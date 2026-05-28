## Context

Capability `citizen-medical-view-permit-links` dostarczyła permit-centric listę badań dla aktywnych pozwoleń z statusami `current | expiring | expired | missing`. UI dodało trzy taby filtrujące wpisy **per exam entry**, a następnie grupujące — przez co karta pozwolenia w „Do uwagi” lub „Braki” mogła pokazywać tylko jeden wiersz badania.

Odkrycie produktowe z eksploracji:

- Składanie wniosku (`PermitApplicationForm`) **wymaga** obu załączników — scenariusz „wniosek bez badań” nie występuje w UI.
- Status `missing` = brak `medicalExamExpiryDate` / `psychologicalExamExpiryDate` na **aktywnym** pozwoleniu, nie „nie złożyłem badania”.
- Dashboard już używa `needsExamAttention()` (wszystko poza `current`) do badge na kafelku „Badania”.

Ograniczenie bez zmian: tylko istniejące endpointy `getPermits()` + `getMedicalAlerts()`.

## Goals / Non-Goals

**Goals:**

- Dwa segmenty: pełny obraz (**Wszystkie**) i inbox problemów (**Wymaga uwagi**).
- W segmencie problemów pokazać **całą kartę pozwolenia** z oboma badaniami; status per wiersz pozostaje źródłem prawdy.
- Spójność filtra „wymaga uwagi” z `needsExamAttention` używanym na dashboardzie.
- Zachować istniejące copy dla `missing` (WPA, brak daty w rejestrze) — ewentualnie doprecyzować mikrocopy, bez zmiany znaczenia statusu.

**Non-Goals:**

- Trzeci tab ani osobny flow dla „braków wymagań”.
- Rozszerzenie widoku o nieaktywne pozwolenia lub brak pozwolenia (empty state bez zmian).
- Refaktor całego programu normalizacji tabów (`ui-status-and-tabs-normalization` już objął `AppTabsList`).

## Decisions

1. **Dwie zakładki zamiast trzech**
   - `all` → Wszystkie (bez zmiany zakresu danych).
   - `attention` → Wymaga uwagi: pozwolenia, gdzie `worstExamStatus(group.exams) !== 'current'` (równoważne: jakikolwiek exam z `needsExamAttention`).
   - Usunięcie `missing` jako osobnego tabu.
   - *Alternatywa odrzucona:* chipy zamiast tabów — mniejszy zysk przy już używanym `AppTabsList`.

2. **Filtrowanie po grupie pozwolenia, nie po przyciętych wpisach**
   - Helper np. `filterPermitGroupsNeedingAttention(groups: PermitExamGroup[])` zwraca grupy z co najmniej jednym examem `needsExamAttention`.
   - Karta renderuje **wszystkie** `group.exams` (medical + psychological), nie podzbiór.
   - *Rationale:* użytkownik widzi kontekst pozwolenia; problematyczny wiersz i tak ma badge i blok „Wymagane działanie”.

3. **Liczniki badge na tabach = liczba pozwoleń**
   - „Wszystkie”: `allGroups.length`.
   - „Wymaga uwagi”: `attentionGroups.length` (nie `attentionEntries.length`).
   - *Rationale:* spójne z kartą jako jednostką nawigacji do `PermitDetails`.

4. **Etykieta statusu `missing` bez zmiany klucza**
   - Badge pozostaje **Brak danych**; komunikat o WPA bez sugerowania „nie dołączyłeś badania”.
   - Opcjonalnie podtytuł w empty state zakładki uwagi: rozróżnienie „termin” vs „brak daty w systemie” — tylko jeśli copy review na to pozwoli.
   - *Nie* zmieniamy enum `ExamStatus` w API frontu — tylko prezentacja i filtry.

5. **Sortowanie w zakładce uwagi**
   - Grupy sortowane jak dziś (`groupEntriesByPermit`), najpierw pozwolenia z `expired`, potem `missing`, potem `expiring` (priorytet przez `worstExamStatus` na grupie).
   - *Rationale:* najpilniejsze na górze bez osobnego tabu.

## Risks / Trade-offs

- **[Ryzyko] Użytkownik szukał osobno „tylko braków danych”** → **Mitigacja:** badge „Brak danych” na wierszu + jeden inbox; w przyszłości opcjonalny chip wewnątrz tabu uwagi, jeśli okaże się potrzebny.
- **[Ryzyko] Dłuższe karty w tabie uwagi (dwa wiersze, jeden OK)** → **Mitigacja:** akceptowalne dla czytelności; wiersz `current` bez bloku ostrzeżenia jest wizualnie lżejszy.
- **[Trade-off] Mniej segmentacji niż 3 taby** → **Mitigacja:** zgodność z modelem mentalnym dashboardu i faktycznymi scenariuszami (termin vs luka WPA = oba „wymaga uwagi”).
