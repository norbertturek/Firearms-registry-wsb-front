# Przewodnik deweloperski

## Wymagania wstępne

- **Node.js** 18+
- **pnpm** (zalecany package manager)
- **Git**
- **Docker** (opcjonalnie, dla backendu)

---

## Szybki start

### 1. Instalacja zależności

```bash
pnpm install
```

### 2. Konfiguracja środowiska

```bash
cp .env.example .env
```

Edytuj `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_USE_MOCKS=true
VITE_SHOW_QUICK_LOGIN=true
```

### 3. Uruchomienie

**Tryb mock (bez backendu):**
```bash
VITE_USE_MOCKS=true pnpm dev
```

**Tryb z backendem:**
```bash
# Terminal 1: Backend (w repozytorium backendu)
docker compose up -d

# Terminal 2: Frontend
VITE_USE_MOCKS=false pnpm dev
```

Aplikacja: http://localhost:5173

---

## Struktura projektu

```
src/
├── app/
│   ├── components/    # Komponenty React
│   │   ├── ui/        # shadcn/ui primitives
│   │   ├── wpa/       # Komponenty WPA
│   │   ├── citizen/   # Komponenty obywatela
│   │   └── search/    # Komponenty wyszukiwania
│   ├── layouts/       # Layouty tras
│   ├── pages/         # Strony (1:1 z trasami)
│   ├── utils/         # Narzędzia pomocnicze
│   └── routes.tsx     # Definicja routera
│
├── services/          # Komunikacja z API
├── types/             # Interfejsy TypeScript
├── mocks/             # MSW handlers
└── lib/               # Biblioteki pomocnicze
```

---

## Konwencje kodu

### Nazewnictwo plików

| Typ | Konwencja | Przykład |
|-----|-----------|----------|
| Komponenty | PascalCase | `WeaponRegistry.tsx` |
| Strony | PascalCase | `CitizenDashboard.tsx` |
| Serwisy | camelCase | `citizenService.ts` |
| Narzędzia | camelCase | `permitEligibility.ts` |
| Typy | camelCase | `api.ts` |

### Struktura komponentu

```tsx
// 1. Importy
import { useState } from "react";
import { Button } from "./ui/button";
import { citizenService } from "@/services/citizenService";
import type { PermitDto } from "@/types/api";

// 2. Interfejsy props (jeśli potrzebne)
interface PermitCardProps {
  permit: PermitDto;
  onRefresh?: () => void;
}

// 3. Komponent (export function, nie arrow)
export function PermitCard({ permit, onRefresh }: PermitCardProps) {
  // 4. Stan lokalny
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Handlery
  const handleAction = async () => {
    setIsLoading(true);
    try {
      // ...
    } finally {
      setIsLoading(false);
    }
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Pobieranie danych

```tsx
// Wzorzec: useState + useEffect
export function MyPage() {
  const [data, setData] = useState<MyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await myService.getData();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Błąd pobierania danych");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) return <Skeleton />;
  if (error) return <Alert variant="destructive">{error}</Alert>;
  
  return <div>{/* render data */}</div>;
}
```

---

## Praca z komponentami UI

### shadcn/ui

Komponenty UI bazują na [shadcn/ui](https://ui.shadcn.com/) — to NIE jest biblioteka npm, a zbiór komponentów kopiowanych do projektu.

**Lokalizacja:** `src/app/components/ui/`

**Dodawanie nowego komponentu:**
```bash
npx shadcn@latest add button
```

**Przykład użycia:**
```tsx
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Tytuł</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Akcja</Button>
  </CardContent>
</Card>
```

### Tailwind CSS

Projekt używa Tailwind CSS v4.

**Klasy responsywne:**
- `md:` — desktop (≥768px)
- brak prefiksu — mobile-first

**Przykład:**
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <aside className="hidden md:block w-64">
    {/* Sidebar tylko na desktop */}
  </aside>
  <main className="flex-1">
    {/* Treść */}
  </main>
</div>
```

---

## Dodawanie nowej strony

### 1. Utwórz komponent strony

```tsx
// src/app/pages/MyNewPage.tsx
export function MyNewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Moja strona</h1>
      {/* ... */}
    </div>
  );
}
```

### 2. Dodaj trasę

```tsx
// src/app/routes.tsx
import { MyNewPage } from "./pages/MyNewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // ...
      { path: "my-new-page", Component: MyNewPage },
      // ...
    ],
  },
]);
```

