## 1. Data aggregation and status model

- [x] 1.1 Add frontend mapping that transforms active permits into exam entries (medical + psychological) with permit identifiers and labels
- [x] 1.2 Merge permit-based exam entries with medical-alert metadata to enrich status and user-facing messages
- [x] 1.3 Implement deterministic status computation for active, expiring, expired, and missing-data states

## 2. Citizen medical view UX

- [x] 2.1 Update medical view layout to show exam-to-permit association (permit number/type, exam type, validity date, status)
- [x] 2.2 Add navigation from exam row/card to permit details using permit identifier
- [x] 2.3 Add empty, loading, and missing-data states consistent with existing citizen UI patterns

## 3. Verification and documentation

- [x] 3.1 Validate behavior with mocked and real API data for users with multiple permits and mixed exam statuses
- [x] 3.2 Confirm no backend contract changes are required and keep existing API calls only
- [x] 3.3 Update developer-facing notes/test checklist for citizen medical view behavior
