## Context

Widok citizen `Moje sprawy` pokazuje listy `permitApplications` i `promiseApplications`, natomiast modal QR opiera się na danych `promises` (wydanych e-promes z `qrToken`). Obecnie logika UI miesza te warstwy, co prowadzi do błędów renderowania akcji QR (zły tab, zły warunek statusu, brak spójnej ścieżki użytkownika).

Zmiana ma zostać wykonana bez modyfikacji backendu i bez nowych endpointów. Zakładamy dostęp do istniejących źródeł:
- `GET /citizen/me/promise-applications`
- `GET /citizen/me/promises`

## Goals / Non-Goals

**Goals:**
- Zapewnić deterministyczne reguły, kiedy i gdzie użytkownik może otworzyć QR promesy.
- Rozdzielić semantykę statusu „wniosku o promesę” od statusu „wydanej promesy”.
- Ujednolicić entry points (`ApplicationsList`, `ApplicationDetails`, `PromisesView`) bez duplikatów i sprzecznych warunków.
- Zapewnić czytelny fallback, gdy wniosek jest zaakceptowany, ale promesa jeszcze nie jest dostępna.

**Non-Goals:**
- Zmiany procesu biznesowego po stronie WPA.
- Dodawanie endpointu łączącego application z issued promise po stronie API.
- Modyfikacja logiki skanera sklepu.

## Decisions

1. **QR action tylko w kontekście promes**
   - Akcja „Pokaż kod QR” ma istnieć w sekcji `Promesy` i w szczegółach wniosku promesy, nie w sekcji pozwoleń.
   - Rationale: QR dotyczy wyłącznie wydanej promesy, nie pozwolenia ani samego wniosku.

2. **Jawna reguła mapowania `promiseApplication -> promise`**
   - Frontend buduje lookup issued promes po kluczach biznesowych (np. permit + weaponType + quantity/status) i używa go do decyzji o dostępności modala.
   - Jeśli mapowanie nie znajdzie pasującej wydanej promesy, UI pokazuje komunikat „wniosek zaakceptowany, promesa jeszcze nieudostępniona” zamiast martwego CTA.
   - Rationale: obecny model danych rozdziela byty, więc logika musi to explicitnie obsłużyć.

3. **Jedna polityka statusów dla QR**
   - `promiseApplication` status sam w sobie nie gwarantuje QR; warunkiem otwarcia modala jest istnienie `issued promise` z `qrToken` i statusem umożliwiającym użycie.
   - Rationale: uniknięcie fałszywych pozytywów (przycisk bez danych do modala).

4. **Spójny UX między widokami**
   - `ApplicationsList`: CTA prowadzi do modala (gdy mapowanie jest możliwe) albo do informacji/fallbacku.
   - `ApplicationDetails`: identyczna reguła i komunikat.
   - `PromisesView`: pozostaje source-of-truth listy wydanych promes i modala QR.
   - Rationale: przewidywalność dla użytkownika i mniejsza złożoność utrzymania.

## Risks / Trade-offs

- **[Ryzyko] Niejednoznaczne mapowanie application -> issued promise** → **Mitigacja:** jawne reguły dopasowania + defensywny fallback UI.
- **[Ryzyko] Rozjazd statusów między dwiema listami po opóźnieniu synchronizacji** → **Mitigacja:** QR CTA zależy od realnie dostępnego `qrToken`, nie od samego statusu wniosku.
- **[Trade-off] Więcej logiki w frontendzie** → **Mitigacja:** centralny helper mapujący i wspólne warunki używane przez oba widoki.
