## ADDED Requirements

### Requirement: Officer dashboard medical tab SHALL use a short mobile-safe label

System SHALL use a concise tab label on the three-column officer dashboard tab bar while keeping the full section title in content.

#### Scenario: Tab bar label on mobile

- **WHEN** officer views the officer dashboard on a narrow viewport with three tabs visible
- **THEN** the medical alerts tab trigger SHALL display the label **Alerty** (with optional count)
- **AND** the tab SHALL remain readable without truncating adjacent tabs

#### Scenario: Section header full name

- **WHEN** officer selects the medical alerts tab
- **THEN** the section header below the tabs SHALL display **Alerty medyczne**
- **AND** the tab trigger SHALL expose **Alerty medyczne** via accessible name (e.g. `aria-label`) if the visible label is shortened

### Requirement: Registry citizen search results SHALL use aggregated summary badges

System SHALL avoid listing every permit type as a separate badge on citizen search result tiles.

#### Scenario: Citizen result badges

- **WHEN** officer views citizen results in registry search
- **THEN** each tile SHALL show the citizen name and PESEL
- **AND** badges SHALL include firearm count (e.g. `N egz.`), medical alert count when > 0, and permit count summary (not one badge per permit type)

### Requirement: Registry citizen search SHALL navigate to officer citizen detail

System SHALL open the officer citizen detail page when an officer selects a citizen from registry search results.

#### Scenario: Citizen tile navigation

- **WHEN** officer taps a citizen result tile on the registry search **Obywatele** tab
- **THEN** system SHALL navigate to `/officer/citizens/{id}` for that citizen
- **AND** system SHALL render `CitizenDetailsWPA` in the officer layout (not the citizen-facing profile or permit routes)

#### Scenario: Officer context preserved after navigation

- **WHEN** officer arrives on citizen detail from registry search
- **THEN** the page SHALL remain within officer/WPA context (officer navigation chrome, no redirect to `/permits/{id}` or citizen dashboard routes)
- **AND** officer SHALL be able to return to registry search via back navigation or the **Rejestr** nav item

### Requirement: Registry firearm search results SHALL use expandable tiles

System SHALL present firearm search results in a collapsed-first, expandable tile pattern consistent with the citizen weapon registry.

#### Scenario: Collapsed firearm tile

- **WHEN** officer views firearm search results
- **THEN** each tile SHALL show weapon brand and model, caliber and serial number, registration date, and status badges in the collapsed state
- **AND** the tile SHALL not require navigation to another page to read primary identification fields

#### Scenario: Expanded firearm tile

- **WHEN** officer expands a firearm search result tile
- **THEN** system SHALL show owner name, owner PESEL, permit number, and permit type
- **AND** the tile SHALL remain non-navigating (expand/collapse only)

### Requirement: Officer citizen detail SHALL use collapsible sections aligned with WPA review UI

System SHALL present `/officer/citizens/{id}` using the same collapsible section pattern as application review screens, optimized mobile first.

#### Scenario: Page structure

- **WHEN** officer opens citizen detail from registry
- **THEN** system SHALL present sections for citizen data, permits, firearms, and medical alerts (when applicable) using collapsible section cards
- **AND** system SHALL NOT use the legacy multi-column admin CardHeader grid as the primary layout

#### Scenario: No navigation to citizen permit detail route

- **WHEN** officer interacts with a permit on the citizen detail page
- **THEN** system SHALL NOT navigate to `/permits/{id}` (citizen permit detail)
- **AND** permit details SHALL be available via expand-in-place or inline fields on the officer citizen detail page

### Requirement: Officer citizen detail SHALL list citizen firearms

System SHALL show the citizen's registered firearms on the officer citizen detail page.

#### Scenario: Firearms section content

- **WHEN** officer expands the firearms section on citizen detail
- **THEN** system SHALL list firearms registered to that citizen using the same expandable tile pattern as registry firearm search
- **AND** the count shown in citizen summary SHALL match the listed firearms when data is available

### Requirement: Search summary counts SHALL match officer citizen detail

Summary counts shown on a citizen search result tile SHALL be consistent with the data presented on the officer citizen detail page for the same citizen.

#### Scenario: Firearm count consistency

- **WHEN** officer views a citizen search result showing `N egz.` and then opens that citizen's detail page
- **THEN** the firearms section title or summary on citizen detail SHALL reflect the same count `N`
- **AND** the firearms list SHALL contain exactly `N` registered firearms when backend data is complete

#### Scenario: Permit count consistency

- **WHEN** officer views a citizen search result showing a permit count summary (e.g. `M pozwoleń`)
- **THEN** the permits section on citizen detail SHALL list the same number of permits `M`

#### Scenario: Medical alert count consistency

- **WHEN** officer views a citizen search result with a medical alert badge count greater than zero
- **THEN** the citizen detail page SHALL show a medical alerts section or summary with the same alert count
- **AND** alert details SHALL correspond to the permits shown on that citizen's detail page

### Requirement: Update medical exams flow SHALL remain on officer citizen detail

System SHALL preserve the officer workflow for updating permit medical exam dates from the citizen detail page and from dashboard deep links.

#### Scenario: Dashboard deep link

- **WHEN** officer follows **Aktualizuj badania** from a medical alert on the dashboard
- **THEN** system SHALL open `/officer/citizens/{id}?permitId={permitId}` and focus the exam update form for that permit

#### Scenario: Save medical exams

- **WHEN** officer saves updated medical and psychological exam dates for a permit
- **THEN** system SHALL call `PATCH /wpa/permits/{id}/medical-exams`
- **AND** system SHALL show user-facing success or error feedback without exposing raw API errors

#### Scenario: Edit control does not trigger permit navigation

- **WHEN** officer taps **Zaktualizuj badania** or submits the exam form
- **THEN** the action SHALL NOT trigger navigation away from the officer citizen detail page

### Requirement: Demo mock data SHALL support medical exam updates for all WPA citizens

System SHALL ensure MSW demo data allows medical exam PATCH for permits shown on any WPA citizen detail reachable from search.

#### Scenario: Non-demo-primary citizens

- **WHEN** officer opens citizen detail for a citizen other than the primary demo profile and updates medical exams
- **THEN** the mock SHALL resolve the permit by real ID in `db.permits` and return success (not 404 stub)
