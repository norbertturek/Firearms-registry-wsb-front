## Why

Citizen widzi dziś alerty medyczne i terminy badań w szczegółach pojedynczego pozwolenia, ale nie ma jednego miejsca, które pokazuje pełny, aktualny obraz wszystkich badań wraz z ich powiązaniem do konkretnych pozwoleń. Utrudnia to szybkie zrozumienie, które dokumenty i terminy dotyczą którego pozwolenia.

## What Changes

- Rozszerzenie widoku badań obywatela o komplet aktualnych badań dla wszystkich aktywnych pozwoleń.
- Jednoznaczne pokazanie powiązania: typ badania, data ważności, status oraz numer/typ pozwolenia.
- Ujednolicenie prezentacji tak, aby użytkownik mógł szybko przejść z listy badań do szczegółów powiązanego pozwolenia.
- Zachowanie obecnego backendu i kontraktów API; zmiana dotyczy sposobu agregacji i prezentacji danych po stronie UI.

## Capabilities

### New Capabilities
- `citizen-medical-view-permit-links`: Widok badań citizen prezentuje pełną listę aktualnych badań z relacją badanie ↔ pozwolenie, statusem i datą ważności.

### Modified Capabilities
- Brak.

## Impact

- Affected specs: nowy capability `citizen-medical-view-permit-links`.
- Affected frontend: widoki citizen związane z badaniami i szczegółami pozwoleń.
- API/backend: bez zmian kontraktów i bez nowych endpointów.
- UX: lepsza czytelność danych medycznych i szybsza identyfikacja powiązań z pozwoleniami.
