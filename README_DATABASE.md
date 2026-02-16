# OneSIM Unified Database - Complete Documentation

## 📁 Generated Files

This database design includes three comprehensive documents:

### 1. **DATABASE_DESIGN_PROMPT.md** (Main Specification)
- Complete database schema design
- Business logic requirements
- Table structures and relationships
- Triggers and functions
- RLS policies
- Sample data and queries

### 2. **MIGRATION_001_UNIFIED_DATABASE.sql** (Ready-to-Run SQL)
- Complete migration script
- Creates all new tables
- Modifies existing tables
- Sets up triggers and RLS
- **Run this in Supabase SQL Editor**

### 3. **IMPLEMENTATION_CHECKLIST.md** (Step-by-Step Guide)
- Pre-implementation checklist
- Database migration steps
- Application code updates
- Testing procedures
- Monitoring queries

---

## 🎯 What This Database Design Solves

### Current State (Before Migration)
- ✅ OneSIM Shop (B2C) works
- ✅ eSIM packages synced from eSIMAccess
- ✅ Direct customer orders tracked
- ❌ No partner/reseller support
- ❌ No commission tracking
- ❌ No customer groups
- ❌ No B2B functionality

### After Migration
- ✅ **Unified database** for B2C + B2B
- ✅ **Partner management** (travel agencies, airlines)
- ✅ **Commission tracking** (auto-calculated 5% default)
- ✅ **Customer groups** (bulk tour management)
- ✅ **Dual order types** (b2c, b2b_partner, admin)
- ✅ **Earnings dashboard** data ready
- ✅ **Backward compatible** (B2C shop still works)

---

## 🏗️ Database Architecture

### Core Tables

```
auth.users (Supabase Auth)
    ↓
profiles (customer | partner | admin)
    ↓
    ├─→ partners
    │       ↓
    │       ├─→ partner_customers
    │       │       ↓
    │       │       └─→ customer_group_members → customer_groups
    │       │
    │       └─→ partner_earnings
    │               ↓
    └─→ orders ←────┘
            ↓
        order_action_logs
```

### New Tables (5)
1. **partners** - B2B partner/reseller accounts
2. **partner_customers** - Partners' end customers
3. **customer_groups** - Bulk customer management
4. **customer_group_members** - Group membership (junction)
5. **partner_earnings** - Commission tracking & payouts

### Modified Tables (2)
1. **orders** - Added B2B fields (source_type, partner_id, commission, etc.)
2. **profiles** - Added user_type (customer | partner | admin)

### Existing Tables (Unchanged)
- esim_packages
- package_operators
- cached_regional_packages
- cached_global_packages
- user_favorites
- order_action_logs
- All other existing tables...

---

## 🔑 Key Concepts

### Order Source Types

Every order has a `source_type`:

| Type | Description | Example |
|------|-------------|---------|
| `b2c` | Direct customer purchase | John buys eSIM for himself |
| `b2b_partner` | Partner buys for customer | Travel agency buys for tourist |
| `admin` | Admin-created order | Support team creates order |

### Customer Types

| Type | Table | Description |
|------|-------|-------------|
| B2C Customer | `auth.users` + `profiles` | Direct OneSIM Shop user |
| B2B Partner | `auth.users` + `profiles` + `partners` | Reseller account |
| Partner Customer | `partner_customers` | Partner's end customer |

### Commission Model

```
Order Amount: $19.00
Commission Rate: 5%
Commission Earned: $0.95

Trigger Flow:
1. Order created → status = 'PENDING'
2. Order allocated → status = 'ALLOCATED'
3. Trigger fires → Creates partner_earnings record
4. Partner totals updated → total_earnings += $0.95
```

---

## 📊 Example Data Scenarios

### Scenario 1: B2C Order (Existing Flow)
```sql
-- Customer "Sardor" buys eSIM directly
INSERT INTO orders (
  user_id: '123',
  source_type: 'b2c',
  end_customer_id: '123',
  end_customer_type: 'b2c',
  partner_id: NULL,
  commission_applicable: FALSE,
  price_usd: 19.00,
  ...
)
```

### Scenario 2: B2B Order (New Flow)
```sql
-- Partner "Grand Travel" buys for client "Aziza"
INSERT INTO orders (
  user_id: 'partner-456',           -- Grand Travel's user_id
  source_type: 'b2b_partner',
  partner_id: 'partner-record-789',
  end_customer_id: 'customer-101',  -- Aziza's partner_customer.id
  end_customer_type: 'b2b_partner_customer',
  customer_first_name: 'Aziza',
  customer_email: 'aziza@example.com',
  price_usd: 19.00,
  commission_applicable: TRUE,
  commission_rate: 5.00,
  commission_amount_usd: 0.95,
  ...
)

-- When order allocated, trigger creates:
INSERT INTO partner_earnings (
  partner_id: 'partner-record-789',
  order_id: 'order-xyz',
  commission_amount_usd: 0.95,
  status: 'earned'
)
```

---

## 🚀 Quick Start

### 1. Backup Database
```
Supabase Dashboard → Database → Backups → Create Backup
```

### 2. Run Migration
```sql
-- Copy contents of MIGRATION_001_UNIFIED_DATABASE.sql
-- Paste in: Supabase Dashboard → SQL Editor → New Query
-- Run
```

### 3. Verify
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'partner%';

