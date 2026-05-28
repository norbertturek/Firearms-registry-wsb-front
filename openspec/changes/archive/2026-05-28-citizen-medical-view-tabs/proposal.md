## Why

Widok badań obywatela ma trzy zakładki (Wszystkie / Do uwagi / Braki), co myli użytkowników: „Braki” brzmi jak brak pozwolenia lub brak załączonych badań przy wniosku, podczas gdy w systemie oznacza wyłącznie **brak daty ważności w rejestrze** na już aktywnym pozwoleniu. Przy składaniu wniosku zaświadczenia są wymagane — osobna zakładka nie odzwierciedla realnego problemu użytkownika.

Dodatkowo filtrowane zakładki pokazują **ucięte karty pozwolenia** (tylko wiersze z problemem), co utrudnia orientację mimo że status jest już widoczny na wierszu w „Wszystkie”.

## What Changes

- Zmniejszenie liczby zakładek z trzech do dwóch: **Wszystkie** oraz **Wymaga uwagi** (łączy wygasające, wygasłe i brak daty w rejestrze).
- Usunięcie zakładki **Braki**; status `missing` pozostaje na wierszu badania z etykietą **Brak danych** i komunikatem o WPA.
- W zakładce **Wymaga uwagi** lista zawiera **pełne karty pozwolenia** (oba badania), gdy choć jedno badanie wymaga uwagi — spójnie z modelem permit-centric.
- Liczniki na zakładkach oparte o **liczbę pozwoleń** (grup), nie pojedynczych wpisów badań.
- Wyrównanie semantyki z dashboardem (`needsExamAttention` / `worstExamStatus`).

## Capabilities

### New Capabilities

- Brak.

### Modified Capabilities

- `citizen-medical-view-permit-links`: Uproszczenie filtrów zakładek, pełne karty w widoku „Wymaga uwagi”, doprecyzowanie znaczenia statusu braku danych w rejestrze (nie brak załącznika przy wniosku).

## Impact

- Affected frontend: `MedicalAlertsView.tsx`, ewentualnie helpery w `src/lib/permitExams.ts`.
- Brak zmian API/backendu.
- UX: jeden inbox problemów zamiast rozdzielenia „terminy” vs „braki danych”; mniej fałszywych skojarzeń z brakiem pozwolenia lub badań przy wniosku.
- Powiązane (bez zmiany scope): `PermitApplicationForm` nadal wymaga załączników — poza tym change.

## Non-Goals

- Widok „zgodności” łączący brak pozwolenia, wnioski i badania w jednym ekranie.
- Zmiana procesu składania wniosku lub walidacji załączników.
- Nowe endpointy lub model domenowy badań globalnych dla konta.
