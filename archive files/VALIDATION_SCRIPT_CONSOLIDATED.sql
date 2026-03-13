-- ============================================
-- OneSIM DATABASE VALIDATION SCRIPT (CONSOLIDATED)
-- Purpose: Verify migration - All results in one output
-- Run this AFTER MIGRATION_002_DISCOUNT_MODEL_CORRECTED.sql
-- ============================================

WITH validation_results AS (
  -- Part 1: Check new tables exist
  SELECT 1 as sort_order, 'NEW TABLES' as category, table_name as item, '✅ EXISTS' as status
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings')

  UNION ALL

  -- Part 2: Check new orders columns
  SELECT 2, 'ORDERS COLUMNS', column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'orders'
  AND column_name IN (
    'source_type', 'partner_id', 'end_customer_id', 'end_customer_type',
    'customer_first_name', 'customer_last_name', 'customer_email', 'customer_phone',
    'customer_group_id', 'discount_applicable', 'discount_rate', 'discount_amount_usd',
    'discount_amount_uzs', 'partner_paid_usd', 'partner_paid_uzs',
    'delivery_method', 'delivery_status', 'notes', 'metadata'
  )

  UNION ALL

  -- Part 3: Check profiles columns
  SELECT 3, 'PROFILES COLUMNS', column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name IN ('user_type', 'is_partner', 'is_admin')

  UNION ALL

  -- Part 4: Check triggers
  SELECT 4, 'TRIGGERS', trigger_name, event_object_table
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

  UNION ALL

  -- Part 5: Check functions
  SELECT 5, 'FUNCTIONS', routine_name, routine_type
  FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_partner_stats_on_order',
    'track_partner_savings_on_allocation',
    'update_group_size',
    'update_updated_at_column'
  )

  UNION ALL

  -- Part 6: Check RLS policies
  SELECT 6, 'RLS POLICIES', tablename || '.' || policyname, cmd::text
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings', 'orders')

  UNION ALL

  -- Part 7: Check indexes
  SELECT 7, 'INDEXES', tablename || '.' || indexname, 'INDEX'
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename IN ('partners', 'partner_customers', 'customer_groups', 'customer_group_members', 'partner_earnings', 'orders')
  AND indexname LIKE 'idx_%'

  UNION ALL

  -- Part 8: Check views
  SELECT 8, 'VIEWS', table_name, 'VIEW'
  FROM information_schema.views
  WHERE table_schema = 'public'
  AND table_name IN ('v_partner_dashboard_stats', 'v_orders_complete')
)
SELECT
  sort_order,
  category,
  item,
  status
FROM validation_results
ORDER BY sort_order, item;

-- Separate query for record counts
SELECT 'RECORD COUNTS' as info;

SELECT
  'orders' AS table_name,
  COUNT(*) AS record_count,
  'Existing B2C orders' as note
FROM orders
UNION ALL
SELECT 'esim_packages', COUNT(*), 'Existing eSIM packages' FROM esim_packages
UNION ALL
SELECT 'profiles', COUNT(*), 'Existing user profiles' FROM profiles
UNION ALL
SELECT 'partners', COUNT(*), 'New B2B partners (should be 0)' FROM partners
UNION ALL
SELECT 'partner_customers', COUNT(*), 'Partner customers (should be 0)' FROM partner_customers
UNION ALL
SELECT 'customer_groups', COUNT(*), 'Customer groups (should be 0)' FROM customer_groups
UNION ALL
SELECT 'partner_earnings', COUNT(*), 'Partner earnings records (should be 0)' FROM partner_earnings
ORDER BY record_count DESC;
