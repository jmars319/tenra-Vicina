#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd node
need_cmd pnpm
ensure_root_files

log "Installing workspace dependencies"
run_in_root pnpm install

log "Checking environment placeholders"
run_in_root ./scripts/check-env.sh

if have_cmd cargo; then
  log "Rust toolchain detected: $(cargo --version)"
else
  warn "Cargo was not found. Desktop development will stay unavailable until Rust is installed."
fi

log "Bootstrap complete"
