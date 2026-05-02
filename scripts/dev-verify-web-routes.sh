#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/dev-common.sh"

need_cmd curl

dev_check_url "[verify:web] health" "$(dev_web_health_url)"
dev_check_url "[verify:web] landing" "$(dev_web_url /)"
dev_check_url "[verify:web] nearby" "$(dev_web_url /nearby)"
dev_check_url "[verify:web] create" "$(dev_web_url /create)"
dev_check_url "[verify:web] profile" "$(dev_web_url /profile)"
dev_check_url "[verify:web] signal detail" "$(dev_web_url /signal/seed-coffee)"

log_success "[verify:web] route smoke checks passed"
