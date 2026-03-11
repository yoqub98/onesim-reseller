-- ============================================
-- OneSIM TEST DATA - B2B Partner System
-- Purpose: Create test partner and validate discount model
-- Date: 2026-02-16
-- ============================================

-- IMPORTANT: This creates test data to validate the B2B system
-- You can delete this test data later if needed

BEGIN;

-- ============================================
-- STEP 1: CREATE TEST PARTNER USER
-- ============================================

-- First, we need to create a user in auth.users
-- NOTE: In production, this is done via Supabase Auth signup
-- For testing, we'll insert directly (you may need to use Supabase dashboard to create auth user)

-- MANUAL STEP: Create a test user via Supabase Auth Dashboard or signup page:
-- Email: test.partner@grandtravel.uz
-- Password: TestPartner123!
-- Then get the user_id and use it below

-- For this test, let's assume you created a user and got the UUID
-- Replace this UUID with your actual test user UUID

DO $$
DECLARE
  v_test_user_id UUID;
  v_partner_id UUID;
  v_customer_id_1 UUID;
  v_customer_id_2 UUID;
  v_group_id UUID;
  v_package_code VARCHAR(50);
BEGIN
  -- NOTE: You need to create the auth user first via Supabase Auth
  -- Then insert their UUID here:
  -- v_test_user_id := 'YOUR-AUTH-USER-UUID-HERE';

  -- For demo purposes, let's use a sample UUID (replace with real one)
  -- IMPORTANT: Replace this with actual auth.users UUID!
  SELECT id INTO v_test_user_id FROM auth.users WHERE email = 'test.partner@grandtravel.uz' LIMIT 1;

  IF v_test_user_id IS NULL THEN
    RAISE NOTICE '⚠️  No test user found with email test.partner@grandtravel.uz';
    RAISE NOTICE '👉 Please create this user via Supabase Auth first, then run this script again';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Found test user: %', v_test_user_id;

  -- ============================================
  -- STEP 2: UPDATE PROFILE TO PARTNER TYPE
  -- ============================================

  UPDATE profiles
  SET user_type = 'partner'
  WHERE id = v_test_user_id;

  RAISE NOTICE '✅ Updated profile to partner type';

  -- ============================================
  -- STEP 3: CREATE PARTNER RECORD
  -- ============================================

  INSERT INTO partners (
    user_id,
    company_name,
    legal_name,
    company_type,
    tax_id,
    registration_number,
    business_email,
    business_phone,
    website,
    address,
    discount_rate,
    custom_discount_rate,
    status,
    verified
  ) VALUES (
    v_test_user_id,
    'Grand Travel Tour',
    'MCHJ "Grand Travel Tour"',
    'travel_agency',
    '123456789',
    'REG-2024-001',
    'info@grandtravel.uz',
    '+998901234567',
    'https://grandtravel.uz',
    '{"street": "Amir Temur 15", "city": "Tashkent", "country": "Uzbekistan", "postal_code": "100000"}'::jsonb,
    5.00,  -- Default 5% discount
    NULL,  -- No custom override
    'active',
    TRUE
  )
  RETURNING id INTO v_partner_id;

  RAISE NOTICE '✅ Created partner: % (ID: %)', 'Grand Travel Tour', v_partner_id;

  -- ============================================
  -- STEP 4: CREATE PARTNER CUSTOMERS
  -- ============================================

  -- Customer 1: Aziza Karimova
  INSERT INTO partner_customers (
    partner_id,
    first_name,
    last_name,
    email,
    phone,
    notes,
    tags
  ) VALUES (
    v_partner_id,
    'Aziza',
    'Karimova',
    'aziza.karimova@example.com',
    '+998901111111',
    'VIP customer, frequent traveler',
    '["vip", "frequent"]'::jsonb
  )
  RETURNING id INTO v_customer_id_1;

  RAISE NOTICE '✅ Created customer: Aziza Karimova (ID: %)', v_customer_id_1;

  -- Customer 2: Jahongir Xasanov
  INSERT INTO partner_customers (
    partner_id,
    first_name,
    last_name,
    email,
    phone,
    notes
  ) VALUES (
    v_partner_id,
    'Jahongir',
    'Xasanov',
    'jahongir.xasanov@example.com',
    '+998902222222',
    'Regular customer'
  )
  RETURNING id INTO v_customer_id_2;

  RAISE NOTICE '✅ Created customer: Jahongir Xasanov (ID: %)', v_customer_id_2;

  -- ============================================
  -- STEP 5: CREATE CUSTOMER GROUP
  -- ============================================

  INSERT INTO customer_groups (
    partner_id,
    name,
    description,
    destination_country_code,
    destination_name,
    travel_start_date,
    travel_end_date,
    tags
  ) VALUES (
    v_partner_id,
    'Antalya Tour Group - March 2026',
    'Spring tour package to Turkey',
    'TR',
    'Turkey',
    '2026-03-15',
    '2026-03-22',
    '["beach", "resort", "spring-2026"]'::jsonb
  )
  RETURNING id INTO v_group_id;

  RAISE NOTICE '✅ Created customer group: % (ID: %)', 'Antalya Tour Group - March 2026', v_group_id;

  -- ============================================
  -- STEP 6: ADD CUSTOMERS TO GROUP
  -- ============================================

  INSERT INTO customer_group_members (group_id, customer_id, added_by)
  VALUES
    (v_group_id, v_customer_id_1, v_test_user_id),
    (v_group_id, v_customer_id_2, v_test_user_id);

  RAISE NOTICE '✅ Added 2 customers to group';

  -- ============================================
  -- STEP 7: CREATE TEST ORDER (B2B with discount)
  -- ============================================

  -- Get a sample package code
  SELECT package_code INTO v_package_code
  FROM esim_packages
  WHERE is_active = TRUE
  LIMIT 1;

  IF v_package_code IS NULL THEN
    RAISE NOTICE '⚠️  No active packages found. Cannot create test order.';
    RETURN;
  END IF;

  -- Create a B2B order with partner discount
  -- Assuming retail price is $20.00
  -- Partner gets 5% discount
  -- Partner pays: $20.00 * 0.95 = $19.00
  -- Partner saves: $1.00 (their earning)

  DECLARE
    v_order_id UUID;
    v_retail_price DECIMAL(10,4) := 20.0000;
    v_discount_rate DECIMAL(5,2) := 5.00;
    v_discount_amount DECIMAL(10,4) := 1.0000; -- $20 * 0.05
    v_partner_paid DECIMAL(10,4) := 19.0000;   -- $20 - $1
  BEGIN
    INSERT INTO orders (
      user_id,
      source_type,
      partner_id,
      end_customer_id,
      end_customer_type,
      customer_first_name,
      customer_last_name,
      customer_email,
      customer_phone,
      customer_group_id,
      transaction_id,
      package_code,
      price_usd,
      price_uzs,
      discount_applicable,
      discount_rate,
      discount_amount_usd,
      discount_amount_uzs,
      partner_paid_usd,
      partner_paid_uzs,
      retail_price_override_usd,
      order_status,
      payment_method,
      notes
    ) VALUES (
      v_test_user_id,           -- Partner is the purchasing user
      'b2b_partner',            -- B2B order
      v_partner_id,             -- Partner making the purchase
      v_customer_id_1,          -- Aziza is the end customer
      'b2b_partner_customer',   -- Customer type
      'Aziza',
      'Karimova',
      'aziza.karimova@example.com',
      '+998901111111',
      v_group_id,               -- Part of tour group
      'TEST-TXN-' || EXTRACT(EPOCH FROM NOW())::TEXT,
      v_package_code,
      v_partner_paid,           -- Price in orders table is what partner paid
      v_partner_paid * 12650,   -- UZS equivalent
      TRUE,                     -- Discount applicable
      v_discount_rate,          -- 5%
      v_discount_amount,        -- $1.00
      v_discount_amount * 12650, -- UZS equivalent
      v_partner_paid,           -- $19.00
      v_partner_paid * 12650,   -- UZS
      v_retail_price,           -- Original retail price $20.00
      'ALLOCATED',              -- Allocated status (triggers partner_earnings)
      'partner_balance',
      'Test order for partner discount validation'
    )
    RETURNING id INTO v_order_id;

    RAISE NOTICE '✅ Created test B2B order: % (ID: %)', 'TEST-ORDER', v_order_id;
    RAISE NOTICE '   Retail Price: $%.2f', v_retail_price;
    RAISE NOTICE '   Partner Paid: $%.2f', v_partner_paid;
    RAISE NOTICE '   Discount: $%.2f (%.0f%%)', v_discount_amount, v_discount_rate;

    -- Wait for triggers to complete
    PERFORM pg_sleep(0.5);

    -- ============================================
    -- STEP 8: VERIFY TRIGGERS WORKED
    -- ============================================

    -- Check partner_earnings was created
    IF EXISTS (SELECT 1 FROM partner_earnings WHERE order_id = v_order_id) THEN
      RAISE NOTICE '✅ partner_earnings record created automatically (trigger worked!)';
    ELSE
      RAISE NOTICE '❌ partner_earnings record NOT created (trigger failed!)';
    END IF;

    -- Check partner stats updated
    DECLARE
      v_partner_total_orders INT;
      v_partner_total_savings DECIMAL(15,2);
    BEGIN
      SELECT total_orders, total_savings
      INTO v_partner_total_orders, v_partner_total_savings
      FROM partners
      WHERE id = v_partner_id;

      RAISE NOTICE '✅ Partner stats updated:';
      RAISE NOTICE '   Total Orders: %', v_partner_total_orders;
      RAISE NOTICE '   Total Savings: $%.2f', v_partner_total_savings;
    END;

  END;

