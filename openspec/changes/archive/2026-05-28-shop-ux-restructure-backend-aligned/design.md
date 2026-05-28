## Context

Sklep ma obecnie trzy widoki (`/shop`, `/shop/verify`, `/shop/sale`), ale główny proces sprzedaży jest rozbity pomiędzy dwa ekrany, które współdzielą i powielają część logiki (scan, verify, komunikaty, stan tokenu). Jednocześnie backend udostępnia tylko dwa endpointy operacyjne dla sklepu (`verify-permit`, `register-sale`), co narzuca podejście "verify before register" bez dedykowanych API pod historię czy kolejkę transakcji sklepu.

W panelach Citizen i WPA dominuje wzorzec "task + status + next action". Reorganizacja sklepu ma osiągnąć podobną czytelność procesu bez rozszerzania backendu w tym etapie.

## Goals / Non-Goals

**Goals:**
- Ustrukturyzować doświadczenie sklepu jako spójny, krokowy flow oparty o istniejące API.
- Utrzymać kontekst zweryfikowanej promesy po udanym skanie/weryfikacji, aby nie wymagać ponownego QR w tej samej sesji zadania.
- Ujednolicić wzorce UI sklepu z Citizen/WPA (statusy, akcje główne, czytelne stany końca kroku).
- Ograniczyć duplikację logiki pomiędzy ekranami sklepu.

**Non-Goals:**
- Dodawanie nowych endpointów backendu (np. historia sprzedaży sklepu, dashboard API).
- Zmiana kontraktu `verify-permit` i `register-sale`.
- Pełna przebudowa IA całej aplikacji poza obszarem sklepu.

## Decisions

### 1) Shop flow pozostaje backend-aligned (bez nowych API)
Sklep dalej opiera się wyłącznie o:
- `POST /shop/verify-permit` (qrToken/promiseNumber)
- `POST /shop/firearms/register-sale` (qrToken)

**Rationale:** backend już zawiera wszystkie walidacje biznesowe i transakcyjność zapisu; zmiana UX nie wymaga rozszerzeń kontraktu.

**Alternatywa rozważana:** dodać endpoint "shop session/checkout state". Odrzucona na tym etapie, bo zwiększa zakres i wymaga zmian domenowych.

### 2) Wprowadzić "verified context" po stronie UI
Po pozytywnej weryfikacji promesy UI przechowuje stan zweryfikowanego `qrToken` i danych odpowiedzi tak, aby:
- ukryć ponowne skanowanie w bieżącej ścieżce,
- umożliwić świadomy reset ("Zeskanuj inną promesę").

**Rationale:** redukcja tarcia użytkownika i zgodność z procesem stanowiska sprzedaży.

**Alternatywa rozważana:** wymagać ponownej weryfikacji przed każdym submit. Odrzucona, bo dubluje kroki bez wzrostu bezpieczeństwa (backend i tak waliduje przy zapisie).

### 3) Ujednolicić strukturę widoków sklepu do wzorca task-first
Widoki sklepu mają eksponować:
- główną akcję bieżącego kroku,
- status kroku (pending/success/error),
- następny krok.

**Rationale:** spójność z mentalnym modelem z Citizen i WPA oraz łatwiejsza orientacja na mobile.

**Alternatywa rozważana:** pozostawić obecne trzy niezależne widoki i jedynie "doszlifować copy". Odrzucona, bo nie redukuje duplikacji.

## Risks / Trade-offs

- **[Ryzyko]** Większa liczba stanów UI (idle/scanning/verifying/verified/reset) może zwiększyć złożoność komponentów.  
  **Mitigation:** wydzielenie współdzielonego `verify context` i jednolitych komponentów statusów.

- **[Ryzyko]** Użytkownik może uznać, że raz zweryfikowana promesa jest "gwarantowana" do zapisu.  
  **Mitigation:** wyraźny komunikat, że finalna walidacja zachodzi ponownie na backendzie przy `register-sale`.

- **[Trade-off]** Bez nowych endpointów nie pokażemy historii sprzedaży sklepu w tej zmianie.  
  **Mitigation:** jawne oznaczenie jako kolejny etap (backend extension).

- **[Ryzyko]** Czarny ekran kamery na desktopach z "pseudo kamerą" może dalej wystąpić.  
  **Mitigation:** wzmocnione komunikaty i fallback do ręcznego tokenu; dodatkowa heurystyka jakości strumienia jako oddzielna iteracja.
