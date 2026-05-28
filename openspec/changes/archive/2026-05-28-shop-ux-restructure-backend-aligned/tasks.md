## 1. Flow and IA alignment

- [x] 1.1 Zdefiniować docelowy flow sklepu jako ciągły proces (verify -> sale) i uprościć routing/nawigację pod ten model.
- [x] 1.2 Ujednolicić copy, statusy i akcje "następny krok" w widokach sklepu, zgodnie z wzorcami używanymi w Citizen/WPA.
- [x] 1.3 Uporządkować ShopDashboard tak, aby prowadził do głównego zadania operacyjnego zamiast duplikować ścieżki.

## 2. Shared verification context

- [x] 2.1 Wydzielić współdzielony stan zweryfikowanej promesy (verified context) używany przez verify/sale.
- [x] 2.2 Po pozytywnej weryfikacji utrzymywać kontekst `qrToken` i danych promesy do czasu świadomego resetu przez użytkownika.
- [x] 2.3 Dodać jawny reset ("Zeskanuj inną promesę") czyszczący kontekst i przywracający skaner.

## 3. UI behavior and scanner UX hardening

- [x] 3.1 Upewnić się, że po weryfikacji skaner nie wymusza ponownego odczytu i nie zasłania stanu promesy.
- [x] 3.2 Dopracować stany kamery na desktopie bez fizycznej kamery (czarny podgląd / pseudo kamera) i jasne fallbacki manualne.
- [x] 3.3 Zachować pełną dostępność manualnego tokenu/numeru tam, gdzie wymagane przez aktualny backend.

## 4. Backend contract verification and real-flow validation

- [x] 4.1 Zweryfikować, że cały nowy flow korzysta wyłącznie z istniejących endpointów (`verify-permit`, `register-sale`) bez zmian kontraktu.
- [x] 4.2 Przetestować end-to-end real backend flow (desktop + mobile przez HTTPS tunnel) dla sukcesu i błędów walidacyjnych.
- [x] 4.3 Uzupełnić dokumentację deweloperską o finalny przebieg testów i zasady uruchamiania real-flow dla sklepu.
