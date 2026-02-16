# OneSIM Partner Discount Model - EXPLAINED

## ❌ What I Got WRONG Initially

I designed the database assuming you **PAY** partners a 5% commission. That's incorrect!

---

## ✅ The CORRECT Model

**Partners get a DISCOUNT at purchase time, not a commission payment later.**

---

## 💰 How It Actually Works

### Pricing Flow:

```
1. eSIMAccess sells to OneSIM:          $10.00
2. OneSIM adds margin (50%):            + $5.00
3. OneSIM Shop retail price (B2C):      = $15.00

4. Partner gets 5% discount:            - $0.75 (5% of $15.00)
5. Partner pays (B2B price):            = $14.25

Partner's advantage (savings):          $0.75
```

### Partner's Business Model:

```
Partner buys from you:                  $14.25 (discounted)
Partner sells to their customer:        $20.00 (their choice)
Partner's actual profit:                $5.75
```

**Key Point:** You don't pay the partner $0.75. The $0.75 is the discount they got at purchase time, which they can turn into profit when reselling.

---

## 📊 Example Scenarios

### Scenario 1: Partner Sells at Retail Price

```
Retail price:           $15.00
Partner pays:           $14.25 (5% discount)
Partner sells for:      $15.00 (same as retail)
Partner profit:         $0.75
```

### Scenario 2: Partner Adds Their Own Markup

```
Retail price:           $15.00
Partner pays:           $14.25 (5% discount)
Partner sells for:      $20.00 (their markup)
Partner profit:         $5.75
```

### Scenario 3: Different Partner Discount Rates

```
Partner A (5% discount):
- Pays: $15.00 * 0.95 = $14.25
- Savings: $0.75

Partner B (10% discount, premium partner):
- Pays: $15.00 * 0.90 = $13.50
- Savings: $1.50

Partner C (3% discount, new partner):
- Pays: $15.00 * 0.97 = $14.55
- Savings: $0.45
```

---

## 🗄️ Database Tracking

### What We Track for Partners:

```sql
partners table:
- discount_rate: 5.00 (default)
- custom_discount_rate: NULL (or override like 10.00)
- effective_discount_rate: COALESCE(custom_discount_rate, discount_rate)
- total_spent: Sum of all discounted prices paid
- total_savings: Sum of all discounts received (their "earnings")
- total_orders_value_retail: What they would've paid at retail
```

### Per-Order Tracking:

```sql
orders table (B2B order):
- price_usd: $15.00 (retail price OR from package.final_price_usd)
- discount_applicable: TRUE
- discount_rate: 5.00 (from partner.effective_discount_rate)
- discount_amount_usd: $0.75 (calculated: $15 * 0.05)
- partner_paid_usd: $14.25 (calculated: $15 - $0.75)

partner_earnings table:
- retail_price_usd: $15.00
- discount_rate: 5.00
- discount_amount_usd: $0.75 (their "earning" = the savings)
- partner_paid_usd: $14.25 (what they actually paid)
- partner_sell_price_usd: NULL (optional - if partner logs it)
- partner_actual_profit_usd: NULL (calculated if sell price logged)
```

---

## 💻 Order Creation Example

### B2C Order (OneSIM Shop):

```javascript
const order = {
  source_type: 'b2c',
  user_id: customer_id,
  price_usd: 15.00,        // Full retail price
  price_uzs: 189750,       // 15 * 12650
  discount_applicable: false,
  // No partner fields
};

// Customer pays: $15.00
```

### B2B Order (OneSIM Reseller):

```javascript
const partner = await getPartner(partner_id);
// partner.effective_discount_rate = 5.00

const package = await getPackage(package_code);
const retail_price = package.final_price_usd; // $15.00

const discount_rate = partner.effective_discount_rate; // 5.00
const discount_amount = retail_price * (discount_rate / 100); // $0.75
const partner_pays = retail_price - discount_amount; // $14.25

const order = {
  source_type: 'b2b_partner',
  user_id: partner_user_id,
  partner_id: partner.id,
  end_customer_id: partner_customer_id,
  end_customer_type: 'b2b_partner_customer',

  price_usd: partner_pays,           // $14.25 (what partner pays)
  price_uzs: partner_pays * 12650,   // UZS equivalent

  discount_applicable: true,
  discount_rate: discount_rate,      // 5.00
  discount_amount_usd: discount_amount, // $0.75
  discount_amount_uzs: discount_amount * 12650,
  partner_paid_usd: partner_pays,    // $14.25
  partner_paid_uzs: partner_pays * 12650,
  retail_price_override_usd: retail_price, // $15.00 (for reference)
};

// Partner pays: $14.25
// Partner saves: $0.75
// You receive: $14.25
```

---

## 📈 Partner Dashboard Display

### What Partners See:

