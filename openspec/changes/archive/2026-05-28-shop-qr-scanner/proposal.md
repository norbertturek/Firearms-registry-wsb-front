## Why

Sklep musi zweryfikować e-promesę obywatela przed sprzedażą broni. Obywatel już otrzymuje kod QR (`qrToken`) w aplikacji, ale panel sklepu wymagał ręcznego wklejania tokenu — na urządzeniu mobilnym to niewykonalne w praktyce. Skaner aparatem domyka główny flow zakupowy bez zmian w backendie (API nadal opiera się na `qrToken`).

## What Changes

- Komponent `QrScanner` z podglądem kamery (`html5-qrcode`) na stronach sklepu: weryfikacja promesy i rejestracja sprzedaży.
- Domyślna zakładka „Skanuj” w `/shop/verify`; automatyczna weryfikacja po odczycie kodu.
- Parser `parseScannedPromesaCode` — obsługa tokenu z QR obywatela, numeru `PROM-...` oraz opcjonalnych formatów (JSON/URI).
- Komunikaty błędów i sukcesu (toast + UI inline) gdy kamera niedostępna, promesa nieważna lub odczytano tylko numer promesy.
- Fallback: ręczne wpisanie tokenu QR lub numeru promesy (weryfikacja bez sprzedaży po samym numerze).
- Wymagania jakościowe: działanie na mobile **i desktop** (webcam), czytelne powiadomienia przy braku kamery/uprawnień, HTTPS.

## Capabilities

### New Capabilities

- `shop-qr-scanner`: Skanowanie kodu QR e-promesy w panelu sklepu (kamera), integracja z weryfikacją i sprzedażą, obsługa błędów i platform.

### Modified Capabilities

- (brak — brak istniejących speców w `openspec/specs/`)

## Impact

- **Frontend**: `src/app/components/shop/QrScanner.tsx`, `src/lib/promesaQr.ts`, `ShopVerification.tsx`, `ShopSalePage.tsx`
- **Zależność**: `html5-qrcode`
- **Backend**: bez zmian (`POST /shop/verify-permit`, `POST /shop/firearms/register-sale` z `qrToken`)
- **Obywatel**: bez zmian (`PromisesView` nadal generuje QR z `qrToken`)
