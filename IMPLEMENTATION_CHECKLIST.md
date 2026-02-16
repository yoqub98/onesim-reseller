# OneSIM Database Implementation Checklist

## 📋 Pre-Implementation

- [ ] **Backup your Supabase database**
  ```bash
  # In Supabase Dashboard: Database → Backups → Create Backup
  ```

- [ ] **Review the design document**: `DATABASE_DESIGN_PROMPT.md`

- [ ] **Understand current data**:
  - Current orders: 6 rows
  - Current packages: 2033 rows
  - Current profiles: 1 row

---

## 🚀 Implementation Steps

### Step 1: Run Database Migration

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/qzjcvrszcegtdbzwrcis/sql
2. Copy entire content of `MIGRATION_001_UNIFIED_DATABASE.sql`
3. Paste and run in SQL Editor
4. Verify success message appears

**Expected output:**
```
Migration completed successfully!
New tables created: partners, partner_customers, customer_groups, customer_group_members, partner_earnings
```

### Step 2: Test Database Schema

Run these queries to verify:

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'partner%';

-- Check orders table has new columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('source_type', 'partner_id', 'commission_applicable');

-- Check triggers are created
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name LIKE '%partner%';
```

### Step 3: Create Test Partner Account

```sql
-- 1. Create auth user (do this in Supabase Auth UI or via signup)
-- Email: test-partner@onesim.uz
-- Password: (your choice)

-- 2. Get the user_id from auth.users
SELECT id, email FROM auth.users WHERE email = 'test-partner@onesim.uz';

-- 3. Update profile to partner type
UPDATE profiles
SET user_type = 'partner'
WHERE id = '<user_id_from_step_2>';

-- 4. Create partner record
INSERT INTO partners (user_id, company_name, legal_name, business_email)
VALUES (
  '<user_id_from_step_2>',
  'Test Travel Agency',
  'LLC Test Travel',
  'test-partner@onesim.uz'
);

-- 5. Verify partner created
SELECT * FROM partners WHERE business_email = 'test-partner@onesim.uz';
```

### Step 4: Create Test B2B Order

```sql
-- Get partner_id
WITH partner AS (
  SELECT id FROM partners WHERE business_email = 'test-partner@onesim.uz'
)
-- Create partner customer
INSERT INTO partner_customers (partner_id, first_name, last_name, email, phone)
SELECT
  id,
  'Aziza',
  'Karimova',
  'aziza.test@example.com',
  '+998901234567'
FROM partner;

-- Create a B2B order
WITH partner AS (
  SELECT id, user_id, effective_commission_rate FROM partners WHERE business_email = 'test-partner@onesim.uz'
),
customer AS (
  SELECT id FROM partner_customers WHERE email = 'aziza.test@example.com'
),
package AS (
  SELECT package_code, final_price_usd FROM esim_packages LIMIT 1
)
INSERT INTO orders (
  user_id,
  source_type,
  partner_id,
  end_customer_id,
  end_customer_type,
  customer_first_name,
  customer_last_name,
  customer_email,
  transaction_id,
  package_code,
  price_usd,
  commission_applicable,
  commission_rate,
  commission_amount_usd,
  order_status
)
SELECT
  p.user_id,
  'b2b_partner',
  p.id,
  c.id,
  'b2b_partner_customer',
  'Aziza',
  'Karimova',
  'aziza.test@example.com',
  'TEST-B2B-' || gen_random_uuid()::text,
  pkg.package_code,
  pkg.final_price_usd,
  TRUE,
  p.effective_commission_rate,
  pkg.final_price_usd * (p.effective_commission_rate / 100),
  'PENDING'
FROM partner p, customer c, package pkg;

-- Verify order created
SELECT
  o.id,
  o.source_type,
  o.partner_id,
  pt.company_name,
  o.customer_first_name,
  o.commission_amount_usd
FROM orders o
JOIN partners pt ON o.partner_id = pt.id
WHERE o.source_type = 'b2b_partner';
```

### Step 5: Test Commission Trigger

```sql
-- Update order to ALLOCATED status to trigger commission
UPDATE orders
SET order_status = 'ALLOCATED'
WHERE source_type = 'b2b_partner'
AND order_status = 'PENDING'
LIMIT 1;

-- Check commission was created
SELECT
  pe.*,
  pt.company_name
FROM partner_earnings pe
JOIN partners pt ON pe.partner_id = pt.id;

-- Check partner earnings updated
SELECT
  company_name,
  total_earnings,
  pending_earnings,
  total_orders
