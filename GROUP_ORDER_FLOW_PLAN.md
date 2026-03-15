# Group Order Flow Redesign — Implementation Plan

## Overview

Redesign the "Guruh uchun" (Mode 3) order flow so it works entirely within modals
on the catalog page — no separate pages, no fire-and-forget. The flow is:

1. Click "Sotib olish" → OrderModal opens
2. Switch to "Guruh uchun" tab, add group, pick delivery method
3. Click "Tasdiqlash" → confirmation overlay appears ON TOP of OrderModal
4. Review summary → click "Davom etish" → loading spinner (backend fires)
5. Modal content swaps to real-time per-member results table
6. Close button appears when all rows reach terminal state

---

## Files to Create

### `src/components/catalog/GroupOrderFlowModal.jsx` (NEW — replaces GroupOrderProgressModal)

Full-screen overlay modal with 3 internal phases managed by `useReducer`.

#### State shape
```js
{
  phase: 'confirmation' | 'processing' | 'results',
  groupOrderId: null | string,
  members: [],          // populated in real-time during results phase
  provisionedCount: 0,
  failedCount: 0,
  error: null | string,
}
```

#### Member row shape (populated from Realtime `orders` updates)
```js
{
  orderId: string,
  firstName: string,
  lastName: string,
  phone: string,
  orderStatus: 'PROCESSING' | 'ALLOCATED' | 'FAILED',
  deliveryStatus: { status: 'pending'|'sending'|'sent'|'failed'|'manual_pending', failure_reason?: string },
  shortUrl: string | null,   // "onesim.uz/e/{token}" — the install link
  iccid: string | null,
}
```

#### Reducer actions
- `PROCEED` — transition confirmation → processing
- `SET_GROUP_ORDER_ID` — store groupOrderId discovered via Realtime, no phase change
- `UPSERT_MEMBER` — add or update a member row (keyed by orderId)
- `SET_RESULTS` — transition processing → results (fired on first orders Realtime event)
- `SET_ERROR` — set error string, usable from any phase
- `RESET` — full reset to initial state (called on close)

---

#### Phase A — `confirmation`

Rendered when `phase === 'confirmation'`.

UI structure:
```
┌──────────────────────────────────────────────────┐
│  Buyurtmani tasdiqlash                      [X]  │
│                                                  │
│  📍 {group.name}  ·  {packageInfo.destination}  │
│                                                  │
│  👥 Jami a'zolar: {memberCount} kishi            │
│                                                  │
│  💳 Narx: {resellerPriceUzs} UZS × {count} =    │
│     Jami: {subtotal} UZS  (bold)                │
│                                                  │
│  📱 Yetkazish usuli: SMS                         │
│                                                  │
│  ℹ️  Tasdiqlashingiz bilanoq, har bir mijozga    │
│     eSIM o'rnatish havolasi SMS orqali           │
│     yuboriladi.                                  │
│                                                  │
│        [Bekor qilish]  [Davom etish →]           │
└──────────────────────────────────────────────────┘
```

Props consumed:
- `group.name`
- `packageInfo.destination`, `packageInfo.countryCode`
- `memberCount = group.members.length`
- `packageInfo.resellerPriceUzs` — unit price
- `subtotal = resellerPriceUzs * memberCount`
- `deliveryMethod` (display only; always shows "SMS" label)

Button actions:
- "Bekor qilish" → calls `onCancel()` prop → returns user to OrderModal (does NOT close OrderModal)
- "Davom etish" → dispatch `PROCEED`, close OrderModal via `onCloseOrderModal()` prop, call `onStartOrder()` prop

---

#### Phase B — `processing`

Rendered when `phase === 'processing'`.

- Centered spinner (same style as rest of app)
- Text: "Buyurtma yaratilmoqda..."
- No close button, no cancel

Realtime subscriptions started during this phase:

