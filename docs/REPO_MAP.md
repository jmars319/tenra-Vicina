# Repo Map

## Apps

- `apps/webapp`: Next.js application shell and the likely first product surface.
- `apps/desktopapp`: Tauri desktop shell with a React renderer and a minimal Rust host.
- `apps/mobileapp`: Expo-style mobile placeholder wired into the shared workspace packages.

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
- `archive/version-minus-1/`: Archived pre-monorepo prototype material, including the original Vite/Firebase app.
