## Context

Sklepowy proces sprzedaży korzysta z jednego backendowego kontraktu weryfikacji (`verify-permit`) i jednego kontraktu finalizacji (`register-sale`), ale UI pozostawia zbyt wiele równorzędnych ścieżek wejścia oraz nie komunikuje jednoznacznie kolejności kroków. Użytkownik potrzebuje flow podobnego do WPA: krok po kroku, z jasnymi stanami i akcją główną.

Zgodnie z decyzją produktową aktualny zakres danych sprzedaży (producent, model, kategoria, kaliber, numer seryjny, rok produkcji) pozostaje bez zmian w tym etapie.

## Goals / Non-Goals

**Goals:**
- Ujednolicić sklepowy flow do modelu krokowego (weryfikacja -> dane broni -> zatwierdzenie).
- Ustalić priorytet metod wejścia przy weryfikacji: skan domyślnie, numer/token jako fallback.
- Utrzymać spójność interakcji i statusów z panelami Citizen/WPA.
- Zapewnić spójny dostęp do „Pokaż QR” dla promes gotowych do użycia, niezależnie od miejsca wejścia użytkownika.
- Zachować bieżący backend i bieżący model danych sprzedaży.

**Non-Goals:**
- Dodawanie nowych pól DTO dla sprzedaży.
- Dodawanie endpointów historii sprzedaży lub dodatkowego API sklepu.
- Zmiana reguł biznesowych backendu.

## Decisions

### 1) Krokowy układ sprzedaży jako główna ścieżka
Widok sprzedaży SHALL być głównym miejscem operacyjnym i prowadzić użytkownika przez kolejne etapy.

**Rationale:** redukcja niepewności operatora i spójność z wzorcem „zadanie + status + akcja”.

### 2) Hierarchia metod weryfikacji
Weryfikacja SHALL preferować skan QR; numer promesy i ręczny token pozostają fallbackiem dla sytuacji awaryjnych.

**Rationale:** skan dostarcza `qrToken` wymagany później do zapisu sprzedaży.

### 3) Brak rozszerzeń danych sprzedaży w tej zmianie
Model danych sprzedaży pozostaje bez zmian.

**Rationale:** zakres danych uznany za wystarczający na obecnym etapie; celem jest usprawnienie UX i flow, nie rozszerzanie domeny.

### 4) Jeden komponent prezentacji QR (modal) we wszystkich wejściach Citizen
Citizen SHALL widzieć kod QR promesy w tym samym modalowym komponencie niezależnie od tego, czy wszedł przez „Moje promesy”, „Moje sprawy”, czy szczegóły zaakceptowanego wniosku.

**Rationale:** operator sklepu potrzebuje szybkiego skanowania, a użytkownik nie powinien szukać QR między różnymi widokami.

### 5) Zero zgadywania po stronie frontendu
Frontend SHALL korzystać wyłącznie z jednoznacznie dostępnych danych promesy (`PromiseDto` z `qrToken`) i nie SHALL zgadywać mapowania między encją wniosku a encją wydanej promesy.

**Rationale:** eliminuje błędy i niespójności UX wynikające z niejawnych zależności danych.

## Risks / Trade-offs

- **[Risk]** Użytkownik może próbować ominąć krokową ścieżkę i ręcznie wymusić niestandardowy przebieg.  
  **Mitigation:** blokowanie kolejnych kroków do momentu pozytywnej weryfikacji.

- **[Risk]** Wielość fallbacków (scan/numer/token) może nadal być postrzegana jako złożona.  
  **Mitigation:** jednoznaczna kolejność i opisy „kiedy użyć którego wejścia”.

- **[Trade-off]** Brak rozszerzeń danych sprzedaży ogranicza szczegółowość operacyjną w porównaniu z pełnym procesem sklepowym.  
  **Mitigation:** odrębna przyszła zmiana, jeśli pojawi się wymóg formalny.

- **[Risk]** W widokach opartych na danych wniosku (`PromiseApplicationDto`) może brakować `qrToken`, więc akcja „Pokaż QR” nie pokaże się mimo statusu „Approved”.  
  **Mitigation:** akcje QR opierać na danych promesy (`PromiseDto`) i renderować wspólny modal tylko dla promes, które mają `qrToken`.

## Migration Plan

1. Wdrożyć zmiany UI flow bez modyfikacji backendu.
2. Dodać wspólny modal QR promesy i podpiąć go pod wszystkie wejścia Citizen dla promes gotowych do użycia.
3. Zweryfikować scenariusze desktop/mobile na istniejących endpointach.
4. Udokumentować finalny sposób użycia (kolejność kroków, fallbacki, spójny dostęp do QR).

Rollback: przywrócenie poprzednich komponentów/widoków sklepu bez ingerencji w API.

## Open Questions

- Czy szczegóły sprawy (widok wniosku) mają otwierać modal QR bezpośrednio, czy przez przycisk „Przejdź do promesy” jako fallback gdy brak `qrToken`?
- Czy po wyświetleniu modalu QR potrzebujemy dodatkowego trybu wysokiego kontrastu/jasności ekranu dla skanowania w sklepie?