**Subscription 1 — `group_orders` table**
```
table: group_orders
event: INSERT | UPDATE
filter: customer_group_id=eq.{groupId}
```
On INSERT: store `groupOrderId` via `SET_GROUP_ORDER_ID`.
On UPDATE where `status` is `completed | partial | failed`: update final status in state.

**Subscription 2 — `orders` table** (activated once `groupOrderId` is known)
```
table: orders
event: INSERT | UPDATE
filter: group_order_id=eq.{groupOrderId}
```
On first event: dispatch `SET_RESULTS` to transition to results phase.
On each event: dispatch `UPSERT_MEMBER` with the row data.

**Timeout**: If still in `processing` phase after 25 seconds with no `groupOrderId`,
dispatch `SET_ERROR` with message:
`"Buyurtma boshlanmadi. Internet aloqasini tekshiring va qayta urinib ko'ring."`

Subscriptions must be cleaned up in `useEffect` return.

---

#### Phase C — `results`

Rendered when `phase === 'results'`.

UI structure:
```
┌──────────────────────────────────────────────────┐
│  Buyurtma natijalari                        [X]  │  ← X only enabled when allDone
│                                                  │
│  ✅ Step 01: {provisionedCount} ta eSIM paketi   │
│     muvaffaqiyatli buyurtma qilindi.             │
│     SMS yuborish boshlandi...                    │
│  (text changes to "SMS yuborish yakunlandi" when │
│   all delivery rows are terminal)               │
│                                                  │
│  ┌────────┬───────────┬────────────────┬───────┐ │
│  │ Mijoz  │  Telefon  │ O'rnatish link │ Holat │ │
│  ├────────┼───────────┼────────────────┼───────┤ │
│  │ Ali B. │+998901234 │ onesim.uz/e/xx │  🔄  │ │  ← PROCESSING / sending
│  │ Vali N.│+998901235 │ onesim.uz/e/yy │  ✅  │ │  ← sent
│  │ Soli K.│+998901236 │ —              │  ❌  │ │  ← FAILED
│  └────────┴───────────┴────────────────┴───────┘ │
│                                                  │
│  [Yopish]   ← disabled until allDone            │
└──────────────────────────────────────────────────┘
```

`allDone` = every member row has a terminal `orderStatus` (`ALLOCATED` or `FAILED`)
AND every ALLOCATED row has a terminal `deliveryStatus.status`
(`sent | failed | manual_pending`).

Per-row status column logic:
| Condition | Display |
|-----------|---------|
| `orderStatus === 'PROCESSING'` | Spinner (gray) |
| `orderStatus === 'FAILED'` | ❌ Red badge "Xato" + hover tooltip with `delivery_status.failure_reason` |
| `orderStatus === 'ALLOCATED'` + `deliveryStatus.status === 'sending'` | Spinner (blue) "Yuborilmoqda" |
| `orderStatus === 'ALLOCATED'` + `deliveryStatus.status === 'sent'` | ✅ Green badge "Yuborildi" |
| `orderStatus === 'ALLOCATED'` + `deliveryStatus.status === 'failed'` | ❌ Red badge "SMS xato" + reason |
| `orderStatus === 'ALLOCATED'` + `deliveryStatus.status === 'manual_pending'` | ⚠️ Yellow badge "Qo'lda" |

Install link column:
- If `shortUrl` is available: show truncated URL + copy icon button
- If `orderStatus === 'FAILED'` or `shortUrl` is null: show "—"

Error state (if `state.error` is set):
- Show error message in red box
- Show "Yopish" button always enabled

---

#### Props for `GroupOrderFlowModal`

```js
GroupOrderFlowModal.propTypes = {
  isOpen: bool,
  group: shape({
    id: string,
    name: string,
    members: array,
  }),
  packageInfo: shape({
    destination: string,
    countryCode: string,
    validityDays: number,
    resellerPriceUzs: number,
  }),
  packageCode: string,
  deliveryMethod: string,
  onCancel: func,           // close flow modal, keep OrderModal open
  onCloseOrderModal: func,  // close the OrderModal (called when Proceed is clicked)
  onStartOrder: func,       // triggers createGroupOrder() in parent
}
```

