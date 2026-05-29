## Why

Shop flow currently duplicates verification behavior across two places (`/shop/verify` and step 1 in `/shop/sale`). This creates inconsistent UX and allows users to interact with firearm data fields before verification is valid, which conflicts with the intended verification-first process.

## What Changes

- Hard-merge verification UX into sales flow so verification tabs and fallback modes live in sales step 1 as the single source of truth.
- Remove duplicate verification entry point from shop navigation and route-level user journeys.
- Enforce true gating for firearm data step: before valid verification, firearm section is non-editable and non-interactive.
- Keep explicit reset path for scanning a different promise and re-opening verification controls.

## Capabilities

### New Capabilities
- `shop-sale-verification-hard-merge`: Defines single-entry shop flow where verification and sale registration are unified and state-gated.

### Modified Capabilities
- `shop-qr-scanner`: Tightens requirement semantics for verification-first UX by removing duplicated verification surfaces and requiring non-interactive firearm inputs before successful verification.

## Impact

- Affected frontend pages/components: `src/app/pages/ShopSalePage.tsx`, `src/app/pages/ShopVerification.tsx`, `src/app/components/Layout.tsx`, `src/app/routes.tsx`, and potentially `src/app/pages/ShopDashboard.tsx`.
- No backend API contract changes required; existing verify/register endpoints remain unchanged.
- Manual QA scope includes shop mobile/desktop navigation, verification fallback modes, and pre-verification interaction blocking.
