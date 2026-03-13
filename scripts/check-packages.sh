#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

need_cmd pnpm
ensure_root_files

log "Typechecking shared packages"
run_in_root pnpm -r --filter "./packages/*" run typecheck
log "Shared packages passed"
