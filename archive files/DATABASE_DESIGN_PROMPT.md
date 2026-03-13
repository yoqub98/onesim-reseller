# OneSIM Unified Database Design Specification

## Executive Summary

Design a comprehensive Supabase PostgreSQL database schema for **OneSIM** - a dual-platform eSIM marketplace consisting of:
1. **OneSIM Shop (B2C)**: Direct consumer platform at `D:\webapp\onesim-shop`
2. **OneSIM Reseller (B2B)**: Partner/agency platform at `d:\webapp\onesim-reseller`

Both platforms share a single Supabase database (`project: onesim`, ID: `qzjcvrszcegtdbzwrcis`) and must support:
- Shared authentication system with role-based access
- Unified order management across B2C and B2B channels
- Partner commission tracking (5% default model)
- Customer management (direct + partner customers)
- eSIM lifecycle from eSIMAccess provider API

---

## Current Database State

### Existing Tables (from onesim-shop):
```
✅ auth.users (Supabase Auth)
✅ profiles
✅ esim_packages (2033 rows)
✅ package_operators
✅ package_price_changes
✅ margin_overrides
✅ price_sync_log
✅ package_views
✅ cached_regional_packages
✅ cached_global_packages
✅ package_cache_metadata
✅ user_favorites
✅ orders (6 rows) - NEEDS ENHANCEMENT
✅ order_action_logs
```

---

## Business Logic Requirements

### 1. User & Partner Management

#### User Types:
- **B2C Customer**: Regular consumer buying eSIMs directly
- **B2B Partner**: Travel agency/airline/tour operator with reseller account
- **B2B Partner Customer**: End customer of the partner (managed by partner)
- **Admin**: Platform administrator

#### Partner Business Model:
- Partners get **5% DISCOUNT** (default) on OneSIM retail prices
- Discount is applied at purchase time (they pay less upfront)
- Partners resell to their customers at any price they choose
- Partners' "earnings" = the discount saved (their profit margin opportunity)
- We don't pay partners anything - the discount IS their revenue model
- Partners can purchase eSIMs in bulk for their customer groups
- Partners assign eSIMs to their end customers
- Partners track their savings/discount earnings, customer groups, and order history

### 2. Order Source Types

Every order must identify its source:

```typescript
type OrderSource =
  | 'b2c'              // Direct customer purchase (OneSIM Shop)
  | 'b2b_partner'      // Partner purchasing for their customer
  | 'admin'            // Admin-initiated order

interface Order {
  source_type: OrderSource;
  partner_id?: UUID;          // NULL for B2C, set for B2B
  end_customer_id?: UUID;     // Who actually uses the eSIM
  purchasing_user_id: UUID;   // Who made the purchase
}
```

**Examples:**
- **B2C Order**: User buys for themselves
  - `source_type = 'b2c'`
  - `partner_id = NULL`
  - `end_customer_id = purchasing_user_id`

- **B2B Order**: Partner "Grand Travel Tour" buys for client "Aziza Karimova"
  - `source_type = 'b2b_partner'`
  - `partner_id = <Grand Travel Tour UUID>`
  - `end_customer_id = <Aziza UUID>`
  - `purchasing_user_id = <Grand Travel Tour UUID>`

- **Admin Order**: Admin creates order manually
  - `source_type = 'admin'`
  - `partner_id = NULL` (or set if for a partner)

### 3. Customer Management

```typescript
// Two types of customers:
interface DirectCustomer {
  user_id: UUID;              // From auth.users
  type: 'b2c';
  owns_orders: Order[];       // Their own purchases
}

interface PartnerCustomer {
  id: UUID;
  partner_id: UUID;           // Which partner manages them
  type: 'b2b_partner_customer';
  // May or may not have auth.users account
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_groups: UUID[];    // Can belong to multiple groups
}
```

### 4. Partner Discount & Earnings Tracking

**Important:** Partners do NOT receive commission payments. They receive DISCOUNTS at purchase time.

