/**
 * Eskiz Callback Edge Function
 *
 * Receives DLR (Delivery Receipt) callbacks from Eskiz.uz
 * Public endpoint - no auth required (secured by obscurity + validation)
 *
 * Callback payload from Eskiz:
 * {
 *   "request_id": "UUID",
 *   "message_id": "4385062",
 *   "user_sms_id": "order_id",
 *   "country": "UZ",
 *   "phone_number": "998991234567",
 *   "sms_count": "1",
 *   "status": "DELIVRD",
 *   "status_date": "2021-04-02 00:39:36"
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { mapEskizStatus } from '../_shared/eskiz.ts';

interface EskizCallback {
  request_id: string;
  message_id: string;
  user_sms_id: string; // Our order.id
  country: string;
  phone_number: string;
  sms_count: string;
  status: string;
  status_date: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse callback payload
    const payload: EskizCallback = await req.json();
    const {
      request_id,
      user_sms_id,
      phone_number,
      status,
      status_date,
    } = payload;

    console.log('Eskiz callback received:', JSON.stringify(payload));

    // Validate required fields
    if (!request_id || !status) {
      throw new Error('Missing required fields: request_id or status');
    }

    const serviceClient = createServiceClient();

    // Map Eskiz status to our internal status
    const { status: mappedStatus, failureReason } = mapEskizStatus(status);

    // Find delivery log by provider_message_id
    const { data: deliveryLog, error: logError } = await serviceClient
      .from('esim_delivery_logs')
      .select('id, order_id')
      .eq('provider_message_id', request_id)
      .maybeSingle();

    if (logError) {
      console.error('Delivery log lookup error:', logError);
    }

    // If we have a user_sms_id (order_id), try to find by that too
    let orderId = deliveryLog?.order_id || user_sms_id;

    if (!orderId && user_sms_id) {
      // Try to find order by ID directly
      const { data: order } = await serviceClient
        .from('orders')
        .select('id')
        .eq('id', user_sms_id)
        .maybeSingle();
      orderId = order?.id;
    }

    // Update delivery log
    if (deliveryLog) {
      const updateData: Record<string, unknown> = {
        status: mappedStatus,
        updated_at: new Date().toISOString(),
      };

      if (mappedStatus === 'delivered') {
        updateData.delivered_at = status_date || new Date().toISOString();
      } else if (mappedStatus === 'failed') {
        updateData.failure_reason = failureReason;
      }

      await serviceClient
        .from('esim_delivery_logs')
        .update(updateData)
        .eq('id', deliveryLog.id);
    }

    // Update order delivery_status JSONB
    if (orderId) {
      const deliveryStatus: Record<string, unknown> = {
        method: 'sms',
        status: mappedStatus,
        updated_at: new Date().toISOString(),
        provider_message_id: request_id,
      };

      if (mappedStatus === 'delivered') {
        deliveryStatus.delivered_at = status_date || new Date().toISOString();
      } else if (mappedStatus === 'failed') {
        deliveryStatus.failure_reason = failureReason;
      }

      await serviceClient
        .from('orders')
        .update({ delivery_status: deliveryStatus })
        .eq('id', orderId);

      // Log callback event to audit log
      await serviceClient.from('payment_audit_log').insert({
        event_type: 'ESKIZ_CALLBACK_RECEIVED',
        order_id: orderId,
        details: {
          eskiz_status: status,
          mapped_status: mappedStatus,
          failure_reason: failureReason,
          phone_number: phone_number?.slice(-4).padStart(phone_number.length, '*'),
          status_date,
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, status: mappedStatus }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Eskiz callback error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
