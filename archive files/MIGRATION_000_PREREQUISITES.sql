-- ============================================
-- OneSIM DATABASE PREREQUISITES
-- Purpose: Create required functions before running main migration
-- Version: 0.0 - Prerequisites
-- Date: 2026-02-16
-- ============================================

-- This script must be run BEFORE MIGRATION_002_DISCOUNT_MODEL_CORRECTED.sql

BEGIN;

-- Create update_updated_at_column() function if it doesn't exist
-- This function is used by triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at column to current timestamp';

COMMIT;

-- Verify function was created
SELECT 'Prerequisite function created successfully!' AS status;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'update_updated_at_column';
