## Why

Officer (WPA) registry flows use inconsistent frontend routes (`/officer` vs `/wpa/...`), legacy citizen-detail layout after search, unreadable firearm result tiles, and a dashboard tab label that overflows on mobile. Urzędnik powinien pracować w jednym spójnym kontekście `/officer/*` z UI jak na pulpicie i przy rozpatrywaniu wniosków.

## What Changes

- Unify officer **frontend** routes: `/wpa/search`, `/wpa/citizens/:id`, `/wpa/attachments/...` → `/officer/search`, `/officer/citizens/:id`, `/officer/attachments/...` with legacy redirects.
- Shorten officer dashboard medical tab label to **Alerty** (full **Alerty medyczne** in section header + `aria-label`).
- Refactor **Wyszukiwarka** (search): aggregate citizen result badges; expandable firearm tiles (reuse `CitizenFirearmCard` pattern); tap citizen → `/officer/citizens/:id` with count consistency vs detail.
- Refactor **Szczegóły obywatela** (`CitizenDetailsWPA`): mobile-first collapsible sections (`ReviewCollapsibleCard`), firearms list for citizen, permit expand with **Zaktualizuj badania** (keep `PATCH /wpa/permits/{id}/medical-exams`), no navigation to citizen `/permits/:id`.
- Fix mock permit stubs so update-medical-exams works for all WPA citizens in demo data.

## Capabilities

### New Capabilities

- `officer-frontend-routes`: Officer browser routes under `/officer/*` with redirects from `/wpa/*`.
- `officer-registry-ui`: Search results, citizen detail, and dashboard tab UX for officer registry work.

### Modified Capabilities

- (none — backend API paths remain `/wpa/...`)

## Impact

- `routes.tsx`, `Layout.tsx`, `LoginPage`, `OfficerDashboard`, `WPASearchPage`, `CitizenDetailsWPA`, `WpaAttachmentViewPage`, `PermitApplicationAttachmentsCard`, `WeaponRegistry`, `DecisionPage` navigations.
- Optional: `AppTabTrigger` aria-label support.
- Mocks: `wpa.ts`, `db.ts` (real permit IDs for WPA citizens).
- **Out of scope:** moving `/applications` and `/decision/:id` under `/officer` (shared with citizen); renaming `components/wpa/` or API paths.

## Non-Goals

- Backend API prefix changes.
- New officer actions on firearms (search tiles are expand-only, not navigable).
- Full officer applications/decision route restructure in this change.