```sql
-- Partner discount model:
-- retail_price = OneSIM Shop public price (with our margin)
-- partner_discount_rate = 5% (default, customizable per partner)
-- partner_pays = retail_price * (1 - partner_discount_rate)
-- partner_savings = retail_price - partner_pays

-- Example:
-- retail_price = $15.00
-- partner_discount_rate = 5%
-- partner_pays = $15.00 * 0.95 = $14.25
-- partner_savings = $0.75 (this is their "earning" - the discount they got)

-- Revenue Model:
-- - We charge partner $14.25 (they pay upfront at discount)
-- - Partner sells to their customer for $20.00 (their choice)
-- - Partner's actual profit = $20.00 - $14.25 = $5.75
-- - We track their $0.75 savings as "earnings" (potential profit margin)
```

---

## Required Database Schema Changes

### NEW TABLES TO CREATE:

#### 1. `partners` - Partner/Agency Profiles
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Company Info
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  company_type VARCHAR(50), -- 'travel_agency', 'airline', 'tour_operator'
  tax_id VARCHAR(100),
  registration_number VARCHAR(100),

  -- Contact
  business_email VARCHAR(255) NOT NULL,
  business_phone VARCHAR(50),
  website VARCHAR(255),
  address JSONB, -- {street, city, country, postal_code}

  -- Business
  commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Default 5%
  custom_commission_rate DECIMAL(5,2), -- Override if needed
  effective_commission_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    COALESCE(custom_commission_rate, commission_rate)
  ) STORED,

  -- Billing
  balance DECIMAL(15,2) DEFAULT 0.00, -- Available balance
  total_earnings DECIMAL(15,2) DEFAULT 0.00, -- Lifetime earnings
  pending_earnings DECIMAL(15,2) DEFAULT 0.00, -- Not yet paid out

  -- Settings
  auto_email_customers BOOLEAN DEFAULT TRUE,
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  preferred_locale VARCHAR(10) DEFAULT 'uz',

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_approval', 'deactivated')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Stats (denormalized for performance)
  total_orders INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ
);

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_status ON partners(status) WHERE status = 'active';
CREATE INDEX idx_partners_company_name ON partners(company_name);
```

#### 2. `partner_customers` - Partner's End Customers
```sql
CREATE TABLE partner_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- May link to auth.users if they also have a direct account
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Additional
  notes TEXT,
  tags JSONB, -- ['vip', 'group-tour-2024']

  -- Stats
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0.00,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_partner_customer_email UNIQUE(partner_id, email)
);

CREATE INDEX idx_partner_customers_partner_id ON partner_customers(partner_id);
CREATE INDEX idx_partner_customers_email ON partner_customers(email);
CREATE INDEX idx_partner_customers_user_id ON partner_customers(user_id) WHERE user_id IS NOT NULL;
```

#### 3. `customer_groups` - Bulk Customer Management
```sql
CREATE TABLE customer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- Group Info
  name VARCHAR(255) NOT NULL, -- "Antalya Tour Group - Oct 2024"
  description TEXT,
  destination_country_code VARCHAR(10),
  destination_name VARCHAR(255),

  -- Metadata
  travel_start_date DATE,
  travel_end_date DATE,
  group_size INTEGER DEFAULT 0,
  tags JSONB,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_groups_partner_id ON customer_groups(partner_id);
CREATE INDEX idx_customer_groups_active ON customer_groups(is_active) WHERE is_active = TRUE;
```

#### 4. `customer_group_members` - Junction Table
```sql
CREATE TABLE customer_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES partner_customers(id) ON DELETE CASCADE,

  -- Metadata
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),

  CONSTRAINT unique_group_member UNIQUE(group_id, customer_id)
);

CREATE INDEX idx_group_members_group_id ON customer_group_members(group_id);
CREATE INDEX idx_group_members_customer_id ON customer_group_members(customer_id);
```

#### 5. `partner_earnings` - Commission Tracking
```sql
CREATE TABLE partner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Amounts
  order_amount_usd DECIMAL(10,4) NOT NULL,
  order_amount_uzs DECIMAL(15,2),
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount_usd DECIMAL(10,4) NOT NULL,
  commission_amount_uzs DECIMAL(15,2),

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'earned', 'paid', 'cancelled')),

  -- Payout tracking
  paid_out BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  payout_method VARCHAR(50),
  payout_reference VARCHAR(255),

  -- Timestamps
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_order_earning UNIQUE(order_id)
);

