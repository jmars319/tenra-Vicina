# Repo Map

## Apps

- `apps/webapp`: Primary browser surface and current local coordination workbench for the social coordination product.
- `apps/mobileapp`: Future primary user surface for location-aware participation, posting, and lightweight review.
- `apps/desktopapp`: Desktop development/operator Tauri surface with a React renderer and minimal Rust host. It supports local board review and import/export without making Vicina desktop-first.

## Shared Packages

- `packages/shared-types`: Core shared primitives such as IDs, timestamps, and coordinates.
- `packages/domain`: Vicina meetup lifecycle concepts plus starter venue data translated from Version -1.
- `packages/api-contracts`: Shared request and event contracts.
- `packages/validation`: Runtime parsing and validation helpers.
- `packages/realtime`: Realtime event models for presence and meetup updates.
- `packages/auth`: Session and user-facing auth types.
- `packages/geo`: Location and distance helpers.
- `packages/privacy`: Redaction and coarse-location helpers.
- `packages/ui`: Thin shared design tokens for app shells.
- `packages/config`: Cross-app constants and env key references.

## Operational Areas

- `scripts/`: Root commands for bootstrap, development, package checks, verification, and doctor runs.
- `docs/`: Short reference docs for contributors.
- Earlier product exploration material has been retired from source control; preserve useful lessons in current package docs instead of restoring the old Vite/Firebase app.