### 3. (Opcjonalnie) Dodaj do nawigacji

```tsx
// src/app/components/Layout.tsx
// W getMobileNavigation():
{ label: "Moja strona", path: "/my-new-page", icon: SomeIcon },
```

---

## Praca z API

### Dodawanie nowego endpointu

**1. Dodaj typy (jeśli potrzebne):**
```typescript
// src/types/api.ts
export interface MyNewDto {
  id: string;
  name: string;
  // ...
}

export interface CreateMyNewRequest {
  name: string;
}
```

**2. Dodaj metodę serwisu:**
```typescript
// src/services/myService.ts
import api from './api';
import type { MyNewDto, CreateMyNewRequest } from '../types/api';

export const myService = {
  async getAll(): Promise<MyNewDto[]> {
    return api.get<MyNewDto[]>('/my-endpoint');
  },
  
  async create(data: CreateMyNewRequest): Promise<MyNewDto> {
    return api.post<MyNewDto>('/my-endpoint', data);
  },
};
```

**3. Użyj w komponencie:**
```typescript
import { myService } from '@/services/myService';

const data = await myService.getAll();
```

---

## Mockowanie API (MSW)

### Dodawanie nowego handlera

```typescript
// src/mocks/handlers/my-handler.ts
import { http, HttpResponse } from 'msw';

export const myHandlers = [
  http.get('/api/v1/my-endpoint', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test' }
    ]);
  }),
  
  http.post('/api/v1/my-endpoint', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-id',
      ...body
    }, { status: 201 });
  }),
];
```

**Zarejestruj w index.ts:**
```typescript
// src/mocks/index.ts
import { myHandlers } from './handlers/my-handler';

export const handlers = [
  ...authHandlers,
  ...citizenHandlers,
  ...myHandlers, // dodaj
];
```

### Praca z in-memory database

```typescript
// src/mocks/db.ts
export const myEntities: any[] = [
  { id: '1', name: 'Entity 1' },
];

// W handlerze:
http.post('/api/v1/my-endpoint', async ({ request }) => {
  const body = await request.json();
  const newEntity = { id: uid(), ...body };
  myEntities.push(newEntity);
  return HttpResponse.json(newEntity, { status: 201 });
});
```

---

## Formularze

### React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface FormData {
  name: string;
  email: string;
}

export function MyForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    try {
      await myService.create(data);
      toast.success("Zapisano!");
    } catch (err) {
      toast.error("Błąd zapisu");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("name", { required: "Nazwa jest wymagana" })}
          placeholder="Nazwa"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Zapisywanie..." : "Zapisz"}
      </Button>
    </form>
  );
}
```

---

## Powiadomienia (Toast)

```tsx
import { toast } from "sonner";

// Sukces
toast.success("Operacja zakończona pomyślnie");

// Błąd
toast.error("Wystąpił błąd");

// Ostrzeżenie
toast.warning("Uwaga!");

// Info
toast.info("Informacja");

// Z opisem
toast.success("Zapisano", {
  description: "Wniosek został złożony pomyślnie"
});
```

---

## Debugowanie

### React DevTools

Zainstaluj rozszerzenie [React DevTools](https://react.dev/learn/react-developer-tools).

### Network requests

1. Otwórz DevTools → Network
2. Filtruj po "Fetch/XHR"
3. Sprawdź request/response

### MSW Debug

```typescript
// W src/mocks/browser.ts
export const worker = setupWorker(...handlers);

// Włącz logowanie
worker.start({
  onUnhandledRequest: 'warn'
});
```

### Console logging

```typescript
// Tymczasowe logowanie
console.log('Debug:', data);

// W serwisach (dla development)
if (import.meta.env.DEV) {
  console.log('[API]', path, params);
}
```

---

## Build i wdrożenie

### Build produkcyjny

```bash
pnpm build
```

Artefakty: `dist/`

### Preview lokalny

```bash
pnpm preview
```

### Vercel

Projekt ma skonfigurowany `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Zmienne środowiskowe na Vercel:**
- `VITE_API_BASE_URL` — URL backendu produkcyjnego
- `VITE_USE_MOCKS=false`
- `VITE_SHOW_QUICK_LOGIN=false`

---

## Panel sklepu — skaner QR promesy

Skanowanie kodu QR w panelu sklepu (`/shop/verify`, `/shop/sale`) używa biblioteki `html5-qrcode` i API `getUserMedia`.

### Test na telefonie — ngrok (HTTPS)

