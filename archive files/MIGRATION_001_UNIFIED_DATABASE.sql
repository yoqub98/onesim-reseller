-- ============================================
-- OneSIM UNIFIED DATABASE MIGRATION
-- Purpose: Add B2B Partner functionality to existing B2C database
-- Version: 1.0
-- Date: 2026-02-16
-- ============================================

-- IMPORTANT: This migration adds partner/B2B functionality while preserving existing B2C data
-- Existing tables modified: orders, profiles
-- New tables: partners, partner_customers, customer_groups, customer_group_members, partner_earnings

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

  -- Commission Model
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  custom_commission_rate DECIMAL(5,2),
  effective_commission_rate DECIMAL(5,2) GENERATED ALWAYS AS (COALESCE(custom_commission_rate, commission_rate)) STORED,

  -- Financials
  balance DECIMAL(15,2) DEFAULT 0.00,
  total_earnings DECIMAL(15,2) DEFAULT 0.00,
  pending_earnings DECIMAL(15,2) DEFAULT 0.00,

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

COMMENT ON TABLE partners IS 'B2B partner/reseller accounts (travel agencies, airlines, etc.)';

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

COMMENT ON TABLE partner_customers IS 'End customers managed by B2B partners';

-- 1.3 Customer Groups (Bulk management for tours/groups)
CREATE TABLE IF NOT EXISTS customer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- Group Info
  name VARCHAR(255) NOT NULL,
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

COMMENT ON TABLE customer_groups IS 'Partner customer groups for bulk tour/travel management';

-- 1.4 Customer Group Members (Junction table)
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

-- 1.5 Partner Earnings (Commission tracking)
CREATE TABLE IF NOT EXISTS partner_earnings (
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

  -- Payout
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

COMMENT ON TABLE partner_earnings IS 'Partner commission tracking and payout management';

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
  -- Source tracking
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

  -- Group affiliation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_group_id') THEN
    ALTER TABLE orders ADD COLUMN customer_group_id UUID REFERENCES customer_groups(id) ON DELETE SET NULL;
  END IF;

  -- Commission
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'commission_applicable') THEN
    ALTER TABLE orders
      ADD COLUMN commission_applicable BOOLEAN DEFAULT FALSE,
      ADD COLUMN commission_rate DECIMAL(5,2),
      ADD COLUMN commission_amount_usd DECIMAL(10,4),
      ADD COLUMN commission_amount_uzs DECIMAL(15,2);
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

