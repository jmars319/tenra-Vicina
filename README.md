# Vicina by Tenra

Vicina by Tenra is an experimental local coordination system for seeing what is happening nearby. It is intentionally not a follower feed, popularity platform, or engagement-maximizing social app.

The product direction is web and mobile led for end users, with a desktop surface retained for local review, board import/export, and operator workflows.

## Operational Purpose

- Represent nearby signals with location, time, category, and reviewable context.
- Support lightweight creation and discovery without follower-count mechanics.
- Keep moderation, blocking, reporting, and privacy boundaries visible in the product model.
- Preserve a desktop review surface for local development and operator inspection.

## Design Posture

- Local coordination over social-feed growth mechanics.
- Clear categories and time windows over infinite-scroll ambiguity.
- Privacy and safety boundaries in shared packages rather than ad hoc UI logic.
- Web/mobile as the natural participation surfaces.
- Desktop as an operator and development surface, not the main social product.

## Architecture

```text
apps/
  webapp/       Next.js browser workbench and current primary product surface
  mobileapp/    Expo reserved surface for future location-aware participation
  desktopapp/   Tauri desktop review and local board operations surface

packages/
  domain/       Signal, area, category, and participation models
  api-contracts/ Shared request and response contracts
  validation/   Runtime schemas
  realtime/     Future realtime payloads
  auth/         Auth/session reserved contracts
  geo/          Location-aware helper contracts
  privacy/      Privacy and safe-display boundaries
  ui/           Shared interface primitives
  config/       Product identity and environment helpers

supabase/       Staged persistence schema and seed material
docs/           Developer and handoff documentation
```

## Current State

- The web app owns the current local coordination loop.
- The web workbench uses local signal data while Supabase integration remains staged.
- The mobile app is the intended future participation surface.
- The desktop app supports local review and import/export workflows.
- Earlier product lessons have been folded into the current monorepo docs and package layout; retired source is no longer tracked.

## Deployment Posture

Vicina is a local coordination workbench. The web app can run locally today; a public deployment requires live persistence, location/privacy review, moderation posture, and production environment configuration.

## Working Locally

```bash
pnpm run bootstrap
pnpm run dev:web
pnpm run dev:desktop
pnpm run dev:mobile
pnpm run verify:all
pnpm run doctor
```

The managed dev harness can also run the web workbench with start, status, restart, stop, and verify commands.

## Direction

- Wire real persistence without weakening the local review model.
- Keep social mechanics focused on useful local coordination.
- Harden safety, reporting, and privacy flows before public use.
- Let mobile become the natural participation surface when the core model is ready.

## Related Documentation

- [Web Companion](docs/WEB_MVP.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Repo Map](docs/REPO_MAP.md)
- [Stability Checklist](docs/STABILITY_CHECKLIST.md)
