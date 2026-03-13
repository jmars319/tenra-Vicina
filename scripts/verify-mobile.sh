#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
ensure_root_files

log "Verifying Rally mobileapp placeholder"
run_in_root pnpm run check:packages
run_in_root pnpm --filter @rally/mobileapp run typecheck
run_in_root pnpm --filter @rally/mobileapp run build
log "Mobileapp verification passed"
