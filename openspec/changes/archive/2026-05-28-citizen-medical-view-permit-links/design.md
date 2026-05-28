## Context

Aktualny backend już dostarcza dane potrzebne do pokazania powiązań badanie ↔ pozwolenie:
- `GET /citizen/me/permits` zawiera daty ważności badań dla każdego pozwolenia.
- `GET /citizen/me/medical-alerts` zawiera alerty z `permitId` i `permitNumber`.

W UI citizen informacje są dziś rozproszone: szczegóły jednego pozwolenia pokazują daty badań, a widok alertów skupia się na wygasających/wygasłych zdarzeniach. Brakuje jednego miejsca z pełnym, aktualnym obrazem badań dla wszystkich pozwoleń aktywnych.

Ograniczenie: zmiana ma zostać zrealizowana bez zmian backendu i bez nowych endpointów.

## Goals / Non-Goals

**Goals:**
- Zapewnić użytkownikowi jeden widok badań obejmujący wszystkie aktywne pozwolenia.
- Jednoznacznie pokazać relację badania do konkretnego pozwolenia (numer i typ).
- Utrzymać spójność z istniejącym UI citizen (karty, statusy, sekcje zwijane/rozwijane).
- Użyć wyłącznie istniejących kontraktów API.

**Non-Goals:**
- Zmiana modelu domenowego na badania globalne dla konta.
- Dodawanie nowych encji lub endpointów backendowych.
- Zmiana procesu akceptacji wniosków przez WPA.

## Decisions

1. **Agregacja danych po stronie frontend**
   - UI buduje listę wpisów badań per pozwolenie na podstawie `getPermits()`.
   - Każde pozwolenie generuje dwa rekordy: lekarskie i psychologiczne.
   - Rationale: to jedyne źródło kompletne dla wszystkich aktywnych pozwoleń; alerty obejmują tylko przypadki bliskie wygaśnięcia/po wygaśnięciu.

2. **Alerty jako warstwa statusu, nie źródło kompletności**
   - `getMedicalAlerts()` służy do oznaczania wpisów jako „wygasa/wygasło” i ewentualnych komunikatów.
   - Przy braku alertu rekord nadal jest widoczny jako „aktualne”.
   - Rationale: użytkownik ma widzieć wszystkie aktualne badania, nie tylko problematyczne.

3. **Prezentacja „Permit-centric + exam-centric”**
   - Widok zawiera czytelne kolumny/pola: numer pozwolenia, typ pozwolenia, typ badania, data ważności, status.
   - Rekord prowadzi do `PermitDetails` przez `permitId`.
   - Rationale: szybka orientacja i przejście do kontekstu dokumentu.

4. **Stan dla braków danych**
   - Jeśli data badania dla pozwolenia jest pusta, wpis ma status „brak danych” i wskazówkę, że wymagane jest potwierdzenie przez WPA.
   - Rationale: odzwierciedlenie obecnego modelu bez ukrywania luk.

## Risks / Trade-offs

- **[Ryzyko] Rozjazd między permitami a alertami (opóźniony sync)** → **Mitigacja:** status krytyczny liczony z daty badania z permitu; alert traktowany jako komunikat dodatkowy.
- **[Ryzyko] Nadmiar informacji przy wielu pozwoleniach** → **Mitigacja:** filtrowanie po statusie i/lub grupowanie po numerze pozwolenia.
- **[Trade-off] Frontendowa agregacja zamiast backendowego endpointu „all exams view”** → **Mitigacja:** prostszy rollout bez zmian API; możliwa ewolucja do dedykowanego endpointu w przyszłości.