1. Token z [dashboard.ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken) → wpisz w `.env`:
   ```env
   NGROK_AUTHTOKEN=twój_token
   ```
2. Uruchom **backend** na PC (`docker compose up` w repo API, port **5000**).
3. Vite + ngrok (prawdziwe API przez proxy — bez mocków):
   ```bash
   pnpm dev:mobile
   ```
   Tryb `--mode mobile`: `VITE_USE_MOCKS=false`, `VITE_API_BASE_URL=/api/v1` → requesty z telefonu idą na ten sam host HTTPS co UI, Vite przekierowuje na `localhost:5000`.
4. W terminalu pojawi się adres `https://….ngrok-free.app` — otwórz na telefonie np. `/shop/sale` (rekomendowany główny flow) lub `/shop/verify` (sama weryfikacja).

Sam tunel (gdy Vite już działa): `pnpm tunnel`.

### HTTPS i uprawnienia kamery

Przeglądarki udostępniają kamerę tylko w **kontekście bezpiecznym**:

- `https://` (ngrok, produkcja)
- `http://localhost` na PC
- Adres LAN `http://192.168.x.x:5173` **nie** włączy kamery na telefonie — użyj `pnpm dev:mobile` lub zakładki **Token**

Przy odmowie uprawnień lub braku kamery UI pokazuje komunikat inline oraz toast; dostępny jest fallback w zakładce **Token**.

### Konta testowe

| Rola | Login | Hasło |
|------|-------|-------|
| Sklep | `shop@example.com` | `Shop123!` |

Przykładowy token QR (MSW): `QR-TEST-TOKEN-12345678`

### Weryfikacja kontraktu backend (shop)

Flow sklepu używa wyłącznie istniejących endpointów:

- `POST /api/v1/shop/verify-permit` — weryfikacja po `qrToken` lub `promiseNumber`
- `POST /api/v1/shop/firearms/register-sale` — zapis sprzedaży wyłącznie po `qrToken`

Brak nowych endpointów wymaganych do działania zreorganizowanego UI.

### Checklist testów manualnych

**Mobile Chrome — skan + sprzedaż**

1. Zaloguj się jako sklep → `/shop/verify` → zakładka **Skanuj**.
2. Zezwól na kamerę; zeskanuj kod z widoku obywatela `/promises` (QR = `qrToken`).
3. Potwierdź toast sukcesu i dane promesy; przejdź do sprzedaży z zweryfikowanym tokenem.
4. Na `/shop/sale` dokończ rejestrację sprzedaży.

**Desktop Chrome/Edge — webcam i odmowa uprawnień**

1. `/shop/verify` → **Skanuj** → wybierz kamerę (webcam po fallbacku `user`).
2. Odśwież stronę, odmów dostępu do kamery — oczekiwany toast „Kamera niedostępna” i komunikat o odmowie uprawnień.
3. Sprawdź banner zachęcający do wpisu ręcznego.

**Fallback ręczny**

1. Zablokuj kamerę lub testuj bez urządzenia wideo.
2. Zakładka **Token** → wklej `QR-TEST-TOKEN-12345678` → weryfikacja i sprzedaż jak po skanie.

### Citizen — widok badań (powiązanie z pozwoleniami)

Widok `/medical-alerts` korzysta wyłącznie z:
- `GET /api/v1/citizen/me/permits` (pełna lista badań per aktywne pozwolenie),
- `GET /api/v1/citizen/me/medical-alerts` (sygnały statusów i komunikaty).

#### Checklist testów manualnych

1. Zaloguj się jako citizen z wieloma aktywnymi pozwoleniami.
2. Wejdź na `/medical-alerts` i potwierdź, że każde aktywne pozwolenie pokazuje dwa wpisy:
   - badanie lekarskie,
   - badanie psychologiczne.
3. Zweryfikuj, że wpis zawiera:
   - numer i typ pozwolenia,
   - datę ważności badania,
   - status (`Aktualne`, `Wygasa`, `Wygasło`, `Brak danych`).
4. Przejdź przyciskiem **Szczegóły** do `PermitDetails` i potwierdź zgodność numeru pozwolenia.
5. Sprawdź zakładki:
   - **Wszystkie** (komplet wpisów),
   - **Do uwagi** (wygasające/wygasłe),
   - **Braki** (puste daty badań).

### Citizen — Moje sprawy -> Promesy (QR flow)

