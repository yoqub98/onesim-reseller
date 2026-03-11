-- ============================================
-- OneSIM DATABASE MIGRATION 003
-- Purpose: Add Admin Access to All Partner Tables
-- Version: 0.3 - Admin RLS Policies
-- Date: 2026-02-16
-- Run After: MIGRATION_002_DISCOUNT_MODEL_CORRECTED.sql
-- ============================================

-- This migration adds admin exceptions to all RLS policies
-- so admins can view/manage all partner data for the admin panel

BEGIN;

-- ============================================
-- STEP 1: PARTNERS TABLE - Admin Access
-- ============================================

-- Allow admins to view ALL partners
DROP POLICY IF EXISTS "Admins can view all partners" ON partners;
CREATE POLICY "Admins can view all partners" ON partners
  FOR SELECT USING (
    auth.uid() = user_id  -- Partners see their own profile
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins see all
  );

-- Allow admins to update ANY partner (manage discount rates, status, etc.)
DROP POLICY IF EXISTS "Admins can update any partner" ON partners;
CREATE POLICY "Admins can update any partner" ON partners
  FOR UPDATE USING (
    auth.uid() = user_id  -- Partners can update their own
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins can update any
  );

-- Allow admins to insert partners (for manual partner creation)
DROP POLICY IF EXISTS "Admins can create partners" ON partners;
CREATE POLICY "Admins can create partners" ON partners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

COMMENT ON POLICY "Admins can view all partners" ON partners IS 'Admins can see all partner profiles';
COMMENT ON POLICY "Admins can update any partner" ON partners IS 'Admins can modify partner settings (discount rates, status, etc.)';

-- ============================================
-- STEP 2: PARTNER CUSTOMERS - Admin Access
-- ============================================

DROP POLICY IF EXISTS "Admins can view all partner customers" ON partner_customers;
CREATE POLICY "Admins can view all partner customers" ON partner_customers
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())  -- Partners see their customers
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins see all
  );

DROP POLICY IF EXISTS "Admins can manage any customer" ON partner_customers;
CREATE POLICY "Admins can manage any customer" ON partner_customers
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())  -- Partners manage their customers
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins manage all
  );

COMMENT ON POLICY "Admins can view all partner customers" ON partner_customers IS 'Admins can see all partner customers';

-- ============================================
-- STEP 3: CUSTOMER GROUPS - Admin Access
-- ============================================

DROP POLICY IF EXISTS "Admins can view all customer groups" ON customer_groups;
CREATE POLICY "Admins can view all customer groups" ON customer_groups
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())  -- Partners see their groups
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins see all
  );

DROP POLICY IF EXISTS "Admins can manage any group" ON customer_groups;
CREATE POLICY "Admins can manage any group" ON customer_groups
  FOR ALL USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())  -- Partners manage their groups
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins manage all
  );

COMMENT ON POLICY "Admins can view all customer groups" ON customer_groups IS 'Admins can see all tour groups';

-- ============================================
-- STEP 4: GROUP MEMBERS - Admin Access
-- ============================================

DROP POLICY IF EXISTS "Admins can view all group members" ON customer_group_members;
CREATE POLICY "Admins can view all group members" ON customer_group_members
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM customer_groups
      WHERE partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    )  -- Partners see their group members
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins see all
  );

DROP POLICY IF EXISTS "Admins can manage any group member" ON customer_group_members;
CREATE POLICY "Admins can manage any group member" ON customer_group_members
  FOR ALL USING (
    group_id IN (
      SELECT id FROM customer_groups
      WHERE partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    )  -- Partners manage their group members
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins manage all
  );

COMMENT ON POLICY "Admins can view all group members" ON customer_group_members IS 'Admins can see all group memberships';

-- ============================================
-- STEP 5: PARTNER EARNINGS - Admin Access
-- ============================================

DROP POLICY IF EXISTS "Admins can view all earnings" ON partner_earnings;
CREATE POLICY "Admins can view all earnings" ON partner_earnings
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())  -- Partners see their earnings
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins see all
  );

-- Keep service role policy for trigger access
-- (Already exists from MIGRATION_002, but add IF NOT EXISTS check)
DROP POLICY IF EXISTS "Service role manages earnings" ON partner_earnings;
CREATE POLICY "Service role manages earnings" ON partner_earnings
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

COMMENT ON POLICY "Admins can view all earnings" ON partner_earnings IS 'Admins can see all partner discount savings';

-- ============================================
-- STEP 6: ORDERS - Admin Full Access
-- ============================================

-- Update existing "Users can view own orders" to simplify
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    (source_type = 'b2c' AND auth.uid() = user_id)  -- B2C customers see their orders
    OR (source_type = 'b2b_partner' AND partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    ))  -- Partners see their orders
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)  -- Admins see all
  );

