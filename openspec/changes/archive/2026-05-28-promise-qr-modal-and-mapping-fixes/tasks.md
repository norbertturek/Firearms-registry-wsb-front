## 1. QR mapping correctness

- [x] 1.1 Replace strict one-shot matching with deterministic multi-step matching for `promiseApplication -> issued promise`
- [x] 1.2 Ensure fallback `QR w przygotowaniu` appears only when no matched issued promise with `qrToken` exists
- [x] 1.3 Reuse one shared helper for QR availability decisions across citizen views

## 2. Modal responsiveness and styling

- [x] 2.1 Refactor QR modal layout to sticky header + independently scrollable content body
- [x] 2.2 Prevent content clipping on tablet viewport by adjusting modal container sizing and overflow behavior
- [x] 2.3 Enforce white background for modal content area while preserving existing header style and close affordance

## 3. Consistency and verification

- [x] 3.1 Verify identical QR availability outcomes in `Moje sprawy -> Promesy` and promise `Szczegóły` view
- [x] 3.2 Confirm zero backend/API contract changes and no new endpoints
- [x] 3.3 Extend manual QA checklist with tablet modal scroll and false-fallback regression cases
