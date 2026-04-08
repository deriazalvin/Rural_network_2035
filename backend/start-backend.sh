#!/usr/bin/env bash
# Start the backend reading environment variables from .env if present.
# Usage: make a file backend/.env with GEMINI_API_KEY and optional SERVER_PORT, then run this script.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  echo "Loading environment from $ENV_FILE"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

# Default port if not provided
: "${SERVER_PORT:=8081}"

echo "Starting backend on port ${SERVER_PORT} (if set)"
GEMINI_VAR="${GEMINI_API_KEY:-}"
if [ -z "$GEMINI_VAR" ]; then
  echo "Warning: GEMINI_API_KEY not set. The service will fallback to local generation."
fi

exec mvn -Dspring-boot.run.arguments="--server.port=${SERVER_PORT}" -f "$SCRIPT_DIR/pom.xml" spring-boot:run