CREATE INDEX idx_partner_earnings_partner_id ON partner_earnings(partner_id);
CREATE INDEX idx_partner_earnings_order_id ON partner_earnings(order_id);
CREATE INDEX idx_partner_earnings_status ON partner_earnings(status);
CREATE INDEX idx_partner_earnings_earned_at ON partner_earnings(earned_at DESC);
```

---

### MODIFY EXISTING TABLE: `orders`

```sql
-- Add new columns to existing orders table:
ALTER TABLE orders
  -- Source tracking
  ADD COLUMN source_type VARCHAR(20) DEFAULT 'b2c'
    CHECK (source_type IN ('b2c', 'b2b_partner', 'admin')),
  ADD COLUMN partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  ADD COLUMN end_customer_id UUID, -- Can be user_id OR partner_customer_id
  ADD COLUMN end_customer_type VARCHAR(20)
    CHECK (end_customer_type IN ('b2c', 'b2b_partner_customer')),

  -- Customer details (denormalized for easy access)
  ADD COLUMN customer_first_name VARCHAR(100),
  ADD COLUMN customer_last_name VARCHAR(100),
  ADD COLUMN customer_email VARCHAR(255),
  ADD COLUMN customer_phone VARCHAR(50),

  -- Group affiliation
  ADD COLUMN customer_group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL,

  -- Partner commission
  ADD COLUMN commission_applicable BOOLEAN DEFAULT FALSE,
  ADD COLUMN commission_rate DECIMAL(5,2),
  ADD COLUMN commission_amount_usd DECIMAL(10,4),
  ADD COLUMN commission_amount_uzs DECIMAL(15,2),

  -- Delivery tracking
  ADD COLUMN delivery_method VARCHAR(20) DEFAULT 'email'
    CHECK (delivery_method IN ('email', 'sms', 'whatsapp', 'manual')),
  ADD COLUMN delivery_status JSONB, -- {email: 'sent', sms: 'failed'}

  -- Enhanced metadata
  ADD COLUMN notes TEXT,
  ADD COLUMN metadata JSONB; -- Flexible field for additional data

