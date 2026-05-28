# UI Consistency Audit

Data audytu: 2026-05-28  
Zakres: widoki aplikacji w `src/app/pages`, komponenty wspólne `src/app/components`.

## Metoda
- Przegląd komponentów bazowych (`Button`, `Card`, `Tabs`, `Input`, `Select`, `Badge`).
- Przegląd wzorców złożonych (search+filters, list tile, collapsible review card, shell nawigacyjny).
- Porównanie widoków podobnych funkcjonalnie:
  - listy i taby,
  - szczegóły/statusy,
  - flow operacyjne (shop),
  - CTA i filtracja.

## A. Elementy zgodne (tożsame z resztą UI)

### 1) Shared primitives (zgodne)
- `Button`: spójny baseline (`rounded-xl`, min-height, focus ring) w `src/app/components/ui/button.tsx`.
- `Tabs`: spójny Radix wrapper i trigger states w `src/app/components/ui/tabs.tsx`.
- `Card`: spójny slot layout i spacing (`CardHeader/CardContent`) w `src/app/components/ui/card.tsx`.

### 2) Search + filters pattern (zgodne)
- Ten sam model interakcji (input + filters sheet + apply/reset) używany przez:
  - `src/app/pages/ApplicationsList.tsx`,
  - `src/app/pages/WPASearchPage.tsx`,
  - komponenty: `src/app/components/search/SearchBarWithFilters.tsx`, `src/app/components/search/SearchFiltersSheet.tsx`.

### 3) Card visual language (zgodne)
- Wiele ekranów stosuje ten sam „miękki” styl kart:
  - `rounded-2xl border-none shadow-sm`,
  - m.in. `ApplicationsList`, `OfficerDashboard`, `TransfersList`, `MedicalAlertsView`.

### 4) Status color semantics (częściowo zgodne)
- Kolory statusów są semantycznie spójne (green=approved, red=rejected, amber=review/correction, blue/cyan=in-progress-like) w wielu stronach.
- Problem dotyczy głównie etykiet tekstowych (opisane niżej), nie kolorów.

### 5) Shell + mobile navigation (zgodne)
- Spójny top app bar + mobile bottom nav w `src/app/components/Layout.tsx`.
- Dla roli shop nawigacja kieruje do `Sprzedaż`, bez duplikowania `Weryfikacja`.

## B. Elementy niezgodne (niespójne)

## High

### B1) Niespójne nazwy statusów dla tych samych stanów
- `ApplicationsList`: `Approved -> "Zaakceptowany"`, `RequiresCorrection -> "Wymaga uzupełnienia"`.
- `ApplicationDetails`: `Approved -> "Zatwierdzony"`, `RequiresCorrection -> "Do uzupełnienia"`.
- Pliki:
  - `src/app/pages/ApplicationsList.tsx`
  - `src/app/pages/ApplicationDetails.tsx`
- Wpływ: użytkownik może interpretować te same stany jako różne.
- Quick fix: centralny `statusLabels.ts` + reużycie we wszystkich widokach.

### B2) Niespójny styl tabs dla podobnych kontekstów
- `ApplicationsList`: prostszy `TabsList className="grid grid-cols-2"`.
- `TransfersList` / `MedicalAlertsView`: bogatszy shell (`rounded-2xl bg-muted/50 p-1`).
- Pliki:
  - `src/app/pages/ApplicationsList.tsx`
  - `src/app/pages/TransfersList.tsx`
  - `src/app/pages/MedicalAlertsView.tsx`
- Wpływ: nierówny UX między podobnymi ekranami list.
- Quick fix: jeden wariant `AppTabsList` i migracja.

## Medium

### B3) Nierówna skala nagłówków (responsywność)
- Część stron: `text-xl md:text-2xl`.
- Część stron: `text-2xl` bez responsywnego zejścia.
- Przykład:
  - `src/app/pages/ShopSalePage.tsx` (`text-2xl`)
  - `src/app/pages/ApplicationsList.tsx` (`text-xl md:text-2xl`)
- Wpływ: różna hierarchia na mobile.
- Quick fix: ujednolicić PageHeader tokens.

### B4) Niejednolity placement akcji „Szczegóły” na mobile
- W `OfficerDashboard` przycisk `Szczegóły` jest `hidden md:flex`.
- Plik: `src/app/pages/OfficerDashboard.tsx`.
- Wpływ: na mobile ograniczony dostęp do kluczowej akcji.
- Quick fix: dodać alternatywną akcję mobile (inline, menu, click area).

### B5) Brak formalnej specyfikacji spacing/typography
- W kodzie jest wzorzec, ale brak dokumentu kontraktowego.
- Źródła:
  - `src/styles/theme.css`,
  - wiele stron z ad-hoc doborem klas.
- Wpływ: AI i devowie łatwo wprowadzają dryf wizualny.
- Quick fix: utrzymać i egzekwować `docs/design-system-agent-guide.md`.

## Low

### B6) Mieszanie radiusów bez jawnej reguły (xl vs 2xl)
- Spotykane równolegle `rounded-xl` i `rounded-2xl` na podobnych kontenerach.
- Wpływ: subtelna niespójność.
- Quick fix: policy w guide (container=2xl, controls=xl, pills=full).

### B7) Niejednolita mikrocopy CTA
- Różne czasowniki dla podobnej intencji („Zatwierdź”, „Zgłoś”, „Rozpatrz”, „Sprawdź”) bez słownika.
- Wpływ: mały, ale zwiększa entropię UI.
- Quick fix: dodać słownik CTA i mapę intencja->czasownik.

## C. Walidacja pad/margin/font-size (wyniki)

### Co jest dobre
- Częsty i poprawny rytm: `pt-2`, `mb-4|mb-6`, `space-y-3|4`, `min-h-[44px|52px]`.
- Typografia tytułów często zgodna: `font-bold tracking-tight`.
- Tekst pomocniczy zwykle `text-muted-foreground`.

### Co wymaga domknięcia
- Ujednolicić wszystkie H1 do jednego tokenu.
- Ujednolicić tabs shell i odstępy w sekcjach tabbed-list.
- Ograniczyć lokalne wyjątki spacingowe tylko do przypadków uzasadnionych.

## D. Backlog normalizacji (kolejność wdrożeń)

### High
1. Centralny mapping statusów (`statusLabels` + `StatusBadge`).
2. `AppTabsList` variant i migracja wszystkich tabbed-list pages.

### Medium
3. `PageHeader` pattern (komponent lub utility) + migracja wszystkich stron.
4. Standardy CTA placement mobile/desktop + poprawka `OfficerDashboard`.

### Low
5. Policy radius/spacing + linter/checklist enforcement.
6. Słownik mikrocopy CTA i stopniowa migracja.

## E. Definition of Done dla spójności UI
- Każdy nowy widok używa kanonicznych komponentów zamiast lokalnych duplikatów.
- Brak rozjazdów status label dla identycznych statusów.
- Tabs, header, CTA mają wspólny wzorzec i skalę.
- Mobile zachowuje dostęp do wszystkich kluczowych akcji.
- Zmiana przechodzi checklistę z `docs/design-system-agent-guide.md`.
