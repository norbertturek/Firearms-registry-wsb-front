## ADDED Requirements

### Requirement: Shop can scan citizen e-promesa QR code

The shop panel SHALL provide a camera-based QR scanner on the promise verification and firearm sale registration screens. The scanner SHALL decode QR codes that contain the citizen's `qrToken` as issued by the citizen application and backend.

#### Scenario: Successful scan triggers verification

- **WHEN** the shop user scans a valid citizen QR code on the verification screen
- **THEN** the system SHALL parse the decoded text as a `qrToken`
- **AND** the system SHALL call `POST /shop/verify-permit` with `{ qrToken }`
- **AND** the system SHALL display the verification result without requiring manual token entry

#### Scenario: Successful scan on sale screen

- **WHEN** the shop user scans a valid citizen QR code on the sale registration screen
- **THEN** the system SHALL populate the QR token field
- **AND** the system SHALL automatically verify the promise before firearm data entry

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

The shop panel SHALL retain manual entry paths when scanning is unavailable or impractical.

#### Scenario: Manual QR token entry

- **WHEN** the shop user switches to the token tab and submits a QR token manually
- **THEN** the system SHALL verify the promise the same way as after a successful scan

#### Scenario: Manual promise number lookup

- **WHEN** the shop user enters a promise number manually
- **THEN** the system SHALL verify by `promiseNumber`
- **AND** the system SHALL NOT allow sale registration unless a `qrToken` was verified separately

### Requirement: Scan-once behavior per session

After a successful decode, the scanner SHALL pause further reads until the user explicitly requests a new scan.

#### Scenario: Rescan after successful read

- **WHEN** the user selects "Skanuj ponownie" (scan again)
- **THEN** the camera preview SHALL resume
- **AND** a new decode SHALL trigger verification again
