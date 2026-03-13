#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/_common.sh"

ensure_root_files

run_in_root ./scripts/verify-web.sh
run_in_root ./scripts/verify-desktop.sh
run_in_root ./scripts/verify-mobile.sh
