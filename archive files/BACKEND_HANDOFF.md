# OneSIM Reseller Frontend -> Backend Handoff

Last updated: 2026-02-16

This document is the implementation handoff for backend engineers/agents wiring `onesim-reseller` UI to real Supabase + eSIM provisioning flows.

## 1) Current UI Status

- Frontend routes/pages are in place and aligned with the Figma prototype flow (`/login`, `/signup`, `/catalog`, `/new-order`, `/orders`, `/orders/:orderId`).
- Data layer is currently mock-based (`src/services/*Service.js` + `src/mock/*`).
- `src/services/apiClient.js` is a placeholder and intentionally not implemented yet.
- Auth is mock-based in `src/context/AuthContext.jsx` (localStorage).

## 2) Live Supabase Reality (important)

The connected project currently has:

- Core data present:
  - `orders` (11 rows, all `source_type='b2c'`)
  - `esim_packages` (2033 rows)
  - package cache tables (`cached_*`, `package_cache_metadata`)
- B2B tables created but currently empty:
  - `partners`
  - `partner_customers`
  - `customer_groups`
  - `customer_group_members`
  - `partner_earnings`
- RLS is enabled on user/partner/order tables.
- Live view currently confirmed: `v_partner_dashboard_stats`.

Note: business model is discount/savings (not commission payout). Some old docs still mention commission terms.

## 3) Source of Truth for UI Contracts

Use these files first:

- `src/services/types.js` -> canonical UI-side data contracts used by components/pages.
- `src/services/CONTRACTS.md` -> backend request/response mapping for each service function.
- `src/services/supabaseMappers.js` -> row-to-UI shape mapping helpers.

## 4) Page -> Backend Ownership Map

1. `src/pages/LoginPage.jsx`
- Needs Supabase auth sign-in and OAuth.
- On successful login, resolve partner profile (`partners` by `user_id`).

2. `src/pages/SignupPage.jsx`
- Needs auth sign-up + partner onboarding insert flow:
  - `auth.users`
  - `profiles` (`user_type='partner'`)
  - `partners` record

3. `src/pages/DashboardPage.jsx`
- Calls:
  - `ordersService.listOrders()`
  - `earningsService.getSummary()`
- Back with:
  - partner scoped orders list
  - dashboard summary from `v_partner_dashboard_stats` (plus derived fields)

4. `src/pages/CatalogPage.jsx`
- Calls:
  - `catalogService.getPlans()`
  - `groupsService.listGroups()`
- Back with:
  - partner-visible sellable packages from `esim_packages`
  - optional partner discount pricing projection
  - partner groups

5. `src/pages/NewOrderPage.jsx`
- Reads plans/groups.
- Creates one order via `ordersService.createOrder(payload)`.
- Backend should normalize source:
  - self order
  - client order
  - group order (single bulk operation or multiple orders)

6. `src/pages/OrdersPage.jsx`
- Calls `ordersService.listPortalOrders({tab, query})`.
- Tabs map to source:
  - `client`: partner sold to end customer
  - `group`: group operations
  - `self`: partner self-provisioned

7. `src/pages/OrderDetailsPage.jsx`
- Calls:
  - `ordersService.getPortalOrderDetails(orderId)`
  - `ordersService.getPortalInstallLinks(orderId)`
  - action callbacks (`resend/suspend/cancel/topup`)
- Backend should enforce action eligibility by order/eSIM status.

8. `src/pages/GroupsPage.jsx`
- UI is fully implemented using mock services:
  - list/search groups
  - create/edit/delete group
  - attach package (simulated)
  - group details modal with members
- Required backend mapping:
  - `customer_groups.name` -> `group.name`
  - `customer_groups.destination_name` -> `group.destination`
  - `customer_groups.destination_country_code` -> `group.destinationCountryCode`
  - `customer_groups.travel_start_date` -> `group.travelStartDate`
  - `customer_groups.travel_end_date` -> `group.travelEndDate`
  - `customer_group_members` + `partner_customers` -> `group.members[]`

## 5) Suggested Backend Integration Sequence

1. Auth + partner identity bootstrap.
2. Catalog read path from `esim_packages`.
3. New order creation path (with eSIM order pipeline + DB persistence).
4. Orders list/details read path with search/tab filters.
5. Order actions (`resend`, `suspend`, `cancel`, `topup`) + `order_action_logs`.
6. Groups page API integration and earnings page data integration.

## 6) Reuse Patterns from onesim-shop

From `D:\\webapp\\onesim-shop`:

- Supabase client pattern: `src/lib/supabaseClient.js`
- BFF call style for sensitive eSIM operations:
  - `POST /api/order`
  - `GET /api/orders?userId=...`
  - `POST /api/orders?action=...`
  - `POST /api/packages`
- eSIMAccess request/response field mapping is already battle-tested there.
- Postman reference is available:
  - `D:\\webapp\\onesim-shop\\src\\eSIM Access API.postman_collection.json`

Recommendation: keep eSIMAccess calls server-side only. Frontend should never hold eSIMAccess secrets.

## 7) Practical Notes for Backend Agents

- Preserve existing UI service function names to avoid page refactors.
- Prefer adding new fields, not renaming old UI fields abruptly.
- If backend uses snake_case from Supabase, normalize to UI contracts using `src/services/supabaseMappers.js`.
- Keep all money handling numeric and explicit by currency (`*_usd`, `*_uzs`).
- Return ISO datetime strings for all timestamps.

## 8) Known Gaps to Resolve During Wiring

- `EarningsSummary` type still uses legacy naming (`totalCommission`) in UI.
- `EarningsPage`, `SettingsPage` are still placeholders.
- Admin-specific views in migration docs may not yet be applied in current Supabase environment.

## 9) Definition of Done for Handoff Completion

- All functions in `src/services/*Service.js` use real API client or Supabase layer.
- `AuthContext` uses Supabase session + auth state listener.
- Mock files are no longer used in production runtime.
- Orders and order actions fully operate against live DB + eSIM lifecycle.
- Error surfaces are user-safe and localized at page level.
