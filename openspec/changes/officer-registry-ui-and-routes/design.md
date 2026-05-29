## Context

Po normalizacji copy i dashboardu WPA (`wpa-dashboard-citizen-ui`) wyszukiwarka używa `ApplicationListTile`, ale:

- **Routing:** pulpit `/officer`, rejestr `/wpa/search` — dwie przestrzenie URL dla tej samej roli.
- **Search → detail:** klik obywatela prowadzi do `CitizenDetailsWPA` ze starym layoutem (`Card` + `CardHeader` + grid 2 kolumn), klik pozwolenia do `/permits/:id` (UI obywatela).
- **Broń w search:** 4 linie tekstu + badge’e w jednym kafelku bez expand — nieczytelne na ~332px.
- **Dashboard:** 3 taby w `grid-cols-3`; label „Alerty medyczne” nie mieści się obok ikony i licznika.

Istniejące wzorce do reuse:

- `ReviewCollapsibleCard` — sekcje na `DecisionPage`, `PermitDetails`
- `CitizenFirearmCard` — expand/collapse w `WeaponRegistry`
- `WpaListSectionHeader` — nagłówki sekcji poza kartą
- `PATCH /wpa/permits/{id}/medical-exams` — aktualizacja badań na istniejącym pozwoleniu (osobny flow od `DecisionPage`)

Ograniczenie: frontend + MSW mocks; kontrakt API `/wpa/*` bez zmian.

## Goals / Non-Goals

**Goals:**

- Wszystkie officer **browser** URL pod `/officer/...` (faza 1: dawne `/wpa/*`).
- Search i citizen detail: ten sam język UI co decision/dashboard (mobile first).
- Zachować flow **Zaktualizuj badania** z dashboardu (`?permitId=`) i z karty pozwolenia.
- Sekcja **Broń** na profilu obywatela WPA z listą expand kafli.
- Tab dashboard: **Alerty** + pełna nazwa w treści sekcji.

**Non-Goals:**

- `/applications`, `/decision/:id` pod `/officer` (współdzielone z obywatelskim layoutem).
- Osobna strona `/officer/firearms/:id`.
- Zmiana nazw folderów `components/wpa/` lub `wpaService`.

## Decisions

### 1. Frontend route map (faza 1)

| Legacy | New |
|--------|-----|
| `/wpa/search` | `/officer/search` |
| `/wpa/citizens/:id` | `/officer/citizens/:id` |
| `/wpa/attachments/:applicationId/:attachmentId` | `/officer/attachments/:applicationId/:attachmentId` |

Implementacja:

- Zarejestrować nowe trasy w `routes.tsx`.
- Dodać `RedirectTo` z legacy `/wpa/*` (jak istniejące legacy shop routes).
- Zaktualizować: `Layout` (bottom nav „Rejestr”), `OfficerDashboard`, `WPASearchPage`, `CitizenDetailsWPA`, `WeaponRegistry`, `LoginPage`, attachment `viewUrl`, wszystkie `navigate('/wpa/...')`.

API pozostaje `/wpa/...` w `wpaService.ts`.

### 2. Officer dashboard tab — „Alerty”

- `AppTabTrigger label="Alerty"` na pulpicie.
- `WpaListSectionHeader title="Alerty medyczne"` bez zmian pod tabem.
- Opcjonalnie rozszerzyć `AppTabTrigger` o `ariaLabel` dla czytników ekranu.

Alternatywa odrzucona: skrót „Med.” — zbyt niejasny.

### 3. Search — kafel obywatela

- Tytuł: imię + nazwisko.
- Linia: PESEL (mono).
- Badge’e: `{N} egz.`, alert medyczny (jeśli > 0), **`{M} pozwolenia`** (lub „1 pozwolenie”) zamiast N× typ pozwolenia.
- Klik kafelka → `/officer/citizens/:id` (`CitizenDetailsWPA`, layout urzędnika); liczniki na kafelku muszą zgadzać się z sekcjami na profilu (broń, pozwolenia, alerty).

### 4. Search — kafel broni (expand only)

Reuse wzorca `CitizenFirearmCard`:

**Zwinięte:** marka + model, kaliber · serial (mono), `DateStatusMeta` (data rejestracji + status + kat.).

**Rozwinięte:** właściciel, PESEL, numer pozwolenia, typ pozwolenia.

Bez `onClick` nawigacji — tylko expand. Komponent: wariant WPA lub reuse z dodatkowymi polami owner.

### 5. Citizen detail — struktura sekcji

Zastąpić `lg:grid-cols-3` + nested `CardHeader` układem pionowym:

```
WpaListSectionHeader (imię, PESEL — lub kompaktowy nagłówek strony)
ReviewCollapsibleCard: Dane obywatela
ReviewCollapsibleCard: Pozwolenia (N)
  └─ per permit: expand (StatusBadge, daty, miejsca)
     └─ Zaktualizuj badania (form) — stopPropagation, bez navigate
ReviewCollapsibleCard: Broń (N)
  └─ CitizenFirearmCard-style list (fetch)
ReviewCollapsibleCard: Alerty medyczne (jeśli activeAlerts > 0)
```

**Broń — dane:**

- Preferencja: rozszerzyć `GET /wpa/citizens/:id` o `firearms: WpaFirearmSearchResult[]` (lub węższy DTO).
- Alternatywa: równoległy fetch `GET /wpa/firearms?pesel=` po załadowaniu profilu.
- MSW: mapować `db.firearms` po `citizenId` / PESEL.

**Pozwolenia:**

- Usunąć `navigate('/permits/:id')` z całej karty.
- Zachować `wpaService.updateMedicalExams` + `?permitId=` deep link z dashboardu.

### 6. Mock — stub permit IDs

`buildWpaCitizenDetail` tworzy `permit-stub-*` poza `db.permits` → PATCH 404.

Fix: seed real `permits` rows for `citizen-002`, `citizen-003` (or map stub numbers to existing permits) so demo **Zapisz badania** works for all search results.

## Risks / Trade-offs

| Ryzyko | Mitigacja |
|--------|-----------|
| Złamane bookmarki `/wpa/*` | Permanent redirects |
| Duży diff w `CitizenDetailsWPA` | Sekcje incremental; reuse istniejących komponentów |
| Firearms not in citizen DTO | MSW + optional client fetch; document in tasks |
| Edit exams inside expandable permit | Oddzielić trigger expand od przycisku edycji (`stopPropagation`) |

## Migration

- Wszystkie wewnętrzne linki na nowe `/officer/*`.
- Legacy `/wpa/*` → redirect (bez usuwania od razu — jedna wersja na merge).