```
EARNINGS DASHBOARD
==================

Total Orders:           47
Total Spent:            $669.75
Retail Value:           $705.00
Total Savings:          $35.25  ← Their "earnings"

Discount Rate:          5%

Recent Orders:
Order     Retail    You Paid   Savings
#001      $15.00    $14.25     $0.75
#002      $20.00    $19.00     $1.00
#003      $25.00    $23.75     $1.25
```

### SQL Query for Dashboard:

```sql
SELECT
  company_name,
  effective_discount_rate AS "Your Discount",
  total_orders AS "Orders",
  total_spent AS "You Paid",
  total_orders_value_retail AS "Retail Value",
  total_savings AS "Your Earnings (Savings)",
  ROUND((total_savings / NULLIF(total_orders_value_retail, 0)) * 100, 2) AS "Effective Discount %"
FROM partners
WHERE id = <partner_id>;
```

---

## 🎯 Key Differences from Commission Model

| Aspect | ❌ Commission (WRONG) | ✅ Discount (CORRECT) |
|--------|----------------------|----------------------|
| **When money changes hands** | Partner pays full price, gets commission later | Partner pays discounted price upfront |
| **What we track** | Money we owe them | Money they saved |
| **Cash flow** | You owe them payouts | They already got their benefit |
| **Their "earnings"** | Commission to be paid | Discount already received |
| **Your revenue** | Full price minus commission | Discounted price |
| **Partner invoice** | $15.00 - $0.75 commission = $14.25 net | $14.25 (discounted price) |

---

## 🔄 Payment Flow

### Commission Model (WRONG):
```
1. Partner pays you:         $15.00
2. You owe partner:          $0.75
3. You pay partner later:    $0.75
4. Partner net:              $14.25
5. Your revenue:             $14.25
```

### Discount Model (CORRECT):
```
1. Partner pays you:         $14.25 (already discounted)
2. You owe partner:          $0.00 (nothing)
3. Partner's benefit:        $0.75 (already received via discount)
4. Your revenue:             $14.25
```

---

## 🧮 Database Calculations

### On Order Creation:

```sql
-- Given:
SET @retail_price = 15.00;
SET @partner_discount_rate = 5.00;

-- Calculate:
SET @discount_amount = @retail_price * (@partner_discount_rate / 100.0);
-- = 15.00 * 0.05 = 0.75

SET @partner_pays = @retail_price - @discount_amount;
-- = 15.00 - 0.75 = 14.25

-- Store in orders table:
INSERT INTO orders (
  price_usd = @partner_pays,              -- 14.25
  discount_amount_usd = @discount_amount, -- 0.75
  partner_paid_usd = @partner_pays,       -- 14.25
  retail_price_override_usd = @retail_price -- 15.00
);
```

### Trigger Updates Partner Totals:

```sql
-- When order allocated:
UPDATE partners
SET
  total_spent = total_spent + 14.25,
  total_savings = total_savings + 0.75,
  total_orders_value_retail = total_orders_value_retail + 15.00
WHERE id = <partner_id>;
```

---

## 📊 Reporting Queries

### Total Partner Savings (Earnings):

```sql
SELECT
  p.company_name,
  COUNT(pe.id) as orders,
  SUM(pe.discount_amount_usd) as total_savings,
  AVG(pe.discount_rate) as avg_discount_rate
FROM partners p
JOIN partner_earnings pe ON p.id = pe.partner_id
WHERE pe.status = 'completed'
GROUP BY p.id, p.company_name
ORDER BY total_savings DESC;
```

### Partner Profitability (if they log sell prices):

```sql
SELECT
  p.company_name,
  SUM(pe.partner_paid_usd) as cost,
  SUM(pe.partner_sell_price_usd) as revenue,
  SUM(pe.partner_actual_profit_usd) as profit,
  SUM(pe.discount_amount_usd) as our_discount_given
FROM partners p
JOIN partner_earnings pe ON p.id = pe.partner_id
WHERE pe.partner_sell_price_usd IS NOT NULL
GROUP BY p.id, p.company_name;
```

---

## ✅ Use the Corrected Migration

**File:** `MIGRATION_002_DISCOUNT_MODEL_CORRECTED.sql`

This migration file has the correct terminology:
- ✅ `discount_rate` (not commission_rate)
- ✅ `discount_amount` (not commission_amount)
- ✅ `partner_paid` (what they actually paid)
- ✅ `total_savings` (not total_earnings/pending_earnings)
- ✅ Triggers calculate savings, not commission
- ✅ No payout tracking (they already got the discount)

---

## 🎯 Summary

**Partner Revenue Model:**
- Partners DON'T get paid by you
- Partners GET DISCOUNTS when buying
- Their "earnings" = the discount they saved
- They make profit by reselling higher than what they paid
- You track their savings for transparency, not for payouts

**Your Revenue:**
- You receive: `retail_price * (1 - partner_discount_rate)`
- Example: $15.00 * 0.95 = $14.25 per B2B order
- No future payout obligations

---

**This is the CORRECT model!** 🎉