-- Allow admins to update ANY order (for support/management)
DROP POLICY IF EXISTS "Admins can update any order" ON orders;
CREATE POLICY "Admins can update any order" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Allow admins to create orders (manual order creation for support)
DROP POLICY IF EXISTS "Admins can create orders" ON orders;
CREATE POLICY "Admins can create orders" ON orders
  FOR INSERT WITH CHECK (
    source_type = 'admin'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

COMMENT ON POLICY "Admins can update any order" ON orders IS 'Admins can modify any order for support purposes';
COMMENT ON POLICY "Admins can create orders" ON orders IS 'Admins can manually create orders with source_type=admin';

-- ============================================
-- STEP 7: CREATE ADMIN DASHBOARD VIEWS
-- ============================================

-- View: All partners with comprehensive stats
CREATE OR REPLACE VIEW v_admin_partners_overview AS
SELECT
  p.id AS partner_id,
  p.user_id,
  u.email AS user_email,
  p.company_name,
  p.legal_name,
  p.business_email,
  p.business_phone,
  p.contact_person,
  p.status,
  p.effective_discount_rate,
  p.total_orders,
  p.total_customers,
  p.total_spent AS total_spent_usd,
  p.total_savings AS total_savings_usd,
  p.total_orders_value_retail AS retail_value_usd,
  ROUND((p.total_savings / NULLIF(p.total_orders_value_retail, 0)) * 100, 2) AS effective_discount_pct,
  COUNT(DISTINCT cg.id) AS total_groups,
  COUNT(DISTINCT o.id) AS actual_order_count,
  COUNT(DISTINCT CASE WHEN o.order_status = 'ALLOCATED' THEN o.id END) AS active_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'PENDING' THEN o.id END) AS pending_orders,
  p.created_at AS partner_since,
  p.updated_at AS last_updated
FROM partners p
JOIN profiles prof ON p.user_id = prof.id
JOIN auth.users u ON prof.id = u.id
LEFT JOIN customer_groups cg ON p.id = cg.partner_id
LEFT JOIN orders o ON p.id = o.partner_id
GROUP BY
  p.id, p.user_id, u.email, p.company_name, p.legal_name, p.business_email,
  p.business_phone, p.contact_person, p.status, p.effective_discount_rate,
  p.total_orders, p.total_customers, p.total_spent, p.total_savings,
  p.total_orders_value_retail, p.created_at, p.updated_at;

COMMENT ON VIEW v_admin_partners_overview IS 'Admin dashboard: All partners with comprehensive stats';

-- View: Complete order details for admin
CREATE OR REPLACE VIEW v_admin_orders_complete AS
SELECT
  o.id AS order_id,
  o.order_no,
  o.source_type,
  o.order_status,

  -- Partner info
  o.partner_id,
  p.company_name AS partner_company,
  p.business_email AS partner_email,

  -- Customer info
  o.customer_first_name,
  o.customer_last_name,
  o.customer_email,
  o.customer_phone,
  o.end_customer_id,
  o.end_customer_type,

  -- Partner customer details (if B2B)
  pc.first_name AS registered_customer_first_name,
  pc.last_name AS registered_customer_last_name,
  pc.email AS registered_customer_email,

  -- Group info
  o.customer_group_id,
  cg.name AS group_name,
  cg.destination_name AS tour_destination,
  cg.travel_start_date,
  cg.travel_end_date,

  -- Package info
  o.package_code,
  o.package_name,

  -- Pricing (for B2B shows discount details)
  o.price_usd,
  o.price_uzs,
  o.discount_applicable,
  o.discount_rate,
  o.discount_amount_usd,
  o.partner_paid_usd,
  o.retail_price_override_usd,

  -- eSIM details
  o.iccid,
  o.esim_go_ref,
  o.qr_code_url,

  -- Delivery
  o.delivery_method,
  o.delivery_status,

  -- Metadata
  o.notes,
  o.metadata,

  -- Timestamps
  o.created_at,
  o.updated_at,
  o.allocated_at,
  o.delivered_at,
  o.activated_at

FROM orders o
LEFT JOIN partners p ON o.partner_id = p.id
LEFT JOIN partner_customers pc ON o.end_customer_id = pc.id AND o.end_customer_type = 'b2b_partner_customer'
LEFT JOIN customer_groups cg ON o.customer_group_id = cg.id;

COMMENT ON VIEW v_admin_orders_complete IS 'Admin dashboard: Complete order details with all related data';

