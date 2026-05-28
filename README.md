# e-Broń — Frontend

Interfejs webowy systemu **e-Broń** (EWeaponRegistry) do cyfrowej obsługi pozwoleń na broń, e-promes, rejestru broni oraz procesów administracyjnych WPA i sklepów z bronią.

Aplikacja jest zbudowana jako **SPA** (Single Page Application) i komunikuje się z backendem .NET przez REST API (`/api/v1`).

---

## Spis treści

- [Funkcjonalności](#funkcjonalności)
- [Stack technologiczny](#stack-technologiczny)
- [Architektura projektu](#architektura-projektu)
- [Wymagania](#wymagania)
- [Szybki start](#szybki-start)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Tryb deweloperski: API vs mocki](#tryb-deweloperski-api-vs-mocki)
- [Routing i nawigacja](#routing-i-nawigacja)
- [Konta testowe](#konta-testowe)
- [Build i wdrożenie](#build-i-wdrożenie)
- [Dokumentacja techniczna](#dokumentacja-techniczna)

---

## Funkcjonalności

### Obywatel (`Citizen`)

- Pulpit z pozwoleniami, alertami i skrótami do usług
- Składanie wniosków o **pozwolenie na broń** i **e-promesę**
- Lista spraw (`Moje sprawy`) z wyszukiwaniem i filtrowaniem statusów
- Podgląd aktywnych promes (QR), rejestru broni, transferów
- Alerty medyczne (wygasające badania)
- Uzupełnianie wniosków po wezwaniu WPA do korekty

### Urzędnik WPA (`WpaOfficer`)

- Panel zadaniowy (statystyki, oczekujące wnioski, alerty medyczne)
- Przegląd i rozpatrywanie wniosków (zatwierdzenie / odrzucenie / korekta)
- Wyszukiwarka obywateli i broni w rejestrze
- Szczegóły obywatela z perspektywy WPA

### Sklep (`Shop`)

- Weryfikacja promesy i uprawnień nabywcy
- Rejestracja sprzedaży broni

---

## Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Framework UI | React 18 |
| Język | TypeScript |
| Bundler | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 |
| Komponenty | shadcn/ui, Radix UI |
| Ikony | Lucide React |
| Formularze | React Hook Form |
| Powiadomienia | Sonner |
| Mocki (dev) | MSW 2 |
| Package manager | pnpm |

---

## Architektura projektu

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            e-Broń FRONTEND                                   │
│                       React 18 + TypeScript + Vite 6                         │
├──────────────────────────────────────────────────────────────────────────────┤
│   ROUTING (React Router 7)                                                   │
│   ├── /citizen/*     → Panel obywatela (7 tras)                              │
│   ├── /officer/*     → Panel urzędnika WPA (6 tras)                          │
│   ├── /shop/*        → Panel sklepu (3 trasy)                                │
│   └── /applications/* → Wnioski (nested layout)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│   WARSTWA PREZENTACJI                                                        │
│   ├── Layout.tsx     → App shell (top bar, bottom nav, portal WPA)           │
│   ├── pages/         → 25+ stron przypisanych do tras                        │
│   └── components/    → 85+ komponentów (ui/, wpa/, citizen/, search/)        │
├──────────────────────────────────────────────────────────────────────────────┤
│   WARSTWA SERWISÓW                                                           │
│   ├── api.ts         → Wrapper fetch + JWT + error handling                  │
│   ├── authService    → Login/logout                                          │
│   ├── citizenService → /citizen/me/* endpoints                               │
│   ├── wpaService     → /wpa/* endpoints                                      │
│   └── shopService    → /shop/* endpoints                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│   TRYB DEV                                                                   │
│   ├── MSW (VITE_USE_MOCKS=true)  → Praca bez backendu                        │
│   └── Real API (VITE_USE_MOCKS=false) → Integracja z Docker                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│   BACKEND (.NET 8 + PostgreSQL)    │    REST API /api/v1/*                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Struktura katalogów

```
src/
├── app/
│   ├── components/     # Layout, komponenty UI (shadcn), widgety domenowe
│   ├── layouts/        # Layouty tras zagnieżdżonych (np. Moje sprawy)
│   ├── pages/          # Ekrany przypisane do tras
│   ├── utils/          # Narzędzia pomocnicze (layout, eligibility)
│   ├── App.tsx         # Root + Toaster
│   └── routes.tsx      # Definicja routera
├── services/           # Klient HTTP i serwisy API (auth, citizen, wpa, shop)
├── types/              # Typy DTO zgodne z kontraktem backendu
├── mocks/              # Handlery MSW do pracy offline
├── lib/                # Biblioteki pomocnicze
└── main.tsx            # Entry point

docs/                   # Dokumentacja techniczna projektu
public/                 # Statyczne assety, service worker MSW
```

Warstwa `services/` opakowuje `fetch` z obsługą JWT (`Authorization: Bearer`), wygaśnięcia sesji (401) i wspólnego base URL z `VITE_API_BASE_URL`.

Szczegółowa dokumentacja architektury: [`docs/architecture.md`](docs/architecture.md)

---

## Wymagania

- **Node.js** 18 lub nowszy
- **pnpm** (zalecany menedżer pakietów projektu)
- **Backend EWeaponRegistry** — repozytorium `Firearms-registery-WSB`, domyślnie `http://localhost:5000`

---

## Szybki start

### 1. Uruchom backend

W repozytorium backendu (Docker):

```bash
docker compose up -d
```

API powinno być dostępne pod adresem `http://localhost:5000/api/v1`.

### 2. Uruchom frontend

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Aplikacja: **http://localhost:5173**

> W pliku `.env.development` domyślnie ustawiono `VITE_USE_MOCKS=false`, aby logowanie i dane szły do prawdziwego API w Dockerze.

---

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` (oraz opcjonalnie dostosuj `.env.development`):

| Zmienna | Opis | Domyślnie |
|---------|------|-----------|
| `VITE_API_BASE_URL` | Bazowy URL REST API | `http://localhost:5000/api/v1` |
| `VITE_USE_MOCKS` | Włącza MSW w dev (`true` / `false`) | `false` w `.env.development` |
| `VITE_SHOW_QUICK_LOGIN` | Kafelki szybkiego logowania na stronie logowania | `true` |

Przykład `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SHOW_QUICK_LOGIN=true
```

---

## Tryb deweloperski: API vs mocki

| Tryb | Konfiguracja | Kiedy używać |
|------|--------------|--------------|
| **Prawdziwe API** | `VITE_USE_MOCKS=false` | Pełna integracja z backendem i seedem bazy |
| **Mocki MSW** | `VITE_USE_MOCKS=true` | Praca bez Dockera, szybkie prototypowanie UI |

Po zmianie zmiennych środowiskowych **zrestartuj** serwer Vite (`pnpm dev`).

---

## Routing i nawigacja

Trasy pogrupowane według obszaru aplikacji. Wszystkie ekrany (poza logowaniem) renderowane są w wspólnym `Layout` z górnym paskiem i dolną nawigacją mobilną.

### Logowanie

| Trasa | Opis |
|-------|------|
| `/` | Strona logowania (email + hasło, opcjonalnie szybkie logowanie testowe) |

Po zalogowaniu użytkownik trafia na pulpit zależny od roli (`Citizen` → `/citizen`, `WpaOfficer` → `/officer`, `Shop` → `/shop`).

### Pulpity

| Trasa | Rola | Opis |
|-------|------|------|
| `/citizen` | Obywatel | Pulpit obywatela — pozwolenia, skróty usług, ostatnie wnioski |
| `/officer` | Urzędnik WPA | Panel urzędnika — statystyki, oczekujące wnioski, alerty medyczne |
| `/shop` | Sklep | Pulpit sklepu — skróty do weryfikacji i sprzedaży |

### Obywatel — wnioski i sprawy

| Trasa | Opis | Aktywna zakładka |
|-------|------|------------------|
| `/application/new` | Wybór typu nowego wniosku (pozwolenie / promesa) | **Nowy** |
| `/applications` | Lista spraw (`Moje sprawy`) z wyszukiwarką i filtrami | **Wnioski** |
| `/applications/new/permit` | Formularz wniosku o pozwolenie na broń | **Wnioski** |
| `/applications/new/promise` | Formularz wniosku o e-promesę | **Wnioski** |
| `/applications/:id` | Szczegóły wniosku | **Wnioski** |
| `/applications/:id/correction` | Uzupełnienie wniosku po wezwaniu WPA | **Wnioski** |

Ekran wyboru typu (`/application/new`) jest **osobną trasą** — po kliknięciu pozwolenia lub promesy przechodzisz do formularza pod `/applications/new/*`, gdzie aktywna jest zakładka **Wnioski**.

### Obywatel — pozwolenia, promesy i broń

| Trasa | Opis |
|-------|------|
| `/permits/:id` | Szczegóły pozwolenia (ważność, sloty, powiązane promesy) |
| `/promises` | Aktywne e-promesy z kodem QR |
| `/weapons` | Rejestr posiadanej broni |
| `/transfers` | Transfery własności między obywatelami |
| `/medical-alerts` | Alerty medyczne (wygasające badania) |

### Urzędnik WPA

| Trasa | Opis |
|-------|------|
| `/applications` | Przegląd wniosków w systemie (lista wspólna, widok oficerski) |
| `/applications/:id` | Szczegóły wniosku do rozpatrzenia |
| `/decision/:id` | Formularz decyzji (zatwierdzenie / odrzucenie / korekta) |
| `/wpa/search` | Wyszukiwarka obywateli i broni |
| `/wpa/citizens/:id` | Profil obywatela z perspektywy WPA |
| `/weapons` | Rejestr broni (widok oficerski) |

### Sklep

| Trasa | Opis |
|-------|------|
| `/shop/verify` | Weryfikacja promesy i uprawnień nabywcy |
| `/shop/sale` | Rejestracja sprzedaży broni |

### Nawigacja mobilna (obywatel)

| Zakładka | Trasa docelowa | Kiedy aktywna |
|----------|----------------|---------------|
| **Pulpit** | `/citizen` | Tylko pulpit obywatela |
| **Wnioski** | `/applications` | Lista spraw, formularze i szczegóły pod `/applications/*` |
| **Broń** | `/weapons` | Rejestr broni |
| **Nowy** | `/application/new` | Wyłącznie ekran wyboru typu wniosku |

---

## Konta testowe

Dane seedowane przez backend w środowisku **Development** (Docker):

| Rola | Email | Hasło | Uwagi |
|------|-------|-------|-------|
| Obywatel | `citizen@example.com` | `Citizen123!` | Konto z przykładowymi danymi (pozwolenie, broń, promesa) |
| Obywatel (puste) | `joanna.dymna@example.com` | `Citizen123!` | Puste konto do testów „od zera” |
| Urzędnik WPA | `officer@example.com` | `Officer123!` | Rozpatrywanie wniosków |
| Sklep | `shop@example.com` | `Shop123!` | Weryfikacja i sprzedaż |
| Admin | `admin@example.com` | `Admin123!` | Konto administracyjne |

Przy `VITE_SHOW_QUICK_LOGIN=true` na stronie logowania dostępne są skróty do wybranych kont testowych.

---

## Build i wdrożenie

### Build produkcyjny

```bash
pnpm build
```

Artefakty trafiają do katalogu `dist/`.

### Vercel

Projekt zawiera `vercel.json` z rewrite SPA — wszystkie ścieżki kierowane są na `index.html`.

Na produkcji ustaw:

- `VITE_API_BASE_URL` — URL wdrożonego backendu
- `VITE_USE_MOCKS=false` (lub pomiń — mocki działają tylko w `import.meta.env.DEV`)
- `VITE_SHOW_QUICK_LOGIN=false` — ukrycie kont testowych

---

## Dokumentacja techniczna

Szczegółowe materiały w katalogu `docs/`:

### Architektura i model domenowy

- [`architecture.md`](docs/architecture.md) — diagram architektury, struktura katalogów, przepływ danych
- [`domain-model.md`](docs/domain-model.md) — model domenowy, słownik pojęć, przepływy biznesowe
- [`api-reference.md`](docs/api-reference.md) — pełna referencja REST API z przykładami
- [`development-guide.md`](docs/development-guide.md) — przewodnik dla deweloperów

### Dokumentacja integracji (z okresu implementacji)

- `ui-api-verification.md` — mapowanie ekranów na endpointy API
- `flow-comparison.md` — porównanie flow biznesowych
- `complete-flow-coverage-analysis.md` — pokrycie scenariuszy
- `field-mapping-reference.md` — mapowanie pól formularzy

---

## Powiązane repozytoria

| Repozytorium | Opis |
|--------------|------|
| **Firearms-registery-WSB** | Backend .NET 8, PostgreSQL, Docker Compose, seed danych testowych |

---

Projekt realizowany w ramach studiów WSB — system demonstracyjny procesów rejestracji broni i obsługi pozwoleń w Polsce.
