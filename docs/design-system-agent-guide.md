# Design System Agent Guide

Ten dokument jest kontraktem dla agenta AI i developerów: jak budować nowy UI tak, aby był spójny z aplikacją.

## 1) Foundations (tokeny i shell)

### Kolory, radius, typografia bazowa
- Źródło tokenów: `src/styles/theme.css`.
- Główne zasady:
  - `--primary` = główny akcent akcji.
  - `--muted` / `--muted-foreground` = tekst pomocniczy i tła pomocnicze.
  - `--radius` + pochodne (`--radius-lg`, `--radius-xl`) są bazą dla `rounded-xl` / `rounded-2xl`.
- Typografia bazowa (`h1-h4`, `label`, `button`, `input`) jest ustawiona w `@layer base`; klasy Tailwind ją nadpisują.

### Layout shell
- Globalny shell i nawigacja: `src/app/components/Layout.tsx`.
- Szerokość głównej kolumny: `src/app/utils/layout.ts` (`max-w-3xl w-full mx-auto px-4`).
- Domyślny wzorzec sekcji strony:
  - wrapper: `pt-1|pt-2`,
  - nagłówek: `mb-4|mb-6`,
  - tytuł: `text-xl md:text-2xl font-bold tracking-tight`,
  - opis: `text-sm md:text-base text-muted-foreground`.

## 2) Komponenty kanoniczne (używaj najpierw tych)

### Button (`src/app/components/ui/button.tsx`)
- Domyślne rozmiary:
  - `size=default`: `min-h-[44px]`.
  - `size=lg`: `min-h-[52px]` (główne CTA formularza).
- Domyślny radius: `rounded-xl`.
- Nie twórz lokalnych „pseudo-przycisków” jeśli wystarczy `Button`.

### Card (`src/app/components/ui/card.tsx`)
- Struktura: `Card` + `CardHeader` + `CardContent` + `CardFooter`.
- Domyślny card ma border; na poziomie strony często stosowany jest wariant:
  - `rounded-2xl border-none shadow-sm`.

### Tabs (`src/app/components/ui/tabs.tsx`)
- `TabsList`: pełna szerokość, `rounded-2xl`, tło `bg-muted`.
- `TabsTrigger`: `min-h-[44px]`, `rounded-xl`.
- Dla podobnych kontekstów (listy, przeglądy) utrzymuj ten sam styl listy tabów.
- Dla list/przeglądów używaj presetu: `src/app/components/ui/AppTabsList.tsx`.

### Input / Select
- Input: `src/app/components/ui/input.tsx`.
- Select: `src/app/components/ui/select.tsx`.
- Praktyka spójności:
  - touch target minimum `44px`,
  - dla cięższych formularzy operacyjnych `min-h-[52px]`.

### Search + Filters pattern
- `SearchBarWithFilters` + `SearchFiltersSheet` + `SearchFilterField`.
- To jest kanoniczny wzorzec filtrowania/listingu.
- Używaj zamiast ad-hoc własnych paneli filtrów.

### ReviewCollapsibleCard
- `src/app/components/wpa/ReviewCollapsibleCard.tsx`.
- Kanoniczny wzorzec sekcji krokowych / review.
- Używaj dla wieloetapowych flow zamiast mieszać statyczne i niestatyczne sekcje bez reguły.

## 3) Wzorce stron (page patterns)

### Page Header
- Stosuj jednolity blok:
  - H1: `text-xl md:text-2xl font-bold tracking-tight`.
  - Subtitle: `text-muted-foreground`.
- Nie mieszaj `text-2xl` fixed i `text-xl md:text-2xl` w podobnych widokach bez uzasadnienia.

### List + Filters
- Search u góry.
- Taby poniżej (jeśli listy wielosegmentowe).
- Karty/list tiles na końcu.
- Empty state: ikona + komunikat + ewentualna akcja.

### CTA placement
- Primary submit dla formularza: pełna szerokość (`w-full`) i `min-h-[52px]`.
- Secondary akcje (`outline`, `ghost`) obok/poniżej, ale nie konkurujące wizualnie z primary.

### Statusy i badge
- Kolory statusów muszą być mapowane centralnie (source-of-truth helper).
- Zakaz duplikowania map status->etykieta w wielu widokach.
- Canonical source-of-truth dla statusów aplikacyjnych: `src/lib/statusUi.ts`.

## 4) Reguły dla agenta (obowiązkowe)

1. **Reuse-first**: zanim napiszesz nowy UI, sprawdź czy istnieje odpowiedni komponent/pattern.
2. **No duplicate flows**: nie twórz równoległych ścieżek dla tego samego celu użytkownika.
3. **Single status dictionary**: etykiety i kolory statusów muszą pochodzić z jednego miejsca.
4. **Touch targets**: minimum `44px`, a primary form actions `52px`.
5. **Responsive consistency**: stosuj te same tokeny nagłówków i spacingu na stronach tej samej kategorii.
6. **Filters consistency**: dla filtrowania/list używaj Search+Sheet pattern.
7. **Section behavior consistency**: dla złożonych ekranów używaj `ReviewCollapsibleCard` konsekwentnie.

## 5) Definicja „spójny UI” (checklista)

Agent PR uznajemy za spójny tylko gdy:
- [ ] użyto kanonicznych primitives/components zamiast lokalnych duplikatów,
- [ ] nagłówek strony ma standardową skalę typografii i spacing,
- [ ] tabs w podobnych widokach mają ten sam styl,
- [ ] główne CTA ma właściwy hierarchy i touch target,
- [ ] statusy/badge korzystają z centralnego mappingu,
- [ ] zachowanie nawigacji i przejść nie duplikuje istniejących flow,
- [ ] empty/loading/error states są zgodne z resztą aplikacji,
- [ ] mobile i desktop zachowują ten sam model interakcji.

## 6) Anti-patterny (czego nie robić)

- Nie twórz nowego komponentu tabs/list/filter, jeśli istnieje już odpowiednik.
- Nie mieszaj wielu nazw dla tego samego statusu (`Zaakceptowany` vs `Zatwierdzony`) w różnych widokach.
- Nie dawaj interaktywności sekcji, która biznesowo ma być zablokowana (np. wymagany krok poprzedni).
- Nie ukrywaj kluczowych akcji na mobile bez alternatywnego punktu dostępu.
