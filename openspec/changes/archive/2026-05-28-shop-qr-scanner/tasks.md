## 1. Zależności i fundamenty

- [x] 1.1 Dodać `html5-qrcode` do `package.json`
- [x] 1.2 Utworzyć `src/lib/promesaQr.ts` z `parseScannedPromesaCode`
- [x] 1.3 Utworzyć komponent `src/app/components/shop/QrScanner.tsx`

## 2. Integracja w panelu sklepu

- [x] 2.1 Zakładka „Skanuj” w `ShopVerification.tsx` z auto-weryfikacją po skanie
- [x] 2.2 Zachować fallback: zakładki Token i Numer promesy
- [x] 2.3 Skaner w `ShopSalePage.tsx` z auto-weryfikacją i obsługą `?qrToken=`
- [x] 2.4 Przycisk sprzedaży tylko przy zweryfikowanym `qrToken` (nie po samym numerze)

## 3. UX, błędy i platformy

- [x] 3.1 Komunikat inline przy błędzie kamery (`cameraError` + `CameraOff`)
- [x] 3.2 Banner zachęcający do wpisu ręcznego przy błędzie kamery
- [x] 3.3 Toast sukces/błąd po weryfikacji promesy
- [x] 3.4 Toast informacyjny gdy odczytano tylko numer `PROM-...`
- [x] 3.5 Fallback kamery: `environment` → `user` (mobile + desktop webcam)
- [x] 3.6 Mapować `NotAllowedError` / `NotFoundError` na dedykowane komunikaty PL + toast
- [x] 3.7 Toast przy pierwszym błędzie uruchomienia kamery (oprócz inline)

## 4. Weryfikacja i dokumentacja

- [x] 4.1 Test manualny: mobile Chrome (skan + sprzedaż)
- [x] 4.2 Test manualny: desktop Chrome/Edge (webcam, odmowa uprawnień)
- [x] 4.3 Test manualny: fallback ręczny tokenu gdy kamera niedostępna
- [x] 4.4 Krótka wzmianka w `docs/development-guide.md` o wymogu HTTPS dla kamery
