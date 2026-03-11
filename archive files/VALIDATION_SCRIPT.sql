-- ============================================
-- OneSIM DATABASE VALIDATION SCRIPT
-- Purpose: Verify migration completed successfully
-- Run this AFTER MIGRATION_002_DISCOUNT_MODEL_CORRECTED.sql
-- ============================================

-- ============================================
-- PART 1: VERIFY NEW TABLES EXIST
-- ============================================
SELECT 'Checking new tables...' AS step;

SELECT
  table_name,
  CASE
    WHEN table_name IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings')
ORDER BY table_name;

-- ============================================
-- PART 2: VERIFY NEW COLUMNS ADDED TO ORDERS
-- ============================================
SELECT 'Checking orders table new columns...' AS step;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN (
  'source_type', 'partner_id', 'end_customer_id', 'end_customer_type',
  'customer_first_name', 'customer_last_name', 'customer_email', 'customer_phone',
  'customer_group_id', 'discount_applicable', 'discount_rate', 'discount_amount_usd',
  'discount_amount_uzs', 'partner_paid_usd', 'partner_paid_uzs',
  'delivery_method', 'delivery_status', 'notes', 'metadata'
)
ORDER BY column_name;

-- ============================================
-- PART 3: VERIFY PROFILES TABLE UPDATES
-- ============================================
SELECT 'Checking profiles table updates...' AS step;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('user_type', 'is_partner', 'is_admin')
ORDER BY column_name;

-- ============================================
-- PART 4: VERIFY TRIGGERS EXIST
-- ============================================
SELECT 'Checking triggers...' AS step;

SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
  'trg_update_partner_stats_on_order',
  'trg_track_partner_savings',
  'trg_update_group_size',
  'update_partners_updated_at',
  'update_partner_customers_updated_at',
  'update_customer_groups_updated_at',
  'update_partner_earnings_updated_at'
)
ORDER BY trigger_name;

-- ============================================
-- PART 5: VERIFY FUNCTIONS EXIST
-- ============================================
SELECT 'Checking functions...' AS step;

SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_partner_stats_on_order',
  'track_partner_savings_on_allocation',
  'update_group_size',
  'update_updated_at_column'
)
ORDER BY routine_name;

-- ============================================
-- PART 6: VERIFY RLS POLICIES
-- ============================================
SELECT 'Checking RLS policies...' AS step;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings', 'orders')
ORDER BY tablename, policyname;

-- ============================================
-- PART 7: VERIFY INDEXES
-- ============================================
SELECT 'Checking indexes...' AS step;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings', 'orders')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- PART 8: VERIFY VIEWS EXIST
-- ============================================
SELECT 'Checking views...' AS step;

SELECT
  table_name AS view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_partner_dashboard_stats', 'v_orders_complete')
ORDER BY table_name;

-- ============================================
-- PART 9: COUNT RECORDS IN EXISTING TABLES
-- ============================================
SELECT 'Checking record counts...' AS step;

SELECT 'orders' AS table_name, COUNT(*) AS record_count FROM orders
UNION ALL
SELECT 'esim_packages', COUNT(*) FROM esim_packages
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'partners', COUNT(*) FROM partners
UNION ALL
SELECT 'partner_customers', COUNT(*) FROM partner_customers
UNION ALL
SELECT 'customer_groups', COUNT(*) FROM customer_groups
UNION ALL
SELECT 'partner_earnings', COUNT(*) FROM partner_earnings;

-- ============================================
-- VALIDATION COMPLETE
-- ============================================
SELECT '✅ VALIDATION COMPLETE - Review results above' AS status;
