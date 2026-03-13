#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
need_cmd cargo
ensure_root_files

log "Verifying Rally desktopapp"
run_in_root pnpm run check:packages
run_in_root pnpm --filter @rally/desktopapp run verify
log "Desktopapp verification passed"
