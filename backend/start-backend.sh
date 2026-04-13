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

# Do not override `server.port` from application.yml unless `SERVER_PORT` is explicitly provided
: "${SERVER_PORT:=}"

if [ -n "${SERVER_PORT}" ]; then
  echo "Starting backend on port ${SERVER_PORT} (overriding application.yml)"
  exec mvn -Dspring-boot.run.arguments="--server.port=${SERVER_PORT}" -f "$SCRIPT_DIR/pom.xml" spring-boot:run
else
  echo "Starting backend using port from application.yml (or default)"
  exec mvn -f "$SCRIPT_DIR/pom.xml" spring-boot:run
fi
