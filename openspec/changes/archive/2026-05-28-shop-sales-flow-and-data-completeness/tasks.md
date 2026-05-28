## 1. Sale flow structure and UX alignment

- [x] 1.1 Przebudować widok sprzedaży na jasno wydzielone kroki (weryfikacja -> dane broni -> zapis), z układem sekcji zwijanych/rozwijanych.
- [x] 1.2 Dostosować copy/statusy/akcje główne sklepu do wzorców używanych w panelach Citizen i WPA.
- [x] 1.3 Uporządkować nawigację sklepu tak, aby sprzedaż była głównym zadaniem operacyjnym, a weryfikacja stanowiła ścieżkę pomocniczą.

## 2. Verification inputs and backend coherence

- [x] 2.1 Ustawić skan jako domyślną metodę weryfikacji, z numerem promesy i tokenem jako fallback.
- [x] 2.2 Zachować walidację sprzedaży wyłącznie po `qrToken` oraz czytelnie komunikować to w UI.
- [x] 2.3 Zapewnić, że po pozytywnej weryfikacji użytkownik nie musi ponownie wpisywać tokenu w tym samym flow.

## 3. Implementation safeguards and documentation

- [x] 3.1 Zweryfikować, że zmiana nie wymaga rozszerzeń modelu danych i nie modyfikuje kontraktu backendu.
- [x] 3.2 Przetestować scenariusze scan/numer/token (sukces i błędy) na desktopie i mobile.
- [x] 3.3 Zaktualizować dokumentację deweloperską o finalny przebieg flow i fallbacki wejścia.

## 4. Citizen QR consistency across entry points

- [ ] 4.1 Wprowadzić wspólny komponent modalowy „Pokaż QR promesy” i używać go we wszystkich ekranach Citizen.
- [ ] 4.2 Zapewnić dostępność akcji „Pokaż QR” dla promes `Active/Approved` zarówno z listy promes, jak i ze ścieżki „Moje sprawy” / szczegółów.
- [ ] 4.3 Oprzeć renderowanie modalu wyłącznie o dane `PromiseDto` z `qrToken` (bez mapowania zgadywanego na podstawie samego `PromiseApplicationDto`).
- [ ] 4.4 Dodać scenariusze testowe regresji: „Approved promesa z każdego entrypointu pokazuje ten sam modal QR”.
