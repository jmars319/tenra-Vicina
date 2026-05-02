#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
ensure_root_files

log "Starting Vicina mobileapp"
run_in_root pnpm --filter @vicina/mobileapp run dev