-- Create indexes for new orders columns
CREATE INDEX IF NOT EXISTS idx_orders_source_type ON orders(source_type);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_end_customer_id ON orders(end_customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_group_id ON orders(customer_group_id) WHERE customer_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_commission_applicable ON orders(commission_applicable) WHERE commission_applicable = TRUE;

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

-- 3.2 Create commission earning when order is allocated
CREATE OR REPLACE FUNCTION create_partner_earning_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create earning if order is newly allocated and commission applicable
  IF NEW.partner_id IS NOT NULL
     AND NEW.commission_applicable = TRUE
     AND NEW.order_status = 'ALLOCATED'
     AND (OLD.order_status IS NULL OR OLD.order_status != 'ALLOCATED') THEN

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

    -- Update partner totals
    UPDATE partners
    SET
      total_earnings = total_earnings + NEW.commission_amount_usd,
      pending_earnings = pending_earnings + NEW.commission_amount_usd
    WHERE id = NEW.partner_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_partner_earning ON orders;
CREATE TRIGGER trg_create_partner_earning
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_partner_earning_on_allocation();

-- 3.3 Update customer group size
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

DROP TRIGGER IF EXISTS trg_update_group_size ON customer_group_members;
CREATE TRIGGER trg_update_group_size
  AFTER INSERT OR DELETE ON customer_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_size();

-- 3.4 Update updated_at on partners
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
-- STEP 4: ROW LEVEL SECURITY (RLS)
-- ============================================

-- 4.1 Partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own profile" ON partners;
CREATE POLICY "Partners can view own profile" ON partners
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can update own profile" ON partners;
CREATE POLICY "Partners can update own profile" ON partners
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all partners" ON partners;
CREATE POLICY "Admins can view all partners" ON partners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 4.2 Partner Customers
ALTER TABLE partner_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own customers" ON partner_customers;
CREATE POLICY "Partners can view own customers" ON partner_customers
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Partners can manage own customers" ON partner_customers;
CREATE POLICY "Partners can manage own customers" ON partner_customers
  FOR ALL
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- 4.3 Customer Groups
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can manage own groups" ON customer_groups;
CREATE POLICY "Partners can manage own groups" ON customer_groups
  FOR ALL
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- 4.4 Customer Group Members
ALTER TABLE customer_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can manage own group members" ON customer_group_members;
CREATE POLICY "Partners can manage own group members" ON customer_group_members
  FOR ALL
  USING (
    group_id IN (
      SELECT id FROM customer_groups
      WHERE partner_id IN (
        SELECT id FROM partners WHERE user_id = auth.uid()
      )
    )
  );

-- 4.5 Partner Earnings
ALTER TABLE partner_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own earnings" ON partner_earnings;
CREATE POLICY "Partners can view own earnings" ON partner_earnings
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role manages earnings" ON partner_earnings;
CREATE POLICY "Service role manages earnings" ON partner_earnings
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- 4.6 Update Orders RLS
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (
    -- B2C: Direct customer orders
    (source_type = 'b2c' AND auth.uid() = user_id)
    OR
    -- B2B: Partner can see their orders
    (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))
    OR
    -- Admin can see all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "Partners can create orders" ON orders;
CREATE POLICY "Partners can create orders" ON orders
  FOR INSERT
  WITH CHECK (
    (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))
    OR
    (source_type = 'b2c' AND auth.uid() = user_id)
  );

-- ============================================
-- STEP 5: CREATE VIEWS
-- ============================================

-- 5.1 Complete Order View
CREATE OR REPLACE VIEW v_orders_complete AS
SELECT
  o.*,
  -- User info
  p_user.first_name AS user_first_name,
  p_user.last_name AS user_last_name,
  -- Partner info
  pt.company_name AS partner_company_name,
  pt.business_email AS partner_email,
  -- End customer
  COALESCE(
    CASE WHEN o.source_type = 'b2c' THEN p_user.first_name END,
    pc.first_name,
    o.customer_first_name
  ) AS end_customer_first_name,
  COALESCE(
    CASE WHEN o.source_type = 'b2c' THEN p_user.last_name END,
    pc.last_name,
    o.customer_last_name
  ) AS end_customer_last_name,
  -- Group
  cg.name AS group_name,
  -- Package
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

-- 5.2 Partner Dashboard Stats
CREATE OR REPLACE VIEW v_partner_dashboard_stats AS
SELECT
  pt.id AS partner_id,
  pt.company_name,
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'ALLOCATED' THEN o.id END) AS active_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'PENDING' THEN o.id END) AS pending_orders,
  COALESCE(SUM(CASE WHEN o.order_status = 'ALLOCATED' THEN o.price_usd END), 0) AS total_spent_usd,
  COALESCE(SUM(CASE WHEN o.order_status = 'ALLOCATED' THEN o.price_uzs END), 0) AS total_spent_uzs,
  pt.total_earnings,
  pt.pending_earnings,
  pt.balance,
  pt.total_customers,
  COUNT(DISTINCT cg.id) AS total_groups
FROM partners pt
LEFT JOIN orders o ON pt.id = o.partner_id
LEFT JOIN customer_groups cg ON pt.id = cg.partner_id
GROUP BY pt.id, pt.company_name, pt.total_earnings, pt.pending_earnings, pt.balance, pt.total_customers;

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
SELECT 'Migration completed successfully!' AS status;
SELECT 'New tables created:' AS info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings');
