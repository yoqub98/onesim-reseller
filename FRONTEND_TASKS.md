# Frontend Improvement Tasks — AI Agent Prompts

> Context: This is a React 19 + Chakra UI v3 reseller dashboard app. Uses mock data via service layer (`/src/services/`), custom i18n via context, design tokens in `/src/design-system/tokens.js`. No backend yet — all data is mock. No TypeScript.
>
> Rules for ALL tasks:
>
> 
> - Do NOT change visual appearance or styling — UI must look identical
> - Preserve all existing functionality exactly
> - Use JSDoc comments where contracts/shapes need to be documented
> - When done with each task, verify the app still runs with `npm start`

---

## Task 1: Break Up Page Components Into Composable Pieces

**Goal:** Decompose the 3 bloated page files into small, focused components so future pages can be built fast by assembling existing pieces.

**What to do:**

1. Refactor `CatalogPage.jsx` (969 lines). Extract into separate files:
   - Filter/search panel (destination filter, search input, filter chips) → own component
   - Plan/package card grid (the list of plans rendered as cards) → own component
   - Order modal (the full modal with customer form, plan summary, payment section) → own component
   - Customer inline form (name, phone, email fields used when adding customer inside modal) → own component
   - The page file itself should only orchestrate: fetch data, manage which modal is open, pass props down. Target: under 150 lines.

2. Refactor `OrdersPage.jsx` (727 lines). Extract:
   - Orders filter bar (tabs/segmented control, search, date filters) → own component
   - Orders table (the table rendering rows with status badges) → own component
   - Order action modals (resend, suspend, cancel, topup confirmation modals) → own component
   - The page file itself: orchestration only. Target: under 150 lines.

3. Refactor `OrderDetailsPage.jsx` (582 lines). Extract:
   - Order info summary card (status, customer info, dates) → own component
   - Package/plan details card → own component
   - Order timeline/activity list → own component
   - Order action buttons bar → own component
   - The page file: orchestration only. Target: under 120 lines.

**Where to put extracted components:**
- Create subfolders per domain: `src/components/catalog/`, `src/components/orders/`
- Each extracted component gets its own file
- Each subfolder gets an `index.js` barrel export

**Commenting rule for this task:**
At the top of each new component file, add a one-line comment describing what it renders and where it's used:
```
// Renders the destination filter bar and search input — used in CatalogPage
```

At the top of each refactored page file, add a short block comment listing which child components it composes:
```
// CatalogPage — orchestrates:
//   CatalogFilters, PlanCardGrid, OrderModal
// Data: catalogService.getPlans()
```

---

## Task 2: Create Shared Hooks and Patterns for Page-Level Data & State

**Goal:** Standardize how pages load data, manage form state, and handle modal open/close — so building a new page is copy-paste-modify, not reinvent.

**What to do:**

1. Create `src/hooks/useServiceData.js` — a generic hook for loading mock data:
   - Takes a service function (e.g. `catalogService.getPlans`) and optional params
   - Returns `{ data, loading, error, refetch }`
   - Calls the service in useEffect on mount (and when params change)
   - This replaces the repeated useState+useEffect+try/catch pattern found in every page
   - Add JSDoc describing the hook signature and return shape

2. Create `src/hooks/useModal.js` — a hook for modal state:
   - Returns `{ isOpen, data, open(data), close() }`
   - `open(data)` sets isOpen=true and stores context data (e.g. which order to act on)
   - `close()` resets both
   - This replaces the repeated `const [showModal, setShowModal] = useState(false)` + `const [modalData, setModalData] = useState(null)` pattern

3. Create `src/hooks/useFormFields.js` — a lightweight hook for form state:
   - Takes initial fields object: `useFormFields({ name: '', phone: '', email: '' })`
   - Returns `{ fields, setField(key, value), resetFields(), setFields(obj) }`
   - No validation logic inside — keep it simple, validation stays in the component
   - This replaces the repeated `const [fields, setFields] = useState(...)` + inline spread-update pattern

4. Refactor existing pages to use these 3 hooks. Every page that loads data should use `useServiceData`. Every modal should use `useModal`. Every form should use `useFormFields`.

**Commenting rule for this task:**
Each hook file gets a JSDoc block at the top explaining:
- What it does (one sentence)
- Parameters with types
- Return value shape with types
- One usage example

```
/**
 * Loads data from a service function on mount.
 * @param {Function} serviceFn - async function returning data
 * @param {*} [params] - optional params passed to serviceFn
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: Function }}
 *
 * Usage:
 *   const { data: plans, loading } = useServiceData(catalogService.getPlans);
 */
```

---

## Task 3: Document Service Contracts and Prepare Integration Points

**Goal:** Make every service file self-documenting so a backend developer can look at the service layer alone and know exactly what endpoints to build, what shapes to send/receive, and where to plug in.

**What to do:**

