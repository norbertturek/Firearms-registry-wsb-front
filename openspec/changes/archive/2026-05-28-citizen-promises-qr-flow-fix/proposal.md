## Why

Na widoku `Moje sprawy -> Promesy` logika wyświetlania akcji QR jest niespójna: przycisk bywa renderowany w złym miejscu, pod złą zakładką lub znika mimo oczekiwanego statusu wniosku. Użytkownik nie ma jednoznacznej ścieżki do otwarcia modala QR dla wydanej promesy.

## What Changes

- Uporządkowanie logiki renderowania akcji QR wyłącznie w sekcji promes (`Moje sprawy -> Promesy`) zamiast mieszania jej z sekcją pozwoleń.
- Rozdzielenie statusów wniosku o promesę od statusu wydanej promesy i jawne mapowanie `promiseApplication -> issued promise`.
- Zdefiniowanie zachowania UI dla 3 stanów:
  - promesa wydana i aktywna (otwórz modal QR),
  - wniosek zaakceptowany, ale brak wydanej promesy (jasny komunikat + nawigacja),
  - statusy niegotowe do QR (brak akcji QR).
- Ujednolicenie entry points QR między `ApplicationsList`, `ApplicationDetails` i `PromisesView`.

## Capabilities

### New Capabilities
- `citizen-promises-qr-flow`: Spójny i deterministyczny flow otwierania QR promesy z widoku `Moje sprawy -> Promesy` oraz powiązanych widoków citizen.

### Modified Capabilities
- `shop-qr-scanner`: Brak.

## Impact

- Affected frontend: `ApplicationsList`, `ApplicationDetails`, `PromisesView`, komponent modala QR.
- API/backend: bez nowych endpointów i bez zmian kontraktów; wykorzystanie istniejących danych citizen.
- UX: użytkownik zawsze wie, kiedy i skąd może otworzyć QR, bez duplikacji i bez „znikającej” akcji.
