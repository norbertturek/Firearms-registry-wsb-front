## Context

Obywatel wyświetla e-promesę w `PromisesView` jako kod QR zakodowany wartością `qrToken` (zgodnie z backendem .NET). Sklep weryfikuje promesę przez `POST /api/v1/shop/verify-permit` i rejestruje sprzedaż przez `POST /api/v1/shop/firearms/register-sale` — oba endpointy wymagają `qrToken` przy sprzedaży; weryfikacja dodatkowo akceptuje `promiseNumber`.

Obecna implementacja frontendu używa biblioteki `html5-qrcode`, która opiera się na **Web API `getUserMedia`** — działa w przeglądarce na urządzeniach mobilnych i na desktopie (wbudowana lub zewnętrzna kamera), pod warunkiem HTTPS (lub localhost w dev).

## Goals / Non-Goals

**Goals:**

- Umożliwić sklepowi skanowanie QR z aplikacji obywatela bez ręcznego kopiowania tokenu.
- Automatycznie wywołać weryfikację promesy po udanym skanie.
- Zapewnić czytelny feedback: sukces, promesa nieważna, błąd kamery, odczyt tylko numeru promesy.
- Działać na **mobile i desktop** w Chrome/Edge/Firefox/Safari (nowoczesne wersje).
- Zachować fallback ręczny (token / numer promesy).

**Non-Goals:**

- Zmiana payloadu QR (nadal `qrToken`, bez numeru promesy w kodzie — numer widoczny pod QR u obywatela).
- Zmiana backendu (`register-sale` bez `promiseNumber`).
- Natywna aplikacja sklepu (PWA poza zakresem).
- Skanowanie z pliku graficznego (możliwe w html5-qrcode, ale nie w pierwszej iteracji).

## Decisions

### 1. Biblioteka: `html5-qrcode`

**Wybór:** `html5-qrcode` v2.x.

**Alternatywy:** `@zxing/browser` (lżejszy, mniej gotowego UI kamery), własny `BarcodeDetector` (słabe wsparcie Safari).

**Uzasadnienie:** Szybka integracja, obsługa mobile + desktop, gotowy lifecycle start/stop/pause.

### 2. Kolejność uruchamiania kamery

1. `facingMode: "environment"` (tylna — mobile).
2. Przy błędzie: `facingMode: "user"` (przednia / webcam na laptopie).

Na desktopie pierwsza próba często kończy się błędem (brak tylnej kamery) — druga próba uruchamia webcam. To akceptowalne opóźnienie (~1 s).

### 3. Parser skanu: `parseScannedPromesaCode`

- Domyślnie: cały odczyt = `qrToken` (zgodne z `react-qr-code` u obywatela).
- Wzorzec `PROM-YYYYMMDD-XXXXXXXX` → tylko weryfikacja po numerze, bez sprzedaży.
- Opcjonalnie JSON `{ "t": "...", "n": "..." }` na przyszłość.

### 4. Powiadomienia użytkownika

| Zdarzenie | Kanał |
|-----------|--------|
| Kamera niedostępna / brak uprawnień | Inline (`cameraError` + ikona `CameraOff`) + banner amber z linkiem do wpisu ręcznego |
| Promesa zweryfikowana OK | Toast sukces + karta „Promesa aktywna” |
| Promesa nieważna | Toast błąd + karta czerwona |
| Odczyt numeru zamiast tokenu | Toast info + brak przycisku sprzedaży |
| Błąd API | Toast błąd + komunikat inline |

**Decyzja:** Nie polegać wyłącznie na toastach — błąd kamery MUSI być widoczny w obszarze skanera (użytkownik może nie zauważyć toastu).

### 5. Desktop vs mobile — layout

- Kontener skanera: `aspect-square`, `max-h: min(70vw, 320px)` — na desktopie ogranicza wysokość, nie rozciąga się na cały ekran.
- Zakładki: 3 kolumny (Skanuj | Token | Numer) — czytelne na szerokim ekranie.
- Brak osobnego „trybu desktop” — ten sam komponent, responsive CSS.

### 6. Wymagania środowiska

- **HTTPS** w produkcji (wymóg przeglądarek dla `getUserMedia`).
- **localhost** w dev — działa bez HTTPS.
- Użytkownik musi **zaakceptować uprawnienie do kamery** — przy odmowie pokazujemy komunikat po polsku, nie cichy fail.

## Risks / Trade-offs

| Ryzyko | Mitygacja |
|--------|-----------|
| Brak kamery na desktopie bez webcam | Fallback: zakładka Token / Numer + komunikat |
| Użytkownik odmawia uprawnień | Komunikat inline + toast; instrukcja włączenia w ustawieniach przeglądarki |
| Safari iOS wymaga gestu użytkownika | Skaner startuje po wejściu na zakładkę (interakcja) — OK |
| Podwójne wywołanie verify przy szybkim skanie | `lockedRef` + `pause()` po pierwszym odczycie |
| Zbyt techniczny komunikat błędu z biblioteki | Mapowanie na PL: „Nie udało się uruchomić aparatu…” |
| Duży bundle (+html5-qrcode) | Akceptowalne dla modułu sklepu; opcjonalnie code-split w przyszłości |

## Migration Plan

1. Dodać zależność `html5-qrcode`.
2. Wdrożyć `QrScanner` + integrację w `ShopVerification` i `ShopSalePage`.
3. Test manualny: mobile Chrome, desktop Chrome/Edge, scenariusz odmowy kamery, seed `QR-TEST-TOKEN-12345678`.
4. Brak migracji danych; rollback = usunięcie komponentu i powrót do pól tekstowych.

## Open Questions

- Czy dodać przycisk „Wybierz zdjęcie” (upload QR) dla sklepów bez kamery? — na razie nie.
- Czy mapować konkretne kody błędów `NotAllowedError` / `NotFoundError` na osobne komunikaty PL? — rekomendowane jako ulepszenie follow-up.
