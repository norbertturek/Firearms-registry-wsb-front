## Why

UI across list and detail views uses partially inconsistent status labels and tab shells, which makes equivalent states look different and reduces trust in navigation consistency. We need one shared contract for status rendering and tab presentation to keep future AI-generated UI aligned with existing patterns.

## What Changes

- Introduce a centralized status UI mapping used by list/detail screens for consistent label text and badge styling.
- Introduce a shared app-level tabs shell/preset for list-style pages so similar contexts render tabs with the same visual hierarchy.
- Standardize tab triggers via `AppTabTrigger`: icons on list-style tabs, counts in label text (e.g. `Pozwolenia (12)`) instead of separate Badge components.
- Add citizen-only tab-dependent “new application” CTA on `ApplicationsList` (permits vs promises).
- Make header logo + “e-Broń” clickable to role home (`/citizen`, `/officer`, `/shop`).
- Migrate key pages identified in audit (status and tab inconsistencies) to the shared status and tabs primitives.
- Add/update documentation references so agent workflows use the shared mapping/preset by default.

## Capabilities

### New Capabilities
- `ui-status-and-tabs-normalization`: Defines consistent status label/badge rendering and tab-shell behavior across equivalent UI contexts.

### Modified Capabilities
- `shop-qr-scanner`: Clarify consistency expectation that shop-related list/review surfaces follow app-level tab/status rendering conventions where applicable.

## Impact

- Affected frontend code includes status renderers and tab containers in `src/app/pages/*` (notably applications, details, transfers, medical alerts, and related list/review screens).
- New shared UI/helper modules will be added under `src/app/components` and/or `src/app/lib` to avoid duplicate mappings.
- No backend contract changes; scope is UI normalization and rendering consistency only.