---

## Files to Modify

### `src/components/catalog/OrderModal.jsx`

**Location**: "Guruh uchun" tab, bottom action area — the "Tasdiqlash" button.

**Current behavior**: calls `onConfirm()` which triggers `onConfirmBuy` in CatalogPage,
which closes OrderModal and opens GroupOrderProgressModal.

**Change**: Replace `onConfirm` call with `onGroupOrderPreview()` call.

Specifically:
1. Add new prop `onGroupOrderPreview` (function).
2. In the group tab, "Tasdiqlash" button's `onClick`:
   - Currently: `onClick={onConfirm}` (or similar)
   - Change to: call `onGroupOrderPreview({ group, packageCode, deliveryMethod, packageInfo })`
   - Pass all data needed for the confirmation summary:
     - `group` = `selectedGroups[0]` (the selected group object with `id`, `name`, `members`)
     - `packageCode` = derived from `buyPlan`
     - `deliveryMethod` = group's `deliveryMethod` or default `'sms'`
     - `packageInfo` = `{ destination, countryCode, validityDays, resellerPriceUzs }` from `buyPlan`
3. Do NOT close OrderModal inside this handler — it stays open until user clicks
   "Davom etish" in the confirmation phase.

No other changes to OrderModal.

---

### `src/pages/CatalogPage.jsx`

#### A. State changes

Remove:
```js
const [groupProgressModal, setGroupProgressModal] = useState(null);
```

Add:
```js
const [groupOrderFlow, setGroupOrderFlow] = useState(null);
// null when closed
// { group, packageInfo, packageCode, deliveryMethod } when open
```

#### B. Callback changes

Remove: the existing `onConfirmBuy` block that handles `activeOrderTab === 'group'`
(the block that sets `groupProgressModal`, calls `closeBuyModal()`, and fires
`ordersService.createGroupOrder(...).catch(...)`).

Add new callback `onGroupOrderPreview`:
```js
const onGroupOrderPreview = useCallback((payload) => {
  // payload = { group, packageInfo, packageCode, deliveryMethod }
  setGroupOrderFlow(payload);
  // Do NOT close OrderModal here
}, []);
```

Add new callback `handleGroupOrderStart`:
```js
const handleGroupOrderStart = useCallback(() => {
  if (!groupOrderFlow) return;
  closeBuyModal(); // close the OrderModal now
  // createGroupOrder is triggered inside GroupOrderFlowModal via onStartOrder prop
  // which calls ordersService.createGroupOrder and returns the promise
}, [groupOrderFlow, closeBuyModal]);
```

Add new callback `handleGroupOrderCancel`:
```js
const handleGroupOrderCancel = useCallback(() => {
  setGroupOrderFlow(null);
  // OrderModal stays open; user returns to it
}, []);
```

#### C. Pass new prop to OrderModal

Find `<OrderModal ... />` render call. Add:
```jsx
onGroupOrderPreview={onGroupOrderPreview}
```

Remove or keep `onConfirm` prop as-is for the non-group tabs (individual / customer tabs
should still use `onConfirm`).

#### D. Replace GroupOrderProgressModal with GroupOrderFlowModal

Remove:
```jsx
{groupProgressModal && (
  <GroupOrderProgressModal
    isOpen={!!groupProgressModal}
    ...
  />
)}
```

Add:
```jsx
<GroupOrderFlowModal
  isOpen={!!groupOrderFlow}
  group={groupOrderFlow?.group}
  packageInfo={groupOrderFlow?.packageInfo}
  packageCode={groupOrderFlow?.packageCode}
  deliveryMethod={groupOrderFlow?.deliveryMethod}
  onCancel={handleGroupOrderCancel}
  onCloseOrderModal={handleGroupOrderStart}
  onStartOrder={() =>
    ordersService.createGroupOrder({
      group_id: groupOrderFlow?.group?.id,
      package_code: groupOrderFlow?.packageCode,
      delivery_method: groupOrderFlow?.deliveryMethod,
    }).catch((err) => console.error('Group order failed:', err))
  }
  onClose={() => setGroupOrderFlow(null)}
/>
```

