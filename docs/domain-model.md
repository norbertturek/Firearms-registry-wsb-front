# Model domenowy systemu e-Broń

## Kontekst biznesowy

System **e-Broń** (EWeaponRegistry) to cyfrowa platforma do obsługi procesów związanych z bronią palną w Polsce, zgodnie z **Ustawą o broni i amunicji** (Dz.U. 1999 Nr 53 poz. 549 z późn. zm.).

System obsługuje trzy główne grupy użytkowników:
- **Obywatele** — posiadacze pozwoleń na broń
- **Urzędnicy WPA** — pracownicy Wydziału Postępowań Administracyjnych Policji
- **Sklepy z bronią** — autoryzowani sprzedawcy broni palnej

---

## Główne encje

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MODEL DOMENOWY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌─────────────────────┐
    │   CITIZEN   │────────▶│   PERMIT            │
    │ (Obywatel)  │  1:N    │   (Pozwolenie)      │
    └─────────────┘         └──────────┬──────────┘
          │                            │
          │                            │ 1:N
          │                            ▼
          │                 ┌─────────────────────┐
          │                 │   PROMISE           │
          │                 │   (E-Promesa)       │
          │                 └──────────┬──────────┘
          │                            │
          │                            │ 1:N (wykorzystanie)
          │                            ▼
          │                 ┌─────────────────────┐
          │ 1:N             │   FIREARM           │
          └────────────────▶│   (Broń)            │
                            └──────────┬──────────┘
                                       │
                                       │ N:N (historia)
                                       ▼
                            ┌─────────────────────┐
                            │   TRANSFER          │
                            │   (Transfer)        │
                            └─────────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         WNIOSKI (APPLICATIONS)                          │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │   ┌─────────────────────┐         ┌─────────────────────┐               │
    │   │ PERMIT APPLICATION  │         │ PROMISE APPLICATION │               │
    │   │ (Wniosek o          │         │ (Wniosek o          │               │
    │   │  pozwolenie)        │         │  e-promesę)         │               │
    │   └─────────────────────┘         └─────────────────────┘               │
    │            │                               │                            │
    │            │  Rozpatrywany przez WPA       │                            │
    │            ▼                               ▼                            │
    │   ┌─────────────────────────────────────────────────────────────────┐   │
    │   │                    WPA OFFICER (Urzędnik)                       │   │
    │   │   • Approve → Tworzy Permit/Promise                             │   │
    │   │   • Reject → Kończy proces                                      │   │
    │   │   • RequireCorrection → Odsyła do poprawy                       │   │
    │   └─────────────────────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## Słownik pojęć

### Pozwolenie (Permit)

**Definicja:** Dokument administracyjny uprawniający do posiadania broni określonego typu.

| Pole | Opis |
|------|------|
| `permitNumber` | Unikalny numer pozwolenia (np. `POZW-20240501-0001`) |
| `permitType` | Rodzaj: Sport, Collection, Protection, Hunting, Other |
| `status` | Active, Suspended, Revoked, Expired |
| `maxFirearms` | Maksymalna liczba sztuk broni |
| `usedSlots` | Aktualnie zarejestrowane sztuki |
| `availableSlots` | Wolne miejsca (`maxFirearms - usedSlots`) |
| `medicalExamExpiryDate` | Data ważności badania lekarskiego |
| `psychologicalExamExpiryDate` | Data ważności badania psychologicznego |

**Cykl życia:**

```
PermitApplication     WPA Approve      Badania wygasają
    Submitted  ──────────▶  Active  ─────────▶  Suspended
                              │                    │
                              │                    │ Badania odnowione
                              │                    ▼
                              │◀─────────────  Restored
                              │
                              │  WPA Revoke
                              ▼
                           Revoked (permanentne)
```

---

### E-Promesa (Promise)

**Definicja:** Zezwolenie na zakup konkretnego typu broni, wydawane na podstawie pozwolenia. Ważna 3 miesiące.

