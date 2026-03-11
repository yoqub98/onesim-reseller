# OneSim — Database Architecture Guide
> **Project:** `onesim` · Supabase · PostgreSQL 17 · Region: `ap-south-1`  
> **Focus:** B2B Reseller Platform (B2C covered briefly for context)

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Domain Map](#2-domain-map)
3. [Auth & Users](#3-auth--users)
4. [B2B Reseller Core](#4-b2b-reseller-core)
   - [partners](#41-partners)
   - [partner_customers](#42-partner_customers)
   - [customer_groups](#43-customer_groups)
   - [customer_group_members](#44-customer_group_members)
   - [group_orders](#45-group_orders)
5. [Orders & eSIMs](#5-orders--esims)
   - [orders](#51-orders)
   - [esim_delivery_logs](#52-esim_delivery_logs)
   - [order_action_logs](#53-order_action_logs)
   - [partner_earnings](#54-partner_earnings)
6. [Package Catalog](#6-package-catalog)
7. [Admin & Ops Tables](#7-admin--ops-tables)
8. [RLS Policy Summary](#8-rls-policy-summary)
9. [B2B Full Flow — Step by Step](#9-b2b-full-flow--step-by-step)
10. [Key Enums & Allowed Values](#10-key-enums--allowed-values)
11. [Important Notes for Frontend](#11-important-notes-for-frontend)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        AUTH LAYER                        │
│              auth.users  ←→  public.profiles             │
└───────────────────────┬─────────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          │                            │
   ┌──────▼──────┐              ┌──────▼──────┐
   │  B2B LAYER  │              │  B2C LAYER  │
   │  (reseller) │              │  (direct)   │
   └──────┬──────┘              └──────┬──────┘
          │                            │
   partners                      orders (source_type='b2c')
   partner_customers
   customer_groups
   customer_group_members
   group_orders
          │
          └──────────────────────────────────┐
                                             │
                                      ┌──────▼──────┐
                                      │   orders    │
                                      │ (1 row per  │
                                      │    eSIM)    │
                                      └──────┬──────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                    esim_delivery_logs  order_action_logs  partner_earnings
```

**Core principle:** Every eSIM — whether ordered B2C or B2B — ends up as one row in `orders`. The B2B layer adds structure *above* it: who ordered, for which group, as part of which bulk purchase.

---

## 2. Domain Map

| Domain | Tables |
|---|---|
| **Auth / Identity** | `profiles` (+ `auth.users`) |
| **B2B Reseller** | `partners`, `partner_customers`, `customer_groups`, `customer_group_members`, `group_orders` |
| **Orders & eSIMs** | `orders`, `esim_delivery_logs`, `order_action_logs`, `partner_earnings` |
| **Package Catalog** | `esim_packages`, `package_operators`, `package_price_changes`, `margin_overrides` |
| **Cache** | `cached_global_packages`, `cached_regional_packages`, `package_cache_metadata` |
| **Analytics** | `package_views`, `price_sync_log` |
| **B2C Only** | `user_favorites` |

---

## 3. Auth & Users

### `profiles`
One row per user, linked 1:1 to `auth.users`.

| Column | Notes |
|---|---|
| `id` | Mirrors `auth.users.id` |
| `user_type` | `'customer'` / `'partner'` / `'admin'` |
| `is_partner` | Generated boolean — `user_type = 'partner'` |
| `is_admin` | Generated boolean — `user_type = 'admin'` |
| `first_name`, `last_name`, `email`, `phone` | Basic identity |

> A user with `user_type = 'partner'` will also have a matching row in `partners`.  
> A user with `user_type = 'customer'` may also appear in `partner_customers` if added by a partner.

---

## 4. B2B Reseller Core

This is the heart of the reseller platform. Five tables work together.

```
partners
   └── partner_customers      (their end customers / travelers)
   └── customer_groups        (a named travel group)
         └── customer_group_members   (which customers are in which group)
         └── group_orders             (a bulk purchase event for the group)
                └── orders            (individual eSIM per customer)
```

---

### 4.1 `partners`
The tour agency / travel company / reseller account.

| Key Column | Notes |
|---|---|
| `user_id` | FK → `auth.users` (the partner's login account) |
| `company_name` | Display name |
| `status` | `active` / `suspended` / `pending_approval` / `deactivated` |
| `verified` | Admin must flip this to `true` before partner can order |
| `discount_rate` | Default discount off retail (e.g. `5.00` = 5%) |
| `custom_discount_rate` | Override for specific partners |
| `effective_discount_rate` | **Generated** — `COALESCE(custom, default)` — always use this |
| `total_orders`, `total_spent`, `total_savings` | Running counters (updated per order) |
| `auto_email_customers` | Partner preference — should we auto-send eSIM to end customer? |

---

### 4.2 `partner_customers`
The end travelers managed by a partner. Not necessarily Onesim users.

| Key Column | Notes |
|---|---|
| `partner_id` | FK → `partners.id` |
| `user_id` | FK → `auth.users` — nullable. Only set if the customer also has a Onesim account |
| `first_name`, `last_name`, `email`, `phone` | Contact info for eSIM delivery |
| `total_orders`, `total_spent` | Per-customer running counters |
| `tags` | JSONB — free tagging by partner (e.g. `["vip", "repeat"]`) |

---

### 4.3 `customer_groups`
A named group of travelers. Think "Italy Trip — June 2026".

| Key Column | Notes |
|---|---|
| `partner_id` | FK → `partners.id` |
| `name` | e.g. "Italy June Group A" |
| `destination_country_code` | ISO code of travel destination |
| `travel_start_date`, `travel_end_date` | Trip dates |
| `group_size` | Expected size (informational) |
| `status` | `draft` / `ready` / `archived` |
| `default_package_code` | Pre-selected eSIM plan for this group |
| `default_package_name` | Human-readable name of above |
| `default_delivery_method` | `email` / `sms` / `manual` — set once when creating group |

> **`status` lifecycle:**  
> `draft` → partner fills in details → `ready` → after trip or no longer needed → `archived`

---

### 4.4 `customer_group_members`
Junction table. Many-to-many between `customer_groups` and `partner_customers`.

| Column | Notes |
|---|---|
| `group_id` | FK → `customer_groups.id` |
| `customer_id` | FK → `partner_customers.id` |
| `added_at` | Timestamp |
| `added_by` | FK → `auth.users` — which admin/partner added them |

> A customer can be in multiple groups. A group can have many customers.

---

### 4.5 `group_orders`
**The bulk purchase event.** When a partner pays and orders eSIMs for an entire group, one row is created here.

| Key Column | Notes |
|---|---|
| `partner_id` | FK → `partners.id` |
| `customer_group_id` | FK → `customer_groups.id` |
| `status` | See lifecycle below |
| `delivery_method` | `email` / `sms` / `manual` — for this specific purchase |
| `package_code` | The eSIM plan ordered for the whole batch |
| `total_esims` | Count of eSIMs in this batch |
| `total_price_usd` | Retail total |
| `partner_paid_usd` | After partner discount |
| `esimaccess_batch_ref` | The `orderNo` returned from esimAccess API (e.g. `B25080914060004`) |
| `paid_at` | Payment confirmed timestamp |
| `ordered_at` | API call made timestamp |

> **`status` lifecycle:**
> ```
> draft → plan_selected → payment_pending → paid → api_ordering → completed
>                                                                       └→ failed
> ```

> One `customer_group` can have **multiple** `group_orders` (e.g. partner re-orders for the same group on a different trip, or adds top-ups for the group).

---

## 5. Orders & eSIMs

### 5.1 `orders`
**One row = one eSIM.** The central table. Both B2C and B2B orders land here.

#### Source identification
| Column | Values | Meaning |
|---|---|---|
| `source_type` | `b2c` | Direct customer purchase |
| `source_type` | `b2b_partner` | Partner bulk order |
| `source_type` | `admin` | Admin-created order |

#### Key B2B-specific columns
| Column | Notes |
|---|---|
| `partner_id` | FK → `partners.id` |
| `customer_group_id` | FK → `customer_groups.id` |
| `group_order_id` | FK → `group_orders.id` — the batch this eSIM belongs to |
| `end_customer_id` | FK → `partner_customers.id` — who this eSIM is assigned to |
| `end_customer_type` | `b2c` or `b2b_partner_customer` |
| `customer_first_name/last_name/email/phone` | Snapshot of customer info at order time |
| `delivery_method` | `email` / `sms` / `manual` / `whatsapp` |
| `discount_rate`, `discount_amount_usd` | Partner discount applied |
| `partner_paid_usd` | What partner actually paid |

#### eSIM data (from esimAccess API)
| Column | Notes |
|---|---|
| `iccid` | Unique eSIM identifier |
| `esim_tran_no` | esimAccess transaction number |
| `order_no` | esimAccess order number |
| `qr_code_url` | URL to QR code image |
| `short_url` | Short URL for the QR |
| `activation_code` | LPA string (for manual install) |
| `smdp_address` | SM-DP+ server address |
| `esim_status` | Live status from API: `NOT_ACTIVE` / `IN_USE` / `EXPIRED` etc. |
| `smdp_status` | `ENABLED` / `DISABLED` / `RELEASED` |
| `activation_date` | When customer activated the eSIM |
| `installation_date` | When eSIM was installed on device |
| `expiry_date` | When the plan expires |
| `total_volume` | Total data in bytes |
| `order_usage` | Used data in bytes |
| `total_duration` | Plan duration in days |

#### Order status
| `order_status` | Meaning |
|---|---|
| `PENDING` | Created, not yet processed |
| `PROCESSING` | API call in progress |
| `ALLOCATED` | eSIM issued successfully |
| `FAILED` | API or payment failed |
| `CANCELLED` | Cancelled by admin/partner |

---

### 5.2 `esim_delivery_logs`
Tracks whether the eSIM was actually delivered to the end customer via email/SMS.

| Column | Notes |
|---|---|
| `order_id` | FK → `orders.id` |
| `delivery_method` | `email` / `sms` / `whatsapp` |
| `recipient_contact` | The email or phone number used |
| `status` | `pending` / `sent` / `delivered` / `failed` / `bounced` |
| `sent_at`, `delivered_at`, `failed_at` | Timestamps per event |
| `failure_reason` | Provider error message |
| `provider_message_id` | ID from SMS gateway / Resend / etc. for tracing |
| `attempt_count` | Number of send attempts |

> **If `delivery_method = manual`** → no row in this table. Physical handoff by tour guide.  
> **Multiple rows per order** are possible if retries happen.

---

### 5.3 `order_action_logs`
Audit log of all post-purchase actions on an order.

| Column | Notes |
|---|---|
| `order_id` | FK → `orders.id` |
| `action_type` | `TOPUP` / `CANCEL` / `SUSPEND` / `RESUME` / `REVOKE` |
| `topup_package_code/name` | For top-up actions |
| `topup_price_usd/uzs` | Cost of the top-up |
| `previous_state`, `new_state` | JSONB snapshots before/after |
| `api_response` | Raw response from esimAccess for the action |
| `status` | `SUCCESS` / `FAILED` / `PENDING` |

---

### 5.4 `partner_earnings`
One row per order where a partner discount was applied. Tracks the financial split.

| Column | Notes |
|---|---|
| `partner_id` | FK → `partners.id` |
| `order_id` | FK → `orders.id` (unique — 1 earnings row per order) |
| `retail_price_usd` | Full price before discount |
| `discount_rate` | Applied rate |
| `discount_amount_usd` | The saving = partner's benefit |
| `partner_paid_usd` | What they actually paid |
| `partner_sell_price_usd` | Optional — what they charged their customer |
| `partner_actual_profit_usd` | **Generated** — `sell_price - paid` (null if sell_price not set) |

---

## 6. Package Catalog

### `esim_packages`
Master list of all eSIM packages synced from esimAccess API. ~2,033 rows.

| Key Column | Notes |
|---|---|
| `package_code` | Unique identifier from API |
| `slug` | Human-friendly identifier (e.g. `US_5_30`) |
| `location_type` | `country` / `regional` / `global` |
| `location_code` | ISO country or region code |
| `data_volume` | Bytes |
| `data_gb` | **Generated** — `data_volume / 1073741824` |
| `duration` | Days |
| `api_price` | Raw price in units (divide by 10000 for USD) |
| `api_price_usd` | **Generated** |
| `default_margin_percent` | Platform default (currently 50%) |
| `custom_margin_percent` | Override for specific packages |
| `effective_margin_percent` | **Generated** — `COALESCE(custom, default)` |
| `final_price_usd` | **Generated** — `api_price_usd * (1 + margin/100)` |
| `is_active`, `is_featured`, `is_hidden` | Visibility flags |

### `package_operators`
Networks/carriers per package per country. ~10,689 rows.  
FK: `package_code` → `esim_packages.package_code`

### `margin_overrides`
Admin-set margin overrides by location type (`country` / `regional` / `global`).  
Takes precedence over `esim_packages.default_margin_percent` when active.

### `package_price_changes`
History log — every time API price changes during sync, a row is recorded here.

### Cache Tables
`cached_global_packages`, `cached_regional_packages`, `package_cache_metadata` — preprocessed package data for fast UI rendering. Expires every 7 days. Do not write to directly; managed by sync functions.

---

## 7. Admin & Ops Tables

| Table | Purpose |
|---|---|
| `price_sync_log` | Log of each package price sync run (status, counts, errors) |
| `package_views` | Analytics — who viewed which package |
| `user_favorites` | B2C — saved packages per user |

---

## 8. RLS Policy Summary

| Table | Admin | Partner | Customer |
|---|---|---|---|
| `partners` | Full | Own row only | ✗ |
| `partner_customers` | Full | Own customers only | ✗ |
| `customer_groups` | Full | Own groups only | ✗ |
| `customer_group_members` | Full | Own groups only | ✗ |
| `group_orders` | Full | Own only | ✗ |
| `orders` | Full | Own partner orders | Own orders |
| `esim_delivery_logs` | Full | SELECT own orders | ✗ |
| `order_action_logs` | Full | Own orders | ✗ |
| `partner_earnings` | Full | Own only | ✗ |
| `esim_packages` | Full | SELECT | SELECT |
| `profiles` | Full | Own row | Own row |

---

## 9. B2B Full Flow — Step by Step

```
1. PARTNER ONBOARDING
   Auth signup → profiles row created (user_type = 'partner')
   Admin approves → partners row created, verified = true

2. BUILD CUSTOMER LIST
   Partner adds travelers → partner_customers rows

3. CREATE A GROUP
   partner creates customer_groups (status = 'draft')
   Sets: destination, travel dates, default_package_code, default_delivery_method
   Adds members → customer_group_members rows
   Group status → 'ready'

4. INITIATE BULK ORDER
   Partner selects group + confirms package
   group_orders row created (status = 'draft' → 'plan_selected')

5. PAYMENT
   Partner pays (Stripe or manual)
   group_orders.status → 'paid', paid_at = now()

6. API ORDERING
   Backend calls esimAccess API
   group_orders.status → 'api_ordering'
   API returns esimList[]
   For each eSIM in response:
     → one orders row created
     → orders.group_order_id = group_orders.id
     → orders.partner_id, customer_group_id set
     → orders.end_customer_id = matching partner_customers.id
     → partner_earnings row created
   group_orders.status → 'completed'
   group_orders.esimaccess_batch_ref = API orderNo

7. DELIVERY
   If delivery_method = 'email' or 'sms':
     → esim_delivery_logs row created (status = 'pending')
     → Email/SMS sent with QR code
     → Log updated: status = 'sent' → 'delivered' or 'failed'
   If delivery_method = 'manual':
     → No delivery log. Tour guide handles physically.

8. ACTIVATION TRACKING
   Background job polls esimAccess for status updates
   orders.esim_status, activation_date, order_usage updated

9. POST-ORDER ACTIONS
   Top-ups, cancellations, suspensions
   → order_action_logs row per action
```

---

## 10. Key Enums & Allowed Values

| Table.Column | Allowed Values |
|---|---|
| `profiles.user_type` | `customer` / `partner` / `admin` |
| `partners.status` | `active` / `suspended` / `pending_approval` / `deactivated` |
| `customer_groups.status` | `draft` / `ready` / `archived` |
| `customer_groups.default_delivery_method` | `email` / `sms` / `manual` |
| `group_orders.status` | `draft` / `plan_selected` / `payment_pending` / `paid` / `api_ordering` / `completed` / `failed` |
| `group_orders.delivery_method` | `email` / `sms` / `manual` |
| `orders.source_type` | `b2c` / `b2b_partner` / `admin` |
| `orders.order_status` | `PENDING` / `PROCESSING` / `ALLOCATED` / `FAILED` / `CANCELLED` |
| `orders.delivery_method` | `email` / `sms` / `whatsapp` / `manual` |
| `orders.end_customer_type` | `b2c` / `b2b_partner_customer` |
| `esim_delivery_logs.delivery_method` | `email` / `sms` / `whatsapp` |
| `esim_delivery_logs.status` | `pending` / `sent` / `delivered` / `failed` / `bounced` |
| `order_action_logs.action_type` | `TOPUP` / `CANCEL` / `SUSPEND` / `RESUME` / `REVOKE` |
| `order_action_logs.status` | `SUCCESS` / `FAILED` / `PENDING` |
| `esim_packages.location_type` | `country` / `regional` / `global` |

---

## 11. Important Notes for Frontend

**Always use generated columns — never compute these client-side:**
- `partners.effective_discount_rate` (not `discount_rate` raw)
- `esim_packages.final_price_usd` (not `api_price_usd` raw)
- `esim_packages.data_gb` (not `data_volume` raw)
- `partner_earnings.partner_actual_profit_usd`
- `profiles.is_partner`, `profiles.is_admin`

**B2B order drill-down query path:**
```
partners → group_orders → orders → esim_delivery_logs
                       ↘ order_action_logs
                       ↘ partner_earnings
```

**Identifying B2B vs B2C orders:**
```
orders.source_type = 'b2b_partner'  → B2B
orders.source_type = 'b2c'          → B2C
orders.group_order_id IS NOT NULL   → part of a bulk batch
```

**Manual delivery — no log exists:**  
When rendering delivery status: check `orders.delivery_method = 'manual'` first. If true, show "Manual / Physical" and skip querying `esim_delivery_logs`.

**Package prices are in different units:**  
`esim_packages.api_price` is raw units (divide by 10,000 for USD).  
Use `api_price_usd` (generated) or `final_price_usd` (generated, with margin) for display.

**Data usage is in bytes:**  
`orders.total_volume` and `orders.order_usage` are bytes. Divide by `1073741824` for GB.

**Cache tables are read-only for frontend:**  
`cached_global_packages` and `cached_regional_packages` are pre-baked for fast package browsing. Never write to them directly.
