#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
need_cmd cargo
ensure_root_files

log "Starting webapp and desktopapp together"
run_in_root pnpm exec concurrently \
  --names web,desktop \
  --prefix-colors blue,green \
  "pnpm run dev:web" \
  "pnpm run dev:desktop"
