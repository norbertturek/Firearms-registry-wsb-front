## ADDED Requirements

### Requirement: Officer registry browser routes SHALL live under `/officer`

System SHALL register officer registry and attachment pages under the `/officer` path prefix in the frontend router.

#### Scenario: Search page route

- **WHEN** officer navigates to the registry search screen
- **THEN** the browser URL SHALL be `/officer/search`
- **AND** the page SHALL render the same registry search UI previously shown at `/wpa/search`

#### Scenario: Citizen detail route

- **WHEN** officer opens a citizen from registry search results
- **THEN** the browser URL SHALL be `/officer/citizens/{id}`
- **AND** query parameters such as `permitId` SHALL continue to work for deep-linking exam update

#### Scenario: Attachment view route

- **WHEN** officer opens a permit application attachment in a new tab
- **THEN** the attachment view URL SHALL use `/officer/attachments/{applicationId}/{attachmentId}`

### Requirement: Legacy `/wpa/*` frontend paths SHALL redirect

System SHALL preserve backward compatibility for bookmarked `/wpa/*` URLs.

#### Scenario: Legacy search redirect

- **WHEN** user opens `/wpa/search` (with optional query string)
- **THEN** system SHALL redirect to `/officer/search` preserving query parameters

#### Scenario: Legacy citizen redirect

- **WHEN** user opens `/wpa/citizens/{id}`
- **THEN** system SHALL redirect to `/officer/citizens/{id}` preserving query parameters

### Requirement: Officer navigation SHALL use unified routes

System SHALL not link officers to `/wpa/*` paths from in-app navigation.

#### Scenario: Bottom nav Rejestr

- **WHEN** officer uses the mobile bottom navigation Rejestr item
- **THEN** system SHALL navigate to `/officer/search`

#### Scenario: Dashboard quick tool to registry

- **WHEN** officer taps the registry quick tool on the officer dashboard
- **THEN** system SHALL navigate to `/officer/search`

### Requirement: Backend API paths SHALL remain unchanged

This route change SHALL affect frontend routing only.

#### Scenario: wpaService calls

- **WHEN** officer registry pages fetch data
- **THEN** HTTP requests SHALL still use `/wpa/...` API endpoints as defined in `wpaService`
