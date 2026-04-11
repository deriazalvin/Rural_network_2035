#!/usr/bin/env bash
# Start the backend. To provide environment variables, create a `backend/.env` file and run this script.

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
# IA integration removed

exec mvn -Dspring-boot.run.arguments="--server.port=${SERVER_PORT}" -f "$SCRIPT_DIR/pom.xml" spring-boot:run
