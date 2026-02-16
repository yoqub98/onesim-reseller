-- ============================================
-- OneSIM ADMIN PANEL - READY-TO-USE QUERIES
-- Purpose: Pre-written queries for admin dashboard
-- Run After: MIGRATION_003_ADMIN_RLS_POLICIES.sql
-- ============================================

-- These queries are ready to copy-paste into your admin panel backend
-- Replace <partner_id>, <order_id>, etc. with actual values

-- ============================================
-- SECTION 1: PARTNER MANAGEMENT
-- ============================================

-- 1.1 List all partners (for partners list page)
-- Shows: Company name, email, status, stats, discount rate
SELECT
  partner_id,
  company_name,
  user_email,
  business_email,
  status,
  effective_discount_rate,
  total_orders,
  total_spent_usd,
  total_savings_usd,
  total_customers,
  total_groups,
  active_orders,
  pending_orders,
  partner_since
FROM v_admin_partners_overview
ORDER BY total_savings_usd DESC;

-- 1.2 Get specific partner details
SELECT *
FROM v_admin_partners_overview
WHERE partner_id = '<partner_id>';

-- 1.3 Search partners by company name or email
SELECT
  partner_id,
  company_name,
  business_email,
  status,
  total_orders,
  total_savings_usd
FROM v_admin_partners_overview
WHERE
  company_name ILIKE '%<search_term>%'
  OR business_email ILIKE '%<search_term>%'
  OR legal_name ILIKE '%<search_term>%'
ORDER BY total_savings_usd DESC;

-- 1.4 Get pending partner approvals
SELECT
  partner_id,
  company_name,
  user_email,
  business_email,
  contact_person,
  partner_since
FROM v_admin_partners_overview
WHERE status = 'pending'
ORDER BY partner_since ASC;

-- 1.5 Update partner status (approve/suspend)
UPDATE partners
SET
  status = 'active',  -- or 'suspended', 'pending'
  updated_at = NOW()
WHERE id = '<partner_id>';

-- 1.6 Update partner discount rate
UPDATE partners
SET
  custom_discount_rate = 10.00,  -- Override default 5%
  updated_at = NOW()
WHERE id = '<partner_id>';

-- 1.7 Partner performance leaderboard
SELECT
  partner_id,
  company_name,
  total_orders,
  total_spent_usd,
  total_savings_usd,
  effective_discount_pct,
  total_customers,
  total_groups
FROM v_admin_partners_overview
WHERE status = 'active'
ORDER BY total_spent_usd DESC
LIMIT 20;

-- ============================================
-- SECTION 2: ORDER MANAGEMENT
-- ============================================

-- 2.1 View all orders with filters
SELECT
  order_id,
  order_no,
  source_type,
  order_status,
  partner_company,
  customer_first_name || ' ' || customer_last_name AS customer_name,
  customer_email,
  package_name,
  price_usd,
  discount_amount_usd,
  delivery_method,
  created_at
FROM v_admin_orders_complete
ORDER BY created_at DESC
LIMIT 100;

-- 2.2 Get specific order details
SELECT *
FROM v_admin_orders_complete
WHERE order_id = '<order_id>';

-- 2.3 View partner's orders
SELECT
  order_id,
  order_no,
  order_status,
  customer_first_name || ' ' || customer_last_name AS customer,
  customer_email,
  package_name,
  partner_paid_usd,
  discount_amount_usd,
  retail_price_override_usd AS retail_price,
  delivery_method,
  delivery_status,
  created_at,
  allocated_at
FROM v_admin_orders_complete
WHERE partner_id = '<partner_id>'
ORDER BY created_at DESC;

-- 2.4 Orders by status
SELECT
  order_id,
  order_no,
  source_type,
  partner_company,
  customer_first_name || ' ' || customer_last_name AS customer,
  package_name,
  price_usd,
  created_at
FROM v_admin_orders_complete
WHERE order_status = 'PENDING'  -- or 'ALLOCATED', 'DELIVERED', 'ACTIVATED'
ORDER BY created_at ASC;

-- 2.5 Orders by date range
SELECT
  order_id,
  order_no,
  source_type,
  partner_company,
  customer_email,
  price_usd,
  created_at
FROM v_admin_orders_complete
WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY created_at DESC;

