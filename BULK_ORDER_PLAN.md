# Bulk Group Order Service — Implementation Plan
ONESIM Reseller | v1.0 | March 2026

---

## Overview

This plan covers two things:
1. **Quick fix** — short URL token display (already 8 chars, verify display)
2. **Bulk order service** — full group order pipeline with real-time per-member progress UI

The single-order service (Mode 1) is working. This builds Mode 3 (Guruh uchun).

---

## Step 0 — Fix short_url Display (Quick)

**Problem:** Token is already `nanoid(8)` = 8 chars, but the value stored is the full
URL string `onesim.uz/e/{token}` (not just the token). The displayed URL in the result
phase may look long if the component shows the raw `short_url` field value.

**Fix:**
- In `process-single-order`, keep storing full URL in `short_url` column (`onesim.uz/e/{token}`)
- Separately extract and return just the token in the response so the frontend can show
  a clean short link
- In `SelfOrderForm` result phase: display as `onesim.uz/e/` + token (verify this is
  what's shown, not the activation code)

**Files:**
- `supabase/functions/process-single-order/index.ts` — return `token` separately in response
- `src/components/catalog/SelfOrderForm.jsx` — display token-based link cleanly

---

## Step 1 — Backend: `process-group-order` Edge Function

**Location:** `supabase/functions/process-group-order/index.ts`

**Trigger:** HTTP POST (authenticated) from frontend

**Request payload:**
```json
{
  "group_id": "uuid",
  "package_code": "string",
  "delivery_method": "sms | manual | email"
}
```

### Stage 0 — Pre-flight (no API calls yet)

| # | Action | Detail |
|---|--------|--------|
| 0.1 | Auth + partner | Verify JWT, load partner row, confirm `status = 'active'` |
| 0.2 | Load / create group_order | Check if group_orders row exists for this group+package+partner. If exists AND status = `api_ordering` → abort (already running). If exists AND status = `completed/partial` → return existing result. Otherwise create new row with `status = 'draft'` |
| 0.3 | Idempotency check | Query orders table for existing rows with this `group_order_id`. Build list of already-processed `customer_id`s to skip |
| 0.4 | Load members | JOIN `customer_group_members → partner_customers` for this group. Build member array: `{ id, first_name, last_name, phone, email, delivery_method }` |
| 0.5 | Validate members | Flag members with missing contact for chosen delivery. They still get eSIM — just flagged `DELIVERY_BLOCKED` |
| 0.6 | Load package | Fetch `esim_packages` by `package_code`. Confirm `is_active = true`. Snapshot prices |
| 0.7 | Balance check | `POST /api/v1/open/balance/query`. Must be ≥ `api_price × member_count`. Abort if insufficient |
| 0.8 | Set status | UPDATE `group_orders.status = 'api_ordering'`, `ordered_at = now()`. Log `BULK_ORDER_STARTED` to `payment_audit_log` |

### Stage 1 — eSIM Provisioning Loop (sequential, idempotent)

For each member NOT already in `orders` for this `group_order_id`:

| # | Action | Detail |
|---|--------|--------|
| 1.1 | Write PROCESSING row | INSERT `orders` with `order_status = 'PROCESSING'`, `end_customer_id`, `group_order_id`. This triggers Realtime event → frontend shows spinner for this member |
| 1.2 | Generate transactionId | `GROUP-{partner_short}-{member_index}-{timestamp}` |
| 1.3 | Call eSIMAccess | `POST /api/v1/open/esim/order` with `count: 1`, `price: api_price` |
| 1.4 | Poll for allocation | 3s interval, max 10 attempts. Wait for `GOT_RESOURCE` |
| 1.5 | On success | Extract `iccid`, `ac`, `qrCodeUrl`, `esimTranNo`. Generate `nanoid(8)` token |
| 1.6 | Update orders row | UPDATE the PROCESSING row to `order_status = 'ALLOCATED'`, set all eSIM fields, `short_url = onesim.uz/e/{token}` → Realtime event → frontend shows checkmark |
| 1.7 | Write partner_earnings | One row per successful eSIM |
| 1.8 | On failure | UPDATE orders row to `order_status = 'FAILED'`, `error_message` → Realtime event → frontend shows error icon |
| 1.9 | Rate limit | `await sleep(150ms)` between members |

**Why write PROCESSING row first?**
Supabase Realtime fires on INSERT. Frontend receives the event immediately and shows the
spinner for that member. Then when the row is UPDATEd to ALLOCATED/FAILED, frontend
receives the update event and transitions the icon. This gives a live step-by-step view
without polling.

### Stage 2 — Post-Provisioning Evaluation

| # | Action | Detail |
|---|--------|--------|
| 2.1 | Count outcomes | `SELECT order_status, COUNT(*) FROM orders WHERE group_order_id = X GROUP BY order_status` |
| 2.2 | Final status | `failed=0` → `completed`. `failed>0 AND succeeded>0` → `partial`. `succeeded=0` → `failed` |
| 2.3 | Update group_orders | SET status, `completed_at`, log `PROVISIONING_COMPLETE` |
| 2.4 | Update partner stats | `total_orders`, `total_spent`, `total_savings`, `last_order_at` |

**Return from function:**
```json
{
  "success": true,
  "group_order_id": "uuid",
  "status": "completed | partial | failed",
  "provisioned": 12,
  "failed": 0,
  "orders": [{ "id", "customer_name", "iccid", "short_url", "order_status" }]
}
```

The function returns here. Delivery is dispatched by calling `dispatch-delivery` (inline for
small groups < 10 members, async trigger for large groups).

---

## Step 2 — Backend: `dispatch-delivery` Edge Function

**Location:** `supabase/functions/dispatch-delivery/index.ts`

**Trigger:** HTTP POST — called by `process-group-order` after provisioning, or manually for retry

**Request payload:**
```json
{
  "group_order_id": "uuid"
}
```

### Stage 3 — Pre-dispatch

| # | Action | Detail |
|---|--------|--------|
| 3.1 | Load ALLOCATED orders | `SELECT orders JOIN partner_customers WHERE group_order_id = X AND order_status = 'ALLOCATED'` |
| 3.2 | Split into queues | `sms_queue`, `email_queue`, `manual_queue` |
| 3.3 | Eskiz auth | If `sms_queue` non-empty: login, get token, check balance |
| 3.4 | Balance = 0 guard | If Eskiz balance = 0: move all SMS orders to manual queue, log `ESKIZ_BALANCE_ZERO` |

### Stage 4 — Delivery Dispatch Loop

**SMS (per member, sequential to give Realtime feedback):**

| # | Action | Detail |
|---|--------|--------|
| 4.1 | For each SMS member | Update `orders.delivery_status = { status: 'sending' }` → Realtime → frontend spinner |
| 4.2 | Build SMS body | **FREE TIER:** `'Bu Eskiz dan test'` / **PRODUCTION (ready):** `'{CompanyName}: eSIM tayyor! {Country} {DataGB}GB. O\'rnatish: onesim.uz/e/{token}'` |
| 4.3 | Call Eskiz | `POST /api/message/sms/send` (single send per member to get per-member Realtime feedback) |
| 4.4 | On success | UPDATE `delivery_status = { status: 'sent', sent_at, provider_message_id }`. Write `esim_delivery_logs` row. → Realtime → frontend checkmark |
| 4.5 | On failure | UPDATE `delivery_status = { status: 'failed', failure_reason }`. → Realtime → frontend error icon |
| 4.6 | Sleep 100ms | Between sends |

> **Note on batch vs sequential:** The doc specifies batch SMS (`/send-batch`). However, for
> real-time UI feedback (spinner → checkmark per person), sequential individual sends are
> preferred during the MVP. The batch endpoint gives one batch UUID — no per-message
> Realtime feedback. Switch to batch once free-tier limitation is resolved.

**Manual queue:**
- UPDATE each order's `delivery_status = { status: 'manual_pending' }`
- No API call

**Email queue (future):**
- Placeholder stub — log and mark `email_pending`

### Stage 5 — Final Summary

| # | Action | Detail |
|---|--------|--------|
| 5.1 | Compute summary | Count: sms_sent, sms_failed, manual_pending |
| 5.2 | Update group_orders.metadata | `{ sms_sent, manual_pending, delivery_failed, delivery_completed_at }` |
| 5.3 | Log completion | `BULK_ORDER_COMPLETED` to `payment_audit_log` |
| 5.4 | Return response | Full delivery summary |

---

## Step 3 — Add `sendSmsBatch` to EskizClient (ready for production)

**File:** `supabase/functions/_shared/eskiz.ts`

Add `sendSmsBatch()` method:
```typescript
async sendSmsBatch(messages: Array<{user_sms_id: string, to: string, text: string}>, dispatchId: number, callbackUrl: string)
```

This stays unused for now (free tier). When Eskiz is upgraded, swap `dispatch-delivery`
from sequential single-send to batch.

Also keep `buildSmsMessage(useTestMessage = true)` flag in place — only change the flag
when production is ready.

---

## Step 4 — Real-time Progress UI

### 4.1 New Component: `GroupOrderProgressModal`

**File:** `src/components/catalog/GroupOrderProgressModal.jsx`

**Two phases:**

**Phase A — Provisioning (eSIM ordering):**
```
Provisioning eSIMs...  [12 / 12]
━━━━━━━━━━━━━━━━━━━━━━━ 100%

  Ali Valiyev        [spinner] → [✓]
  Bobur Toshmatov    [spinner] → [✓]
  Zulfiya Ergasheva  [pending] → [spinner] → [✗ Failed]
  ...
```

**Phase B — Delivery dispatch (SMS sending):**
```
SMS yuborilmoqda...  [11 / 11]
━━━━━━━━━━━━━━━━━━━━━━━ 100%

  Ali Valiyev        +998901234567  [spinner] → [✓ Yuborildi]
  Bobur Toshmatov    +998907654321  [spinner] → [✓ Yuborildi]
  Zulfiya Ergasheva  —              [Manual]
  ...
```

**Phase C — Summary (after both complete):**
```
✓ Buyurtma yakunlandi!

  12 ta eSIM   11 ta SMS yuborildi   1 ta manual

  [Yopish]  [Yangi buyurtma]
```

### 4.2 Supabase Realtime Subscription

```javascript
// Subscribe to orders for this group_order_id
const subscription = supabase
  .channel(`group-order-${groupOrderId}`)
  .on('postgres_changes', {
    event: '*',        // INSERT + UPDATE
    schema: 'public',
    table: 'orders',
    filter: `group_order_id=eq.${groupOrderId}`
  }, (payload) => {
    // payload.new.order_status = 'PROCESSING' | 'ALLOCATED' | 'FAILED'
    // payload.new.delivery_status.status = 'sending' | 'sent' | 'failed'
    updateMemberStatus(payload.new)
  })
  .subscribe()
```

The component maintains a local map `{ [customerId]: memberState }` where
`memberState = { provisionStatus, deliveryStatus, shortUrl, iccid }`.

### 4.3 Member state machine (UI only)

```
provision:  idle → processing → allocated | failed
delivery:   idle → sending → sent | failed | manual_pending
```

Icon logic:
- `processing / sending` → animated spinner (orange)
- `allocated / sent` → checkmark (green)
- `failed` → X icon (red) + inline error reason
- `manual_pending` → printer icon (grey)

---

## Step 5 — Wire OrderModal Group Tab

**File:** `src/components/catalog/OrderModal.jsx`

Current state: The group tab shows group picker + member list + Confirm button.
When Confirm is clicked → `onConfirm()` → nothing useful happens yet.

**Changes:**
1. Remove the bottom footer confirm/cancel bar for group tab (it's currently shared,
   but SelfOrderForm handles its own buttons). Add a dedicated confirm section inside
   the group tab content area.
2. When Confirm is clicked:
   - Validate: at least one group selected
   - Call `ordersService.createGroupOrder({ group_id, package_code, delivery_method })`
   - This calls `process-group-order` Edge Function
   - Immediately open `GroupOrderProgressModal` with the returned `group_order_id`
   - Start Realtime subscription

**New service method:**
`ordersService.createGroupOrder(payload)` → calls `process-group-order`

---

## Step 6 — Shared Infrastructure Checks

| Item | Status | Action |
|------|--------|--------|
| `orders.group_order_id` column | Check migration | Confirm column exists |
| `group_orders` table + status column | Check migration | Confirm table + all status values |
| `orders.order_status` — add `'PROCESSING'` | Check | Add if not exists |
| Supabase Realtime enabled on `orders` table | Check | Enable in Supabase dashboard |
| `eskiz-callback` Edge Function | Exists ✓ | Already built |
| `get-esim-landing` / SharedEsimPage | Exists ✓ | Already built |

---

## Step 7 — i18n Keys to Add

**File:** `src/i18n/uz.js` (and `ru.js`)

```javascript
groupOrder: {
  progressTitle: 'Buyurtma jarayoni',
  provisioningPhase: 'eSIM buyurtma qilinmoqda...',
  deliveryPhase: 'SMS yuborilmoqda...',
  doneTitle: 'Buyurtma yakunlandi!',
  memberProvisioning: 'Tayyorlanmoqda',
  memberAllocated: 'Tayyor',
  memberFailed: 'Xatolik',
  memberSending: 'Yuborilmoqda',
  memberSent: 'Yuborildi',
  memberManual: 'Qo\'lda',
  summary: {
    esims: 'ta eSIM',
    smsSent: 'ta SMS yuborildi',
    manual: 'ta manual',
  }
}
```

---

## Build Order

Execute in this exact sequence:

1. **[Quick]** Verify & fix short URL display in `SelfOrderForm` result phase
2. **[Backend]** Add `sendSmsBatch` stub to `EskizClient` + ensure `buildSmsMessage` production template is correct
3. **[DB]** Verify `orders.group_order_id`, `group_orders` table, and `orders.order_status` includes `'PROCESSING'`. Enable Realtime on `orders` table
4. **[Backend]** Build `process-group-order` Edge Function (Stage 0 → 1 → 2)
5. **[Backend]** Build `dispatch-delivery` Edge Function (Stage 3 → 4 → 5)
6. **[Frontend]** Build `GroupOrderProgressModal` component with Realtime subscription
7. **[Frontend]** Wire `ordersService.createGroupOrder()` + connect to `OrderModal` group tab
8. **[i18n]** Add missing translation keys
9. **[Test]** End-to-end: pick group → confirm → watch per-member progress → verify orders in DB → verify SMS (test message) received

---

## Key Constraints & Notes

| Constraint | Detail |
|-----------|--------|
| Eskiz free tier | Only `'Bu Eskiz dan test'` message allowed. Production template is coded and ready — just flip `useTestMessage = false` |
| Sequential delivery | Use single `sendSms()` per member (not batch) to enable per-member Realtime feedback. Switch to `sendSmsBatch()` later |
| Edge Function timeout | Supabase limit ~150s. For groups > 25 members, `process-group-order` returns after provisioning; `dispatch-delivery` handles SMS separately |
| Idempotency | PROCESSING → ALLOCATED/FAILED pattern means safe retry on crash — skip already-provisioned members |
| Group tab in OrderModal | Currently supports multiple groups selected. For now, simplify to single group selection for the bulk order pipeline. Multi-group is a future enhancement |

---

## Files to Create / Modify

### New files
- `supabase/functions/process-group-order/index.ts`
- `supabase/functions/dispatch-delivery/index.ts`
- `src/components/catalog/GroupOrderProgressModal.jsx`

### Modified files
- `supabase/functions/_shared/eskiz.ts` — add `sendSmsBatch()`
- `src/services/ordersService.js` — add `createGroupOrder()`
- `src/components/catalog/OrderModal.jsx` — wire group tab confirm
- `src/i18n/uz.js` + `ru.js` — add groupOrder keys
- `supabase/functions/process-single-order/index.ts` — return token separately (short URL fix)
- `src/components/catalog/SelfOrderForm.jsx` — display fix (short URL fix)
