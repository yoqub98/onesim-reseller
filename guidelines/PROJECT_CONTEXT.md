# Project Context & Implementation Plan

## Current Mode: Building Half-Working MVP

### Features NOT Implemented Yet (Skipped for MVP)
1. **Payment handling** - No actual payment processing, charging, invoice or receipt generation
2. **eSIM delivery via SMS** - No actual SMS sending of eSIM QR codes

These features will be implemented later.

### Testing Approach
- Payment step is omitted entirely
- Orders go directly to eSIM allocation (via esimAccess API)
- Payment integration will be added in between later

---

## Deployment Architecture

### Current State
- Running on `.vercel.app` domain

### Future Production Setup
Both sites share:
- **1 Supabase project** (shared database)
- **1 Hosting account**
- **Same eSIM provider**: esimAccess (plans & orders)

| Version | Domain | Purpose |
|---------|--------|---------|
| B2C | `www.onesim.uz` | Regular customers (already deployed) |
| B2B | `partner.onesim.uz` | Partner/reseller portal (this project) |

### Deployment Method
- GitHub Actions with FTP secret keys
- Both B2C and B2B deploy to same hosting account

---

## Key Technical Notes
- B2C and B2B fetch plans from the same source (esimAccess)
- B2C and B2B order eSIMs from the same source (esimAccess)
- Shared Supabase means shared `plans`, `orders`, and related tables
