## 1. Navigation and route hard merge

- [x] 1.1 Remove duplicated `Weryfikacja` entry from shop role navigation and make `/shop/sale` the primary verification entry point.
- [x] 1.2 Update route behavior for `/shop/verify` (redirect or compatibility view) so legacy links do not break user flow.
- [x] 1.3 Update shop dashboard action copy/links so "Nowa sprzedaż" clearly communicates verification-first unified flow.

## 2. Unified verification in sale flow

- [x] 2.1 Move/align verification methods in `ShopSalePage` to include scan/token/number fallback tabs as single source of verification behavior.
- [x] 2.2 Remove duplicated verification affordances that conflict with sale step 1 logic.
- [x] 2.3 Keep explicit "Zeskanuj inną promesę" reset action and verify that it clears session verification context consistently.

## 3. Firearm section interaction gating

- [x] 3.1 Apply hard disabled state to all firearm form controls before successful verification (`isValid: true`).
- [x] 3.2 Prevent or collapse firearm-section interaction before verification and show clear prerequisite guidance.
- [x] 3.3 Ensure submit action remains blocked until verification success and enabled immediately after successful verification.

## 4. QA and documentation

- [ ] 4.1 Execute manual test matrix for desktop/mobile: scan flow, token fallback, number fallback, reset flow, and legacy route behavior.
- [x] 4.2 Add/update developer guide notes to reflect hard-merge flow and pre-verification non-interactive firearm section rules.
