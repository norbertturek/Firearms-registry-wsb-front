## ADDED Requirements

### Requirement: Shop sale SHALL use step-oriented verification-first flow
The shop sale experience SHALL be presented as an ordered sequence of steps where successful promise verification is required before firearm registration fields are actionable.

#### Scenario: Firearm details unlocked after positive verification
- **WHEN** a shop user verifies a promise with `isValid: true`
- **THEN** the UI SHALL mark verification as completed
- **AND** the firearm details step SHALL become available for submission
- **AND** final registration SHALL still use `POST /shop/firearms/register-sale` with `qrToken`

### Requirement: Shop verification SHALL support prioritized fallback inputs
Verification UI SHALL prioritize QR scan and keep manual inputs as fallback paths.

#### Scenario: Preferred scan with manual fallback
- **WHEN** the user opens verification in shop flow
- **THEN** scan input SHALL be presented as the primary method
- **AND** promise number and manual token inputs SHALL remain available as fallback options
- **AND** the UI SHALL explain that final sale requires a verified `qrToken`

### Requirement: Citizen SHALL have consistent QR access for accepted promises
When a promise is ready for in-shop usage (`Active` or `Approved`) the citizen UI SHALL expose the same `Pokaż QR` action regardless of entry point.

#### Scenario: QR action available from multiple entry points
- **WHEN** a citizen opens an accepted/active promise from `Moje promesy`
- **THEN** the UI SHALL provide `Pokaż QR`
- **AND** opening action SHALL render the standard QR modal
- **AND** the same promise opened via `Moje sprawy` or `Szczegóły wniosku` SHALL provide equivalent QR action

#### Scenario: QR modal uses only explicit promise data
- **WHEN** the UI opens QR modal for a promise
- **THEN** data source SHALL be a promise entity that includes `qrToken` (`PromiseDto`)
- **AND** frontend SHALL NOT infer QR availability only from application status without promise data
- **AND** when explicit `qrToken` is absent, UI SHALL show clear fallback action (e.g., navigate to list where promise data is available)

## MODIFIED Requirements

### Requirement: Shop can scan citizen e-promesa QR code

The shop panel SHALL support scanning as the default verification path and SHALL minimize redundant manual entry after successful scan.

#### Scenario: Scan-first verification behavior
- **WHEN** the shop user scans a valid citizen QR code
- **THEN** the system SHALL parse it as `qrToken`
- **AND** the system SHALL call `POST /shop/verify-permit` with `{ qrToken }`
- **AND** the UI SHALL not require re-entering token manually in the same flow unless user resets verification context

### Requirement: Manual fallback remains available

The shop panel SHALL keep fallback methods for verification while preserving backend constraints.

#### Scenario: Promise number as verification fallback
- **WHEN** the shop user enters only promise number (`PROM-...`)
- **THEN** the system SHALL verify by `promiseNumber`
- **AND** the UI SHALL clearly indicate that sale submission still requires verified `qrToken`

#### Scenario: Manual token as verification fallback
- **WHEN** scanning is unavailable and user provides token manually
- **THEN** the system SHALL verify by `qrToken`
- **AND** positive verification SHALL allow moving to sale step without requiring camera access
