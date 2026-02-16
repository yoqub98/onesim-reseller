-- ============================================
-- OneSIM UNIFIED DATABASE MIGRATION (CORRECTED)
-- Purpose: Partner DISCOUNT model (NOT commission payments)
-- Version: 2.0 - DISCOUNT MODEL
-- Date: 2026-02-16
-- ============================================

-- CRITICAL CORRECTION:
-- Partners receive DISCOUNTS at purchase time, NOT commission payments
-- They buy at: retail_price * (1 - discount_rate)
-- Their "earnings" = the discount they saved (potential profit margin)

BEGIN;

-- ============================================
-- STEP 1: CREATE NEW TABLES
-- ============================================

-- 1.1 Partners (Travel Agencies, Airlines, Tour Operators)
CREATE TABLE IF NOT EXISTS partners (
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
  address JSONB,

  -- DISCOUNT Model (NOT commission)
  discount_rate DECIMAL(5,2) DEFAULT 5.00, -- Default 5% discount off retail
  custom_discount_rate DECIMAL(5,2), -- Admin can override
  effective_discount_rate DECIMAL(5,2) GENERATED ALWAYS AS (COALESCE(custom_discount_rate, discount_rate)) STORED,

  -- Financials (tracking spend & savings, NOT owed amounts)
  total_spent DECIMAL(15,2) DEFAULT 0.00, -- Total paid (at discounted price)
  total_savings DECIMAL(15,2) DEFAULT 0.00, -- Total discount received (their "earnings")
  total_orders_value_retail DECIMAL(15,2) DEFAULT 0.00, -- What would've cost at retail

  -- Settings
  auto_email_customers BOOLEAN DEFAULT TRUE,
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  preferred_locale VARCHAR(10) DEFAULT 'uz',

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_approval', 'deactivated')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Denormalized Stats
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

COMMENT ON TABLE partners IS 'B2B partner/reseller accounts with discount pricing';
COMMENT ON COLUMN partners.discount_rate IS 'Percentage discount off retail (default 5%)';
COMMENT ON COLUMN partners.total_savings IS 'Total discounts received = their earnings';

-- 1.2 Partner Customers (End customers of partners)
CREATE TABLE IF NOT EXISTS partner_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Additional
  notes TEXT,
  tags JSONB,

  -- Stats
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0.00,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ,

  CONSTRAINT unique_partner_customer_email UNIQUE(partner_id, email)
);

CREATE INDEX idx_partner_customers_partner_id ON partner_customers(partner_id);
CREATE INDEX idx_partner_customers_email ON partner_customers(email);
CREATE INDEX idx_partner_customers_user_id ON partner_customers(user_id) WHERE user_id IS NOT NULL;

-- 1.3 Customer Groups
CREATE TABLE IF NOT EXISTS customer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  destination_country_code VARCHAR(10),
  destination_name VARCHAR(255),

  travel_start_date DATE,
  travel_end_date DATE,
  group_size INTEGER DEFAULT 0,
  tags JSONB,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_groups_partner_id ON customer_groups(partner_id);
CREATE INDEX idx_customer_groups_active ON customer_groups(is_active) WHERE is_active = TRUE;

-- 1.4 Customer Group Members
CREATE TABLE IF NOT EXISTS customer_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES partner_customers(id) ON DELETE CASCADE,

  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),

  CONSTRAINT unique_group_member UNIQUE(group_id, customer_id)
);

CREATE INDEX idx_group_members_group_id ON customer_group_members(group_id);
CREATE INDEX idx_group_members_customer_id ON customer_group_members(customer_id);

-- 1.5 Partner Earnings (DISCOUNT/SAVINGS tracking - NOT commission)
CREATE TABLE IF NOT EXISTS partner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Pricing Breakdown
  retail_price_usd DECIMAL(10,4) NOT NULL, -- OneSIM Shop public price
  retail_price_uzs DECIMAL(15,2),
  discount_rate DECIMAL(5,2) NOT NULL, -- Partner's discount % at time of order
  discount_amount_usd DECIMAL(10,4) NOT NULL, -- Amount saved (their "earning")
  discount_amount_uzs DECIMAL(15,2),
  partner_paid_usd DECIMAL(10,4) NOT NULL, -- What partner actually paid
  partner_paid_uzs DECIMAL(15,2),

  -- Partner's Resale Tracking (optional)
  partner_sell_price_usd DECIMAL(10,4), -- What partner charged their customer
  partner_sell_price_uzs DECIMAL(15,2),
  partner_actual_profit_usd DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN partner_sell_price_usd IS NOT NULL
    THEN partner_sell_price_usd - partner_paid_usd
    ELSE NULL END
  ) STORED,

  -- Status
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),

  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_order_earning UNIQUE(order_id)
);

