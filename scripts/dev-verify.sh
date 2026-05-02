#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/dev-common.sh"

cleanup_dev_verify() {
  if [[ "${DEV_VERIFY_KEEP_RUNNING:-0}" != "1" ]]; then
    dev_stop_web
  fi
}

trap cleanup_dev_verify EXIT

log_step "[verify] stopping any managed web server (safe)"
dev_stop_web

log_step "[verify] starting dev stack"
dev_start_web

log_step "[verify] checking web routes"
run_in_root ./scripts/dev-verify-web-routes.sh

log_step "[verify] restarting dev stack"
dev_stop_web
dev_start_web

log_step "[verify] checking web routes after restart"
run_in_root ./scripts/dev-verify-web-routes.sh

if [[ "${DEV_VERIFY_KEEP_RUNNING:-0}" != "1" ]]; then
  log_step "[verify] stopping dev stack"
  trap - EXIT
  dev_stop_web
fi

log_success "[verify] complete"
