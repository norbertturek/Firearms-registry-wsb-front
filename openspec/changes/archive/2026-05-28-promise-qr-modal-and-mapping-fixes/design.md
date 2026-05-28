## Context

Flow citizen opiera się na dwóch źródłach: `promiseApplications` (wnioski) i `promises` (wydane e-promesy z `qrToken`). Obecne mapowanie między tymi bytami bywa zbyt restrykcyjne, co prowadzi do fałszywego stanu „QR w przygotowaniu” mimo dostępnego QR w widoku `Moje promesy`.

Dodatkowo modal QR ma problemy responsywne na tabletach: przycinanie treści i brak sticky header przy przewijaniu. Użytkownik wymaga białego tła contentu modala oraz przewijalnego body przy stałym nagłówku.

## Goals / Non-Goals

**Goals:**
- Ograniczyć fałszywe fallbacki „QR w przygotowaniu” przez stabilniejsze mapowanie application -> issued promise.
- Zapewnić spójne zachowanie QR CTA w widokach citizen.
- Zapewnić modal QR odporny na rozdzielczości tabletowe: sticky header, scroll tylko body, brak ucinania treści.
- Wymusić biały content background modala niezależnie od motywu.

**Non-Goals:**
- Dodawanie nowych endpointów backendowych.
- Zmiana procesów WPA/Shop.
- Przebudowa całego systemu statusów obiegowych.

## Decisions

1. **Mapowanie QR z preferencją stabilnych sygnałów**
   - Używać bardziej tolerancyjnego dopasowania wydanej promesy do wniosku (hierarchia dopasowania zamiast jednego twardego warunku).
   - Priorytet: promesa z `qrToken` i statusem używalnym; fallback „w przygotowaniu” tylko gdy brak takiej promesy.
   - Rationale: minimalizacja false negative.

2. **Jedna reguła CTA w citizen**
   - `Moje sprawy -> Promesy` i `Szczegóły wniosku promesy` korzystają z tej samej funkcji decyzyjnej.
   - `Moje promesy` pozostaje źródłem prawdy dla samej listy wydanych promes.
   - Rationale: przewidywalny UX i mniejsza powierzchnia regresji.

3. **Modal layout: sticky header + scroll body**
   - `DialogContent` jako kontener kolumnowy z max-height.
   - Header z `position: sticky` i wyraźnym tłem.
   - Body z `overflow-y-auto` i `min-h-0` dla poprawnego scrolla na tabletach.
   - Rationale: brak ucinania treści i zachowanie kontekstu nagłówka.

4. **Wymuszone białe tło contentu**
   - Content body modala używa tła „białe” (niezależne od tokenów theme).
   - Rationale: spełnienie oczekiwań UX i zgodność wizualna dla tego konkretnego modala.

## Risks / Trade-offs

- **[Ryzyko] Zbyt luźne mapowanie po stronie frontend** → **Mitigacja:** deterministyczna kolejność reguł + jawne testy regresyjne.
- **[Ryzyko] Sticky header koliduje z animacją dialogu** → **Mitigacja:** test na mobile/tablet/desktop i ograniczenie custom CSS do modala QR.
- **[Trade-off] Wymuszone białe tło odstaje od dark mode** → **Mitigacja:** zakres tylko dla modala QR promesy, świadoma decyzja produktowa.
