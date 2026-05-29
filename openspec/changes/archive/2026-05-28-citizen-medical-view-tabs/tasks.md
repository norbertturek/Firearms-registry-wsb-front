## 1. Filtering helpers

- [x] 1.1 Add `filterPermitGroupsNeedingAttention(groups)` (or equivalent) in `src/lib/permitExams.ts` using `needsExamAttention` / `worstExamStatus` per group
- [x] 1.2 Ensure group sort in attention list prioritizes worse group status (expired → missing → expiring) without changing `groupEntriesByPermit` contract for the full list

## 2. MedicalAlertsView tabs

- [x] 2.1 Replace three tabs (`all` / `attention` / `missing`) with two: **Wszystkie** and **Wymaga uwagi**
- [x] 2.2 Wire attention tab to full permit groups from `allGroups` filtered by attention helper (not entry-filtered subsets)
- [x] 2.3 Update tab badges to count permit groups; remove `missing` tab state, content, and empty state
- [x] 2.4 Update attention-tab empty state copy (no references to a separate "Braki" tab)

## 3. Copy and consistency

- [x] 3.1 Verify `PermitExamStatusRow` / `ExamStatusBadge` copy for `missing` stays registry-focused (WPA, brak daty) — adjust microcopy only if needed
- [x] 3.2 Confirm dashboard `CitizenMedicalNavIcon` attention semantics still match medical view attention tab filter

## 4. Verification

- [x] 4.1 Manual check: permit with mixed statuses (one current, one expiring) shows both rows on attention tab
- [x] 4.2 Manual check: permit with only `missing` data appears on attention tab, not on a removed third tab
- [x] 4.3 Manual check: zero active permits still shows existing empty state (unchanged)
- [x] 4.4 No new API calls or backend contract changes
