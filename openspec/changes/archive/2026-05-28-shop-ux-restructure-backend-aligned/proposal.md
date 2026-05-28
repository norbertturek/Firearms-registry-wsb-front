## Why

Obecny panel sklepu realizuje poprawny proces biznesowy, ale rozdziela go na dwa podobne widoki (`/shop/verify` i `/shop/sale`), co zwiększa liczbę kroków, duplikuje interakcje i utrudnia spójność UX względem paneli Citizen i WPA. Potrzebna jest reorganizacja UI, która zachowa obecny backend bez zmian kontraktu API.

## What Changes

- Przebudować doświadczenie sklepu na spójny, task-first flow sprzedaży (scan/verify -> dane broni -> zapis), zamiast dwóch częściowo dublujących się ekranów.
- Ujednolicić wzorce UI sklepu z Citizen i WPA: statusy, komunikaty kroków, bloki akcji oraz czytelne stany "co dalej".
- Ograniczyć ręczne ponawianie skanowania: po poprawnej weryfikacji utrzymywać kontekst promesy do końca procesu lub do świadomego resetu.
- Zachować pełną kompatybilność z obecnym backendem: `verify-permit` (qrToken/promiseNumber) i `register-sale` (qrToken), bez nowych endpointów.
- Zdefiniować zakres reorganizacji tak, aby nie wymagał wdrażania historii sprzedaży po stronie backendu w tym etapie.

## Capabilities

### New Capabilities
- *(none)*

### Modified Capabilities
- `shop-qr-scanner`: zmiana wymagań UX i przepływu sklepu (struktura ekranów, utrzymanie zweryfikowanego kontekstu, spójność interakcji), przy niezmienionym kontrakcie API.

## Impact

- Frontend: `src/app/pages/ShopDashboard.tsx`, `src/app/pages/ShopVerification.tsx`, `src/app/pages/ShopSalePage.tsx`, komponenty shop i nawigacja w `Layout`.
- Spójność UX: dopasowanie wzorców interakcji i komunikatów do istniejących paneli Citizen/WPA.
- Backend: brak nowych endpointów i brak zmian payloadów; wykorzystywane pozostają tylko istniejące operacje sklepu.
- Dokumentacja/specyfikacja: aktualizacja capability `shop-qr-scanner` o wymagania reorganizacji UI.
