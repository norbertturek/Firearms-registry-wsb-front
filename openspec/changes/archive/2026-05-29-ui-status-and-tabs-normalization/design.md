## Context

The app already has strong primitive-level consistency (`Button`, `Tabs`, `Card`) but page-level implementations diverged in two high-impact places: status wording and tab shell styling. The audit confirms user-visible inconsistencies between equivalent screens (`ApplicationsList`, `ApplicationDetails`, `TransfersList`, `MedicalAlertsView`) and flags maintenance risk for AI-generated edits that bypass shared patterns.

This change is cross-cutting because it touches shared UI contracts and multiple pages at once. The goal is to normalize without changing backend behavior.

## Goals / Non-Goals

**Goals:**
- Introduce one source of truth for status label + badge presentation.
- Introduce one reusable tabs shell preset for list/review contexts.
- Migrate key pages with known inconsistencies to these shared contracts.
- Ensure future UI work can reuse the same conventions by default.

**Non-Goals:**
- No API or domain status model changes.
- No redesign of unrelated surfaces (forms, drawers, scanner internals).
- No full typography/CTA program in this change (covered by later roadmap steps).

## Decisions

1. **Central status mapping helper**
   - Create a shared module (e.g. `src/app/lib/statusUi.ts` or equivalent) mapping status keys to:
     - normalized label,
     - badge variant/class semantics.
   - Reuse in list/detail pages instead of local `switch` renderers.
   - Alternative rejected: keep local maps with copy/paste synchronization (high drift risk).

2. **App-level tabs shell preset**
   - Introduce reusable tabs wrapper/preset class for multi-segment lists with consistent spacing and visual hierarchy.
   - Introduce `AppTabTrigger` for list/review tabs: optional Lucide icon, label with in-text count (`formatTabLabel`), `rounded-xl text-xs sm:text-sm`.
   - Tab segment counts SHALL appear in the label text, not as separate Badge chips on triggers.
   - Existing `Tabs` primitive remains unchanged; the preset is composition-level to avoid breaking all tabs use-cases.
   - Alternative rejected: force one style directly inside base `TabsList` (too invasive).

3. **Targeted page migration first**
   - Migrate the high-priority pages found in audit:
     - `ApplicationsList`,
     - `ApplicationDetails`,
     - `TransfersList`,
     - `MedicalAlertsView`,
     - `OfficerDashboard`,
     - `WPASearchPage`.
   - This gives visible consistency gains while keeping rollout risk manageable.

4. **Citizen applications CTA**
   - On `ApplicationsList`, citizens see a tab-dependent primary action below tabs: new permit vs new promise (respecting `canApplyForPromise` / disabled state when promise not allowed).
   - WPA officer view on the same route does not show this CTA.

5. **Header home navigation**
   - Logo + “e-Broń” in `Layout` navigate to the current role’s dashboard path.

## Risks / Trade-offs

- **[Risk] Label normalization can conflict with business wording expectations** → Mitigation: define explicit canonical wording in helper and confirm usage in affected pages before broader rollout.
- **[Risk] Tabs preset may not fit every screen density** → Mitigation: expose a minimal override surface (className extension) while keeping core shape fixed.
- **[Risk] Partial migration leaves temporary inconsistency** → Mitigation: scope this change to all known high-priority pages in one pass and document follow-up pages in tasks.
