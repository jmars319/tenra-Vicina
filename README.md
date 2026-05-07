# Vicina by tenra

Vicina by tenra is an experimental local coordination system for seeing what is happening nearby. It is intentionally not a follower feed, popularity platform, or engagement-maximizing social app.

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
  webapp/       Next.js browser MVP and current primary product surface
  mobileapp/    Expo scaffold for future location-aware participation
  desktopapp/   Tauri desktop review and local board operations surface

packages/
  domain/       Signal, area, category, and participation models
  api-contracts/ Shared request and response contracts
  validation/   Runtime schemas
  realtime/     Future realtime payloads
  auth/         Auth/session placeholders
  geo/          Location-aware helper contracts
  privacy/      Privacy and safe-display boundaries
  ui/           Shared interface primitives
  config/       Product identity and environment helpers

supabase/       MVP schema and seed material
docs/           Developer and handoff documentation
archive/        Retired prototype material
```

## Current State

- The web app owns the current MVP loop.
- The web MVP uses local mock data while Supabase integration remains staged.
- The mobile app is the intended future participation surface.
- The desktop app supports local review and import/export workflows.
- The archived Version -1 prototype is preserved outside the canonical app layout.

## Deployment Posture

Vicina is an experimental product scaffold. The web app can run locally today; a real public deployment requires live persistence, location/privacy review, moderation posture, and production environment configuration.

## Working Locally

```bash
pnpm run bootstrap
pnpm run dev:web
pnpm run dev:desktop
pnpm run dev:mobile
pnpm run verify:all
pnpm run doctor
```

The managed dev harness can also run the web MVP with start, status, restart, stop, and verify commands.

## Direction

- Wire real persistence without weakening the local review model.
- Keep social mechanics focused on useful local coordination.
- Harden safety, reporting, and privacy flows before public use.
- Let mobile become the natural participation surface when the core model is ready.

## Related Documentation

- [Web MVP](docs/WEB_MVP.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Repo Map](docs/REPO_MAP.md)
- [Stability Checklist](docs/STABILITY_CHECKLIST.md)
