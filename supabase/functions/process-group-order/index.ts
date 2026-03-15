/**
 * Process Group Order Edge Function
 *
 * Handles Mode 3 (Guruh uchun) — bulk eSIM provisioning for a customer group.
 *
 * Stages:
 *   Stage 0  — Pre-flight (auth, partner, group, members, package, balance)
 *   Stage 1  — Sequential eSIM provisioning loop (one order per member)
 *   Stage 2  — Post-provisioning evaluation (count outcomes, final status)
 *   Stage 3  — SMS delivery loop (sequential, one send per member for Realtime feedback)
 *
 * Realtime:
 *   - Stage 1: INSERT order with order_status='PROCESSING' → Realtime fires → frontend spinner
 *              UPDATE order to 'ALLOCATED'/'FAILED' → Realtime fires → frontend checkmark/error
 *   - Stage 3: UPDATE delivery_status={status:'sending'} → Realtime fires → frontend SMS spinner
 *              UPDATE delivery_status={status:'sent'/'failed'} → Realtime fires → frontend result
 *
 * Request payload:
 *   { group_id: uuid, package_code: string, delivery_method: 'sms'|'manual' }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { nanoid } from 'https://esm.sh/nanoid@5.0.4';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase.ts';
import { EsimAccessClient } from '../_shared/esimaccess.ts';
import { EskizClient } from '../_shared/eskiz.ts';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate idempotent transaction ID for group member orders */
function makeGroupTransactionId(partnerShort: string, memberIndex: number): string {
  return `GROUP-${partnerShort}-${memberIndex}-${Date.now()}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ══════════════════════════════════════════════════════════════
    // STAGE 0 — PRE-FLIGHT
    // ══════════════════════════════════════════════════════════════

    const payload = await req.json();
    const { group_id, package_code, delivery_method = 'sms' } = payload;

    if (!group_id) throw new Error('group_id is required');
    if (!package_code) throw new Error('package_code is required');

    const authHeader = req.headers.get('Authorization');
    const supabase = createSupabaseClient(authHeader);
    const serviceClient = createServiceClient();

    // 0.1 Auth + partner
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data: partner, error: partnerError } = await serviceClient
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partner) throw new Error('Partner not found');
    if (partner.status !== 'active') throw new Error("Hisobingiz to'xtatilgan. ONESIM bilan bog'laning.");

    const partnerShort = partner.id.substring(0, 8);

    // 0.2 Load / create group_orders row
    // Check for an in-progress or completed order for this group + package
    const { data: existingOrder } = await serviceClient
      .from('group_orders')
      .select('id, status')
      .eq('partner_id', partner.id)
      .eq('customer_group_id', group_id)
      .eq('package_code', package_code)
      .in('status', ['api_ordering', 'completed', 'partial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingOrder?.status === 'api_ordering') {
      throw new Error('Bu guruh uchun buyurtma allaqachon jarayonda. Iltimos kuting.');
    }

    // Create new group_orders row (draft)
    const { data: groupOrder, error: groupOrderError } = await serviceClient
      .from('group_orders')
      .insert({
        partner_id: partner.id,
        customer_group_id: group_id,
        package_code,
        delivery_method,
        status: 'draft',
      })
      .select('id')
      .single();

    if (groupOrderError || !groupOrder) {
      throw new Error(`Guruh buyurtmasini yaratib bo'lmadi: ${groupOrderError?.message}`);
    }

    const groupOrderId = groupOrder.id;

    // 0.3 Idempotency — find already-processed members (in case of retry)
    const { data: existingOrderRows } = await serviceClient
      .from('orders')
      .select('end_customer_id, order_status')
      .eq('group_order_id', groupOrderId)
      .in('order_status', ['ALLOCATED', 'FAILED']);

    const processedCustomerIds = new Set(
      (existingOrderRows || []).map((row: { end_customer_id: string }) => row.end_customer_id)
    );

    // 0.4 Load group members
    const { data: memberLinks, error: membersError } = await serviceClient
      .from('customer_group_members')
      .select(`
        customer_id,
        partner_customers (
          id,
          first_name,
          last_name,
          phone,
          email
        )
      `)
      .eq('group_id', group_id);

    if (membersError) throw new Error(`Guruh a'zolarini yuklab bo'lmadi: ${membersError.message}`);
    if (!memberLinks || memberLinks.length === 0) throw new Error('Guruhda a\'zolar topilmadi');

    type MemberLink = {
      customer_id: string;
      partner_customers: {
        id: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        email: string | null;
      } | Array<{
        id: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        email: string | null;
      }>;
    };

    const members = (memberLinks as MemberLink[]).map((link) => {
      const customer = Array.isArray(link.partner_customers)
        ? link.partner_customers[0]
        : link.partner_customers;
      return {
        customerId: link.customer_id,
        firstName: customer?.first_name || '',
        lastName: customer?.last_name || '',
        phone: customer?.phone || null,
        email: customer?.email || null,
      };
    }).filter((m) => m.customerId);

    const membersToProcess = members.filter((m) => !processedCustomerIds.has(m.customerId));

    // 0.5 Validate members — flag those missing delivery contact
    // They still get eSIM; just note DELIVERY_BLOCKED
    const membersWithDeliveryFlag = membersToProcess.map((m) => ({
      ...m,
      deliveryBlocked: delivery_method === 'sms' && !m.phone,
    }));

    // 0.6 Load package
    const { data: packageData, error: packageError } = await serviceClient
      .from('esim_packages')
      .select('*')
      .eq('package_code', package_code)
      .single();

    if (packageError || !packageData) throw new Error('Package not found');
    if (!packageData.is_active) throw new Error('Bu paket faol emas');

    const discountRate = partner.custom_discount_rate ?? partner.discount_rate ?? 10;
    const apiPrice = packageData.api_price;
    const retailPriceUsd = parseFloat(packageData.final_price_usd ?? packageData.retail_price ?? 0);
    const partnerPriceUsd = retailPriceUsd * (1 - discountRate / 100);

    // 0.7 Balance check
    const esimClient = new EsimAccessClient();
    const balance = await esimClient.queryBalance();
    const totalCost = apiPrice * membersToProcess.length;

    if (balance < totalCost) {
      throw new Error("Hisobda mablag' yetarli emas. ONESIM bilan bog'laning.");
    }

    // 0.8 Update group_orders status to api_ordering + log start
    await serviceClient
      .from('group_orders')
      .update({
        status: 'api_ordering',
        member_count: members.length,
        ordered_at: new Date().toISOString(),
      })
      .eq('id', groupOrderId);

    await serviceClient.from('payment_audit_log').insert({
      event_type: 'BULK_ORDER_STARTED',
      partner_id: partner.id,
      details: {
        group_order_id: groupOrderId,
        group_id,
        package_code,
        member_count: members.length,
        to_process: membersToProcess.length,
      },
    });

    // ══════════════════════════════════════════════════════════════
    // STAGE 1 — eSIM PROVISIONING LOOP (sequential, idempotent)
    // ══════════════════════════════════════════════════════════════

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < membersWithDeliveryFlag.length; i++) {
      const member = membersWithDeliveryFlag[i];

      // 1.1 Write PROCESSING row → triggers Realtime INSERT → frontend shows spinner
      const { data: processingRow, error: insertError } = await serviceClient
        .from('orders')
        .insert({
          user_id: user.id,
          partner_id: partner.id,
          package_code,
          order_status: 'PROCESSING',
          source_type: 'b2b_partner',
          delivery_method,
          delivery_status: { method: delivery_method, status: 'pending' },
          end_customer_type: 'b2b_partner_customer',
          group_order_id: groupOrderId,
          end_customer_id: member.customerId,
          customer_first_name: member.firstName,
          customer_last_name: member.lastName,
          customer_phone: delivery_method === 'sms' ? member.phone : null,
          customer_email: member.email,
          retail_price_override_usd: retailPriceUsd,
          partner_paid_usd: partnerPriceUsd,
          discount_rate: discountRate,
          discount_amount_usd: retailPriceUsd - partnerPriceUsd,
        })
        .select('id')
        .single();

      if (insertError || !processingRow) {
        console.error(`[Group Order] Failed to insert PROCESSING row for member ${member.customerId}:`, insertError);
        failCount++;
        continue;
      }

      const orderId = processingRow.id;

      try {
        // 1.2 Generate transactionId
        const transactionId = makeGroupTransactionId(partnerShort, i);

        // 1.3 Call eSIMAccess (count: 1 per member)
        const orderNo = await esimClient.orderEsim(transactionId, package_code, 1, apiPrice);

        // 1.4 Poll for allocation
        const esims = await esimClient.pollForAllocation(orderNo);
        const esim = esims.find((e) => e.esimStatus === 'GOT_RESOURCE') || esims[0];

        if (!esim || esim.esimStatus !== 'GOT_RESOURCE') {
          throw new Error('eSIM allocation failed after polling');
        }

        // 1.5 Generate token for short URL
        const token = nanoid(8);
        const shortUrl = `onesim.uz/e/${token}`;

        // 1.6 UPDATE orders row to ALLOCATED → Realtime fires → frontend shows checkmark
        await serviceClient
          .from('orders')
          .update({
            order_status: 'ALLOCATED',
            iccid: esim.iccid,
            qr_code_data: esim.ac,
            qr_code_url: esim.qrCodeUrl,
            activation_code: esim.ac,
            smdp_address: esim.ac.split('$')[1] || null,
            short_url: shortUrl,
            esim_tran_no: esim.esimTranNo,
            order_no: orderNo,
            transaction_id: transactionId,
            expiry_date: esim.expiredTime ? new Date(esim.expiredTime) : null,
            smdp_status: esim.smdpStatus,
          })
          .eq('id', orderId);

        // 1.7 Write partner_earnings
        await serviceClient.from('partner_earnings').insert({
          partner_id: partner.id,
          order_id: orderId,
          retail_price: retailPriceUsd,
          partner_paid: partnerPriceUsd,
          discount_amount: retailPriceUsd - partnerPriceUsd,
          discount_rate: discountRate,
          status: 'completed',
        });

        await serviceClient.from('payment_audit_log').insert({
          event_type: 'ESIM_PROVISIONED',
          order_id: orderId,
          partner_id: partner.id,
          details: { iccid: esim.iccid, group_order_id: groupOrderId },
        });

        successCount++;
      } catch (provisionError) {
        console.error(`[Group Order] Provisioning failed for member ${member.customerId}:`, provisionError);

        // 1.8 UPDATE orders row to FAILED → Realtime fires → frontend shows error icon
        await serviceClient
          .from('orders')
          .update({
            order_status: 'FAILED',
            delivery_status: {
              method: delivery_method,
              status: 'failed',
              failure_reason: String(provisionError instanceof Error ? provisionError.message : provisionError),
            },
          })
          .eq('id', orderId);

        failCount++;
      }

      // 1.9 Rate limit between members
      if (i < membersWithDeliveryFlag.length - 1) {
        await sleep(150);
      }
    }

    // ══════════════════════════════════════════════════════════════
    // STAGE 2 — POST-PROVISIONING EVALUATION
    // ══════════════════════════════════════════════════════════════

    // 2.1-2.2 Determine final group order status
    let finalStatus: string;
    if (failCount === 0) {
      finalStatus = 'completed';
    } else if (successCount === 0) {
      finalStatus = 'failed';
    } else {
      finalStatus = 'partial';
    }

    // 2.3 Update group_orders with provisioning result
    await serviceClient
      .from('group_orders')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        metadata: {
          provisioned: successCount,
          failed: failCount,
          provisioning_done_at: new Date().toISOString(),
        },
      })
      .eq('id', groupOrderId);

    // 2.4 Update partner stats
    const totalPartnerPaid = successCount * partnerPriceUsd;
    const totalDiscount = successCount * (retailPriceUsd - partnerPriceUsd);

    if (successCount > 0) {
      await serviceClient
        .from('partners')
        .update({
          total_orders: (partner.total_orders || 0) + successCount,
          total_spent: (partner.total_spent || 0) + totalPartnerPaid,
          total_savings: (partner.total_savings || 0) + totalDiscount,
          last_order_at: new Date().toISOString(),
        })
        .eq('id', partner.id);
    }

    // ══════════════════════════════════════════════════════════════
    // STAGE 3 — SMS DELIVERY (sequential per-member for Realtime feedback)
    // ══════════════════════════════════════════════════════════════
    //
    // Note: For groups > 25 members, consider splitting delivery into a separate
    // dispatch-delivery Edge Function call to avoid the ~150s Supabase timeout.

    if (delivery_method === 'sms' && successCount > 0) {
      // Load all ALLOCATED orders for this group_order
      const { data: allocatedOrders } = await serviceClient
        .from('orders')
        .select('id, iccid, short_url, customer_phone, customer_first_name, customer_last_name')
        .eq('group_order_id', groupOrderId)
        .eq('order_status', 'ALLOCATED');

      const smsOrders = (allocatedOrders || []).filter((o: { customer_phone: string | null }) => o.customer_phone);
      const manualOrders = (allocatedOrders || []).filter((o: { customer_phone: string | null }) => !o.customer_phone);

      // Mark manual orders
      for (const order of manualOrders) {
        await serviceClient
          .from('orders')
          .update({
            delivery_status: { method: 'manual', status: 'manual_pending' },
          })
          .eq('id', order.id);
      }

      if (smsOrders.length > 0) {
        let eskizClient: EskizClient | null = null;
        let eskizBalance = 0;

        try {
          eskizClient = new EskizClient();
          eskizBalance = await eskizClient.getBalance();
        } catch (eskizInitError) {
          console.error('[Group Order] Eskiz init failed:', eskizInitError);
        }

        if (eskizBalance === 0) {
          // No Eskiz balance — move all SMS orders to manual
          await serviceClient.from('payment_audit_log').insert({
            event_type: 'ESKIZ_BALANCE_ZERO',
            partner_id: partner.id,
            details: { group_order_id: groupOrderId, sms_count: smsOrders.length },
          });

          for (const order of smsOrders) {
            await serviceClient
              .from('orders')
              .update({
                delivery_status: { method: 'manual', status: 'manual_pending' },
              })
              .eq('id', order.id);
          }
        } else {
          const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
          const callbackUrl = `${supabaseUrl}/functions/v1/eskiz-callback`;

          let smsSentCount = 0;
          let smsFailedCount = 0;

          for (const order of smsOrders) {
            // 3.1 Update delivery_status to 'sending' → Realtime → frontend SMS spinner
            await serviceClient
              .from('orders')
              .update({
                delivery_status: { method: 'sms', status: 'sending' },
              })
              .eq('id', order.id);

            try {
              // 3.2 Build SMS message
              // FREE TIER: useTestMessage = true. Set to false when Eskiz is upgraded.
              const token = order.short_url?.replace('onesim.uz/e/', '') || '';
              const smsMessage = EskizClient.buildSmsMessage(
                partner.company_name,
                packageData.location_name || packageData.location_code || '',
                packageData.data ? packageData.data / 1024 : 0,
                token,
                true // useTestMessage — flip to false for production
              );

              // 3.3 Send SMS (single send per member for per-member Realtime feedback)
              // TODO (future): Switch to eskizClient.sendSmsBatch() for paid tier
              const smsResult = await eskizClient!.sendSms(order.customer_phone, smsMessage, callbackUrl);

              // 3.4 On success → UPDATE delivery_status to 'sent' → Realtime → checkmark
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
                .eq('id', order.id);

              // Log delivery
              await serviceClient.from('esim_delivery_logs').insert({
                order_id: order.id,
                method: 'sms',
                status: 'sent',
                provider_message_id: smsResult.id,
                recipient_contact: (order.customer_phone || '').slice(-4).padStart(11, '*'),
                sent_at: new Date().toISOString(),
              });

              smsSentCount++;
            } catch (smsError) {
              console.error(`[Group Order] SMS failed for order ${order.id}:`, smsError);

              // 3.5 On failure → UPDATE delivery_status to 'failed' → Realtime → error icon
              await serviceClient
                .from('orders')
                .update({
                  delivery_status: {
                    method: 'sms',
                    status: 'failed',
                    failure_reason: String(smsError instanceof Error ? smsError.message : smsError),
                  },
                })
                .eq('id', order.id);

              smsFailedCount++;
            }

            // 3.6 Delay between sends (respect Eskiz rate limits)
            await sleep(300);
          }

          // Update group_orders metadata with delivery summary
          await serviceClient
            .from('group_orders')
            .update({
              metadata: {
                provisioned: successCount,
                failed: failCount,
                sms_sent: smsSentCount,
                sms_failed: smsFailedCount,
                manual_pending: manualOrders.length,
                delivery_completed_at: new Date().toISOString(),
              },
            })
            .eq('id', groupOrderId);
        }
      }
    }

    // ══════════════════════════════════════════════════════════════
    // STAGE 4 — FINAL SUMMARY + LOG
    // ══════════════════════════════════════════════════════════════

    await serviceClient.from('payment_audit_log').insert({
      event_type: 'BULK_ORDER_COMPLETED',
      partner_id: partner.id,
      details: {
        group_order_id: groupOrderId,
        status: finalStatus,
        provisioned: successCount,
        failed: failCount,
      },
    });

    // Fetch final order rows for response
    const { data: finalOrders } = await serviceClient
      .from('orders')
      .select('id, customer_first_name, customer_last_name, iccid, short_url, order_status, delivery_status')
      .eq('group_order_id', groupOrderId);

    return new Response(
      JSON.stringify({
        success: true,
        group_order_id: groupOrderId,
        status: finalStatus,
        provisioned: successCount,
        failed: failCount,
        orders: (finalOrders || []).map((o: {
          id: string;
          customer_first_name: string;
          customer_last_name: string;
          iccid: string;
          short_url: string;
          order_status: string;
          delivery_status: Record<string, unknown>;
        }) => ({
          id: o.id,
          customer_name: [o.customer_first_name, o.customer_last_name].filter(Boolean).join(' '),
          iccid: o.iccid,
          short_url: o.short_url,
          order_status: o.order_status,
          delivery_status: o.delivery_status,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[Group Order] Fatal error:', error);

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
