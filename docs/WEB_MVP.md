# Web MVP

The current product surface is `apps/webapp`.

## Decision

Vicina now starts with a local-first web MVP instead of immediately wiring Firebase or another hosted backend. The web app uses Next.js route handlers under `/api/vicina/*` and a gitignored JSON dev store at `apps/webapp/.data/vicina-dev-store.json`.

This keeps the core user loop testable without credentials:

- Edit a local display name.
- Select a pilot venue in the Innovation Quarter.
- Check in for a 90-minute window.
- Leave the current venue.
- See active presence and expiry timing.
- Send and read venue-scoped messages.

## Why

The archived V-1 app proved the rough Firebase shape, but the new monorepo needed a clean Vicina product loop first. Once the interaction model is stable, the API contracts and validation package give us a narrower backend swap path.

## Run

```bash
pnpm dev:web
```

## Verify

```bash
pnpm verify:web
pnpm doctor
```

## Next Backend Cut

When moving beyond local testing, keep the API routes and replace `apps/webapp/src/lib/vicina-store.ts` with a hosted persistence adapter. The highest-leverage next backend decision is between:

- Firebase: fastest match to V-1 behavior and realtime primitives.
- Supabase/Postgres: better relational model and analytics path if Vicina becomes more than a pilot.