1. In every service file (`ordersService.js`, `catalogService.js`, `groupsService.js`, `earningsService.js`), add JSDoc above each exported function documenting:
   - What it does (one sentence)
   - `@param` with expected shape as inline object type
   - `@returns {Promise<shape>}` with the exact shape the frontend expects back
   - `@endpoint` tag with the suggested REST endpoint (e.g. `GET /api/v1/orders`, `POST /api/v1/orders`)
   - `@todo` tag saying "Replace withDelay mock with HTTP client call"

   Example:
   ```
   /**
    * Fetches paginated list of portal orders filtered by tab.
    * @param {{ tab: 'client'|'group'|'self', search?: string, page?: number }} params
    * @returns {Promise<{ orders: PortalOrder[], total: number }>}
    * @endpoint GET /api/v1/portal/orders?tab={tab}&search={search}&page={page}
    * @todo Replace withDelay mock with HTTP client call
    */
   ```

2. Create `src/services/apiClient.js` — a placeholder HTTP client module:
   - Export a single object with methods: `get(url, params)`, `post(url, body)`, `put(url, body)`, `delete(url)`
   - Each method should just be a stub that throws "Not implemented — replace with real HTTP client" for now
   - Add a commented-out example showing how it would work with fetch or axios
   - Add `BASE_URL` constant reading from `process.env.REACT_APP_API_BASE_URL` with fallback to `'/api/v1'`
   - Add a JSDoc comment at the top: "Backend team: configure this file with your HTTP client. All service files should call these methods instead of withDelay."

3. Create `src/services/types.js` — a single file with JSDoc `@typedef` definitions for all data shapes used across the app. Look at the mock data files to extract these shapes:
   - `@typedef {Object} Plan` — id, name, destination, countryCode, data, validity, priceUsd, priceUzs, etc.
   - `@typedef {Object} Order` — id, customer, plan, status, createdAt, etc.
   - `@typedef {Object} PortalOrder` — full portal order shape
   - `@typedef {Object} Group` — id, name, members, etc.
   - `@typedef {Object} EarningsSummary` — shape from earnings mock
   - `@typedef {Object} Customer` — name, phone, email
   - Reference these types in service JSDoc: `@returns {Promise<Plan[]>}`

4. In each mock data file (`src/mock/*.js`), add a top-line comment:
   ```
   // Mock data for catalogService — see src/services/types.js for shape definitions
   ```

**Commenting rule for this task:**
This task IS the commenting task. Every comment added here serves the backend team directly. The principle: a backend developer should be able to:
- Open `src/services/types.js` to see every data shape
- Open any service file to see every endpoint they need to build
- Open `src/services/apiClient.js` to know where to plug in their HTTP client
- Never need to read component code to understand what the API contract is

---

## Task 4: Centralize Constants, Enums, and Config

**Goal:** Pull all hardcoded magic values out of components and into shared constant files — so nothing is scattered, everything is single-source-of-truth, and future pages reuse the same values.

**What to do:**

1. Create `src/constants/statuses.js`:
   - Export all order status values as constants: `PENDING`, `ACTIVE`, `SUSPENDED`, `CANCELLED`, `EXPIRED`, etc.
   - Export a `STATUS_CONFIG` map: `{ [STATUS]: { label_key, colorScheme, icon } }` — the label_key references the i18n dictionary key, colorScheme is the Chakra color used for badges
   - Find everywhere in components where status strings or status-to-color mappings are hardcoded and replace with imports from this file

2. Create `src/constants/delivery.js`:
   - Export delivery method constants: `WHATSAPP`, `TELEGRAM`, `EMAIL`, `MANUAL`, etc.
   - Export a config map with label keys and icons for each method
   - Replace hardcoded delivery references in components

3. Create `src/constants/currency.js`:
   - Move `USD_TO_UZS_RATE` from `utils/currency.js` into this file
   - Move currency codes (`UZS`, `USD`) as named constants
   - Keep formatting functions in `utils/currency.js` but import rate/codes from constants
   - Add a comment: `// @todo Backend: this rate should come from API config endpoint`

4. Create `src/constants/navigation.js`:
   - Extract the sidebar navigation items array (routes, labels, icons) from `SidebarNav.jsx` into this file
   - The sidebar component should import and map over this array
   - This makes it easy to add/remove/reorder nav items without touching component code

5. Create `src/constants/index.js` — barrel export for all constant files.

6. Audit all page and component files for any remaining magic strings or numbers (filter values, page sizes, timeout durations, etc.) and move them to appropriate constant files.

**Commenting rule for this task:**
Each constant file gets a top comment explaining what it centralizes:
```
// Order status constants and display config
// Used by: OrdersTable, OrderDetailsPage, StatusBadge
// Backend: status values must match API response values
```

For any value that will come from the backend later, add:
```
// @todo Backend: replace with value from /api/v1/config
```