END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show partner summary
SELECT
  'PARTNER SUMMARY' as section,
  p.company_name,
  p.effective_discount_rate as discount_rate,
  p.total_orders,
  p.total_spent,
  p.total_savings,
  p.total_customers,
  p.status
FROM partners p
WHERE p.company_name = 'Grand Travel Tour';

-- Show partner customers
SELECT
  'PARTNER CUSTOMERS' as section,
  pc.first_name || ' ' || pc.last_name as customer_name,
  pc.email,
  pc.phone,
  pc.total_orders
FROM partner_customers pc
JOIN partners p ON pc.partner_id = p.id
WHERE p.company_name = 'Grand Travel Tour';

-- Show customer groups
SELECT
  'CUSTOMER GROUPS' as section,
  cg.name,
  cg.destination_name,
  cg.group_size,
  cg.travel_start_date,
  cg.travel_end_date
FROM customer_groups cg
JOIN partners p ON cg.partner_id = p.id
WHERE p.company_name = 'Grand Travel Tour';

-- Show partner orders
SELECT
  'PARTNER ORDERS' as section,
  o.transaction_id,
  o.customer_first_name || ' ' || o.customer_last_name as customer,
  o.partner_paid_usd as paid,
  o.discount_amount_usd as saved,
  o.order_status as status
FROM orders o
JOIN partners p ON o.partner_id = p.id
WHERE p.company_name = 'Grand Travel Tour';

-- Show partner earnings
SELECT
  'PARTNER EARNINGS' as section,
  pe.retail_price_usd as retail,
  pe.partner_paid_usd as paid,
  pe.discount_amount_usd as savings,
  pe.discount_rate || '%' as discount,
  pe.status
FROM partner_earnings pe
JOIN partners p ON pe.partner_id = p.id
WHERE p.company_name = 'Grand Travel Tour';

-- Final success message
SELECT '✅ TEST DATA CREATED SUCCESSFULLY!' as status;
SELECT '📊 Review the results above to verify everything works correctly' as note;
