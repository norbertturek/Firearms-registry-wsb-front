## Purpose

Define the unified verification and sale flow in the shop panel so verification and firearm registration are completed in one ordered task.

## Requirements

### Requirement: Shop SHALL use unified verification-and-sale flow

The shop panel SHALL provide a single task flow in `/shop/sale` where verification controls and firearm registration are executed in one ordered process.

#### Scenario: Verification controls live only in sale flow

- **WHEN** a shop user starts a new sale process
- **THEN** the UI SHALL present verification methods in sale step 1
- **AND** the user SHALL NOT need to switch to a separate verification page to continue the same transaction

### Requirement: Firearm section SHALL be non-interactive before positive verification

Before a successful verification result (`isValid: true`), firearm section fields MUST be non-editable and guarded against accidental interaction.

#### Scenario: Pre-verification firearm controls are blocked

- **WHEN** verification has not succeeded yet
- **THEN** firearm input controls SHALL be disabled
- **AND** firearm section interaction SHALL show prerequisite guidance to verify promise first

#### Scenario: Firearm controls unlock after successful verification

- **WHEN** verification returns `isValid: true`
- **THEN** firearm input controls SHALL become enabled
- **AND** user SHALL be able to submit sale registration normally
