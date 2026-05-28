## ADDED Requirements

### Requirement: Shop verification and sale UI SHALL operate as one continuous task flow
The shop experience SHALL present verification and sale as a continuous, step-oriented process with clear "current step" and "next step" guidance, while preserving compatibility with existing shop API endpoints.

#### Scenario: Verify step leads directly to sale step
- **WHEN** a shop user gets `isValid: true` from `POST /shop/verify-permit`
- **THEN** the UI SHALL keep a verified promise context in the current task flow
- **AND** the UI SHALL move the user to firearm-data completion without requiring immediate re-scan
- **AND** the final save SHALL still use `POST /shop/firearms/register-sale` with `qrToken`

### Requirement: Shop UI SHALL align with role-wide status/action patterns
Shop pages SHALL use status-first cards, explicit next actions, and predictable reset actions consistent with Citizen/WPA interaction patterns.

#### Scenario: Verified state has explicit continuation and reset actions
- **WHEN** a promise is verified successfully
- **THEN** the UI SHALL show a clear success state and a primary continuation action
- **AND** the UI SHALL provide a secondary "scan another promise" reset action
- **AND** the reset action SHALL clear local verification context before a new scan

## MODIFIED Requirements

### Requirement: Shop can scan citizen e-promesa QR code

The shop panel SHALL provide camera-based QR scanning as the primary entry to verification and sale flow, and SHALL keep scanned verification context available for subsequent sale steps in the same task flow.

#### Scenario: Successful scan triggers verification

- **WHEN** the shop user scans a valid citizen QR code on the verification step
- **THEN** the system SHALL parse the decoded text as a `qrToken`
- **AND** the system SHALL call `POST /shop/verify-permit` with `{ qrToken }`
- **AND** the system SHALL display the verification result without requiring manual token entry

#### Scenario: Successful scan on sale step

- **WHEN** the shop user scans a valid citizen QR code in the sale flow
- **THEN** the system SHALL store the verified `qrToken` in local UI context for that flow
- **AND** the system SHALL automatically verify the promise before enabling firearm registration fields

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
