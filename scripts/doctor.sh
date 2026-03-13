#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
ensure_root_files

log "Running lint"
run_in_root pnpm run lint

log "Running typecheck"
run_in_root pnpm run typecheck

log "Running full verification"
run_in_root pnpm run verify:all

log "Doctor passed"
