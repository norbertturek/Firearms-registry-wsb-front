## Why

Panel urzędnika WPA (`OfficerDashboard`) i lista wniosków dla roli officer w `ApplicationsList` nadal używają starego wzorca **Card + CardHeader + CardDescription** wokół list wyników. Obywatel po refaktorze ma sekcje z nagłówkiem poza kartą i kafelkami listowymi (`CitizenApplicationCard`, `CitizenNavIconTile`).

Wiersze WPA (`ApplicationListTile`) są już zbliżone do citizen, ale **podwójna rama** (zewnętrzny CardHeader + wewnętrzny tile) psuje spójność i daje wrażenie nieaktualnego UI — zgodnie z obserwacją użytkownika na elemencie „Wnioski o pozwolenie na broń”.

## What Changes

- Refaktor `OfficerDashboard`: sekcje tabów (pozwolenia, promesy, alerty) bez opakowania `CardHeader`; nagłówek sekcji jak u citizen (`h3` + opis w `px-1`).
- Wyrównanie kafelków „Narzędzia WPA” do wzorca citizen (`CITIZEN_NAV_ICON_TONE`, `rounded-2xl`, ten sam układ co usługi na dashboardzie obywatela).
- Ten sam pattern listy sekcji w widoku officer w `ApplicationsList` (branch `isOfficer`).
- Opcjonalny współdzielony komponent nagłówka sekcji WPA (DRY) — bez zmiany logiki API ani flow decyzji.
- Zachowanie `ApplicationListTile`, badge statusów (`statusUi`) i `AppTabsList` — tylko shell sekcji.

## Capabilities

### New Capabilities

- `wpa-dashboard-citizen-ui`: Pulpit i listy WPA officer używają tego samego języka wizualnego sekcji i kafelków co citizen (bez dokumentowego CardHeader wokół list).

### Modified Capabilities

- Brak.

## Impact

- Affected frontend: `OfficerDashboard.tsx`, `ApplicationsList.tsx`, ewentualnie nowy komponent w `src/app/components/wpa/`.
- Brak zmian backendu / kontraktów API.
- UX: spójność między rolą citizen i WPA w obrębie „listy spraw”; mniej wizualnego szumu na pulpicie urzędnika.
- Powiązane: `ApplicationDetails`, `DecisionPage` — poza scope (już `ReviewCollapsibleCard`).

## Non-Goals

- Redesign szczegółów wniosku WPA ani ekranu decyzji.
- Zmiana treści biznesowej list (filtry, sortowanie, akcje Rozpatrz).
- Unified design system dla całej roli shop/WPA poza wskazanymi ekranami.