-- 2.6 Failed deliveries (need attention)
SELECT
  order_id,
  order_no,
  partner_company,
  customer_email,
  delivery_method,
  delivery_status,
  created_at
FROM v_admin_orders_complete
WHERE delivery_status->>'status' = 'failed'
  OR delivery_status->>'status' = 'pending'
ORDER BY created_at ASC;

-- 2.7 Update order status (for support)
UPDATE orders
SET
  order_status = 'ALLOCATED',  -- or other status
  updated_at = NOW()
WHERE id = '<order_id>';

-- 2.8 Manually create order as admin
INSERT INTO orders (
  user_id,
  source_type,
  package_code,
  package_name,
  customer_first_name,
  customer_last_name,
  customer_email,
  customer_phone,
  price_usd,
  price_uzs,
  order_status,
  notes
) VALUES (
  '<user_id>',
  'admin',
  '<package_code>',
  '<package_name>',
  '<first_name>',
  '<last_name>',
  '<email>',
  '<phone>',
  15.00,
  189750,
  'PENDING',
  'Manually created by admin for support ticket #123'
);

-- ============================================
-- SECTION 3: CUSTOMER MANAGEMENT
-- ============================================

-- 3.1 View all partner customers
SELECT
  pc.id,
  pc.partner_id,
  p.company_name AS partner_company,
  pc.first_name || ' ' || pc.last_name AS customer_name,
  pc.email,
  pc.phone,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(o.partner_paid_usd) AS total_spent_usd,
  pc.created_at
FROM partner_customers pc
JOIN partners p ON pc.partner_id = p.id
LEFT JOIN orders o ON pc.id = o.end_customer_id AND o.end_customer_type = 'b2b_partner_customer'
GROUP BY pc.id, pc.partner_id, p.company_name, pc.first_name, pc.last_name, pc.email, pc.phone, pc.created_at
ORDER BY total_spent_usd DESC NULLS LAST;

-- 3.2 View specific partner's customers
SELECT
  pc.id,
  pc.first_name || ' ' || pc.last_name AS name,
  pc.email,
  pc.phone,
  COUNT(DISTINCT o.id) AS orders,
  COUNT(DISTINCT cgm.group_id) AS groups_membership,
  pc.created_at
FROM partner_customers pc
LEFT JOIN orders o ON pc.id = o.end_customer_id AND o.end_customer_type = 'b2b_partner_customer'
LEFT JOIN customer_group_members cgm ON pc.id = cgm.customer_id
WHERE pc.partner_id = '<partner_id>'
GROUP BY pc.id, pc.first_name, pc.last_name, pc.email, pc.phone, pc.created_at
ORDER BY orders DESC;

-- 3.3 Customer's order history
SELECT
  o.order_no,
  o.package_name,
  o.order_status,
  o.partner_paid_usd,
  o.discount_amount_usd,
  o.iccid,
  o.delivery_method,
  cg.name AS group_name,
  o.created_at,
  o.allocated_at
FROM orders o
LEFT JOIN customer_groups cg ON o.customer_group_id = cg.id
WHERE o.end_customer_id = '<customer_id>'
  AND o.end_customer_type = 'b2b_partner_customer'
ORDER BY o.created_at DESC;

-- 3.4 Search customers across all partners
SELECT
  pc.id,
  pc.first_name || ' ' || pc.last_name AS name,
  pc.email,
  pc.phone,
  p.company_name AS partner_company,
  COUNT(DISTINCT o.id) AS total_orders
FROM partner_customers pc
JOIN partners p ON pc.partner_id = p.id
LEFT JOIN orders o ON pc.id = o.end_customer_id
WHERE
  pc.email ILIKE '%<search_term>%'
  OR pc.first_name ILIKE '%<search_term>%'
  OR pc.last_name ILIKE '%<search_term>%'
GROUP BY pc.id, pc.first_name, pc.last_name, pc.email, pc.phone, p.company_name
ORDER BY total_orders DESC;

-- ============================================
-- SECTION 4: GROUP MANAGEMENT (TOURS)
-- ============================================

-- 4.1 View all customer groups/tours
SELECT *
FROM v_admin_groups_overview
ORDER BY created_at DESC;

-- 4.2 Active tours (ongoing or upcoming)
SELECT
  group_id,
  partner_company,
  group_name,
  destination_name,
  travel_start_date,
  travel_end_date,
  group_size,
  total_orders,
  active_orders,
  total_group_spent_usd