-- View: Partner earnings breakdown for admin
CREATE OR REPLACE VIEW v_admin_partner_earnings AS
SELECT
  pe.id AS earning_id,
  pe.partner_id,
  p.company_name AS partner_company,
  p.business_email AS partner_email,

  -- Order details
  pe.order_id,
  o.order_no,
  o.package_name,
  o.customer_first_name || ' ' || o.customer_last_name AS end_customer,

  -- Pricing breakdown
  pe.retail_price_usd,
  pe.partner_paid_usd,
  pe.discount_rate,
  pe.discount_amount_usd AS partner_saved_usd,
  pe.partner_sell_price_usd,
  pe.partner_actual_profit_usd,

  -- Dates
  pe.purchased_at,
  o.order_status,
  o.allocated_at

FROM partner_earnings pe
JOIN partners p ON pe.partner_id = p.id
JOIN orders o ON pe.order_id = o.id;

COMMENT ON VIEW v_admin_partner_earnings IS 'Admin dashboard: Partner discount savings and profit tracking';

-- View: Customer groups overview for admin
CREATE OR REPLACE VIEW v_admin_groups_overview AS
SELECT
  cg.id AS group_id,
  cg.partner_id,
  p.company_name AS partner_company,

  -- Group details
  cg.name AS group_name,
  cg.description,
  cg.destination_country_code,
  cg.destination_name,
  cg.travel_start_date,
  cg.travel_end_date,
  cg.group_size,
  cg.tags,
  cg.is_active,

  -- Orders for this group
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT CASE WHEN o.order_status = 'ALLOCATED' THEN o.id END) AS active_orders,
  SUM(o.partner_paid_usd) AS total_group_spent_usd,
  SUM(o.discount_amount_usd) AS total_group_saved_usd,

  -- Timestamps
  cg.created_at,
  cg.updated_at

FROM customer_groups cg
JOIN partners p ON cg.partner_id = p.id
LEFT JOIN orders o ON cg.id = o.customer_group_id
GROUP BY
  cg.id, cg.partner_id, p.company_name, cg.name, cg.description,
  cg.destination_country_code, cg.destination_name, cg.travel_start_date,
  cg.travel_end_date, cg.group_size, cg.tags, cg.is_active,
  cg.created_at, cg.updated_at;

COMMENT ON VIEW v_admin_groups_overview IS 'Admin dashboard: Tour groups with order statistics';

-- ============================================
-- STEP 8: CREATE ADMIN ANALYTICS VIEWS
-- ============================================

-- View: Platform-wide statistics
CREATE OR REPLACE VIEW v_admin_platform_stats AS
SELECT
  -- Partner stats
  (SELECT COUNT(*) FROM partners WHERE status = 'active') AS active_partners,
  (SELECT COUNT(*) FROM partners WHERE status = 'pending') AS pending_partners,
  (SELECT COUNT(*) FROM partners) AS total_partners,

  -- Customer stats
  (SELECT COUNT(*) FROM partner_customers) AS total_b2b_customers,
  (SELECT COUNT(DISTINCT user_id) FROM orders WHERE source_type = 'b2c') AS total_b2c_customers,

  -- Order stats
  (SELECT COUNT(*) FROM orders WHERE source_type = 'b2b_partner') AS total_b2b_orders,
  (SELECT COUNT(*) FROM orders WHERE source_type = 'b2c') AS total_b2c_orders,
  (SELECT COUNT(*) FROM orders) AS total_orders,

  -- Group stats
  (SELECT COUNT(*) FROM customer_groups WHERE is_active = TRUE) AS active_groups,
  (SELECT COUNT(*) FROM customer_groups) AS total_groups,

  -- Revenue stats
  (SELECT COALESCE(SUM(total_spent), 0) FROM partners) AS total_b2b_revenue_usd,
  (SELECT COALESCE(SUM(price_usd), 0) FROM orders WHERE source_type = 'b2c') AS total_b2c_revenue_usd,
  (SELECT COALESCE(SUM(total_savings), 0) FROM partners) AS total_discounts_given_usd,

  -- Package stats
  (SELECT COUNT(*) FROM esim_packages WHERE is_active = TRUE) AS active_packages,
  (SELECT COUNT(*) FROM esim_packages) AS total_packages;

COMMENT ON VIEW v_admin_platform_stats IS 'Admin dashboard: Platform-wide statistics and KPIs';

-- ============================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================

-- Grant SELECT on all admin views to authenticated users
-- (RLS will still apply - only admins will see data)
GRANT SELECT ON v_admin_partners_overview TO authenticated;
GRANT SELECT ON v_admin_orders_complete TO authenticated;
GRANT SELECT ON v_admin_partner_earnings TO authenticated;
GRANT SELECT ON v_admin_groups_overview TO authenticated;
GRANT SELECT ON v_admin_platform_stats TO authenticated;

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'MIGRATION_003 completed successfully!' AS status;
SELECT 'Admin access enabled for all partner tables' AS info;
SELECT 'Created 5 admin dashboard views' AS views_created;

-- Verify admin views were created
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'v_admin_%';
