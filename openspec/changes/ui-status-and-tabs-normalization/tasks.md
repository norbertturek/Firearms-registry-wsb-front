## 1. Shared status mapping foundation

- [x] 1.1 Create a shared status UI mapping module (canonical label + badge semantics) for application status rendering.
- [x] 1.2 Refactor `ApplicationsList` and `ApplicationDetails` to consume the shared status mapping instead of local status label switches.
- [x] 1.3 Validate that status wording is identical across migrated list/detail views for the same status keys.

## 2. Shared tabs shell foundation

- [x] 2.1 Introduce a reusable app-level tabs shell preset for list/review segmented contexts.
- [x] 2.2 Migrate high-priority tabbed pages (`ApplicationsList`, `TransfersList`, `MedicalAlertsView`) to the shared tabs shell preset.
- [x] 2.3 Verify migrated tabs preserve existing behavior while matching shared visual hierarchy and spacing.

## 3. Shop consistency alignment

- [x] 3.1 Review shop tab/status surfaces and align any segmented tabs with the shared tabs shell where applicable.
- [x] 3.2 Ensure shop status labels shown in affected list/review contexts use shared status UI mapping where applicable.

## 4. Documentation and regression checks

- [x] 4.1 Update design-system documentation references to include shared status mapping and tabs shell usage guidance.
- [ ] 4.2 Run manual regression checks on migrated pages (desktop/mobile) for status labels, tab styling, and action availability.
