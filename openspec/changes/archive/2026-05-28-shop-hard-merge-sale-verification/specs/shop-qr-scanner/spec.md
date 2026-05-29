## MODIFIED Requirements

### Requirement: Shop verification SHALL support prioritized fallback inputs
Verification UI SHALL prioritize QR scan and keep manual inputs as fallback paths inside the unified sale flow.

#### Scenario: Preferred scan with manual fallback

- **WHEN** the user opens verification in shop sale flow
- **THEN** scan input SHALL be presented as the primary method
- **AND** promise number and manual token inputs SHALL remain available as fallback options
- **AND** the UI SHALL explain that final sale requires a verified `qrToken`

### Requirement: Shop verification and sale UI SHALL operate as one continuous task flow

The shop experience SHALL present verification and sale as a continuous, step-oriented process with clear "current step" and "next step" guidance, while preserving compatibility with existing shop API endpoints.

#### Scenario: Verify step leads directly to sale step

- **WHEN** a shop user gets `isValid: true` from `POST /shop/verify-permit`
- **THEN** the UI SHALL keep a verified promise context in the current task flow
- **AND** the UI SHALL move the user to firearm-data completion without requiring immediate re-scan
- **AND** the final save SHALL still use `POST /shop/firearms/register-sale` with `qrToken`

#### Scenario: No duplicate verification surface in primary navigation
- **WHEN** a shop user navigates using standard shop navigation actions
- **THEN** verification SHALL be accessed through the sale flow as the primary entry point
- **AND** the UI SHALL NOT expose an additional, equivalent verification workspace that duplicates sale step 1 behavior
