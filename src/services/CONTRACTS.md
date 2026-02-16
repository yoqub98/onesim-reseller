# Reseller Service Contracts (Backend Handoff)

This file defines the contract between UI service functions and backend implementations.
Keep function names stable to avoid page-level churn.

## 1) Auth Contract

Used by: `src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx`, `src/pages/SignupPage.jsx`

### Login
- Input: `{ email, password }`
- Backend operation:
  1. `supabase.auth.signInWithPassword`
  2. fetch partner by `partners.user_id = auth.uid()`
- Output (UI user shape):
```js
{
  id: "uuid",
  email: "partner@company.com",
  company_name: "Company LLC",
  partner_id: "uuid",
  role: "partner"
}
```

### Signup (partner onboarding)
- Input (from UI form):
```js
{
  email, password,
  companyName, legalName, inn, address,
  contactFullName, contactPhone, contractNumber
}
```
- Backend operation:
  1. create auth user
  2. upsert `profiles` with `user_type='partner'`
  3. insert into `partners`
- Output: auth/session + partner profile payload.

## 2) catalogService

### `getPlans()`
- Current UI function: `catalogService.getPlans()`
- Suggested backend source:
  - `esim_packages` (active + visible records)
  - optional joins/derivations for operators/country display
- Expected UI output array (`Plan[]`, see `src/services/types.js`):
```js
{
  id, name, destination, countryCode, dataGb, dataLabel,
  validityDays, price, speed, coverage,
  originalPriceUzs, resellerPriceUzs, sku
}
```

## 3) groupsService

### `listGroups()`
- Backend source:
  - `customer_groups` by current partner
  - group members from `customer_group_members` + `partner_customers`
- Output (`Group[]`):
```js
{
  id,
  code, // optional short human-readable code e.g. GRP-1234
  name,
  destination, // e.g. "BAA"
  destinationCountryCode, // e.g. "AE"
  travelStartDate, // YYYY-MM-DD
  travelEndDate, // YYYY-MM-DD
  packageLabel, // optional assigned package summary
  packageStatus, // scheduled | unassigned
  packageScheduledAt, // ISO datetime
  members: [{ name, phone, email }],
  deliveryMethod,
  deliveryTime
}
```

### `createGroup(payload)`
- Input:
```js
{
  name,
  members: [{ name, phone, email }],
  deliveryMethod, // sms | email | operator | manual
  deliveryTime // now | scheduled
}
```
- Backend write:
  - insert `customer_groups`
  - upsert `partner_customers`
  - insert `customer_group_members`
- Output: created group in UI shape.

## 4) ordersService

### `listOrders()`
- Used on dashboard recent table.
- Backend source: partner-scoped orders (latest first).
- Output (`Order[]`):
```js
{
  id, customerName, destination, countryCode, planName,
  amount, commission, status, createdAt
}
```
Note: `commission` is legacy UI naming. In discount model this can map to partner savings/profit projection.

### `createOrder(payload)`
- Input from `NewOrderPage`:
```js
{
  customerName,
  destination,
  countryCode,
  planName,
  amount,
  commission,
  phone?,
  email?
}
```
- Backend responsibilities:
  1. resolve selected package (`esim_packages`)
  2. create DB order record (`orders`)
  3. trigger eSIM provisioning flow (server-side)
  4. return created order summary
- Minimal output:
```js
{ id, ... }
```

### `listPortalOrders({tab, query})`
- Tab mapping:
  - `client` -> partner customer orders
  - `group` -> grouped orders
  - `self` -> partner self orders
- Backend source:
  - `orders`, optionally `partner_customers`, `customer_groups`, `esim_packages`
- Output (`PortalOrder[]`).

### `getPortalOrderDetails(id)`
- Backend source:
  - one order + related package + customer/group details + timeline fields
- Output: one `PortalOrder | null`.

### `getPortalPackage(packageId)`
- Backend source:
  - package lookup by internal id/code mapping
- Output: `PortalPackage | null`.

### `getPortalInstallLinks(id)`
- Backend source:
  - order row (`activation_code`, `iccid`, etc.)
- Output:
```js
{
  ios: "https://...",
  android: "https://..."
}
```

### Order actions
- `resendPortalOrder(id)`
- `suspendPortalOrder(id)`
- `cancelPortalOrder(id)`
- `topupPortalOrder(id)`

For each:
- validate actor + order ownership with RLS/auth
- call server/BFF action (and eSIMAccess where relevant)
- append `order_action_logs`
- return `{ ok: true }` on success

## 5) earningsService

### `getSummary()`
- Preferred source:
  - `v_partner_dashboard_stats` by `partner_id`
  - with derived fields for UI
- Output (`EarningsSummary`):
```js
{
  totalCommission,   // currently UI naming; map from discount savings if needed
  totalOrders,
  activeEsims,
  monthlyGrowthPct
}
```

## 6) Error Contract

Service functions should throw `Error(message)` for UI hooks to catch:
- `useServiceData()` expects rejected promise -> `.message`.
- Keep message short and user-safe; log full technical details server-side.

## 7) Status and Enum Contract

Align backend values to existing constants:
- order statuses: see `src/constants/statuses.js`
- delivery methods: see `src/constants/delivery.js`

If DB uses uppercase legacy values (`PENDING`, `ALLOCATED`, etc.), map to lowercase UI statuses in mappers.
