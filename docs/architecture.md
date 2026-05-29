# Architektura systemu e-Broń

## Przegląd systemu

**e-Broń** to system informatyczny do cyfrowej obsługi pozwoleń na broń, e-promes i rejestru broni w Polsce. Frontend jest aplikacją SPA (Single Page Application) komunikującą się z backendem .NET przez REST API.

---

## Diagram architektury

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            e-Broń FRONTEND                                   │
│                       React 18 + TypeScript + Vite 6                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                     ROUTING (React Router 7)                          │  │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────────┐   │  │
│   │   │  /citizen │   │  /officer │   │   /shop   │   │/applications/*│   │  │
│   │   │   (7 tras)│   │  (6 tras) │   │  (3 trasy)│   │   (nested)    │   │  │
│   │   └───────────┘   └───────────┘   └───────────┘   └───────────────┘   │  │
│   └───────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                     WARSTWA PREZENTACJI                               │  │
│   │                                                                       │  │
│   │   Layout.tsx ─────────────────────────────────────────────────────────│  │
│   │   ├── Top App Bar (logo, nawigacja, wylogowanie)                      │  │
│   │   ├── WPA Review Bar Portal (kontekstowy dla urzędników)              │  │
│   │   ├── Main Content (Outlet)                                           │  │
│   │   └── Mobile Bottom Nav (nawigacja dolna zależna od roli)             │  │
│   │                                                                       │  │
│   │   Pages (25+ stron) ──────────────────────────────────────────────────│  │
│   │   ├── Dashboards: CitizenDashboard, OfficerDashboard, ShopDashboard   │  │
│   │   ├── Applications: List, Details, Forms (Permit/Promise)             │  │
│   │   ├── Decision: Approve/Reject/Correction workflow                    │  │
│   │   └── WPA: Search, CitizenDetails                                     │  │
│   │                                                                       │  │
│   │   Components (85+ komponentów) ──────────────────────────────────────│  │
│   │   ├── ui/        → shadcn/ui (Radix primitives + Tailwind)            │  │
│   │   ├── wpa/       → Panele recenzji, karty załączników                 │  │
│   │   ├── citizen/   → Drawer transferu, powiadomienia o pozwoleniach     │  │
│   │   └── search/    → Pasek wyszukiwania, filtry                         │  │
│   └───────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                     WARSTWA SERWISÓW                                  │  │
│   │                                                                       │  │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │  │
│   │   │ authService  │  │citizenService│  │ wpaService   │  │shopService│  │  │
│   │   ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────┤  │  │
│   │   │ login()      │  │ getProfile() │  │ getCitizens()│  │ verify() │  │  │
│   │   │              │  │ getPermits() │  │ getApps()    │  │ sale()   │  │  │
│   │   │              │  │ getFirearms()│  │ approve()    │  │          │  │  │
│   │   │              │  │ transfers()  │  │ reject()     │  │          │  │  │
│   │   └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘  │  │
│   │                            │                                          │  │
│   │                            ▼                                          │  │
│   │   ┌───────────────────────────────────────────────────────────────┐   │  │
│   │   │                      api.ts                                   │   │  │
│   │   │   • JWT Bearer auth (localStorage)                            │   │  │
│   │   │   • Automatyczne sprawdzanie wygaśnięcia tokenu               │   │  │
│   │   │   • Auto-redirect na /login przy 401                          │   │  │
│   │   │   • Obsługa FormData dla uploadu plików                       │   │  │
│   │   │   • Base URL: VITE_API_BASE_URL                               │   │  │
│   │   └───────────────────────────────────────────────────────────────┘   │  │
│   └───────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                        ─────────────┼─────────────                           │
│                       │             │             │                          │
│   ┌─────────────────────┐                     ┌─────────────────────┐        │
│   │    MSW (dev mock)   │                     │   Real API (.NET)   │        │
│   │  VITE_USE_MOCKS=true│                     │ VITE_USE_MOCKS=false│        │
│   │  - db.ts in-memory  │                     │ localhost:5000      │        │
│   │  - handlers/*.ts    │                     │ Docker Compose      │        │
│   └─────────────────────┘                     └─────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (.NET 8)                                     │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                     REST API /api/v1/*                              │    │
│   │   ├── /auth          → Login, sesja, JWT                            │    │
│   │   ├── /citizen/me/*  → Profil, pozwolenia, promesy, broń, transfery │    │
│   │   ├── /wpa/*         → Panel urzędnika, wnioski, alerty, obywatele  │    │
│   │   └── /shop/*        → Weryfikacja promesy, rejestracja sprzedaży   │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                     PostgreSQL                                      │    │
│   │   • Users, Citizens, Permits, PermitApplications                    │    │
│   │   • Promises, PromiseApplications, Firearms                         │    │
│   │   • TransferRequests, MedicalAlerts                                 │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Struktura katalogów

```
src/
├── app/
│   ├── components/
│   │   ├── ui/           # shadcn/ui - prymitywy (Button, Card, Dialog, etc.)
│   │   ├── wpa/          # Komponenty dla urzędnika WPA
│   │   ├── citizen/      # Komponenty dla obywatela
│   │   ├── search/       # Komponenty wyszukiwania
│   │   └── Layout.tsx    # Główny layout aplikacji
│   │
│   ├── layouts/
│   │   └── ApplicationsLayout.tsx   # Layout dla zagnieżdżonych tras wniosków
│   │
│   ├── pages/            # Strony przypisane do tras
│   │   ├── LoginPage.tsx
│   │   ├── CitizenDashboard.tsx
│   │   ├── OfficerDashboard.tsx
│   │   ├── ShopDashboard.tsx
│   │   ├── ApplicationsList.tsx
│   │   ├── ApplicationDetails.tsx
│   │   ├── PermitApplicationForm.tsx
│   │   ├── PromiseApplicationForm.tsx
│   │   ├── DecisionPage.tsx
│   │   ├── WeaponRegistry.tsx
│   │   ├── PromisesView.tsx
│   │   ├── TransfersList.tsx
│   │   ├── MedicalAlertsView.tsx
│   │   ├── WPASearchPage.tsx
│   │   ├── CitizenDetailsWPA.tsx
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── layout.ts           # Klasy CSS dla spójnego layoutu
│   │   └── permitEligibility.ts # Logika uprawnień do promesy
│   │
│   ├── App.tsx           # Root component + Toaster
│   └── routes.tsx        # Definicja routera
│
├── services/             # Warstwa komunikacji z API
│   ├── api.ts            # Wrapper fetch + JWT + error handling
│   ├── authService.ts    # Login/logout
│   ├── citizenService.ts # Endpointy /citizen/me/*
│   ├── wpaService.ts     # Endpointy /wpa/*
│   └── shopService.ts    # Endpointy /shop/*
│
├── types/
│   └── api.ts            # Interfejsy TypeScript zgodne z DTO backendu
│
├── mocks/                # MSW - mockowanie API w trybie dev
│   ├── db.ts             # In-memory database
│   ├── handlers/
│   │   ├── auth.ts
│   │   ├── citizen.ts
│   │   ├── wpa.ts
│   │   └── shop.ts
│   ├── browser.ts
│   └── index.ts
│
├── lib/
│   ├── medicalAlerts.ts  # Pomocnicze funkcje dla alertów
│   └── registryNumbers.ts # Generowanie numerów rejestrowych
│
└── main.tsx              # Entry point
```

---

## Przepływ danych

### Autentykacja

```
┌─────────────┐     POST /auth/login      ┌─────────────┐
│  LoginPage  │ ─────────────────────────▶│   Backend   │
│             │                           │             │
│             │◀───────────────────────── │             │
└─────────────┘   { token, expiresAt,     └─────────────┘
       │              user: { role } }
       │
       ▼
┌─────────────────────────────────────┐
│          localStorage               │
│  ├── auth_token                     │
│  ├── auth_token_expiry              │
│  └── userRole                       │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Redirect na dashboard roli      │
│  • Citizen  → /citizen              │
│  • WpaOfficer → /officer            │
│  • Shop → /shop                     │
└─────────────────────────────────────┘
```

### Komunikacja z API

```
┌─────────────┐                          ┌─────────────┐
│   Component │                          │   Backend   │
│  (np. Page) │                          │             │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       │  1. Wywołanie serwisu                  │
       │     citizenService.getPermits()        │
       ▼                                        │
┌─────────────┐                                 │
│   Service   │                                 │
│citizenService│                                │
└──────┬──────┘                                 │
       │                                        │
       │  2. api.get('/citizen/me/permits')     │
       ▼                                        │
┌─────────────┐                                 │
│   api.ts    │                                 │
│  • Dodaje Bearer token                        │
│  • Sprawdza expiry                            │
│  • Obsługuje błędy                            │
└──────┬──────┘                                 │
       │                                        │
       │  3. fetch() ──────────────────────────▶│
       │                                        │
       │◀─────────────────────────────  4. JSON │
       │                                        │
       │  5. Parsowanie + error handling        │
       ▼                                        │
┌─────────────┐                                 │
│  Component  │                                 │
│   setState  │                                 │
└─────────────┘
```

---

## Role i uprawnienia

| Rola | Dashboard | Główne funkcje |
|------|-----------|----------------|
| **Citizen** | `/citizen` | Składanie wniosków, podgląd pozwoleń/promes/broni, transfery |
| **WpaOfficer** | `/officer` | Rozpatrywanie wniosków, wyszukiwanie, alerty medyczne |
| **Shop** | `/shop` | Weryfikacja promesy (QR), rejestracja sprzedaży broni |
| **Admin** | — | Konto administracyjne (pełny dostęp) |

---

## Kluczowe wzorce

### 1. Wrapper API z JWT

```typescript
// src/services/api.ts
function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/';
    throw { message: 'Sesja wygasła' };
  }
  // ...
}
```

### 2. Serwisy domenowe

```typescript
// src/services/citizenService.ts
export const citizenService = {
  async getProfile(): Promise<CitizenProfileDto> {
    return api.get<CitizenProfileDto>('/citizen/me');
  },
  
  async createPermitApplication(data: CreatePermitApplicationRequest): Promise<PermitApplicationDto> {
    return api.post<PermitApplicationDto>('/citizen/me/permit-applications', data);
  },
  // ...
};
```

### 3. Tryb mock (MSW)

```typescript
// Uruchamiany warunkowo w main.tsx
if (import.meta.env.VITE_USE_MOCKS === 'true') {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}
```

### 4. Layout responsywny

```typescript
// src/app/components/Layout.tsx
<nav className="md:hidden fixed bottom-0 ...">
  {/* Mobile bottom navigation */}
