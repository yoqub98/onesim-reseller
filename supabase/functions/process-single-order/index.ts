/**
 * Process Single Order Edge Function
 *
 * Handles Mode 1 (Tur agent nomiga) - Single order for partner themselves
 *
 * Flow:
 * 1. Auth & partner lookup
 * 2. Pre-flight: eSIMAccess balance check
 * 3. Generate transactionId
 * 4. Call eSIMAccess /esim/order
 * 5. Poll for allocation
 * 6. Generate nanoid token for short_url
 * 7. Write orders row
 * 8. Write partner_earnings row
 * 9. Update partner stats
 * 10. SMS delivery (if requested)
 * 11. Return result
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { nanoid } from 'https://esm.sh/nanoid@5.0.4';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase.ts';
import { EsimAccessClient, generateTransactionId } from '../_shared/esimaccess.ts';
import { EskizClient } from '../_shared/eskiz.ts';

interface OrderRequest {
  mode: 'agent' | 'client';
  package_code: string;
  quantity: number;
  delivery_method: 'sms' | 'manual';
  phone?: string; // Required if delivery_method = 'sms' and quantity = 1
}

interface OrderResult {
  id: string;
  iccid: string;
  short_url: string;
  qr_code_data: string;
  activation_code: string;
  package_name: string;
  delivery_status: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const payload: OrderRequest = await req.json();
    const { mode, package_code, quantity, delivery_method, phone } = payload;

    // Validate input
    if (!package_code) {
      throw new Error('package_code is required');
    }
    if (!quantity || quantity < 1 || quantity > 30) {
      throw new Error('quantity must be between 1 and 30');
    }
    if (delivery_method === 'sms' && quantity === 1 && !phone) {
      throw new Error('phone is required for SMS delivery');
    }

    // Get auth header and create clients
    const authHeader = req.headers.get('Authorization');
    const supabase = createSupabaseClient(authHeader);
    const serviceClient = createServiceClient();

    // B.1: Auth & partner lookup
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: partner, error: partnerError } = await serviceClient
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partner) {
      throw new Error('Partner not found');
    }

    if (partner.status !== 'active') {
      throw new Error("Hisobingiz to'xtatilgan. ONESIM bilan bog'laning.");
    }

    // Load package details
    const { data: packageData, error: packageError } = await serviceClient
      .from('esim_packages')
      .select('*')
      .eq('package_code', package_code)
      .single();

    if (packageError || !packageData) {
      throw new Error('Package not found');
    }

    // Calculate prices
    const discountRate = partner.custom_discount_rate ?? partner.discount_rate ?? 10;
    const apiPrice = packageData.api_price; // units × 10000
    const retailPriceUsd = packageData.retail_price_usd;
    const partnerPriceUsd = retailPriceUsd * (1 - discountRate / 100);
    const totalApiCost = apiPrice * quantity;

    // B.2: Pre-flight eSIMAccess balance check
    const esimClient = new EsimAccessClient();
    const balance = await esimClient.queryBalance();

    if (balance < totalApiCost) {
      throw new Error("Hisobda mablag' yetarli emas. ONESIM bilan bog'laning.");
    }

    // B.3: Generate transactionId
    const transactionId = generateTransactionId('AGENT', partner.id);

    // Log order start
    await serviceClient.from('payment_audit_log').insert({
      event_type: 'AGENT_ORDER_STARTED',
      partner_id: partner.id,
      details: {
        package_code,
        quantity,
        delivery_method,
        transaction_id: transactionId,
      },
    });

    // B.4: Call eSIMAccess /esim/order
    const orderNo = await esimClient.orderEsim(
      transactionId,
      package_code,
      quantity,
      apiPrice
    );

    // B.5: Poll for allocation
    const esims = await esimClient.pollForAllocation(orderNo);

    // Check if all eSIMs are allocated
    const allocatedEsims = esims.filter(e => e.esimStatus === 'GOT_RESOURCE');
    if (allocatedEsims.length === 0) {
      throw new Error('eSIM allocation failed. Please try again.');
    }

    // B.6-B.9: Process each allocated eSIM
    const results: OrderResult[] = [];
    let totalPartnerPaid = 0;
    let totalDiscount = 0;

    for (const esim of allocatedEsims) {
      // Generate unique token for short_url
      const token = nanoid(8);
      const shortUrl = `onesim.uz/e/${token}`;

      // B.7: Write orders row
      const { data: orderData, error: orderError } = await serviceClient
        .from('orders')
        .insert({
          user_id: user.id,
          partner_id: partner.id,
          package_code,
          iccid: esim.iccid,
          qr_code_data: esim.ac,
          qr_code_url: esim.qrCodeUrl,
          activation_code: esim.ac,
          smdp_address: esim.ac.split('$')[1] || null,
          short_url: shortUrl,
          esim_tran_no: esim.esimTranNo,
          order_no: orderNo,
          order_status: 'ALLOCATED',
          source_type: 'b2b_partner',
          delivery_method,
          delivery_status: { method: delivery_method, status: 'pending' },
          end_customer_type: 'b2b_partner_customer',
          customer_phone: delivery_method === 'sms' ? phone : null,
          retail_price_usd: retailPriceUsd,
          partner_paid_usd: partnerPriceUsd,
          discount_rate: discountRate,
          discount_amount_usd: retailPriceUsd - partnerPriceUsd,
          expiry_date: esim.expiredTime ? new Date(esim.expiredTime) : null,
          smdp_status: esim.smdpStatus,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order insert error:', orderError);
        continue;
      }

      // B.8: Write partner_earnings
      const discountAmount = retailPriceUsd - partnerPriceUsd;
      await serviceClient.from('partner_earnings').insert({
        partner_id: partner.id,
        order_id: orderData.id,
        retail_price: retailPriceUsd,
        partner_paid: partnerPriceUsd,
        discount_amount: discountAmount,
        discount_rate: discountRate,
        status: 'completed',
      });

      totalPartnerPaid += partnerPriceUsd;
      totalDiscount += discountAmount;

      // Log provisioning
      await serviceClient.from('payment_audit_log').insert({
        event_type: 'ESIM_PROVISIONED',
        order_id: orderData.id,
        partner_id: partner.id,
        details: {
          iccid: esim.iccid,
          esim_tran_no: esim.esimTranNo,
        },
      });

      results.push({
        id: orderData.id,
        iccid: esim.iccid,
        short_url: shortUrl,
        qr_code_data: esim.ac,
        activation_code: esim.ac,
        package_name: packageData.name,
        delivery_status: 'pending',
      });
    }

    // B.9: Update partner stats
    await serviceClient
      .from('partners')
      .update({
        total_orders: (partner.total_orders || 0) + allocatedEsims.length,
        total_spent: (partner.total_spent || 0) + totalPartnerPaid,
        total_savings: (partner.total_savings || 0) + totalDiscount,
        last_order_at: new Date().toISOString(),
      })
      .eq('id', partner.id);

    // B.10: SMS delivery (if requested)
    let smsSent = false;
    if (delivery_method === 'sms' && quantity === 1 && phone && results.length > 0) {
      try {
        const eskizClient = new EskizClient();
        const balance = await eskizClient.getBalance();

        if (balance > 0) {
          // Build SMS message
          // FREE TIER: Using test message only
          const smsMessage = EskizClient.buildSmsMessage(
            partner.company_name,
            packageData.location_name || packageData.location_code,
            packageData.data / 1024, // Convert MB to GB
            results[0].short_url.replace('onesim.uz/e/', ''),
            true // useTestMessage = true for free tier
          );

          // Get callback URL
          const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
          const callbackUrl = `${supabaseUrl}/functions/v1/eskiz-callback`;

          // Send SMS
          const smsResult = await eskizClient.sendSms(phone, smsMessage, callbackUrl);

          // Log delivery attempt
          await serviceClient.from('esim_delivery_logs').insert({
            order_id: results[0].id,
            method: 'sms',
            status: 'sent',
            provider_message_id: smsResult.id,
            recipient_contact: phone.slice(-4).padStart(phone.length, '*'),
            sent_at: new Date().toISOString(),
          });

          // Update order delivery_status
          await serviceClient
            .from('orders')
            .update({
              delivery_status: {
                method: 'sms',
                status: 'sent',
                sent_at: new Date().toISOString(),
                provider_message_id: smsResult.id,
              },
            })
            .eq('id', results[0].id);

          smsSent = true;
          results[0].delivery_status = 'sent';

          // Log delivery event
          await serviceClient.from('payment_audit_log').insert({
            event_type: 'DELIVERY_SENT',
            order_id: results[0].id,
            partner_id: partner.id,
            details: {
              method: 'sms',
              provider_message_id: smsResult.id,
            },
          });
        } else {
          // No SMS balance - mark as manual
          await serviceClient.from('payment_audit_log').insert({
            event_type: 'ESKIZ_BALANCE_ZERO',
            partner_id: partner.id,
            details: { attempted_phone: phone.slice(-4) },
          });
        }
      } catch (smsError) {
        console.error('SMS delivery error:', smsError);
        // SMS failure doesn't fail the order
        await serviceClient.from('payment_audit_log').insert({
          event_type: 'DELIVERY_FAILED',
          order_id: results[0]?.id,
          partner_id: partner.id,
          details: { error: String(smsError) },
        });
      }
    }

    // Log completion
    await serviceClient.from('payment_audit_log').insert({
      event_type: 'AGENT_ORDER_COMPLETED',
      partner_id: partner.id,
      details: {
        order_count: results.length,
        total_paid: totalPartnerPaid,
        total_discount: totalDiscount,
        sms_sent: smsSent,
      },
    });

    // B.11: Return response
    return new Response(
      JSON.stringify({
        success: true,
        orders: results,
        sms_sent: smsSent,
        summary: {
          total_orders: results.length,
          total_paid_usd: totalPartnerPaid,
          total_discount_usd: totalDiscount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Process single order error:', error);

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
