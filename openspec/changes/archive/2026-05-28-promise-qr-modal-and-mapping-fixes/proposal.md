## Why

W widokach citizen dotyczących promes występują niespójności: użytkownik może widzieć fallback „QR w przygotowaniu” mimo dostępnego QR w `Moje promesy`, a modal QR nie zachowuje się poprawnie na tabletach (ucięta treść, brak sticky header). Powoduje to utratę zaufania do flow i błędy UX w kluczowym etapie sprzedaży.

## What Changes

- Doprecyzowanie reguł mapowania `promiseApplication -> issued promise` tak, aby eliminować fałszywy fallback „QR w przygotowaniu”.
- Ujednolicenie zachowania CTA QR między `Moje sprawy -> Promesy`, `Szczegóły wniosku promesy` i `Moje promesy`.
- Aktualizacja modala QR:
  - biały content background niezależny od tokenu motywu,
  - sticky header,
  - przewijalny body content bez ucinania treści na tabletach.
- Uzupełnienie test checklisty pod przypadki regresyjne QR/fallback/modal.

## Capabilities

### New Capabilities
- `citizen-promise-qr-modal-resilience`: Odporna logika dostępności QR promesy i responsywne zachowanie modala QR w widokach citizen.

### Modified Capabilities
- `shop-qr-scanner`: Brak.

## Impact

- Affected frontend: `ApplicationsList`, `ApplicationDetails`, `PromisesView`, `PromiseQrModal`, helper mapowania QR.
- API/backend: bez nowych endpointów i bez zmian kontraktów.
- UX: spójna decyzja o dostępności QR, brak fałszywego fallbacku i poprawna obsługa modal scroll/sticky header na tabletach.
