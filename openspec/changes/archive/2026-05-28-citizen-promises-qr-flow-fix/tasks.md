## 1. Promise QR data and mapping rules

- [x] 1.1 Create a shared frontend helper that determines QR availability from issued promises data (`qrToken`) instead of application status alone
- [x] 1.2 Implement deterministic mapping from promise application items to issued promise records used by QR modal
- [x] 1.3 Add fallback state for approved applications that do not yet have a mapped issued promise token

## 2. UI behavior consistency across citizen views

- [x] 2.1 Fix `ApplicationsList` so QR action appears only in the `Promesy` tab and never in `Pozwolenia`
- [x] 2.2 Apply the same QR availability logic in `ApplicationDetails` for promise type entries
- [x] 2.3 Keep `PromisesView` as source-of-truth for modal payload and ensure navigation/CTA behavior is consistent

## 3. Validation and regression checks

- [x] 3.1 Validate citizen flow for: issued active promise, approved-without-issued-promise, and non-eligible statuses
- [x] 3.2 Verify no backend/API contract changes are required and no new endpoints are introduced
- [x] 3.3 Update manual test checklist in docs for `Moje sprawy -> Promesy` QR behavior and fallback messaging
