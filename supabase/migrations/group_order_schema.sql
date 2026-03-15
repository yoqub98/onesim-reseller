-- ============================================================
-- Group Order Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to group_orders table
ALTER TABLE public.group_orders
  ADD COLUMN IF NOT EXISTS package_code text,
  ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'sms',
  ADD COLUMN IF NOT EXISTS member_count int,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- 2. Add group order columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS group_order_id uuid,
  ADD COLUMN IF NOT EXISTS end_customer_id uuid,
  ADD COLUMN IF NOT EXISTS customer_first_name text,
  ADD COLUMN IF NOT EXISTS customer_last_name text,
  ADD COLUMN IF NOT EXISTS customer_email text;

-- 3. Ensure order_status allows 'PROCESSING'
-- (If you have a CHECK constraint on order_status, update it here)
-- If using text with no constraint, this is a no-op:
DO $$
BEGIN
  -- Drop old check constraint if it exists and doesn't include PROCESSING
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders'
      AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%order_status%'
  ) THEN
    -- Add PROCESSING to allowed values if constraint exists
    -- You may need to drop and recreate the constraint manually
    RAISE NOTICE 'Check constraint on order_status exists - verify PROCESSING is allowed';
  END IF;
END;
$$;

-- 4. Indexes for performance and Realtime filtering
CREATE INDEX IF NOT EXISTS idx_orders_group_order_id
  ON public.orders(group_order_id)
  WHERE group_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_group_orders_customer_group_id
  ON public.group_orders(customer_group_id);

CREATE INDEX IF NOT EXISTS idx_group_orders_partner_status
  ON public.group_orders(partner_id, status);

-- 5. Enable Realtime on both tables
-- Run these statements (they are idempotent in recent Supabase versions):
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_orders;

-- Done.
-- After running this script, go to Supabase Dashboard → Database → Replication
-- and verify that "orders" and "group_orders" appear in the replication list.
