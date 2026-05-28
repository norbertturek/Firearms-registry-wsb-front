## Why

Weryfikacja i sprzedaż w panelu sklepu są funkcjonalnie poprawne, ale wciąż nieoptymalne UX-owo: operator ma zbyt dużo równoległych ścieżek (scan/token/numer) i nie zawsze dostaje jednoznaczny, krokowy proces. Dodatkowo zakres danych sprzedaży wymaga doprecyzowania względem realnego procesu sklepowego.

## What Changes

- Uporządkować sklepowy flow sprzedaży do modelu krokowego (zwijane/rozwijane sekcje), w stylu znanym z panelu WPA.
- Zdefiniować klarowną kolejność źródeł wejścia dla promesy: skan jako domyślny, numer/token jako fallback na etapie weryfikacji.
- Utrzymać zasadę backendową: sprzedaż finalna wyłącznie po `qrToken`, bez rejestracji po samym numerze.
- Ujednolicić UI sklepu (hierarchia informacji, statusy, akcje) z wzorcami Citizen/WPA.
- Ujednolicić dostęp do kodu QR promesy po stronie Citizen: jeśli promesa jest zaakceptowana/aktywna, akcja „Pokaż QR” SHALL być dostępna niezależnie od punktu wejścia (lista promes, szczegóły sprawy/wniosku).
- Standaryzować prezentację QR do jednego komponentu modalowego (popup) dla szybkiego skanowania przez sklep, zamiast rozproszonych paneli zależnych od widoku.
- Potwierdzić, że aktualny zakres danych sprzedaży jest wystarczający dla bieżącego etapu i nie rozszerzać modelu backendowego.

## Capabilities

### New Capabilities
- *(none)*

### Modified Capabilities
- `shop-qr-scanner`: doprecyzowanie zachowania krokowego flow sprzedaży, priorytetu źródeł weryfikacji oraz spójności UI sklepu z pozostałymi rolami, przy zachowaniu bieżącego zakresu danych sprzedaży.
- `shop-qr-scanner`: doprecyzowanie reguły „jedna prawda o promesie” po stronie Citizen (QR widoczny dla każdej promesy gotowej do użycia, z modalem jako wspólnym wzorcem prezentacji).

## Impact

- Frontend: `ShopDashboard`, `ShopVerification`, `ShopSalePage`, komponenty shop i nawigacja.
- Frontend: `PromisesView`, `ApplicationsList`, `ApplicationDetails` oraz współdzielony komponent prezentacji QR promesy.
- Specyfikacja: modyfikacja istniejącej capability `shop-qr-scanner`.
- Backend: brak zmian kontraktu i brak rozszerzeń modelu danych w tej zmianie.
