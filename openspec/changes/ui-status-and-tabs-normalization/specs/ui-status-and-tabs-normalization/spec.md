## ADDED Requirements

### Requirement: UI SHALL use a centralized status label and badge mapping
Equivalent domain statuses rendered in list and detail views MUST use a shared UI mapping so wording and badge semantics stay consistent across pages.

#### Scenario: Same status key renders same label and style
- **WHEN** a page renders `Approved` status in list and detail contexts
- **THEN** both views SHALL display the same canonical label
- **AND** both views SHALL use the same badge visual semantics

#### Scenario: New status is introduced
- **WHEN** a new status key is added to a supported screen
- **THEN** the page SHALL consume status UI metadata from the shared mapping
- **AND** the page SHALL NOT introduce local ad-hoc label mappings for that key

### Requirement: UI SHALL use a shared tabs shell for list/review contexts
Pages that present parallel list/review segments through tabs MUST use a shared tabs shell preset to keep visual hierarchy and spacing consistent.

#### Scenario: Multi-segment list page uses tabs
- **WHEN** a page defines tabs for equivalent record segments (e.g., active/archive/attention)
- **THEN** tabs list container SHALL use the shared app-level tabs shell preset
- **AND** triggers SHALL preserve touch targets and active/inactive state hierarchy

#### Scenario: Existing tab page migration
- **WHEN** a previously custom tab shell is migrated
- **THEN** behavior SHALL remain unchanged functionally
- **AND** visual structure SHALL align with other migrated tabbed pages
