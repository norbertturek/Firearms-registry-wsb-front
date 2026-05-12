Dobra — poniżej masz **gotowe, uporządkowane podsumowanie projektu** w formie, którą możesz wkleić do dokumentacji albo wykorzystać do Figmy / prezentacji.

👉 To jest dokładnie:

* co projektujesz
* jakie są wymagania
* jakie masz ograniczenia (gov + WCAG)
* co MUSI się znaleźć w UI

---

# 🧠 1. CEL PROJEKTU

Projekt:
👉 **Digitalizacja legitymacji posiadania broni (system administracyjny)**

Cel:

* cyfryzacja procesu:

  * uzyskania pozwolenia
  * zakupu
  * rejestracji broni
* skrócenie czasu decyzji
* integracja danych między interesariuszami

---

# 🧑‍🤝‍🧑 2. INTERESARIUSZE (kluczowe dla UI)

## 👤 Użytkownik (obywatel)

* składa wnioski
* sprawdza status
* zarządza bronią

---

## 🏛️ Organ (Policja – WPA)

* rozpatruje wnioski
* wydaje decyzje
* prowadzi rejestr

---

## 🏪 Sklep

* weryfikuje promesę
* zgłasza sprzedaż

---

👉 UI musi mieć **3 różne widoki / dashboardy**

---

# 🔁 3. GŁÓWNY PROCES (core systemu)

To jest fundament Twojego projektu:

```
1. Logowanie (login.gov.pl)
2. Złożenie wniosku
3. Weryfikacja (urzędnik)
4. Decyzja administracyjna
5. Promesa (zgoda na zakup)
6. Zakup broni (sklep)
7. Rejestracja broni
```

👉 wszystko co projektujesz musi wspierać ten flow

---

# 📱 4. ZAKRES UI – CO MASZ ZAPROJEKTOWAĆ

## 🔴 Ekrany (MUST)

### 🔐 Autoryzacja

* ekran logowania:

  * „Zaloguj przez login.gov.pl”

---

### 🏠 Dashboard (3 role)

* użytkownik
* urzędnik
* sklep

---

### 📄 Wnioski

* lista wniosków
* szczegóły
* status

---

### 📝 Formularze (KLUCZOWE)

* wniosek o pozwolenie
* rejestracja broni
* wyrejestrowanie

---

### ⚖️ Decyzja (urzędnik)

* zatwierdź
* odrzuć
* uzasadnienie

---

### 🔫 Rejestr broni

* lista
* szczegóły

---

### 🏪 Sklep

* weryfikacja promesy
* zgłoszenie sprzedaży

---

# 🎯 5. WYMAGANIA GOV (UI/UX)

👉 to NIE są „ładne zasady” — to standard administracji

## 📌 Charakter UI:

* prosty
* tekstowy
* przewidywalny
* bez „designerskich eksperymentów”

---

## 📱 Layout:

* mobile-first
* duże elementy (touch)
* max prostota

---

## 🧭 Nawigacja:

* max 3 poziomy
* brak ukrytych funkcji

---

## 🔘 Komponenty:

* formularze (label + input + error)
* listy
* statusy
* CTA (Złóż wniosek, Wyślij, Zatwierdź)

---

# ♿ 6. WCAG 2.1 AA – CO DOTYCZY TWOJEGO UI

👉 To jest wymagane prawnie w Polsce dla systemów publicznych ([accens.pl][1])

👉 standard zawiera ~47 kryteriów ([Kreatik][2])

---

## 🔴 TO MUSISZ ZAPROJEKTOWAĆ (UI responsibility)

### 1. Formularze

* label nad polem
* komunikaty błędów
* instrukcje

👉 wymagane przez WCAG ([Recite Me][3])

---

### 2. Kontrast

* min. 4.5:1 dla tekstu ([Recite Me][3])

---

### 3. Struktura

* nagłówki (H1, H2, H3)
* logiczny układ

---

### 4. Focus (!!!)

* widoczny stan aktywny

---

### 5. Czytelność

* font min. 14–16 px
* spacing

---

### 6. Komunikaty

* zrozumiałe
* bez kodów błędów

---

### 7. Nawigacja

* przewidywalna
* bez ukrytych elementów

---

## ❌ NIE ROBISZ (dev robi)

* aria-label
* screen reader
* semantyka HTML

---

# 🎨 7. DESIGN SYSTEM (DO FIGMY)

## 🔤 Typografia

* H1: 24–32 px
* H2: 20–24 px
* H3: 16–20 px
* body: 16 px

---

## 🎨 Kolory

* tekst: #1A1A1A
* tło: #FFFFFF
* primary: #005EA5
* border: #DADADA

---

## 📏 Spacing

* grid: 8px
* sekcja: 24px
* padding: 16px

---

## 🔘 Komponenty

* input: min 44px
* button: min 44px

---

# 🔐 8. WYMAGANIA SYSTEMOWE (wpływ na UI)

## 🔑 Logowanie

* login.gov.pl (MUST)

---

## 🔒 Dane wrażliwe

* PESEL
* adres
* dowód

👉 UI:

* maskowanie danych
* komunikaty bezpieczeństwa

---

## 📊 Statusy

* w trakcie
* zaakceptowany
* odrzucony

---

# 🧭 9. FLOW UI (co masz pokazać na projekcie)

## 🎯 MAIN FLOW

```
Login
↓
Dashboard
↓
Złóż wniosek
↓
Formularz
↓
Wysłanie
↓
Status
↓
Decyzja
↓
Promesa
↓
Zakup
↓
Rejestracja broni
```

---

# 🚫 10. OGRANICZENIA (bardzo ważne)

## ❌ NIE możesz:

* robić fancy UI
* używać małego tekstu
* ukrywać funkcji
* używać samego koloru jako informacji

---

## ❌ NIE jest wymagane:

* dark mode
* animacje
* custom UX

---

# ✅ 11. CO ODDAJESZ (idealny projekt)

## 📦 Final deliverables:

### 1. Ekrany

* wszystkie role
* wszystkie flow

---

### 2. Design system

* komponenty
* typografia
* kolory

---

### 3. Flow

* user flow
* system flow (mermaid)

---

### 4. Accessibility

* pokazane:

  * focus
  * error
  * kontrast

---

# 🚀 NAJWAŻNIEJSZE PODSUMOWANIE

👉 To NIE jest aplikacja mobilna
👉 To jest **system administracyjny**

---

## Jedno zdanie, które definiuje projekt:

👉
**„Prosty, dostępny system workflow do obsługi decyzji administracyjnych zgodny z WCAG i standardami gov.pl”**

---

Jeśli chcesz, mogę Ci teraz zrobić:

* gotowy **layout Figmy (screen po screenie)**
* albo **kompletny UI kit gov (komponenty + style)**
* albo **opis projektu do oddania (na 5)**

[1]: https://accens.pl/blog/en/digital-accessibility-legal-regulations/?utm_source=chatgpt.com "Digital accessibility - legal regulations"
[2]: https://kreatik.pl/en/blog-a-digital-world-without-barriers-why-is-accessibility-a-must/?utm_source=chatgpt.com "Digital accessibility is not just about contrast and font ..."
[3]: https://reciteme.com/news/european-accessibility-act-in-poland/?utm_source=chatgpt.com "European Accessibility Act in Poland | EAA Compliance"
