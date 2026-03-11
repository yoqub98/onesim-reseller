# Single Order Implementation Plan (Mode 1: Tur agent nomiga)

## Scope
Implementing **single order for tour operator themselves** (Mode 1 only).
- SMS delivery via Eskiz API
- eSIMAccess API integration for eSIM provisioning
- Frontend modal updates
- Edge Function backend

**NOT in scope** (tomorrow): Mode 2 (Mijoz uchun), Mode 3 (Guruh uchun / Bulk orders)

---

## Implementation Checklist

### Phase 1: Backend Infrastructure

#### 1.1 Supabase Secrets Setup
- [ ] Add `ESIMACCESS_ACCESS_CODE` secret
- [ ] Add `ESKIZ_EMAIL` secret (yoqub.xamidoff19@gmail.com)
- [ ] Add `ESKIZ_SECRET_KEY` secret (nJ45jlD82l5BcSMCFloA0p0GRqzWUA548irsiPGh)

#### 1.2 Database Additions (SQL to run)
```sql
-- Add esim_delivery_logs table if not exists
CREATE TABLE IF NOT EXISTS esim_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  method TEXT NOT NULL, -- 'sms', 'email', 'manual'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  provider_message_id TEXT,
  recipient_contact TEXT, -- masked phone/email
  attempt_count INT DEFAULT 1,
  failure_reason TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add payment_audit_log table if not exists
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  order_id UUID,
  group_order_id UUID,
  partner_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to orders table if needed
ALTER TABLE orders ADD COLUMN IF NOT EXISTS short_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS esim_tran_no TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS smdp_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_no TEXT;
```

#### 1.3 Edge Function: `process-single-order`
Location: `supabase/functions/process-single-order/index.ts`

**Responsibilities:**
1. Authenticate JWT & load partner
2. Pre-flight: Check eSIMAccess balance
3. Generate transactionId
4. Call eSIMAccess `/esim/order`
5. Poll for allocation (3s interval, max 10 attempts)
6. Generate nanoid(8) token for short_url
7. Write orders row
8. Write partner_earnings row
9. Update partner stats
10. Call Eskiz SMS (if delivery_method = 'sms')
11. Return result

#### 1.4 Edge Function: `eskiz-callback`
Location: `supabase/functions/eskiz-callback/index.ts`

**Responsibilities:**
1. Receive Eskiz DLR callback (public endpoint)
2. Map Eskiz status to our status
3. Update esim_delivery_logs
4. Update orders.delivery_status JSONB

---

### Phase 2: Frontend Updates

#### 2.1 OrderModal Enhancement (`src/components/catalog/OrderModal.jsx`)
- [ ] Mode 1 tab ("Tur agent nomiga") form fields:
  - Phone input (autofill from partner.business_phone)
  - Quantity input (1-30, default 1)
  - Delivery method select (SMS/Manual, auto based on qty)
- [ ] Loading state on submit
- [ ] Result phase after success (QR code, token URL, copy button)
- [ ] Error handling with retry

#### 2.2 Order Service Updates (`src/services/ordersService.js`)
- [ ] Add `createSingleOrder(payload)` method
- [ ] Call Edge Function `process-single-order`
- [ ] Handle response and error states

#### 2.3 i18n Additions (`src/i18n/uz.js`, `src/i18n/ru.js`)
- [ ] Add labels for order modal fields
- [ ] Add success/error messages
- [ ] Add SMS delivery messages

---

### Phase 3: SMS Integration

#### 3.1 Eskiz SMS Service (in Edge Function)
```typescript
// Test mode (free tier):
// message: "Bu Eskiz dan test"
// from: "4546"

// Production mode (commented, ready to swap):
// message: "{CompanyName}: eSIM tayyor! {Country} {DataGB}GB. O'rnatish: onesim.uz/e/{token}"
// from: "4546"
```

#### 3.2 SMS Flow
1. Login to Eskiz (`POST /api/auth/login`)
2. Check balance (`GET /api/user/get-limit`)
3. Send SMS (`POST /api/message/sms/send`)
4. Log to esim_delivery_logs
5. Register callback_url for DLR

---

## Execution Order

| Step | Task | Files |
|------|------|-------|
| 1 | Run DB migration SQL | (manual) |
| 2 | Create `process-single-order` Edge Function | `supabase/functions/process-single-order/index.ts` |
| 3 | Create `eskiz-callback` Edge Function | `supabase/functions/eskiz-callback/index.ts` |
| 4 | Update `ordersService.js` with createSingleOrder | `src/services/ordersService.js` |
| 5 | Update OrderModal for Mode 1 form | `src/components/catalog/OrderModal.jsx` |
| 6 | Add i18n strings | `src/i18n/uz.js`, `src/i18n/ru.js` |
| 7 | Test end-to-end flow | - |

---

## API Reference

### eSIMAccess API
- Base: `https://api.esimaccess.com`
- Auth: `RT-AccessCode: {secret}`
- Order: `POST /api/v1/open/esim/order`
- Query: `POST /api/v1/open/esim/query`
- Balance: `POST /api/v1/open/balance/query`

### Eskiz API
- Base: `https://notify.eskiz.uz`
- Login: `POST /api/auth/login`
- Send: `POST /api/message/sms/send`
- Balance: `GET /api/user/get-limit`

---

## Test Constraints (Free Tier)
- Eskiz free tier: Only "Bu Eskiz dan test" message allowed
- Sender must be "4546"
- Real message template prepared but commented out
