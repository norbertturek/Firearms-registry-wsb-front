## Purpose

Ensure citizens consistently see and use promise QR functionality across views, with resilient matching logic and readable, tablet-safe modal behavior.

## Requirements

### Requirement: Citizen SHALL see QR-ready state when issued promise token exists

The system SHALL expose QR modal action whenever an issued promise with usable `qrToken` can be matched to the selected promise application context.

#### Scenario: QR available despite non-identical descriptive fields

- **WHEN** an approved promise application has a corresponding issued promise with valid `qrToken`
- **THEN** system SHALL present QR-open action instead of fallback state

#### Scenario: QR not available

- **WHEN** no issued promise with usable `qrToken` can be matched
- **THEN** system SHALL present fallback message/state indicating QR is not yet available

### Requirement: Promise QR decisions SHALL be consistent across citizen views

The system SHALL apply the same QR availability decision rules in `Moje sprawy -> Promesy` and promise application details.

#### Scenario: Same decision in list and details

- **WHEN** citizen checks the same promise context in list and details views
- **THEN** both views SHALL return the same QR availability result and fallback behavior

### Requirement: Promise QR modal SHALL support tablet-safe scrolling

The modal SHALL keep header visible and allow scrolling in the content body without clipping data on tablet viewport sizes.

#### Scenario: Tablet viewport with long content

- **WHEN** citizen opens QR modal on tablet-size viewport
- **THEN** header SHALL remain visible while body content scrolls
- **AND** no modal section SHALL be clipped or unreachable

### Requirement: Promise QR modal content SHALL render with white background

The modal content area SHALL use white background for readability and visual consistency required by product expectations.

#### Scenario: Content rendering

- **WHEN** QR modal content is displayed
- **THEN** body content background SHALL appear white regardless of theme token defaults

### Requirement: Changes SHALL remain backend-compatible

The system SHALL implement this capability without introducing new API endpoints or backend schema changes.

#### Scenario: Existing API contracts only

- **WHEN** QR availability is computed and modal is rendered
- **THEN** system SHALL rely only on existing citizen endpoints for applications and issued promises