FROM v_admin_groups_overview
WHERE is_active = TRUE
  AND (travel_end_date >= CURRENT_DATE OR travel_end_date IS NULL)
ORDER BY travel_start_date ASC NULLS LAST;

-- 4.3 Group details with members
SELECT
  cg.name AS group_name,
  cg.destination_name,
  cg.travel_start_date,
  cg.travel_end_date,
  cg.group_size,
  p.company_name AS partner,
  pc.first_name || ' ' || pc.last_name AS member_name,
  pc.email AS member_email,
  COUNT(o.id) AS member_orders
FROM customer_groups cg
JOIN partners p ON cg.partner_id = p.id
JOIN customer_group_members cgm ON cg.id = cgm.group_id
JOIN partner_customers pc ON cgm.customer_id = pc.id
LEFT JOIN orders o ON pc.id = o.end_customer_id AND o.customer_group_id = cg.id
WHERE cg.id = '<group_id>'
GROUP BY cg.name, cg.destination_name, cg.travel_start_date, cg.travel_end_date,
         cg.group_size, p.company_name, pc.first_name, pc.last_name, pc.email
ORDER BY member_name;

-- 4.4 Groups by destination
SELECT
  destination_name,
  COUNT(DISTINCT group_id) AS total_groups,
  SUM(group_size) AS total_travelers,
  SUM(total_orders) AS total_orders,
  SUM(total_group_spent_usd) AS total_revenue_usd
FROM v_admin_groups_overview
WHERE destination_name IS NOT NULL
GROUP BY destination_name
ORDER BY total_revenue_usd DESC;

-- ============================================
-- SECTION 5: EARNINGS & FINANCIAL REPORTS
-- ============================================

-- 5.1 View all partner earnings/discounts
SELECT *
FROM v_admin_partner_earnings
ORDER BY purchased_at DESC
LIMIT 100;

-- 5.2 Partner's earnings breakdown
SELECT
  earning_id,
  order_no,
  package_name,
  end_customer,
  retail_price_usd,
  partner_paid_usd,
  discount_rate,
  partner_saved_usd,
  partner_sell_price_usd,
  partner_actual_profit_usd,
  purchased_at,
  order_status
FROM v_admin_partner_earnings
WHERE partner_id = '<partner_id>'
ORDER BY purchased_at DESC;

-- 5.3 Total discounts given by date range
SELECT
  DATE(purchased_at) AS date,
  COUNT(*) AS orders,
  SUM(discount_amount_usd) AS total_discounts_usd,
  SUM(partner_paid_usd) AS revenue_collected_usd,
  SUM(retail_price_usd) AS retail_value_usd
FROM v_admin_partner_earnings
WHERE purchased_at BETWEEN '2026-01-01' AND '2026-12-31'
GROUP BY DATE(purchased_at)
ORDER BY date DESC;

-- 5.4 Revenue comparison: B2C vs B2B
SELECT
  source_type,
  COUNT(*) AS total_orders,
  SUM(price_usd) AS total_revenue_usd,
  AVG(price_usd) AS avg_order_value_usd
FROM orders
WHERE order_status IN ('ALLOCATED', 'DELIVERED', 'ACTIVATED')
GROUP BY source_type
ORDER BY total_revenue_usd DESC;

-- 5.5 Monthly revenue report
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS month,
  source_type,
  COUNT(*) AS orders,
  SUM(price_usd) AS revenue_usd
FROM orders
WHERE order_status IN ('ALLOCATED', 'DELIVERED', 'ACTIVATED')
GROUP BY TO_CHAR(created_at, 'YYYY-MM'), source_type
ORDER BY month DESC, source_type;

-- 5.6 Top earning partners (by discount savings)
SELECT
  partner_company,
  partner_email,
  COUNT(*) AS total_orders,
  SUM(partner_saved_usd) AS total_discounts_received_usd,
  SUM(partner_paid_usd) AS total_revenue_from_partner_usd,
  SUM(retail_price_usd) AS retail_value_usd,
  ROUND(AVG(discount_rate), 2) AS avg_discount_rate
FROM v_admin_partner_earnings
GROUP BY partner_company, partner_email
ORDER BY total_discounts_received_usd DESC
LIMIT 20;

