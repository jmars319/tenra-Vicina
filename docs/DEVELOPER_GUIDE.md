# Developer Guide

## Bootstrap

1. Install Node 22 or newer and pnpm.
2. Install Rust and Cargo if you plan to work on `apps/desktopapp`.
3. Run `pnpm bootstrap` from the repo root.
4. Copy `.env.example` to `.env.local` or `.env` when you are ready to wire real services.

## Run Surfaces

- Web: `pnpm dev:web`
- Desktop: `pnpm dev:desktop`
- Mobile: `pnpm dev:mobile`
- Web and desktop together: `pnpm dev:both`

## Verify The Scaffold

- Package checks: `pnpm check:packages`
- Full typecheck: `pnpm typecheck`
- Per-surface verification: `pnpm verify:web`, `pnpm verify:desktop`, `pnpm verify:mobile`
- Whole-repo integrity pass: `pnpm doctor`

## Add A New Shared Package

1. Create a new folder under `packages/`.
2. Match the existing pattern: `package.json`, `tsconfig.json`, and `src/index.ts`.
3. Use an `@vicina/*` package name and keep exports narrow.
4. Add the package as a `workspace:*` dependency only where it is actually consumed.
5. Keep the package TypeScript strict and independently typecheckable.

## Add A New App Surface

1. Create the app under `apps/`.
2. Keep root lifecycle control in `scripts/` rather than inventing separate top-level entrypoints.
3. Wire at least one import from the shared packages to prove workspace resolution.
4. Add a root build or verify command if the new surface changes repo-wide expectations.
5. Keep the desktop app useful for local development and board review, but keep social product depth web/mobile-led unless a desktop-specific workflow is clearly needed.
