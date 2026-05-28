## MODIFIED Requirements

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
