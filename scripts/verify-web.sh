#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
ensure_root_files

log "Verifying Rally webapp"
run_in_root pnpm run check:packages
run_in_root pnpm --filter @rally/webapp run typecheck
run_in_root pnpm --filter @rally/webapp run build
log "Webapp verification passed"
