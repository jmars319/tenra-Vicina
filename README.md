# Vicina

Vicina by JAMARQ is an experimental hyperlocal coordination app for seeing
what is happening nearby right now. Its tagline is "What's happening nearby."
The product is intentionally not a traditional feed, follower, or popularity
platform.

## Repo Layout

- `apps/webapp`: Next.js web shell for the likely first production surface.
- `apps/desktopapp`: Vite + React + Tauri desktop shell.
- `apps/mobileapp`: Expo React Native MVP scaffold with Expo Router.
- `packages/*`: Shared Vicina packages for domain logic, contracts, validation, realtime, auth, geo, privacy, UI, and config.
- `supabase/`: SQL migration and seed data for the mobile MVP backend.
- `scripts/`: Root lifecycle commands for bootstrap, development, verification, and environment checks.
- `docs/`: Short operational docs for developers working inside the scaffold.
- `archive/version-minus-1/`: Archived Version -1 prototype material preserved outside the new canonical layout.

## Install

Use Node 22 or newer.

```bash
pnpm install
```

Useful commands:

```bash
pnpm dev:mobile
pnpm verify:mobile
pnpm typecheck
pnpm lint
pnpm doctor
```

## Mobile MVP

The mobile scaffold uses:

- Expo React Native with TypeScript and Expo Router
- Supabase auth, Postgres, realtime-ready tables, storage-ready project setup, and RLS
- Zod validation through `@vicina/validation`
- TanStack Query for server state
- Seed fallback data so the nearby feed and detail routes render before Supabase is configured

Routes:

- `/auth`
- `/(tabs)/nearby`
- `/(tabs)/create`
- `/(tabs)/profile`
- `/signal/[id]`
- `/settings`

## Supabase Setup

1. Create a Supabase project at `supabase.com`.
2. Copy `.env.example` to `.env`.
3. Paste your project values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. Install and authenticate the Supabase CLI if needed.
5. Link the project and run migrations:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For local Supabase:

```bash
supabase start
supabase db reset
```

`supabase/seed.sql` creates local seed users and active signals for development.
The mobile app also has a TypeScript seed fallback in
`apps/mobileapp/src/data/seedSignals.ts` so the feed renders without a backend.

## Database Schema

The MVP migration lives at
`supabase/migrations/20260502120000_vicina_mvp.sql` and creates:

- `profiles`
- `signals`
- `signal_interests`
- `signal_comments`
- `user_blocks`
- `reports`

The schema includes UUID primary keys, `created_at` and `updated_at`, safe
defaults, indexes for active signal lookup and latitude/longitude bounding-box
queries, and RLS policies for authenticated ownership. Anonymous users can read
visible, active, unexpired signals. Authenticated users can create and manage
only their own signals, interests, comments, reports, and blocks.

## Run Expo

```bash
pnpm dev:mobile
```

The app launches with seed data if Supabase env vars are absent. Live posting,
replying, reporting, and blocking require Supabase auth.

## MVP Limitations

- Nearby search is intentionally geospatial-ish: latitude/longitude indexes plus
  app-side radius filtering. PostGIS can replace this when the product needs it.
- Display names are minimal and profile editing is not fully built.
- Realtime subscriptions and storage upload flows are not wired yet, though the
  Supabase stack and schema leave room for them.
- Moderation is foundational only: report, block, and content status fields.

## Safety And Privacy

- Vicina never displays exact coordinates publicly.
- The mobile app rounds coordinates before sending them.
- Public UI uses approximate labels such as "near Downtown" or "within 2 miles."
- No likes, follower counts, popularity ranking, or infinite-scroll engagement
  mechanics are included.
- Comments/replies live only inside a signal thread.

## Smoke Checklist

- Auth screen renders at `/auth`.
- Nearby tab renders seeded active signals.
- Radius controls support 1, 3, 5, and 10 miles.
- Create signal form rejects missing title/description and expiration over 24 hours.
- Signal detail renders approximate area, time, expiration, interest count, and thread.
- Profile tab renders signed-out and signed-in states.
- No exact latitude/longitude is displayed in public UI.
- `pnpm verify:mobile` passes.

## Notes

- The archived Version -1 app remains separate from the new scaffold so the repo reads as Vicina rather than as a nested historical artifact.
- Shared workspace imports are wired into all three app shells.
- The current web MVP lives in `apps/webapp` and runs against local Next.js API routes with a gitignored dev store. See `docs/WEB_MVP.md`.
