#!/usr/bin/env bash

# Copy this file to .dev/dev-config.sh for local overrides:
#   mkdir -p .dev
#   cp scripts/dev-config.example.sh .dev/dev-config.sh
#
# The managed dev harness intentionally runs the web app on 3002 by default so
# it can coexist with other local projects that commonly claim port 3000.

DEV_WEB_HOST=127.0.0.1
DEV_WEB_PUBLIC_HOST=localhost
DEV_WEB_PORT=3002
DEV_WEB_DIR=apps/webapp
DEV_WEB_HEALTH_PATH=/api/health
DEV_READY_TIMEOUT_SECONDS=45
DEV_STOP_TIMEOUT_SECONDS=10
