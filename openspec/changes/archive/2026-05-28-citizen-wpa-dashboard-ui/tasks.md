## 1. Shared section components

- [x] 1.1 Add `WpaListSectionHeader` (title, description, optional action) matching citizen section typography (`px-1`, `text-lg font-bold`, muted subtitle)
- [x] 1.2 Add optional `WpaQuickToolCard` or inline pattern using `CitizenNavIconTile` + `CITIZEN_NAV_ICON_TONE` for dashboard shortcuts

## 2. OfficerDashboard

- [x] 2.1 Replace permit tab Card+CardHeader wrapper with `WpaListSectionHeader` + `space-y-3` list of `ApplicationListTile`
- [x] 2.2 Same refactor for promise tab
- [x] 2.3 Replace alerts tab CardHeader with section header; keep alert row actions; optional icon tile on alert rows if low effort
- [x] 2.4 Update „Narzędzia WPA” grid to citizen nav tile styling (`gap-0` on cards)
- [x] 2.5 Verify empty states and „Zobacz wszystkie wnioski” CTA spacing

## 3. ApplicationsList (officer)

- [x] 3.1 Refactor officer permit section: remove CardHeader shell, use `WpaListSectionHeader` + tile list
- [x] 3.2 Refactor officer promise section the same way
- [x] 3.3 Confirm citizen branch unchanged

## 4. Verification

- [x] 4.1 Visual check: OfficerDashboard tabs — no CardHeader around full lists; tiles match citizen density
- [x] 4.2 Visual check: ApplicationsList officer vs citizen — distinct but consistent section headers
- [x] 4.3 Regression: tab badges, Nowy highlight, Rozpatrz/Szczegóły navigation, alert suspend flow
- [x] 4.4 Build passes; no API changes