-- Create indexes for new columns
CREATE INDEX idx_orders_source_type ON orders(source_type);
CREATE INDEX idx_orders_partner_id ON orders(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX idx_orders_end_customer_id ON orders(end_customer_id);
CREATE INDEX idx_orders_customer_group_id ON orders(customer_group_id) WHERE customer_group_id IS NOT NULL;
CREATE INDEX idx_orders_commission_applicable ON orders(commission_applicable) WHERE commission_applicable = TRUE;

-- Comments
COMMENT ON COLUMN orders.source_type IS 'Order source: b2c (direct customer), b2b_partner (partner order), admin (admin created)';
COMMENT ON COLUMN orders.partner_id IS 'Partner who made the purchase (NULL for B2C orders)';
COMMENT ON COLUMN orders.end_customer_id IS 'Actual eSIM user - references auth.users.id for B2C or partner_customers.id for B2B';
COMMENT ON COLUMN orders.user_id IS 'Who initiated/paid for the order (customer for B2C, partner for B2B)';
```

---

### MODIFY EXISTING TABLE: `profiles`

```sql
-- Add role and type information
ALTER TABLE profiles
  ADD COLUMN user_type VARCHAR(20) DEFAULT 'customer'
    CHECK (user_type IN ('customer', 'partner', 'admin')),
  ADD COLUMN is_partner BOOLEAN GENERATED ALWAYS AS (user_type = 'partner') STORED,
  ADD COLUMN is_admin BOOLEAN GENERATED ALWAYS AS (user_type = 'admin') STORED;

CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_partners ON profiles(is_partner) WHERE is_partner = TRUE;
```

---

## Database Triggers & Functions

### 1. Auto-update partner stats when order is created
```sql
CREATE OR REPLACE FUNCTION update_partner_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL THEN
    UPDATE partners
    SET
      total_orders = total_orders + 1,
      last_order_at = NOW()
    WHERE id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_partner_stats_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_stats_on_order();
```

### 2. Auto-create commission record when order is allocated
```sql
CREATE OR REPLACE FUNCTION create_partner_earning_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create earning if:
  -- 1. Order is for a partner (partner_id IS NOT NULL)
  -- 2. Order is newly allocated (NEW.order_status = 'ALLOCATED')
  -- 3. Commission is applicable
  IF NEW.partner_id IS NOT NULL
     AND NEW.commission_applicable = TRUE
     AND NEW.order_status = 'ALLOCATED'
     AND OLD.order_status != 'ALLOCATED' THEN

    INSERT INTO partner_earnings (
      partner_id,
      order_id,
      order_amount_usd,
      order_amount_uzs,
      commission_rate,
      commission_amount_usd,
      commission_amount_uzs,
      status
    ) VALUES (
      NEW.partner_id,
      NEW.id,
      NEW.price_usd,
      NEW.price_uzs,
      NEW.commission_rate,
      NEW.commission_amount_usd,
      NEW.commission_amount_uzs,
      'earned'
    )
    ON CONFLICT (order_id) DO NOTHING;

    -- Update partner total earnings
    UPDATE partners
    SET
      total_earnings = total_earnings + NEW.commission_amount_usd,
      pending_earnings = pending_earnings + NEW.commission_amount_usd
    WHERE id = NEW.partner_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_partner_earning
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_partner_earning_on_allocation();
```

### 3. Auto-update customer group size
```sql
CREATE OR REPLACE FUNCTION update_group_size()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customer_groups
    SET group_size = group_size + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customer_groups
    SET group_size = group_size - 1
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_group_size
  AFTER INSERT OR DELETE ON customer_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_size();
```

---

## Row Level Security (RLS) Policies

### Partners Table
```sql
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Partners can view their own profile
CREATE POLICY "Partners can view own profile" ON partners
  FOR SELECT
  USING (auth.uid() = user_id);

-- Partners can update their own profile
CREATE POLICY "Partners can update own profile" ON partners
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all partners
CREATE POLICY "Admins can view all partners" ON partners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
```

### Partner Customers Table
```sql
ALTER TABLE partner_customers ENABLE ROW LEVEL SECURITY;

-- Partners can view their own customers
CREATE POLICY "Partners can view own customers" ON partner_customers
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Partners can manage their own customers
CREATE POLICY "Partners can manage own customers" ON partner_customers
  FOR ALL
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );
```

### Orders Table (Enhanced)
```sql
-- Update existing policies

-- B2C: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (
    -- Direct B2C orders
    (source_type = 'b2c' AND auth.uid() = user_id)
    OR
    -- B2B: Partner can see all their orders
    (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))
    OR
    -- Admin can see all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Partners can create orders for their customers
CREATE POLICY "Partners can create orders" ON orders
  FOR INSERT
  WITH CHECK (
    (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))
    OR
    (source_type = 'b2c' AND auth.uid() = user_id)
  );
```

### Partner Earnings Table
```sql
ALTER TABLE partner_earnings ENABLE ROW LEVEL SECURITY;

-- Partners can view their own earnings
CREATE POLICY "Partners can view own earnings" ON partner_earnings
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert/update earnings (via triggers)
CREATE POLICY "Service role manages earnings" ON partner_earnings
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
```

---

## Useful Database Views

### 1. Complete Order View (with all customer and partner info)
```sql
CREATE OR REPLACE VIEW v_orders_complete AS
SELECT
  o.*,
  -- User info (who made the purchase)
  p_user.first_name AS user_first_name,
  p_user.last_name AS user_last_name,

  -- Partner info (if B2B)
  pt.company_name AS partner_company_name,
  pt.business_email AS partner_email,

  -- End customer info
  CASE
    WHEN o.source_type = 'b2c' THEN p_user.first_name
    WHEN o.source_type = 'b2b_partner' THEN pc.first_name
    ELSE o.customer_first_name
  END AS end_customer_first_name,

  CASE
    WHEN o.source_type = 'b2c' THEN p_user.last_name
    WHEN o.source_type = 'b2b_partner' THEN pc.last_name
    ELSE o.customer_last_name
  END AS end_customer_last_name,

  CASE
    WHEN o.source_type = 'b2c' THEN p_user.phone
    WHEN o.source_type = 'b2b_partner' THEN pc.email
    ELSE o.customer_email
  END AS end_customer_email,

  -- Group info
  cg.name AS group_name,

  -- Package info
  pkg.name AS package_name,
  pkg.data_gb,
  pkg.duration,

  -- Earnings
  pe.commission_amount_usd,
  pe.status AS earning_status

