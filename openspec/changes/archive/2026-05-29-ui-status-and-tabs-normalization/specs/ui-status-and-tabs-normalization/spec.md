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

### Requirement: List-style tab triggers SHALL use AppTabTrigger with in-text counts
Tab triggers on list/review pages MUST use the shared `AppTabTrigger` component. Segment counts SHALL be rendered inside the label text (e.g. `Pozwolenia (12)`) and MUST NOT use separate Badge components on the trigger.

#### Scenario: Tab with non-zero count
- **WHEN** a tab segment has a positive count
- **THEN** the trigger label SHALL include the count in parentheses
- **AND** counts above 99 SHALL display as `99+`

#### Scenario: Tab with zero count
- **WHEN** a tab segment count is zero or unset
- **THEN** the trigger SHALL show the base label without parentheses

### Requirement: List-style tab triggers SHALL include icons
Each tab trigger on migrated list/review pages MUST include a Lucide icon consistent with the segment semantics (e.g. Shield for permits, Inbox for incoming transfers).

#### Scenario: Migrated tabbed list page
- **WHEN** a user views tabs on `TransfersList`, `MedicalAlertsView`, `ApplicationsList`, `OfficerDashboard`, or `WPASearchPage`
- **THEN** each tab trigger SHALL display an icon alongside the label

### Requirement: Citizen applications list SHALL expose tab-dependent create action
On `ApplicationsList`, citizens MUST see a primary action to create a new record that depends on the active tab. Officers viewing the same route MUST NOT see this action.

#### Scenario: Permits tab active (citizen)
- **WHEN** a citizen has the permits tab selected
- **THEN** the page SHALL offer navigation to create a new permit application

#### Scenario: Promises tab active (citizen)
- **WHEN** a citizen has the promises tab selected and is eligible for a promise application
- **THEN** the page SHALL offer navigation to create a new promise application
- **AND WHEN** the citizen is not eligible
- **THEN** the create action SHALL be disabled

### Requirement: Header branding SHALL navigate to role home
The application header logo and “e-Broń” title MUST act as a single control that navigates to the dashboard for the current user role.

#### Scenario: Citizen clicks header branding
- **WHEN** a citizen clicks the logo or “e-Broń” in the header
- **THEN** the app SHALL navigate to `/citizen`

#### Scenario: Officer clicks header branding
- **WHEN** an officer clicks the logo or “e-Broń” in the header
- **THEN** the app SHALL navigate to `/officer`
