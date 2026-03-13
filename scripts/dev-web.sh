#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
ensure_root_files

log "Starting Rally webapp"
run_in_root pnpm --filter @rally/webapp run dev
