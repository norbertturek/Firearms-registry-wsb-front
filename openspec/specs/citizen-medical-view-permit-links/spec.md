## Requirements

### Requirement: Citizen SHALL see complete exam-to-permit mapping

System SHALL present in the citizen medical view all currently known medical and psychological exam validity records for each active permit, including the explicit permit association.

#### Scenario: Build full list from permits

- **WHEN** citizen opens the medical view
- **THEN** system SHALL fetch citizen permits and present exam entries for each active permit
- **AND** each permit SHALL expose two entries: medical exam and psychological exam

#### Scenario: Show permit context for each exam entry

- **WHEN** an exam entry is rendered
- **THEN** system SHALL display permit number and permit type for the associated permit
- **AND** system SHALL provide navigation to permit details using the associated permit identifier

### Requirement: Citizen medical view SHALL use two attention-focused tabs

System SHALL present the citizen medical view with exactly two filter tabs: a full list and an attention list. System SHALL NOT expose a separate tab whose primary label implies missing permits, missing application attachments, or incomplete application requirements.

#### Scenario: Tab labels and count

- **WHEN** citizen views the medical screen with at least one active permit
- **THEN** system SHALL show tabs labeled for a full list and for items requiring attention
- **AND** system SHALL show exactly two tabs (not three)

#### Scenario: Attention tab aggregate filter

- **WHEN** citizen selects the attention tab
- **THEN** system SHALL include each active permit whose medical or psychological exam has a non-current status (`expiring`, `expired`, or missing registry date)
- **AND** system SHALL use the same non-current attention rule as the citizen dashboard medical entry badge

### Requirement: Attention tab SHALL show full permit exam context

When a permit is included in the attention tab, system SHALL render the complete permit exam card with both exam rows, not a subset of only problematic rows.

#### Scenario: Permit with one problematic exam

- **WHEN** a permit has one exam marked expiring, expired, or missing data and the other exam is current
- **THEN** the attention tab SHALL still display both exam rows for that permit
- **AND** each row SHALL retain its own status badge and action guidance

#### Scenario: Tab badge counts permits not exam rows

- **WHEN** tab badges display counts
- **THEN** the attention tab badge SHALL count permits (permit groups) requiring attention
- **AND** the full-list tab badge SHALL count permits shown in the full list

### Requirement: Citizen SHALL see clear exam status per permit

System SHALL calculate and present a deterministic status for each exam entry per permit based on expiry date and available alert signals. Status `missing` SHALL mean missing validity date in the registry for an active permit, not missing medical attachments on a permit application.

#### Scenario: Status is active when exam date is valid

- **WHEN** exam expiry date is after current date and no matching expired condition exists
- **THEN** system SHALL mark the exam entry as active/current

#### Scenario: Status is expiring or expired

- **WHEN** exam expiry date is within warning horizon or in the past
- **THEN** system SHALL mark the exam entry as expiring or expired respectively
- **AND** system SHALL surface due date in a user-readable date format

#### Scenario: Missing exam date in registry

- **WHEN** permit exam expiry date is missing on an active permit
- **THEN** system SHALL mark status as missing data with label semantics indicating registry data gap (e.g. "Brak danych")
- **AND** system SHALL display guidance that exam confirmation requires WPA verification
- **AND** system SHALL NOT present this state as equivalent to failing to attach certificates when submitting a new permit application

### Requirement: Citizen medical view SHALL remain backend-compatible

System SHALL deliver the new medical view behavior without introducing new backend endpoints or breaking existing API contracts.

#### Scenario: Use existing citizen endpoints only

- **WHEN** medical view data is loaded
- **THEN** system SHALL use existing citizen endpoints for permits and medical alerts
- **AND** system SHALL NOT require any backend schema or contract change for this capability
