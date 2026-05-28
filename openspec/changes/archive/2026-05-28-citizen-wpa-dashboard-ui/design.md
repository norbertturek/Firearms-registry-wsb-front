## Context

Citizen UI po ostatnich iteracjach:
- sekcje formularzy i list: `rounded-2xl border-none shadow-sm gap-0`, nagłówek z `CitizenNavIconTile` + `CITIZEN_NAV_ICON_TONE`
- listy wniosków obywatela: `CitizenApplicationCard` w `space-y-3`, tytuł sekcji **poza** kartą (`h3` + link „Wszystkie”)
- statusy: `getApplicationStatusMeta` / `statusUi`

WPA officer dashboard:
- `ApplicationListTile` już używa `CitizenNavIconTile`, `DateStatusMeta`, chevron — **OK**
- Problematyczne: `Card` > `CardHeader` (`CardTitle` + `CardDescription`) > `CardContent` > lista tile’ów
- „Narzędzia WPA”: `bg-primary/10 rounded-lg` zamiast `CITIZEN_NAV_ICON_TONE rounded-2xl`
- Tab alerty: custom `bg-muted/30` divy — akceptowalne, ale nagłówek sekcji nadal w CardHeader

Ograniczenie: tylko frontend, bez zmian API.

## Goals / Non-Goals

**Goals:**

- Usunąć wzorzec „dokumentu urzędowego” (CardHeader) z list na pulpicie WPA.
- Sekcja = nagłówek tekstowy + lista `ApplicationListTile` (lub alert rows) + CTA „Zobacz wszystkie”.
- Narzędzia skrótów WPA wizualnie jak kafelki „Usługi” na `CitizenDashboard`.
- Spójność `OfficerDashboard` i officer branch w `ApplicationsList`.

**Non-Goals:**

- Nowy komponent listy z inną semantyką danych.
- Zmiana tabów, liczników powiadomień, logiki `isNewForVerification`.
- Shop panel.

## Decisions

1. **Sekcja listy bez zewnętrznego Card**
   - Struktura:
     ```
     <div className="space-y-3">
       <WpaListSectionHeader title description />
       {items.map → ApplicationListTile}
       {empty state}
       {footer CTA}
     </div>
     ```
   - *Alternatywa odrzucona:* zostawić Card bez header — nadal sugeruje jeden blok; citizen nie owija listy jedną kartą.

2. **Współdzielony `WpaListSectionHeader` (lub `WpaDashboardSection`)**
   - Props: `title`, `description?`, opcjonalnie `action` (link/button).
   - Klasy: `px-0.5` / `px-1`, `text-lg font-bold`, `text-sm text-muted-foreground` — jak citizen `h3` + podtytuł.
   - Rationale: DRY między 3 tabami dashboardu i ApplicationsList.

3. **Narzędzia WPA → citizen nav tile pattern**
   - Zamiana `bg-primary/10 p-2 rounded-lg` na `CitizenNavIconTile` lub identyczne klasy `CITIZEN_NAV_ICON_TONE` + `p-3 rounded-2xl`.
   - Zachować grid 1/2 kolumn i `Card` jako klikalny kafelek (jak citizen usługi) — tylko wnętrze ikony ujednolicić.

4. **Tab Alerty**
   - Usunąć CardHeader; ten sam `WpaListSectionHeader`.
   - Wiersze alertów: opcjonalnie lekki refactor do wspólnego `WpaAlertListTile` z ikoną `AlertTriangle` w `CitizenNavIconTile` — tylko jeśli nie zwiększa scope; minimum = header + istniejące `bg-muted/30 rounded-2xl` karty.

5. **Card `gap-0` gdzie Card zostaje**
   - Kafelki narzędzi i ewentualne empty state mogą zostać na `Card` — zawsze `gap-0 overflow-hidden` jak citizen.

## Risks / Trade-offs

- **[Ryzyko] Mniej „ramy” na desktopie** → **Mitigacja:** tile’y i tak mają `bg-muted/30` / highlight — lista pozostaje czytelna.
- **[Ryzyko] Duży diff w OfficerDashboard** → **Mitigacja:** zmiana strukturalna bez dotykania fetch/logiki.
- **[Trade-off] Dwa miejsca list officer** → **Mitigacja:** jeden header component, dwa pliki stron.
