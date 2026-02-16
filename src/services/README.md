# Services Layer Notes

This folder is prepared for backend integration.

## Files to start with

1. `apiClient.js`
- Replace stubs with real HTTP client logic.
- Keep method signatures unchanged.

2. `CONTRACTS.md`
- Source of truth for request/response payloads per service function.

3. `supabaseMappers.js`
- Use these mappers to normalize DB/eSIM data into UI contracts.

4. `endpoints.js`
- Logical BFF route map.

## Rule for backend wiring

- Do not change page components first.
- Keep service public APIs stable.
- Implement backend calls behind existing service functions, then remove mocks.

## Quick ownership map

- `catalogService.js` -> package browsing
- `groupsService.js` -> customer group CRUD
- `ordersService.js` -> order create/list/details/actions
- `earningsService.js` -> dashboard summary