Widok QR dla promes w `Moje sprawy` korzysta z istniejących endpointów citizen:
- `GET /api/v1/citizen/me/promise-applications` (statusy wniosków),
- `GET /api/v1/citizen/me/promises` (wydane promesy z `qrToken`).

#### Checklist testów manualnych

1. Wejdź na `Moje sprawy` i potwierdź, że przycisk **Pokaż kod QR** pojawia się tylko w zakładce **Promesy**.
2. W zakładce **Pozwolenia** potwierdź brak przycisków/CTA związanych z QR promesy.
3. Dla promesy z dostępnym tokenem:
   - kliknij **Pokaż kod QR**,
   - potwierdź otwarcie modala QR i poprawne dane promesy.
4. Dla wniosku o statusie `Approved`, ale bez dostępnej wydanej promesy:
   - potwierdź fallback **QR w przygotowaniu**,
   - potwierdź komunikat informacyjny zamiast pustego modala.
5. Zweryfikuj analogiczne zachowanie w `Szczegóły wniosku` dla typu promesa.
6. Test tablet (np. iPad / DevTools tablet):
   - otwórz modal QR i potwierdź, że header jest stale widoczny (sticky),
   - potwierdź, że body modala przewija się pionowo i żadna sekcja nie jest ucięta.
7. Potwierdź, że content body modala QR ma białe tło (niezależnie od tokenu `bg-background`).
8. Regresja false fallback:
   - jeśli dla danego kontekstu istnieje wydana promesa z `qrToken`, nie powinien pojawić się stan **QR w przygotowaniu**.

### Shop — hard-merge sprzedaży i weryfikacji

Shop używa jednego flow w `\/shop\/sale`:
- krok 1: weryfikacja promesy (`Skanuj`, `Token`, `Numer`),
- krok 2: dane broni (odblokowane wyłącznie po pozytywnej weryfikacji pełnym `qrToken`).

Ścieżka `\/shop\/verify` jest utrzymywana tylko dla kompatybilności i przekierowuje do `\/shop\/sale`.

#### Checklist testów manualnych

1. Shop desktop/mobile: wejście z nawigacji prowadzi tylko do **Sprzedaż** (brak oddzielnej pozycji **Weryfikacja**).
2. Wejdź ręcznie na `\/shop\/verify` i potwierdź redirect do `\/shop\/sale`.
3. W `\/shop\/sale`, krok 1:
   - **Skanuj**: zeskanuj poprawny QR i potwierdź status `Promesa ważna`.
   - **Token**: wprowadź poprawny token i potwierdź przejście do aktywnej sprzedaży.
   - **Numer**: wprowadź numer promesy i potwierdź komunikat, że sprzedaż wymaga pełnego QR.
4. Przed pozytywną weryfikacją po `qrToken`:
   - sekcja **Dane zbywanej broni** nie daje się rozwinąć,
   - pola formularza broni są nieedytowalne.
5. Po pozytywnej weryfikacji po `qrToken`:
   - sekcja **Dane zbywanej broni** odblokowuje się,
   - można wpisać dane i zatwierdzić sprzedaż.
6. Kliknij **Zeskanuj inną promesę** i potwierdź:
   - wyczyszczenie kontekstu sesji,
   - ponowne zablokowanie sekcji danych broni.

---

## Rozwiązywanie problemów

### "Module not found"

```bash
# Wyczyść cache i przeinstaluj
rm -rf node_modules
pnpm install
```

### Stary cache Vite

```bash
rm -rf node_modules/.vite
pnpm dev
```

### MSW nie przechwytuje requestów

1. Sprawdź czy `VITE_USE_MOCKS=true`
2. Sprawdź czy handler jest zarejestrowany w `src/mocks/index.ts`
3. Sprawdź URL w handlerze (musi zawierać pełny path)

### 401 po odświeżeniu

Token wygasł. Wyloguj się i zaloguj ponownie.

### Białe ekrany

1. Otwórz DevTools → Console
2. Sprawdź błędy JavaScript
3. Sprawdź Network na błędy 500

---

## Przydatne komendy

```bash
# Uruchom dev server
pnpm dev

# Build produkcyjny
pnpm build

# Podgląd builda
pnpm preview

# Sprawdź typy TypeScript
npx tsc --noEmit

# Formatowanie (jeśli skonfigurowane)
pnpm format
```

---

## Zasoby

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MSW Documentation](https://mswjs.io/)
- [Lucide Icons](https://lucide.dev/icons/)
