#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/dev-common.sh"

dev_stop_web
dev_start_web
log_success "[dev-web] restarted"
