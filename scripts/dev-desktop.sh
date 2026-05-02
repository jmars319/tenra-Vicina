#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
need_cmd cargo
ensure_root_files

log "Starting Vicina desktopapp"
run_in_root pnpm --filter @vicina/desktopapp run dev