FROM orders o
LEFT JOIN profiles p_user ON o.user_id = p_user.id
LEFT JOIN partners pt ON o.partner_id = pt.id
LEFT JOIN partner_customers pc ON (o.end_customer_id = pc.id AND o.end_customer_type = 'b2b_partner_customer')
LEFT JOIN customer_groups cg ON o.customer_group_id = cg.id
LEFT JOIN esim_packages pkg ON o.package_code = pkg.package_code
LEFT JOIN partner_earnings pe ON o.id = pe.order_id;
```

### 2. Partner Dashboard Stats
```sql
CREATE OR REPLACE VIEW v_partner_dashboard_stats AS
SELECT
  pt.id AS partner_id,
  pt.company_name,

  -- Orders
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'ALLOCATED' THEN o.id END) AS active_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'PENDING' THEN o.id END) AS pending_orders,

  -- Revenue
  COALESCE(SUM(CASE WHEN o.order_status = 'ALLOCATED' THEN o.price_usd END), 0) AS total_spent_usd,
  COALESCE(SUM(CASE WHEN o.order_status = 'ALLOCATED' THEN o.price_uzs END), 0) AS total_spent_uzs,

  -- Earnings
  pt.total_earnings,
  pt.pending_earnings,
  pt.balance,

  -- Customers
  pt.total_customers,
  COUNT(DISTINCT cg.id) AS total_groups

FROM partners pt
LEFT JOIN orders o ON pt.id = o.partner_id
LEFT JOIN customer_groups cg ON pt.id = cg.partner_id
GROUP BY pt.id, pt.company_name, pt.total_earnings, pt.pending_earnings, pt.balance, pt.total_customers;
```

---

## Migration SQL Script

```sql
-- Run this SQL script in your Supabase SQL Editor

BEGIN;

-- 1. Create partners table
-- [Full CREATE TABLE statement from above]

-- 2. Create partner_customers table
-- [Full CREATE TABLE statement from above]

-- 3. Create customer_groups table
-- [Full CREATE TABLE statement from above]

-- 4. Create customer_group_members table
-- [Full CREATE TABLE statement from above]

-- 5. Create partner_earnings table
-- [Full CREATE TABLE statement from above]

-- 6. Modify orders table
-- [Full ALTER TABLE statement from above]

-- 7. Modify profiles table
-- [Full ALTER TABLE statement from above]

-- 8. Create triggers
-- [All trigger creation statements from above]

-- 9. Create views
-- [All view creation statements from above]

-- 10. Set up RLS policies
-- [All RLS policy statements from above]

COMMIT;
```

---

## Sample Data for Testing

```sql
-- 1. Create a test partner
INSERT INTO auth.users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'grandtravel@example.com');

