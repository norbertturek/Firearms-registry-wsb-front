## ADDED Requirements

### Requirement: WPA officer dashboard sections SHALL use citizen-style section headers

System SHALL present list sections on the WPA officer dashboard without wrapping the entire list in a CardHeader/CardTitle/CardDescription document shell.

#### Scenario: Permit applications tab section header

- **WHEN** officer views the permit applications tab on the WPA dashboard
- **THEN** system SHALL show a section title and optional description outside of any CardHeader component
- **AND** system SHALL render pending applications as a vertical list of application tiles below that header

#### Scenario: Promise applications and medical alerts tabs

- **WHEN** officer views the promise applications or medical alerts tab
- **THEN** system SHALL use the same section header pattern as the permit applications tab
- **AND** system SHALL NOT use CardHeader solely to label the whole list block

### Requirement: WPA dashboard quick tools SHALL match citizen nav tile styling

System SHALL render WPA dashboard shortcut tiles (e.g. search, all applications) with the same icon tile tone and geometry used on the citizen dashboard service grid.

#### Scenario: Icon tile tone

- **WHEN** officer views WPA quick tools on the dashboard
- **THEN** each tool icon SHALL use the citizen nav icon tile tone (e.g. blue-50 background, primary icon color, rounded-2xl)
- **AND** system SHALL NOT use the legacy primary/10 rounded-lg-only icon treatment for those shortcuts

### Requirement: WPA officer applications list SHALL align with dashboard list sections

When the applications list page is shown to an officer, permit and promise list sections SHALL follow the same section header and list layout pattern as the WPA officer dashboard.

#### Scenario: Officer applications list permit section

- **WHEN** officer opens the applications list and views permit applications
- **THEN** system SHALL NOT wrap the full permit results list in CardHeader
- **AND** system SHALL present results using the same application list tile component as the dashboard

### Requirement: WPA list section behavior SHALL remain unchanged

UI alignment SHALL NOT alter application fetching, filtering, navigation targets, or decision actions.

#### Scenario: Actions preserved

- **WHEN** officer interacts with Rozpatrz, Szczegóły, or alert actions after the UI update
- **THEN** system SHALL preserve existing navigation paths and business behavior
