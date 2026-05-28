## Context

Shop currently exposes verification in two separate journeys: dedicated `ShopVerification` route and step 1 inside `ShopSalePage`. This duplicates scan/token/number UX, creates inconsistent state transitions, and increases risk of divergent behavior. Additionally, firearm data fields in `ShopSalePage` are only visually dimmed before positive verification but remain interactive.

The requested direction is hard merge: sales flow owns verification entirely, while pre-verification firearm inputs must be truly blocked.

## Goals / Non-Goals

**Goals:**
- Make `ShopSalePage` the single verification + registration flow.
- Remove duplicated verification tabs and route-level detours from primary shop navigation.
- Enforce non-interactive firearm section before successful verification (`isValid: true`).
- Preserve explicit reset behavior to scan/verify another promise.

**Non-Goals:**
- Backend API changes or contract changes for verify/register endpoints.
- Reworking scanner internals (`QrScanner`) beyond integration points.
- Adding historical sales/statistics features.

## Decisions

1. **Single source of verification = `ShopSalePage` step 1**
   - `ShopSalePage` keeps scan-first plus fallback inputs and verification state.
   - Alternative considered: keep full `ShopVerification` and only deep-link to sale. Rejected because it preserves duplicated UX and state drift.

2. **Route/nav hard merge for shop role**
   - Remove `Weryfikacja` from shop navigation and direct users to `/shop/sale` for verification-first flow.
   - Keep route compatibility decision: route may stay available as non-promoted fallback/redirect for backward links.
   - Alternative considered: delete route entirely. Rejected due to potential breakage of old links and lower rollback flexibility.

3. **Hard gating for firearm data**
   - Before positive verification, firearm controls are disabled (`disabled` on all editable controls) and section expansion is blocked/collapsed.
   - Alternative considered: allow data prefill before verify. Rejected because it conflicts with strict verification-first expectation and causes accidental edits.

4. **State reset remains explicit**
   - Existing reset action continues to clear verification context and re-enable verification controls first.
   - This maintains scan-once semantics while allowing deliberate rescan.

## Risks / Trade-offs

- **[Risk] Existing users rely on `/shop/verify` directly** → Mitigation: preserve route compatibility (redirect/info state) and keep deep-link handling in release notes.
- **[Risk] Over-strict UI gating may feel rigid** → Mitigation: show clear disabled-state helper text explaining prerequisite verification.
- **[Risk] Incomplete disable coverage on custom controls (`Select`)** → Mitigation: add checklist-level verification for every editable control in firearm card.