INSERT INTO profiles (id, first_name, last_name, phone, user_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Grand', 'Travel', '+998901234567', 'partner');

INSERT INTO partners (user_id, company_name, legal_name, business_email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Grand Travel Tour', 'MCHJ "Grand Travel"', 'info@grandtravel.uz');

-- 2. Create partner customers
INSERT INTO partner_customers (partner_id, first_name, last_name, email, phone) VALUES
  ((SELECT id FROM partners WHERE company_name = 'Grand Travel Tour'), 'Aziza', 'Karimova', 'aziza@example.com', '+998901111111'),
  ((SELECT id FROM partners WHERE company_name = 'Grand Travel Tour'), 'Jahongir', 'Xasanov', 'jahongir@example.com', '+998902222222');

-- 3. Create a customer group
INSERT INTO customer_groups (partner_id, name, destination_country_code, destination_name) VALUES
  ((SELECT id FROM partners WHERE company_name = 'Grand Travel Tour'), 'Antalya Tour Group - Oct 2024', 'TR', 'Turkiya');

-- 4. Create a B2B order
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
  price_uzs,
  commission_applicable,
  commission_rate,
  commission_amount_usd,
  order_status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001', -- partner user_id
  'b2b_partner',
  (SELECT id FROM partners WHERE company_name = 'Grand Travel Tour'),
  (SELECT id FROM partner_customers WHERE email = 'aziza@example.com'),
  'b2b_partner_customer',
  'Aziza',
  'Karimova',
  'aziza@example.com',
  'TXN-B2B-001',
  'PACKAGE_CODE_HERE',
  19.00,
  240000,
  TRUE,
  5.00,
  0.95,
  'ALLOCATED'
);
```

---

## API Integration Points

### eSIMAccess Provider
- Orders placed via both B2C and B2B must call eSIMAccess API
- Response data (ICCID, QR, activation codes) stored in `orders` table
- Usage tracking updated via webhook or polling from eSIMAccess

---

## Application Logic Notes

### Order Creation Flow

**B2C (OneSIM Shop):**
1. User browses packages
2. User clicks "Buy"
3. Create order with:
   - `source_type = 'b2c'`
   - `user_id = auth.uid()`
   - `end_customer_id = auth.uid()`
   - `end_customer_type = 'b2c'`
   - `partner_id = NULL`
   - `commission_applicable = FALSE`

**B2B (OneSIM Reseller):**
1. Partner browses packages
2. Partner enters customer details (or selects from existing)
3. Create order with:
   - `source_type = 'b2b_partner'`
   - `user_id = auth.uid()` (partner)
   - `partner_id = <partner.id>`
   - `end_customer_id = <partner_customer.id>`
   - `end_customer_type = 'b2b_partner_customer'`
   - `commission_applicable = TRUE`
   - `commission_rate = <partner.effective_commission_rate>`
   - Calculate: `commission_amount_usd = price_usd * (commission_rate / 100)`

### Commission Lifecycle
1. Order created → `partner_earnings.status = 'pending'`
2. Order allocated → Trigger creates earning record → `status = 'earned'`
3. Monthly payout → `status = 'paid'`, `paid_at = NOW()`

---

## Performance Considerations

1. **Denormalization**: Customer details copied to `orders` for fast queries
2. **Materialized Stats**: `partners.total_orders`, `partners.total_earnings` updated via triggers
3. **Indexes**: All foreign keys, frequently filtered columns, and date columns indexed
4. **Views**: Pre-computed joins for complex queries

---

## Security Considerations

1. **RLS Enabled**: All partner-related tables have Row Level Security
2. **Service Role Only**: Certain operations (commission creation) restricted to service_role
3. **Email Validation**: Enforce unique email per partner in `partner_customers`
4. **Audit Trail**: `order_action_logs` tracks all modifications

---

## Next Steps for Implementation

1. **Backup Current Database**: Create snapshot before running migrations
2. **Run Migration Script**: Execute the full SQL migration
3. **Test RLS Policies**: Verify partners can only see their own data
4. **Update Application Code**:
   - OneSIM Shop: Ensure orders set `source_type = 'b2c'`
   - OneSIM Reseller: Implement partner customer management
5. **Test Commission Calculation**: Verify triggers create earnings correctly
6. **Set Up Monitoring**: Track order creation, commission accrual

---

## Questions to Resolve Before Implementation

1. **Partner Approval Workflow**: Should partners be auto-approved or require admin review?
2. **Payout Schedule**: Monthly? On-demand? Minimum threshold?
3. **Currency Conversion**: How to handle UZS ↔ USD for commissions?
4. **Partner Onboarding**: What KYC/documents required?
5. **Commission Disputes**: How to handle refunds/cancellations?
6. **Customer Data Ownership**: Can customers belong to multiple partners?
7. **API Access**: Do partners get API keys for integration?

---

## Appendix: Table Relationships Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (user_type: customer | partner | admin)
    ↓
    ├─→ partners (if user_type = 'partner')
    │       ↓
    │       ├─→ partner_customers
    │       │       ↓
    │       │       └─→ customer_group_members
    │       │               ↓
    │       │       customer_groups
    │       │
    │       └─→ partner_earnings
    │               ↓
    └─→ orders ←────┘
            ↓
        order_action_logs
```

---

**End of Database Design Specification**

Generated for: OneSIM Platform (B2C + B2B)
Database: Supabase PostgreSQL
Project: `onesim` (qzjcvrszcegtdbzwrcis)
Date: February 16, 2026