</nav>

<nav className="hidden md:flex ...">
  {/* Desktop top navigation */}
</nav>
```

---

## Zależności zewnętrzne

| Kategoria | Biblioteka | Zastosowanie |
|-----------|------------|--------------|
| UI Framework | React 18 | Komponenty, hooks |
| Routing | React Router 7 | SPA routing, nested routes |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Komponenty | shadcn/ui + Radix | Accessible UI primitives |
| Formularze | React Hook Form | Walidacja, stan formularzy |
| Powiadomienia | Sonner | Toast notifications |
| Ikony | Lucide React | Ikony SVG |
| QR | react-qr-code | Generowanie kodów QR |
| Daty | date-fns | Formatowanie dat |
| Mock API | MSW 2 | Mockowanie API w dev |

---

## Środowiska

| Środowisko | API | Mocki | Opis |
|------------|-----|-------|------|
| **Development (mock)** | — | `VITE_USE_MOCKS=true` | Praca bez backendu |
| **Development (API)** | `localhost:5000` | `VITE_USE_MOCKS=false` | Integracja z Docker |
| **Production** | URL backendu | wyłączone | Build produkcyjny |

---

## Bezpieczeństwo

1. **JWT w localStorage** — token przechowywany z datą wygaśnięcia
2. **Automatyczne wylogowanie** — przy 401 Unauthorized
3. **Brak wrażliwych danych w URL** — parametry w body, nie w query string
4. **Role-based routing** — przekierowania na podstawie roli użytkownika