| Pole | Opis |
|------|------|
| `promiseNumber` | Unikalny numer promesy (np. `PROM-20240515-0001`) |
| `weaponType` | Typ broni (np. "Pistolet sportowy 9mm") |
| `quantity` | Dozwolona liczba sztuk |
| `usedQuantity` | Wykorzystane sztuki |
| `remainingQuantity` | Pozostałe do wykorzystania |
| `qrToken` | Token QR do weryfikacji w sklepie |
| `expiryDate` | Data wygaśnięcia (3 miesiące od wydania) |

**Cykl życia:**

```
PromiseApplication    WPA Approve     Zakup w sklepie    Wszystkie wykorzystane
    Submitted  ──────────▶  Active  ───────────▶  Active  ─────────▶  Used
                              │         (remainingQuantity--)           │
                              │                                         │
                              │  3 miesiące minęły                      │
                              ▼                                         │
                           Expired ◀────────────────────────────────────┘
```

**Proces zakupu:**

```
┌─────────────┐    QR Token    ┌─────────────┐    Rejestracja    ┌─────────────┐
│  Obywatel   │ ─────────────▶ │    Sklep    │ ────────────────▶ │   System    │
│ (pokazuje   │                │ (weryfikuje │                   │ (rejestruje │
│  QR w apce) │                │  promesę)   │                   │  broń)      │
└─────────────┘                └─────────────┘                   └─────────────┘
```

---

### Broń (Firearm)

**Definicja:** Jednostka broni palnej zarejestrowana w systemie.

| Pole | Opis |
|------|------|
| `brand` | Marka (np. Glock, CZ, Walther) |
| `model` | Model (np. 17 Gen5, P-10 C) |
| `category` | Kategoria: A (zakazana), B (pozwolenie), C (zgłoszenie) |
| `caliber` | Kaliber (np. 9x19mm, .22LR) |
| `serialNumber` | Numer seryjny |
| `productionYear` | Rok produkcji |
| `status` | Registered, Transferred, Lost, Archived |

**Kategorie broni (EU):**

| Kategoria | Opis | Wymagania |
|-----------|------|-----------|
| **A** | Broń zakazana | Wyjątkowe pozwolenia (kolekcjonerzy) |
| **B** | Broń wymagająca pozwolenia | Standard dla większości broni palnej |
| **C** | Broń podlegająca zgłoszeniu | Strzelby gładkolufowe |

---

### Transfer

**Definicja:** Przeniesienie własności broni między obywatelami.

| Pole | Opis |
|------|------|
| `firearmId` | Broń będąca przedmiotem transferu |
| `buyerPesel` | PESEL nabywcy |
| `transferType` | Sale, Donation, Inheritance, AdministrativeCorrection |
| `status` | PendingAcceptance, Accepted, Rejected, Cancelled, Completed |

**Proces transferu:**

```
┌─────────────┐   Inicjuje    ┌─────────────┐   Akceptuje   ┌─────────────┐
│  Sprzedający│ ────────────▶ │   Wniosek   │ ────────────▶ │  Kupujący   │
│  (Seller)   │               │ (Pending)   │               │  (Buyer)    │
└─────────────┘               └─────────────┘               └─────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
             ┌─────────────┐                ┌─────────────┐
             │  Accepted   │                │  Rejected   │
             │  → Completed│                │             │
             └─────────────┘                └─────────────┘
```

**Warunki akceptacji:**
- Kupujący ma aktywne pozwolenie obejmujące kategorię broni
- Kupujący ma wolne sloty w pozwoleniu
- Badania medyczne kupującego są aktualne

---

### Alerty medyczne

**Definicja:** Powiadomienia o zbliżającym się lub przekroczonym terminie ważności badań.

| Typ | Opis | Próg |
|-----|------|------|
| `MedicalExamExpiring` | Badanie lekarskie wkrótce wygasa | 30 dni |
| `MedicalExamExpired` | Badanie lekarskie wygasło | 0 dni |
| `PsychologicalExamExpiring` | Badanie psychologiczne wkrótce wygasa | 30 dni |
| `PsychologicalExamExpired` | Badanie psychologiczne wygasło | 0 dni |

**Konsekwencje wygasłych badań:**
- Pozwolenie może zostać zawieszone
- Niemożliwe akceptowanie transferów
- Sklep widzi `medicalExamsValid: false` przy weryfikacji

