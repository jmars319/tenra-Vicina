# Stability Checklist

- [ ] `pnpm install` completes without dependency errors.
- [ ] `pnpm lint` completes cleanly.
- [ ] `pnpm typecheck` completes cleanly.
- [ ] `pnpm verify:web` completes cleanly.
- [ ] `pnpm verify:desktop` completes cleanly.
- [ ] `pnpm verify:mobile` completes cleanly.
- [ ] Workspace imports resolve inside all three app shells.
- [ ] `apps/webapp` boots locally and the venue check-in/chat loop works.
- [ ] `apps/desktopapp` boots locally when Cargo is available.
- [ ] `apps/mobileapp` can at least typecheck and expose a clear Expo entrypoint.
