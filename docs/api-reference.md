# Referencja API — e-Broń

Base URL: `http://localhost:5000/api/v1`

Wszystkie endpointy (poza `/auth/login`) wymagają nagłówka:
```
Authorization: Bearer <token>
```

---

## Autentykacja

### POST /auth/login

Logowanie do systemu.

**Request:**
```json
{
  "email": "citizen@example.com",
  "password": "Citizen123!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-05-28T10:00:00Z",
  "user": {
    "id": "u-citizen-001",
    "email": "citizen@example.com",
    "role": "Citizen",
    "isActive": true
  }
}
```

### GET /auth/me

Sprawdzenie aktualnej sesji.

**Response 200:**
```json
{
  "id": "u-citizen-001",
  "email": "citizen@example.com",
  "role": "Citizen",
  "isActive": true
}
```

---

## Obywatel (Citizen)

### GET /citizen/me

Profil obywatela.

**Response:**
```json
{
  "id": "cp-001",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "peselMasked": "90010*****",
  "address": "ul. Testowa 1, 00-001 Warszawa",
  "documentNumber": "ABC123456",
  "weaponBookNumber": "WB-2024-00001",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Pozwolenia

#### GET /citizen/me/permits

Lista pozwoleń obywatela.

**Response:**
```json
[
  {
    "id": "permit-001",
    "permitNumber": "POZW-20240501-0001",
    "permitType": "Sport",
    "permitTypeName": "Sport",
    "status": "Active",
    "statusName": "Aktywne",
    "issueDate": "2024-05-01T00:00:00Z",
    "expiryDate": "2029-05-01T00:00:00Z",
    "maxFirearms": 5,
    "usedSlots": 1,
    "availableSlots": 4,
    "isValid": true,
    "medicalExamExpiryDate": "2026-06-15T00:00:00Z",
    "psychologicalExamExpiryDate": "2027-05-01T00:00:00Z"
  }
]
```

---

### Wnioski o pozwolenie

#### GET /citizen/me/permit-applications

Lista wniosków o pozwolenie.

#### POST /citizen/me/permit-applications

Złożenie wniosku o pozwolenie.

**Request:**
```json
{
  "requestedPermitType": "Sport",
  "reason": "Uprawianie sportu strzeleckiego w klubie sportowym.",
  "medicalExamExpiryDate": "2027-05-01",
  "psychologicalExamExpiryDate": "2027-05-01"
}
```

#### PUT /citizen/me/permit-applications/{id}/correction

Uzupełnienie wniosku po wezwaniu WPA.

**Request:** (jak POST)

#### POST /citizen/me/permit-applications/{id}/attachments

Upload załączników (multipart/form-data).

**Form fields:**
- `medicalCertificate` — plik PDF zaświadczenia lekarskiego
- `psychologicalCertificate` — plik PDF zaświadczenia psychologicznego

---

### Wnioski o promesę

#### GET /citizen/me/promise-applications

Lista wniosków o e-promesę.

#### POST /citizen/me/promise-applications

Złożenie wniosku o e-promesę.

**Request:**
```json
{
  "permitId": "permit-001",
  "requestedWeaponType": "Pistolet sportowy 9mm",
  "requestedQuantity": 1
}
```

#### PUT /citizen/me/promise-applications/{id}/correction

Uzupełnienie wniosku.

---

### Promesy

#### GET /citizen/me/promises

Lista aktywnych promes z QR tokenem.

**Response:**
```json
[
  {
    "id": "promise-001",
    "promiseNumber": "PROM-20240515-0001",
    "weaponType": "Pistolet sportowy 9mm",
    "quantity": 2,
    "usedQuantity": 1,
    "remainingQuantity": 1,
    "status": "Active",
    "statusName": "Aktywna",
    "feeAmount": 17.00,
    "paymentStatus": "Paid",
    "paymentStatusName": "Opłacona",
    "qrToken": "QR-TEST-TOKEN-12345678",
    "issueDate": "2024-05-15T00:00:00Z",
    "expiryDate": "2024-08-15T00:00:00Z",
    "isValid": true
  }
]
```

---

### Broń

#### GET /citizen/me/firearms

Lista broni obywatela (paginowana).

**Query params:**
- `page` (default: 1)
- `pageSize` (default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": "firearm-001",
      "brand": "Glock",
      "model": "17 Gen5",
      "category": "B",
      "categoryName": "B",
      "caliber": "9x19mm",
      "serialNumber": "GLOCK-2024-00001",
      "productionYear": 2024,
      "status": "Registered",
      "statusName": "Zarejestrowana",
      "registeredAt": "2024-03-15T10:00:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

#### GET /citizen/me/firearms/{id}

Szczegóły broni z historią właścicieli.

**Response:**
```json
{
  "id": "firearm-001",
  "brand": "Glock",
  "model": "17 Gen5",
  "category": "B",
  "caliber": "9x19mm",
  "serialNumber": "GLOCK-2024-00001",
  "productionYear": 2024,
  "status": "Registered",
  "registeredAt": "2024-03-15T10:00:00Z",
  "ownershipHistory": [
    {
      "id": "hist-001",
      "previousOwnerName": null,
      "newOwnerName": "Jan Kowalski",
      "transferType": "Sale",
      "transferTypeName": "Sprzedaż",
      "transferDate": "2024-03-15T10:00:00Z",
      "notes": "Zakup w sklepie"
    }
  ]
}
```

#### POST /citizen/me/firearms/{id}/report-lost

Zgłoszenie utraty/kradzieży broni.

**Request:**
```json
{
  "description": "Skradziona z samochodu dnia 2026-05-20"
}
```

---

### Transfery

#### GET /citizen/me/transfer-requests

Lista transferów (jako sprzedający lub kupujący).

**Response:**
```json
[
  {
    "id": "transfer-001",
    "firearmId": "firearm-001",
    "firearmDescription": "Glock 17 Gen5, 9x19mm",
    "buyerName": "Anna Nowak",
    "transferType": "Sale",
    "transferTypeName": "Sprzedaż",
    "status": "PendingAcceptance",
    "statusName": "Oczekuje na akceptację",
    "transactionDate": null,
    "createdAt": "2026-05-20T10:00:00Z",
    "isSeller": true,
    "isBuyer": false
  }
]
```

#### POST /citizen/me/transfer-requests

Inicjacja transferu.

**Request:**
```json
{
  "firearmId": "firearm-001",
  "buyerPesel": "85050567890",
  "transferType": "Sale"
}
```

#### POST /citizen/me/transfer-requests/{id}/accept

Akceptacja transferu (tylko kupujący).

#### POST /citizen/me/transfer-requests/{id}/reject

Odrzucenie transferu (tylko kupujący).

#### POST /citizen/me/transfer-requests/{id}/cancel

Anulowanie transferu (tylko sprzedający).

---

### Alerty medyczne

#### GET /citizen/me/medical-alerts

Lista alertów medycznych obywatela.

**Response:**
```json
[
  {
    "id": "alert-001",
    "permitId": "permit-001",
    "permitNumber": "POZW-20240501-0001",
    "alertType": "MedicalExamExpiring",
    "alertTypeName": "Badanie lekarskie wkrótce wygasa",
    "message": "Badanie lekarskie wygasa za 20 dni (pozwolenie POZW-20240501-0001).",
    "dueDate": "2026-06-15T00:00:00Z",
    "isResolved": false,
    "createdAt": "2026-05-25T00:00:00Z"
  }
]
```

---

## Sklep (Shop)

### POST /shop/verify-permit

Weryfikacja promesy przed sprzedażą.

**Request (jedno z dwóch):**
```json
{
  "qrToken": "QR-TEST-TOKEN-12345678"
}
```
lub:
```json
{
  "promiseNumber": "PROM-20240515-0001"
}
```

**Response 200:**
```json
{
  "isValid": true,
  "message": "Weryfikacja zakończona sukcesem",
  "citizenName": "Jan Kowalski",
  "permitNumber": "POZW-20240501-0001",
  "permitType": "Sport",
  "availableSlots": 4,
  "weaponType": "Pistolet sportowy 9mm",
  "remainingPromiseQuantity": 1,
  "promiseExpiryDate": "2024-08-15T00:00:00Z",
  "medicalExamsValid": true
}
```

### POST /shop/firearms/register-sale

Rejestracja sprzedaży broni.

**Request:**
```json
{
  "qrToken": "QR-TEST-TOKEN-12345678",
  "brand": "Glock",
  "model": "17 Gen5",
  "category": "B",
  "caliber": "9x19mm",
  "serialNumber": "GLOCK-2024-00002",
  "productionYear": 2024
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Broń zarejestrowana pomyślnie",
  "firearmId": "firearm-002",
  "registrationNumber": "REJ-20260527-0001"
}
```

---

## WPA (Urzędnik)

### Wnioski o pozwolenie

#### GET /wpa/permit-applications

Lista wniosków o pozwolenie (paginowana).

**Query params:**
- `page`, `pageSize`
- `status` — Submitted, UnderReview, Approved, Rejected, RequiresCorrection

#### GET /wpa/permit-applications/{id}

Szczegóły wniosku.

#### POST /wpa/permit-applications/{id}/mark-under-review

Oznaczenie jako „w trakcie rozpatrzenia".

#### POST /wpa/permit-applications/{id}/approve

Zatwierdzenie wniosku.

**Request:**
```json
{
  "maxFirearms": 5,
  "medicalExamExpiryDate": "2027-05-01",
  "psychologicalExamExpiryDate": "2027-05-01"
}
```

#### POST /wpa/permit-applications/{id}/reject

Odrzucenie wniosku.

**Request:**
```json
{
  "reason": "Brak aktualnego zaświadczenia psychologicznego"
}
```

#### POST /wpa/permit-applications/{id}/require-correction

Wezwanie do uzupełnienia.

**Request:**
```json
{
  "reason": "Proszę załączyć skan dowodu osobistego"
}
```

#### GET /wpa/permit-applications/{applicationId}/attachments/{attachmentId}

Pobranie załącznika (zwraca blob).

---

### Wnioski o promesę

#### GET /wpa/promise-applications

Lista wniosków o promesę (paginowana).

**Query params:**
- `page`, `pageSize`
- `status` — Submitted, Paid, UnderReview, Approved, Rejected, RequiresCorrection

#### GET /wpa/promise-applications/{id}

Szczegóły wniosku.

#### POST /wpa/promise-applications/{id}/mark-under-review

#### POST /wpa/promise-applications/{id}/approve

(bez body — tworzy promesę automatycznie)

#### POST /wpa/promise-applications/{id}/reject

**Request:**
```json
{
  "reason": "Brak wolnych slotów w pozwoleniu"
}
```

#### POST /wpa/promise-applications/{id}/require-correction

**Request:**
```json
{
  "reason": "Proszę doprecyzować typ broni"
}
```

---

### Obywatele

#### GET /wpa/citizens

Lista obywateli (paginowana).

**Query params:**
- `page`, `pageSize`
- `q` — fraza wyszukiwania
- `searchBy` — all, name, pesel, permitNumber
- `permitType` — Sport, Collection, Protection, Hunting, Other
- `hasAlerts` — true/false

**Response:**
```json
{
  "items": [
    {
      "id": "cp-001",
      "userId": "u-citizen-001",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "pesel": "90010112345",
      "address": "ul. Testowa 1, 00-001 Warszawa",
      "documentNumber": "ABC123456",
      "weaponBookNumber": "WB-2024-00001",
      "createdAt": "2024-01-15T10:00:00Z",
      "permits": [
        {
          "permitNumber": "POZW-20240501-0001",
          "permitTypeName": "Sport"
        }
      ],
      "totalFirearms": 1,
      "activeAlerts": 0
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

#### GET /wpa/citizens/{id}

Szczegóły obywatela (pełny PESEL, wszystkie pozwolenia).

---

### Wyszukiwarka broni

#### GET /wpa/firearms

Wyszukiwanie broni w rejestrze.

**Query params:**
- `page`, `pageSize`
- `serialNumber`
- `pesel`
- `permitNumber`
- `permitType`

**Response:**
```json
{
  "items": [
    {
      "id": "firearm-001",
      "brand": "Glock",
      "model": "17 Gen5",
      "category": "B",
      "caliber": "9x19mm",
      "serialNumber": "GLOCK-2024-00001",
      "status": "Registered",
      "ownerName": "Jan Kowalski",
      "ownerPesel": "90010112345",
      "permitNumber": "POZW-20240501-0001",
      "permitType": "Sport",
      "registeredAt": "2024-03-15T10:00:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

---

### Alerty medyczne

#### GET /wpa/medical-alerts

Lista alertów medycznych wszystkich obywateli.

**Query params:**
- `page`, `pageSize`
- `resolved` — true/false

---

### Zarządzanie pozwoleniami

#### POST /wpa/permits/{id}/suspend

Zawieszenie pozwolenia.

**Request:**
```json
{
  "reason": "Wygasłe badanie lekarskie"
}
```

#### POST /wpa/permits/{id}/revoke

Cofnięcie pozwolenia.

**Request:**
```json
{
  "reason": "Wyrok skazujący"
}
```

#### POST /wpa/permits/{id}/restore

Przywrócenie pozwolenia.

**Request:**
```json
{
  "reason": "Badania odnowione"
}
```

#### PATCH /wpa/permits/{id}/medical-exams

Aktualizacja dat badań.

**Request:**
```json
{
  "medicalExamExpiryDate": "2028-05-01",
  "psychologicalExamExpiryDate": "2028-05-01"
}
```

---

## Enumeracje

### UserRole
- `Citizen` — obywatel
- `Shop` — sklep z bronią
- `WpaOfficer` — urzędnik WPA
- `Admin` — administrator

### PermitType
- `Sport` — sportowe
- `Collection` — kolekcjonerskie
- `Protection` — do ochrony
- `Hunting` — myśliwskie
- `Other` — inne

### PermitStatus
- `Active` — aktywne
- `Suspended` — zawieszone
- `Revoked` — cofnięte
- `Expired` — wygasłe

### PermitApplicationStatus / PromiseApplicationStatus
- `Submitted` — złożony
- `Paid` — opłacony (tylko promesa)
- `UnderReview` — w trakcie rozpatrzenia
- `Approved` — zatwierdzony
- `Rejected` — odrzucony
- `RequiresCorrection` — wymaga uzupełnienia

### PromiseStatus
- `Draft`, `Submitted`, `Paid`, `UnderReview`, `Approved`, `Rejected`
- `Active` — aktywna (z QR)
- `Used` — wykorzystana
- `Expired` — wygasła

### FirearmCategory
- `A` — broń zakazana
- `B` — wymagająca pozwolenia
- `C` — podlegająca zgłoszeniu

### FirearmStatus
- `Registered` — zarejestrowana
- `Transferred` — przeniesiona
- `Lost` — zgubiona/skradziona
- `Archived` — zarchiwizowana

### TransferType
- `Sale` — sprzedaż
- `Donation` — darowizna
- `Inheritance` — spadek
- `AdministrativeCorrection` — korekta administracyjna

### TransferRequestStatus
- `PendingAcceptance` — oczekuje na akceptację
- `Accepted` — zaakceptowany
- `Rejected` — odrzucony
- `Cancelled` — anulowany
- `Completed` — zakończony

### MedicalAlertType
- `MedicalExamExpiring` — badanie lekarskie wkrótce wygasa
- `MedicalExamExpired` — badanie lekarskie wygasło
- `PsychologicalExamExpiring` — badanie psych. wkrótce wygasa
- `PsychologicalExamExpired` — badanie psych. wygasło

---

## Paginacja

Wszystkie endpointy listowe zwracają obiekt paginacji:

```json
{
  "items": [...],
  "totalCount": 156,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

**Query params:**
- `page` — numer strony (default: 1)
- `pageSize` — rozmiar strony (default: 20)

---

## Kody błędów

| Kod | Opis |
|-----|------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request — błąd walidacji |
| 401 | Unauthorized — brak/wygasły token |
| 403 | Forbidden — brak uprawnień |
| 404 | Not Found |
| 422 | Unprocessable Entity — błąd logiki biznesowej |
| 500 | Internal Server Error |

**Format błędu:**
```json
{
  "message": "Opis błędu",
  "errors": {
    "fieldName": ["Komunikat walidacji"]
  }
}
```