CREATE INDEX idx_partner_earnings_partner_id ON partner_earnings(partner_id);
CREATE INDEX idx_partner_earnings_order_id ON partner_earnings(order_id);
CREATE INDEX idx_partner_earnings_status ON partner_earnings(status);
CREATE INDEX idx_partner_earnings_purchased_at ON partner_earnings(purchased_at DESC);

COMMENT ON TABLE partner_earnings IS 'Tracks partner discounts/savings per order (NOT money owed)';
COMMENT ON COLUMN partner_earnings.discount_amount_usd IS 'The discount/saving = partner earnings';
COMMENT ON COLUMN partner_earnings.partner_paid_usd IS 'Discounted price partner actually paid';
COMMENT ON COLUMN partner_earnings.partner_sell_price_usd IS 'Optional: what partner sold to their customer';

-- ============================================
-- STEP 2: MODIFY EXISTING TABLES
-- ============================================

-- 2.1 Add columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
    ALTER TABLE profiles
      ADD COLUMN user_type VARCHAR(20) DEFAULT 'customer'
        CHECK (user_type IN ('customer', 'partner', 'admin')),
      ADD COLUMN is_partner BOOLEAN GENERATED ALWAYS AS (user_type = 'partner') STORED,
      ADD COLUMN is_admin BOOLEAN GENERATED ALWAYS AS (user_type = 'admin') STORED;

    CREATE INDEX idx_profiles_user_type ON profiles(user_type);
    CREATE INDEX idx_profiles_partners ON profiles(is_partner) WHERE is_partner = TRUE;
  END IF;
END $$;