-- ============================================
-- SECTION 6: PLATFORM ANALYTICS
-- ============================================

-- 6.1 Platform-wide dashboard stats
SELECT *
FROM v_admin_platform_stats;

-- 6.2 Daily order statistics
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS total_orders,
  COUNT(CASE WHEN source_type = 'b2c' THEN 1 END) AS b2c_orders,
  COUNT(CASE WHEN source_type = 'b2b_partner' THEN 1 END) AS b2b_orders,
  SUM(price_usd) AS revenue_usd
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 6.3 Popular packages (most ordered)
SELECT
  package_code,
  package_name,
  COUNT(*) AS total_orders,
  COUNT(CASE WHEN source_type = 'b2c' THEN 1 END) AS b2c_orders,
  COUNT(CASE WHEN source_type = 'b2b_partner' THEN 1 END) AS b2b_orders,
  SUM(price_usd) AS total_revenue_usd
FROM orders
WHERE order_status IN ('ALLOCATED', 'DELIVERED', 'ACTIVATED')
GROUP BY package_code, package_name
ORDER BY total_orders DESC
LIMIT 20;

-- 6.4 Order status distribution
SELECT
  order_status,
  source_type,
  COUNT(*) AS order_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM orders
GROUP BY order_status, source_type
ORDER BY order_count DESC;

-- 6.5 Delivery method statistics
SELECT
  delivery_method,
  COUNT(*) AS total_orders,
  COUNT(CASE WHEN delivery_status->>'status' = 'delivered' THEN 1 END) AS delivered,
  COUNT(CASE WHEN delivery_status->>'status' = 'failed' THEN 1 END) AS failed,
  COUNT(CASE WHEN delivery_status->>'status' = 'pending' THEN 1 END) AS pending
FROM orders
WHERE delivery_method IS NOT NULL
GROUP BY delivery_method
ORDER BY total_orders DESC;

-- 6.6 Partner growth over time
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS new_partners,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS cumulative_partners
FROM partners
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- ============================================
-- SECTION 7: USER MANAGEMENT
-- ============================================

-- 7.1 List all users with types
SELECT
  u.id,
  u.email,
  u.created_at AS registered_at,
  u.email_confirmed_at,
  u.last_sign_in_at,
  p.user_type,
  CASE
    WHEN pt.id IS NOT NULL THEN pt.company_name
    ELSE NULL
  END AS partner_company
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN partners pt ON u.id = pt.user_id
ORDER BY u.created_at DESC;

-- 7.2 Make user an admin
UPDATE profiles
SET user_type = 'admin'
WHERE id = '<user_id>';

-- 7.3 Get user's complete profile
SELECT
  u.id,
  u.email,
  p.user_type,
  pt.company_name,
  pt.business_email,
  pt.status AS partner_status,
  pt.effective_discount_rate,
  pt.total_orders,
  pt.total_spent
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN partners pt ON u.id = pt.user_id
WHERE u.id = '<user_id>';

-- ============================================
-- SECTION 8: AUDIT & LOGS
-- ============================================

-- 8.1 View order action logs
SELECT
  oal.*,
  o.order_no,
  u.email AS performed_by_email
FROM order_action_logs oal
JOIN orders o ON oal.order_id = o.id
LEFT JOIN auth.users u ON oal.performed_by = u.id
ORDER BY oal.created_at DESC
LIMIT 100;

-- 8.2 Specific order's history
SELECT
  oal.action_type,
  oal.description,
  oal.metadata,
  u.email AS performed_by,
  oal.created_at
FROM order_action_logs oal
LEFT JOIN auth.users u ON oal.performed_by = u.id
WHERE oal.order_id = '<order_id>'
ORDER BY oal.created_at ASC;

-- 8.3 Recent partner activity
SELECT
  p.company_name,
  oal.action_type,
  o.order_no,
  oal.created_at
FROM order_action_logs oal
JOIN orders o ON oal.order_id = o.id
JOIN partners p ON o.partner_id = p.id
WHERE o.partner_id = '<partner_id>'
ORDER BY oal.created_at DESC
LIMIT 50;

-- ============================================
-- END OF ADMIN QUERIES
-- ============================================

-- These queries are optimized for admin dashboards and reporting
-- All queries respect RLS policies - only admins can execute them
-- Replace placeholders like <partner_id>, <order_id> with actual values
