#!/bin/bash
# start.sh — Met à jour l'IP automatiquement et démarre Expo
# Usage: ./start.sh        (démarre Expo normalement)
#        ./start.sh -c     (avec --clear)
#        ./start.sh -t     (avec --tunnel)

set -e

cd "$(dirname "$0")"

./update-ip.sh

npx expo start --clear "$@"