FROM partners
WHERE business_email = 'test-partner@onesim.uz';
```

---

## 💻 Update Application Code

### OneSIM Shop (B2C) - `D:\webapp\onesim-shop`

**File: `src/lib/createOrder.js` (or similar)**

```javascript
// When creating B2C order, add:
const orderData = {
  user_id: userId,
  source_type: 'b2c',           // ← ADD THIS
  end_customer_id: userId,       // ← ADD THIS
  end_customer_type: 'b2c',      // ← ADD THIS
  partner_id: null,              // ← ADD THIS
  commission_applicable: false,  // ← ADD THIS
  // ... rest of existing fields
};
```

**No other changes needed for B2C app!**

---

### OneSIM Reseller (B2B) - `d:\webapp\onesim-reseller`

#### 1. Partner Authentication

```javascript
// Check if logged-in user is a partner
const { data: partner } = await supabase
  .from('partners')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (!partner) {
  // Redirect to partner registration
}
```

#### 2. Create Partner Customer

```javascript
// src/services/partnerCustomerService.js
export const createPartnerCustomer = async (partnerId, customerData) => {
  const { data, error } = await supabase
    .from('partner_customers')
    .insert({
      partner_id: partnerId,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
    })
    .select()
    .single();

  return { data, error };
};
```

#### 3. Create B2B Order

```javascript
// src/services/orderService.js
export const createPartnerOrder = async (partnerId, customerId, packageData) => {
  // Get partner commission rate
  const { data: partner } = await supabase
    .from('partners')
    .select('effective_commission_rate')
    .eq('id', partnerId)
    .single();

  // Get customer details
  const { data: customer } = await supabase
    .from('partner_customers')
    .select('*')
    .eq('id', customerId)
    .single();

  // Calculate commission
  const commissionAmount = packageData.price_usd * (partner.effective_commission_rate / 100);

  // Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id, // Partner's user_id
      source_type: 'b2b_partner',
      partner_id: partnerId,
      end_customer_id: customerId,
      end_customer_type: 'b2b_partner_customer',
      customer_first_name: customer.first_name,
      customer_last_name: customer.last_name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      transaction_id: `B2B-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      package_code: packageData.package_code,
      package_name: packageData.name,
      price_usd: packageData.price_usd,
      price_uzs: packageData.price_uzs,
      commission_applicable: true,
      commission_rate: partner.effective_commission_rate,
      commission_amount_usd: commissionAmount,
      commission_amount_uzs: commissionAmount * 12650, // UZS conversion
      order_status: 'PENDING',
    })
    .select()
    .single();

  return { data: order, error };
};
```

#### 4. Fetch Partner Orders

```javascript
// src/services/orderService.js
export const getPartnerOrders = async (partnerId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      partner_customers (
        first_name,
        last_name,
        email,
        phone
      ),
      customer_groups (
        name
      )
    `)
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });

  return { data, error };
};
```

#### 5. Fetch Partner Earnings

```javascript
// src/services/earningsService.js
export const getPartnerEarnings = async (partnerId) => {
  const { data, error } = await supabase
    .from('partner_earnings')
    .select(`
      *,
      orders (
        order_no,
        package_name,
        customer_first_name,
        customer_last_name
      )
    `)
    .eq('partner_id', partnerId)
    .order('earned_at', { ascending: false });

  return { data, error };
};

export const getPartnerDashboardStats = async (partnerId) => {
  const { data, error } = await supabase
    .from('v_partner_dashboard_stats')
    .select('*')
    .eq('partner_id', partnerId)
    .single();

  return { data, error };
};
```

---

## 🧪 Testing Checklist

- [ ] B2C order creation still works (existing functionality)
- [ ] Partner can register and create profile
- [ ] Partner can add customers
- [ ] Partner can create customer groups
- [ ] Partner can create B2B orders for customers
- [ ] Commission automatically calculated on order creation
- [ ] Commission record created when order status → ALLOCATED
- [ ] Partner earnings updated correctly
- [ ] RLS: Partner can only see their own data
- [ ] RLS: B2C user cannot see partner data
- [ ] Dashboard stats view works

---

## 📊 Key Queries for Monitoring

### Check Order Distribution
```sql
SELECT
  source_type,
  COUNT(*) as order_count,
  SUM(price_usd) as total_revenue_usd
FROM orders
GROUP BY source_type;
```

### Partner Performance
```sql
SELECT
  pt.company_name,
  pt.total_orders,
  pt.total_earnings,
  pt.pending_earnings,
  COUNT(DISTINCT pc.id) as customer_count
FROM partners pt
LEFT JOIN partner_customers pc ON pt.id = pc.partner_id
GROUP BY pt.id, pt.company_name, pt.total_orders, pt.total_earnings, pt.pending_earnings
ORDER BY pt.total_earnings DESC;
```

### Commission Payout Report
```sql
SELECT
  pt.company_name,
  SUM(CASE WHEN pe.status = 'earned' THEN pe.commission_amount_usd ELSE 0 END) as unpaid_commissions,
  SUM(CASE WHEN pe.status = 'paid' THEN pe.commission_amount_usd ELSE 0 END) as paid_commissions,
  COUNT(*) as total_orders
FROM partner_earnings pe
JOIN partners pt ON pe.partner_id = pt.id
GROUP BY pt.id, pt.company_name;
```

---

## 🎯 Next Steps After Implementation

1. **Partner Onboarding Flow**
   - Create signup form for partners
   - Add KYC/verification workflow
   - Set up email notifications

2. **Commission Payout System**
   - Design payout schedule (monthly/on-demand)
   - Add payout history tracking
   - Integrate payment gateway

3. **Customer Management UI**
   - Build customer list/creation forms
   - Add customer group management
   - Bulk import customers from CSV

4. **Earnings Dashboard**
   - Display commission stats
   - Show payout history
   - Export reports

5. **Admin Panel**
   - Approve/reject partner applications
   - Manage commission rates
   - Process payouts

---

## ⚠️ Important Notes

1. **Existing B2C Orders**: All existing orders will have `source_type = 'b2c'` by default
2. **Backward Compatibility**: B2C shop continues to work without changes
3. **Commission Calculation**: Only happens when `order_status = 'ALLOCATED'`
4. **RLS Security**: Partners can ONLY see their own data
5. **Test Thoroughly**: Use test partner account before going live

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Database → Logs
2. Verify RLS policies: Database → Policies
3. Review trigger execution: Check `partner_earnings` table
4. Test queries in SQL Editor first

---

**Database Migration Created:** February 16, 2026
**Project:** OneSIM (B2C + B2B Unified Platform)
**Supabase Project:** qzjcvrszcegtdbzwrcis
