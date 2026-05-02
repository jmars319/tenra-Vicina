# Vicina

Vicina by JAMARQ is an experimental social coordination system for real-time, usually hyperlocal meetups. Its tagline is "Local, live, real." This repository is now a pnpm monorepo scaffold intended for steady, production-minded iteration rather than a one-off prototype layout.

Web is the likely initial primary surface. Desktop and mobile are scaffolded so they stay part of the same development cycle from the start.

## Repo Layout

- `apps/webapp`: Next.js web shell for the likely first production surface.
- `apps/desktopapp`: Vite + React + Tauri desktop shell.
- `apps/mobileapp`: Expo-style mobile placeholder for future iOS and Android work.
- `packages/*`: Shared Vicina packages for domain logic, contracts, validation, realtime, auth, geo, privacy, UI, and config.
- `scripts/`: Root lifecycle commands for bootstrap, development, verification, and environment checks.
- `docs/`: Short operational docs for developers working inside the scaffold.
- `archive/version-minus-1/`: Archived Version -1 prototype material preserved outside the new canonical layout.

## Core Commands

- `pnpm bootstrap`
- `pnpm dev:web`
- `pnpm dev:desktop`
- `pnpm dev:mobile`
- `pnpm dev:both`
- `pnpm verify:all`
- `pnpm doctor`

## Notes

- The archived Version -1 app remains separate from the new scaffold so the repo reads as Vicina rather than as a nested historical artifact.
- Shared workspace imports are wired into all three app shells.
- The current web MVP lives in `apps/webapp` and runs against local Next.js API routes with a gitignored dev store. See `docs/WEB_MVP.md`.
- Node 22 or newer is the baseline.