-- Should return:
-- partners
-- partner_customers
-- customer_groups
-- customer_group_members
-- partner_earnings
```

### 4. Create Test Partner
See **IMPLEMENTATION_CHECKLIST.md** → Step 3

### 5. Update Application Code
See **IMPLEMENTATION_CHECKLIST.md** → "Update Application Code"

---

## 🔒 Security (RLS)

All partner tables have Row Level Security enabled:

- ✅ Partners can ONLY see their own data
- ✅ Partners can ONLY manage their own customers
- ✅ B2C users CANNOT see partner data
- ✅ Admins can see everything
- ✅ Service role (triggers) can manage earnings

---

## 📈 Dashboard Queries

### Partner Dashboard Stats
```sql
SELECT * FROM v_partner_dashboard_stats
WHERE partner_id = '<partner_id>';

-- Returns:
-- total_orders
-- active_orders
-- pending_orders
-- total_spent_usd
-- total_earnings
-- pending_earnings
-- total_customers
-- total_groups
```

### Partner Earnings History
```sql
SELECT
  pe.*,
  o.order_no,
  o.package_name,
  o.customer_first_name || ' ' || o.customer_last_name as customer_name
FROM partner_earnings pe
JOIN orders o ON pe.order_id = o.id
WHERE pe.partner_id = '<partner_id>'
ORDER BY pe.earned_at DESC;
```

### Complete Order Details
```sql
SELECT * FROM v_orders_complete
WHERE partner_id = '<partner_id>';

-- Includes all joined data:
-- - User info
-- - Partner info
-- - End customer info
-- - Group info
-- - Package info
-- - Earnings info
```

---

## 🧪 Testing

See **IMPLEMENTATION_CHECKLIST.md** for complete testing procedures.

Quick test:
```sql
-- 1. Create partner
-- 2. Create partner customer
-- 3. Create order with source_type = 'b2b_partner'
-- 4. Update order status to 'ALLOCATED'
-- 5. Check partner_earnings table
-- 6. Verify commission amount is correct
```

---

## 📞 Integration Points

### eSIMAccess API
- Orders (both B2C and B2B) call eSIMAccess
- Response data stored in `orders` table
- Same flow for both order types

### Payment Gateway
- B2C: Customer pays directly
- B2B: Partner pays (bulk discount already applied)
- Commission tracked separately

### Email Delivery
- B2C: Email to customer's email
- B2B: Email to partner customer's email (from partner_customers table)

---

## 📋 Migration Checklist

- [ ] Backup database
- [ ] Run migration SQL
- [ ] Verify tables created
- [ ] Create test partner
- [ ] Test B2B order creation
- [ ] Test commission trigger
- [ ] Update B2C app (minimal changes)
- [ ] Update B2B app (new features)
- [ ] Test RLS policies
- [ ] Monitor for errors

---

## 🎯 What's Next

After successful migration:

1. **Frontend Development**
   - Partner registration flow
   - Customer management UI
   - Earnings dashboard
   - Order creation for customers

2. **Business Logic**
   - Commission payout system
   - Partner approval workflow
   - Bulk order processing

3. **Admin Tools**
   - Partner management panel
   - Commission rate adjustments
   - Payout processing

---

## 📚 Additional Resources

- **Supabase Project**: https://supabase.com/dashboard/project/qzjcvrszcegtdbzwrcis
- **Current Tables**: 13 tables (see list in DATABASE_DESIGN_PROMPT.md)
- **New Tables**: 5 tables for B2B functionality
- **Views**: 2 views for reporting

---

## ⚠️ Important Notes

1. **Backward Compatible**: Existing B2C functionality unchanged
2. **Default Values**: Existing orders get `source_type = 'b2c'` automatically
3. **Commission Calculation**: Only on `order_status = 'ALLOCATED'`
4. **RLS Protection**: Partners isolated from each other's data
5. **Trigger-Based**: Commissions auto-created via database triggers

---

## 🔧 Troubleshooting

### Migration Fails
- Check for existing column names
- Verify foreign key constraints
- Review error message in Supabase logs

### RLS Blocks Access
- Verify user has correct `user_type` in profiles
- Check partner record exists for user
- Test with service_role key (bypasses RLS)

### Commission Not Created
- Verify order has `commission_applicable = TRUE`
- Check order status is 'ALLOCATED'
- Look for errors in Supabase logs
- Test trigger manually: `UPDATE orders SET order_status = 'ALLOCATED' WHERE id = '...'`

---

## 📊 Project Context

- **B2C App**: `D:\webapp\onesim-shop` (React, Chakra UI)
- **B2B App**: `d:\webapp\onesim-reseller` (React, custom design system)
- **Database**: Supabase PostgreSQL (qzjcvrszcegtdbzwrcis)
- **eSIM Provider**: eSIMAccess API
- **Current Packages**: 2,033 eSIM packages
- **Current Orders**: 6 B2C orders

---

**Generated:** February 16, 2026
**Version:** 1.0
**Status:** Ready for Implementation

---

## 🎉 You're Ready!

All documents created and ready to use:
1. Read `DATABASE_DESIGN_PROMPT.md` for full understanding
2. Run `MIGRATION_001_UNIFIED_DATABASE.sql` in Supabase
3. Follow `IMPLEMENTATION_CHECKLIST.md` step by step

Good luck with your OneSIM B2B implementation! 🚀