-- 2.2 Add columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'source_type') THEN
    ALTER TABLE orders ADD COLUMN source_type VARCHAR(20) DEFAULT 'b2c'
      CHECK (source_type IN ('b2c', 'b2b_partner', 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'partner_id') THEN
    ALTER TABLE orders ADD COLUMN partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'end_customer_id') THEN
    ALTER TABLE orders ADD COLUMN end_customer_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'end_customer_type') THEN
    ALTER TABLE orders ADD COLUMN end_customer_type VARCHAR(20)
      CHECK (end_customer_type IN ('b2c', 'b2b_partner_customer'));
  END IF;

  -- Customer details (denormalized)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_first_name') THEN
    ALTER TABLE orders
      ADD COLUMN customer_first_name VARCHAR(100),
      ADD COLUMN customer_last_name VARCHAR(100),
      ADD COLUMN customer_email VARCHAR(255),
      ADD COLUMN customer_phone VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_group_id') THEN
    ALTER TABLE orders ADD COLUMN customer_group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL;
  END IF;

  -- Partner DISCOUNT (NOT commission)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_applicable') THEN
    ALTER TABLE orders
      ADD COLUMN discount_applicable BOOLEAN DEFAULT FALSE,
      ADD COLUMN discount_rate DECIMAL(5,2),
      ADD COLUMN discount_amount_usd DECIMAL(10,4), -- Savings partner got
      ADD COLUMN discount_amount_uzs DECIMAL(15,2),
      ADD COLUMN partner_paid_usd DECIMAL(10,4), -- What partner actually paid
      ADD COLUMN partner_paid_uzs DECIMAL(15,2),
      ADD COLUMN retail_price_override_usd DECIMAL(10,4); -- If different from package price
  END IF;

  -- Delivery & Metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_method') THEN
    ALTER TABLE orders
      ADD COLUMN delivery_method VARCHAR(20) DEFAULT 'email'
        CHECK (delivery_method IN ('email', 'sms', 'whatsapp', 'manual')),
      ADD COLUMN delivery_status JSONB,
      ADD COLUMN notes TEXT,
      ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_source_type ON orders(source_type);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_end_customer_id ON orders(end_customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_group_id ON orders(customer_group_id) WHERE customer_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_discount_applicable ON orders(discount_applicable) WHERE discount_applicable = TRUE;

COMMENT ON COLUMN orders.discount_amount_usd IS 'Discount partner received (their earning)';
COMMENT ON COLUMN orders.partner_paid_usd IS 'Actual discounted price partner paid';

-- ============================================
-- STEP 3: CREATE TRIGGERS & FUNCTIONS
-- ============================================

-- 3.1 Update partner stats when order is created
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

DROP TRIGGER IF EXISTS trg_update_partner_stats_on_order ON orders;
CREATE TRIGGER trg_update_partner_stats_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_stats_on_order();

-- 3.2 Track partner savings when order is allocated
CREATE OR REPLACE FUNCTION track_partner_savings_on_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_retail_price DECIMAL(10,4);
BEGIN
  -- Only track if partner order and newly allocated
  IF NEW.partner_id IS NOT NULL
     AND NEW.discount_applicable = TRUE
     AND NEW.order_status = 'ALLOCATED'
     AND (OLD.order_status IS NULL OR OLD.order_status != 'ALLOCATED') THEN

    -- Determine retail price
    v_retail_price := COALESCE(NEW.retail_price_override_usd, NEW.price_usd + NEW.discount_amount_usd);

    -- Create savings/earnings record
    INSERT INTO partner_earnings (
      partner_id,
      order_id,
      retail_price_usd,
      retail_price_uzs,
      discount_rate,
      discount_amount_usd,
      discount_amount_uzs,
      partner_paid_usd,
      partner_paid_uzs,
      status
    ) VALUES (
      NEW.partner_id,
      NEW.id,
      v_retail_price,
      v_retail_price * 12650, -- UZS conversion (approximate)
      NEW.discount_rate,
      NEW.discount_amount_usd,
      NEW.discount_amount_uzs,
      NEW.partner_paid_usd,
      NEW.partner_paid_uzs,
      'completed'
    )
    ON CONFLICT (order_id) DO NOTHING;

    -- Update partner totals
    UPDATE partners
    SET
      total_spent = total_spent + NEW.partner_paid_usd,
      total_savings = total_savings + NEW.discount_amount_usd,
      total_orders_value_retail = total_orders_value_retail + v_retail_price
    WHERE id = NEW.partner_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_track_partner_savings ON orders;
CREATE TRIGGER trg_track_partner_savings
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_partner_savings_on_allocation();

-- 3.3 Update customer group size
CREATE OR REPLACE FUNCTION update_group_size()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customer_groups SET group_size = group_size + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customer_groups SET group_size = group_size - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_group_size ON customer_group_members;
CREATE TRIGGER trg_update_group_size
  AFTER INSERT OR DELETE ON customer_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_size();

-- 3.4 Updated_at triggers
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_customers_updated_at ON partner_customers;
CREATE TRIGGER update_partner_customers_updated_at BEFORE UPDATE ON partner_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_groups_updated_at ON customer_groups;
CREATE TRIGGER update_customer_groups_updated_at BEFORE UPDATE ON customer_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_earnings_updated_at ON partner_earnings;
CREATE TRIGGER update_partner_earnings_updated_at BEFORE UPDATE ON partner_earnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_earnings ENABLE ROW LEVEL SECURITY;

-- Partners policies
DROP POLICY IF EXISTS "Partners can view own profile" ON partners;
CREATE POLICY "Partners can view own profile" ON partners
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can update own profile" ON partners;
CREATE POLICY "Partners can update own profile" ON partners
  FOR UPDATE USING (auth.uid() = user_id);

-- Partner customers policies
DROP POLICY IF EXISTS "Partners can manage own customers" ON partner_customers;
CREATE POLICY "Partners can manage own customers" ON partner_customers
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Customer groups policies
DROP POLICY IF EXISTS "Partners can manage own groups" ON customer_groups;
CREATE POLICY "Partners can manage own groups" ON customer_groups
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- Group members policies
DROP POLICY IF EXISTS "Partners can manage own group members" ON customer_group_members;
CREATE POLICY "Partners can manage own group members" ON customer_group_members
  FOR ALL USING (
    group_id IN (
      SELECT id FROM customer_groups
      WHERE partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    )
  );

-- Partner earnings policies
DROP POLICY IF EXISTS "Partners can view own earnings" ON partner_earnings;
CREATE POLICY "Partners can view own earnings" ON partner_earnings
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role manages earnings" ON partner_earnings;
CREATE POLICY "Service role manages earnings" ON partner_earnings
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Orders policies (updated)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    (source_type = 'b2c' AND auth.uid() = user_id)
    OR (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Partners can create orders" ON orders;
CREATE POLICY "Partners can create orders" ON orders
  FOR INSERT WITH CHECK (
    (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))
    OR (source_type = 'b2c' AND auth.uid() = user_id)
  );

-- ============================================
-- STEP 5: CREATE VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_partner_dashboard_stats AS
SELECT
  pt.id AS partner_id,
  pt.company_name,
  pt.effective_discount_rate,
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'ALLOCATED' THEN o.id END) AS active_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'PENDING' THEN o.id END) AS pending_orders,
  pt.total_spent AS total_spent_usd,
  pt.total_savings AS total_savings_usd, -- Their "earnings"
  pt.total_orders_value_retail AS would_have_paid_retail_usd,
  pt.total_customers,
  COUNT(DISTINCT cg.id) AS total_groups
FROM partners pt
LEFT JOIN orders o ON pt.id = o.partner_id
LEFT JOIN customer_groups cg ON pt.id = cg.partner_id
GROUP BY pt.id, pt.company_name, pt.effective_discount_rate, pt.total_spent, pt.total_savings, pt.total_orders_value_retail, pt.total_customers;

COMMENT ON VIEW v_partner_dashboard_stats IS 'Partner dashboard showing spending, savings (earnings), and stats';

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
SELECT 'Migration completed - DISCOUNT MODEL (not commission)' AS status;
