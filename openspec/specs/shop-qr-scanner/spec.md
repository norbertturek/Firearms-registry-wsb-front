## Purpose

Enable practical in-shop verification and sale registration flows by allowing camera-based scanning of citizen e-promesa QR codes (`qrToken`) on mobile and desktop browsers.

## Requirements

### Requirement: Shop can scan citizen e-promesa QR code

The shop panel SHALL support scanning as the default verification path and SHALL minimize redundant manual entry after successful scan.

#### Scenario: Scan-first verification behavior

- **WHEN** the shop user scans a valid citizen QR code on the verification step
- **THEN** the system SHALL parse the decoded text as a `qrToken`
- **AND** the system SHALL call `POST /shop/verify-permit` with `{ qrToken }`
- **AND** the UI SHALL not require re-entering token manually in the same flow unless user resets verification context

### Requirement: Shop sale SHALL use step-oriented verification-first flow

The shop sale experience SHALL be presented as an ordered sequence of steps where successful promise verification is required before firearm registration fields are actionable.

#### Scenario: Firearm details unlocked after positive verification

- **WHEN** a shop user verifies a promise with `isValid: true`
- **THEN** the UI SHALL mark verification as completed
- **AND** the firearm details step SHALL become available for submission
- **AND** final registration SHALL still use `POST /shop/firearms/register-sale` with `qrToken`

### Requirement: Shop verification SHALL support prioritized fallback inputs

Verification UI SHALL prioritize QR scan and keep manual inputs as fallback paths inside the unified sale flow.

#### Scenario: Preferred scan with manual fallback

- **WHEN** the user opens verification in shop sale flow
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

### Requirement: Shop UI SHALL align with role-wide status/action patterns

Shop pages SHALL use status-first cards, explicit next actions, predictable reset actions, and shared app-level status/tabs rendering conventions consistent with Citizen/WPA interaction patterns.

#### Scenario: Verified state has explicit continuation and reset actions

- **WHEN** a promise is verified successfully
- **THEN** the UI SHALL show a clear success state and a primary continuation action
- **AND** the UI SHALL provide a secondary "scan another promise" reset action
- **AND** the reset action SHALL clear local verification context before a new scan

#### Scenario: Shop list/review tabs follow shared shell
- **WHEN** a shop surface uses segmented tabs for equivalent contexts
- **THEN** the tabs container SHALL use the shared app-level tabs shell preset
- **AND** status labels displayed within those contexts SHALL come from shared status UI mapping where applicable

### Requirement: Scanner works on mobile and desktop browsers

The scanner SHALL use the browser MediaDevices API (`getUserMedia`) and MUST attempt rear camera (`environment`) first, then fall back to front camera / webcam (`user`) when the first attempt fails.

#### Scenario: Mobile device with rear camera

- **WHEN** the shop user opens the scan tab on a mobile browser with a rear camera and grants permission
- **THEN** the live camera preview SHALL be visible
- **AND** scanning SHALL succeed when pointed at the citizen QR code

#### Scenario: Desktop with webcam

- **WHEN** the shop user opens the scan tab on a desktop browser with a webcam and grants permission
- **THEN** the system SHALL fall back to an available camera if `environment` is unavailable
- **AND** the live camera preview SHALL be visible
- **AND** scanning SHALL succeed when pointed at the citizen QR code

#### Scenario: Application served over HTTPS or localhost

- **WHEN** the application is loaded over HTTPS in production or `http://localhost` in development
- **THEN** the browser SHALL be allowed to request camera access per platform policy

### Requirement: User receives clear feedback when camera or scan fails

The system MUST NOT fail silently when the camera cannot start, permission is denied, or the scanned content is invalid.

#### Scenario: Camera permission denied or device unavailable

- **WHEN** the browser cannot start the camera (permission denied, no device, or unsupported context)
- **THEN** the scanner area SHALL display a visible error state with a Polish message
- **AND** the system SHALL show guidance to use manual token entry (fallback tab)
- **AND** the system MAY show a toast with the error summary

#### Scenario: Promise number scanned without full QR token

- **WHEN** the decoded text matches only a promise number (`PROM-...`) and not a `qrToken`
- **THEN** the system SHALL verify by `promiseNumber` if supported by the API
- **AND** the system SHALL inform the user that sale registration requires scanning the full citizen QR code
- **AND** the system SHALL NOT enable the sale registration action without a verified `qrToken`

#### Scenario: Invalid or expired promise after scan

- **WHEN** verification returns `isValid: false`
- **THEN** the system SHALL display a clear invalid state (visual card and message)
- **AND** the system SHALL show a toast with the translated API message

#### Scenario: Valid promise after scan

- **WHEN** verification returns `isValid: true` with sufficient slots, valid medical exams, and remaining promise quantity
- **THEN** the system SHALL display an active/valid state
- **AND** the system SHALL offer navigation to sale registration with the verified `qrToken`

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

### Requirement: Scan-once behavior per session

After a successful decode and positive verification, the scanner SHALL pause further reads and the verified promise context SHALL remain active until the user explicitly resets it.

#### Scenario: Rescan only after explicit reset

- **WHEN** a promise has already been verified in the current shop flow
- **THEN** the scanner UI SHALL stay hidden or paused by default
- **AND** the system SHALL require the user to choose an explicit reset action before starting a new scan

#### Scenario: Rescan after explicit reset

- **WHEN** the user selects "Zeskanuj inną promesę" (or equivalent reset action)
- **THEN** the verified context SHALL be cleared
- **AND** the scanner SHALL resume and allow decoding a new QR code
