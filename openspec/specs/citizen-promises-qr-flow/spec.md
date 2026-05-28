## Purpose

Define citizen-facing QR behavior for promise flows so QR actions appear only in valid contexts, open only with issued-token data, and stay consistent across list/detail views without backend contract changes.

## Requirements

### Requirement: Citizen SHALL get QR action only in promise context

The system SHALL expose "Pokaż kod QR" action only for citizen promise flows and SHALL NOT render it in unrelated permit sections.

#### Scenario: QR action placement in My Cases

- **WHEN** citizen opens `Moje sprawy` and switches between tabs
- **THEN** QR action SHALL be available only in `Promesy` tab items
- **AND** QR action SHALL NOT appear in `Pozwolenia` tab items

### Requirement: Citizen SHALL open QR modal only for issued promise with token

The system SHALL open QR modal only when an issued promise with valid `qrToken` is available for the current citizen.

#### Scenario: Issued promise available

- **WHEN** citizen triggers QR action for an item that maps to an issued promise with `qrToken`
- **THEN** system SHALL open QR modal for that specific issued promise

#### Scenario: Approved application without issued promise token

- **WHEN** citizen triggers QR action context for an approved promise application that has no mapped issued promise with `qrToken`
- **THEN** system SHALL NOT open an empty modal
- **AND** system SHALL show a clear fallback message explaining that issued promise data is not yet available

### Requirement: Citizen QR behavior SHALL be consistent across views

The system SHALL apply the same QR availability and fallback logic in list and details views that reference citizen promise data.

#### Scenario: Consistent behavior in ApplicationsList and ApplicationDetails

- **WHEN** citizen accesses promise items from list and details views
- **THEN** QR action behavior SHALL follow the same mapping and token rules in both views
- **AND** user-facing messages for unavailable QR SHALL be semantically consistent

### Requirement: Promise QR flow SHALL remain backend-compatible

The system SHALL implement the QR flow fix without introducing new backend endpoints or changing existing API contracts.

#### Scenario: Existing endpoints only

- **WHEN** citizen promise screens load data for QR availability
- **THEN** system SHALL rely on existing citizen promise applications and issued promises endpoints
- **AND** system SHALL require no backend schema or contract changes for this behavior
