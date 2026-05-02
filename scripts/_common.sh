#!/usr/bin/env bash
set -euo pipefail

COMMON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${COMMON_DIR}/.." && pwd)"

source "${COMMON_DIR}/script-utils.sh"

log() {
  log_info "$*"
}

warn() {
  log_warn "$*"
}

fail() {
  log_error "$*"
  exit 1
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

need_cmd() {
  have_cmd "$1" || fail "Missing required command: $1"
}

ensure_root_files() {
  [[ -f "${REPO_ROOT}/package.json" ]] || fail "Expected ${REPO_ROOT}/package.json"
  [[ -f "${REPO_ROOT}/pnpm-workspace.yaml" ]] || fail "Expected ${REPO_ROOT}/pnpm-workspace.yaml"
}

run_in_root() {
  (
    cd "${REPO_ROOT}"
    "$@"
  )
}
