## 1. Officer frontend routes

- [x] 1.1 Add `/officer/search`, `/officer/citizens/:id`, `/officer/attachments/...` to `routes.tsx`
- [x] 1.2 Add `RedirectTo` from legacy `/wpa/search`, `/wpa/citizens/:id`, `/wpa/attachments/...`
- [x] 1.3 Update `Layout` bottom nav, active path checks, officer home links
- [x] 1.4 Replace all in-app `navigate('/wpa/...')` and attachment `viewUrl` with `/officer/...`
- [x] 1.5 Smoke-test redirects preserve query strings (`tab=firearms`, `permitId`)

## 2. Officer dashboard tab label

- [x] 2.1 Change medical tab label to **Alerty** on `OfficerDashboard`
- [x] 2.2 Add `aria-label="Alerty medyczne"` on tab trigger (extend `AppTabTrigger` if needed)
- [x] 2.3 Confirm section header still reads **Alerty medyczne**

## 3. Registry search UI

- [x] 3.1 Citizen results: replace per-permit-type badges with permit count summary + existing egz./alert badges
- [x] 3.2 Firearm results: introduce expandable tile (reuse or adapt `CitizenFirearmCard`)
- [x] 3.3 Collapsed: brand/model, caliber·serial, date + status badges; expanded: owner, PESEL, permit info
- [x] 3.4 Citizen tile tap navigates to `/officer/citizens/:id` (officer layout, not citizen profile)

## 4. Officer citizen detail refactor

- [x] 4.1 Replace legacy Card/grid layout with vertical `ReviewCollapsibleCard` sections (mobile first)
- [x] 4.2 Section **Dane obywatela**: PESEL, dokument, adres, statystyki
- [x] 4.3 Section **Pozwolenia**: expandable permit rows; remove `navigate('/permits/...')`
- [x] 4.4 Preserve **Zaktualizuj badania** + `?permitId=` deep link; fix click propagation
- [x] 4.5 Section **Broń**: load and list citizen firearms (extend DTO or fetch by PESEL)
- [x] 4.6 Section **Alerty medyczne** when `activeAlerts > 0`; link back to dashboard/officer context

## 5. Mock / data

- [x] 5.1 Seed or map real `db.permits` entries for `citizen-002`, `citizen-003` (fix stub 404 on PATCH)
- [x] 5.2 Include citizen firearms in citizen detail response or document PESEL filter for firearms fetch
- [x] 5.3 Verify `syncMedicalAlertsFromPermits` after exam update in demo

## 6. Verification

- [x] 6.1 `npm run build`
- [x] 6.2 Manual: officer dashboard → 3 tabs readable on mobile width
- [x] 6.3 Manual: search **Obywatele** → tap citizen → `/officer/citizens/:id` in officer context → back/Rejestr returns to search
- [x] 6.4 Manual: search tile counts (egz., pozwolenia, alerty) match citizen detail sections
- [x] 6.5 Manual: citizen detail → expand permit → save badania
- [x] 6.6 Manual: search firearm → expand tile; legacy `/wpa/search` redirect works