#### E. Update imports

Add import for `GroupOrderFlowModal`.
Remove import for `GroupOrderProgressModal`.

---

### `src/services/ordersService.js`

No structural changes needed. Verify (do not change unless broken):
- `createGroupOrder({ group_id, package_code, delivery_method })` calls
  `supabase.functions.invoke('process-group-order', { body: { ... } })`
- Returns the full response including `group_order_id` in the payload
  (the GroupOrderFlowModal discovers `group_order_id` via Realtime on `group_orders`,
  not from the function response, so this is fine as-is)

---

## Files to Delete

### `src/components/catalog/GroupOrderProgressModal.jsx`

Delete this file after `GroupOrderFlowModal` is implemented and verified working.
It is fully replaced by the new component.

---

## Database — No Changes Required

The schema migration was already applied. Relevant columns confirmed present:
- `orders.short_url` — eSIM install link
- `orders.order_status` — PROCESSING | ALLOCATED | FAILED
- `orders.delivery_status` — JSON { status, failure_reason, sent_at, ... }
- `orders.group_order_id` — links member order to the bulk group order
- `orders.customer_first_name`, `customer_last_name`, `customer_phone`
- `group_orders.status` — now includes 'partial' (migration applied)

Realtime is enabled on both `orders` and `group_orders` tables (confirmed).

---

## Edge Function — No Changes Required

`process-group-order` (already deployed with column name fixes):
- Stage 0: creates `group_orders` row → triggers Realtime on `group_orders`
- Stage 1: inserts `orders` rows with `group_order_id` set → triggers Realtime on `orders`
- Stage 1: updates each order to ALLOCATED with `short_url` populated
- Stage 3: updates `delivery_status` per member as SMS sends

The Realtime events fired by the edge function are exactly what Phase B/C need.

---

## Z-Index / Layering Notes

`GroupOrderFlowModal` must render with a z-index higher than `OrderModal`.
Suggested approach: render both modals as siblings in `CatalogPage`. The
`GroupOrderFlowModal` overlay should have `z-index: 60` (or whatever is above
the existing modal's z-index). The OrderModal backdrop should remain visible
but dimmed behind the confirmation overlay.

When "Davom etish" is clicked:
- `onCloseOrderModal()` is called → `closeBuyModal()` → OrderModal unmounts
- `GroupOrderFlowModal` transitions to `processing` phase and fills the screen

---

## UX Edge Cases to Handle

| Case | Handling |
|------|----------|
| User clicks Cancel in confirmation | `onCancel()` — close flow modal, OrderModal stays open |
| Edge function errors before any Realtime event | 25s timeout → `SET_ERROR` → show error + Yopish button |
| Some members FAILED, some ALLOCATED | Show mixed results in table; Step 01 still shows "X ta eSIM buyurtma qilindi" for the successful count |
| Member has no phone number | `deliveryStatus.status = 'manual_pending'` → show ⚠️ "Qo'lda" badge |
| User closes results modal before all rows are done | Disallow close (button disabled) until `allDone` — OR allow close and subscriptions clean up |
| Network drop during processing phase | Supabase Realtime will reconnect; state is DB-driven so no data is lost |

---

## Implementation Sequence

1. Create `GroupOrderFlowModal.jsx` — confirmation phase only (no Realtime yet)
2. Wire it into `CatalogPage` and `OrderModal` — test confirmation UI end-to-end
3. Add processing phase + Realtime subscriptions to `GroupOrderFlowModal`
4. Add results phase + per-row rendering to `GroupOrderFlowModal`
5. Test full end-to-end flow with real edge function
6. Delete `GroupOrderProgressModal.jsx`