---

## Przepływy biznesowe

### 1. Uzyskanie pierwszego pozwolenia

```
1. Obywatel składa wniosek o pozwolenie (PermitApplication)
   └─ Podaje: typ pozwolenia, uzasadnienie
   └─ Załącza: zaświadczenie lekarskie, psychologiczne

2. WPA rozpatruje wniosek
   └─ Weryfikuje dokumenty
   └─ Sprawdza karalność (zewnętrzny system)
   └─ Decyzja: Approve / Reject / RequireCorrection

3. Po zatwierdzeniu → powstaje Permit
   └─ WPA ustala: maxFirearms, daty ważności badań
```

### 2. Zakup broni

```
1. Obywatel (z pozwoleniem) składa wniosek o e-promesę
   └─ Wybiera pozwolenie (permitId)
   └─ Określa: typ broni, ilość

2. WPA rozpatruje → powstaje Promise z QR

3. Obywatel idzie do sklepu, pokazuje QR

4. Sklep weryfikuje promesę (POST /shop/verify-permit)
   └─ Sprawdza: isValid, medicalExamsValid, remainingQuantity

5. Sklep rejestruje sprzedaż (POST /shop/firearms/register-sale)
   └─ Podaje dane broni: brand, model, category, caliber, serialNumber

6. Broń pojawia się w rejestrze obywatela
```

### 3. Sprzedaż broni innemu obywatelowi

```
1. Sprzedający inicjuje transfer
   └─ Podaje PESEL kupującego
   └─ Wybiera typ: Sale / Donation / Inheritance

2. System weryfikuje kupującego
   └─ Ma pozwolenie na tę kategorię?
   └─ Ma wolne sloty?
   └─ Badania aktualne?

3. Kupujący akceptuje lub odrzuca

4. Po akceptacji → broń zmienia właściciela
```

---

## Diagram stanów

### Wniosek o pozwolenie

```
                    ┌───────────────┐
                    │   Submitted   │
                    └───────┬───────┘
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │UnderReview│ │  Approved │ │ Requires  │
        └─────┬─────┘ └───────────┘ │Correction │
              │                     └─────┬─────┘
              │                           │
    ┌─────────┼─────────┐                 │ (poprawka)
    ▼         ▼         ▼                 ▼
┌───────┐ ┌───────┐ ┌────────┐     ┌───────────┐
│Approved│ │Rejected│ │Requires│     │ Submitted │
└───────┘ └───────┘ │Correction│    │  (ponownie)│
                    └──────────┘     └───────────┘
```

### Promesa

```
     ┌───────────┐
     │   Draft   │  (opcjonalne, nie używane w API)
     └─────┬─────┘
           │
           ▼
     ┌───────────┐
     │ Submitted │
     └─────┬─────┘
           │
           ▼
     ┌───────────┐
     │   Paid    │  (mockowane - opłata administracyjna)
     └─────┬─────┘
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
┌───────┐ ┌──────┐ ┌───────────┐
│Approved│ │Reject│ │RequiresCorr│
└───┬───┘ └──────┘ └───────────┘
    │
    ▼
┌───────────┐      ┌───────────┐
│  Active   │─────▶│   Used    │  (remainingQuantity = 0)
└─────┬─────┘      └───────────┘
      │
      │ (3 miesiące)
      ▼
┌───────────┐
│  Expired  │
└───────────┘
```

---

## Reguły biznesowe

1. **Limit broni na pozwolenie** — `usedSlots` nie może przekroczyć `maxFirearms`

2. **Ważność promesy** — 3 miesiące od daty wydania

3. **Aktualne badania** — wymagane do:
   - Aktywnego korzystania z pozwolenia
   - Akceptowania transferów
   - Zakupu broni w sklepie

4. **Transfer wymaga zgodności kategorii** — kupujący musi mieć pozwolenie obejmujące kategorię przenoszonej broni

5. **Utrata broni** — zgłoszenie `report-lost` zmienia status na `Lost` i zwalnia slot w pozwoleniu

6. **Zawieszenie pozwolenia** — blokuje możliwość zakupu i transferu, ale broń pozostaje zarejestrowana
