## ADDED Requirements

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

### Requirement: Citizen SHALL see clear exam status per permit
System SHALL calculate and present a deterministic status for each exam entry per permit based on expiry date and available alert signals.

#### Scenario: Status is active when exam date is valid
- **WHEN** exam expiry date is after current date and no matching expired condition exists
- **THEN** system SHALL mark the exam entry as active/current

#### Scenario: Status is expiring or expired
- **WHEN** exam expiry date is within warning horizon or in the past
- **THEN** system SHALL mark the exam entry as expiring or expired respectively
- **AND** system SHALL surface due date in a user-readable date format

#### Scenario: Missing exam date
- **WHEN** permit exam expiry date is missing
- **THEN** system SHALL mark status as missing data
- **AND** system SHALL display guidance that exam confirmation requires WPA verification

### Requirement: Citizen medical view SHALL remain backend-compatible
System SHALL deliver the new medical view behavior without introducing new backend endpoints or breaking existing API contracts.

#### Scenario: Use existing citizen endpoints only
- **WHEN** medical view data is loaded
- **THEN** system SHALL use existing citizen endpoints for permits and medical alerts
- **AND** system SHALL NOT require any backend schema or contract change for this capability
