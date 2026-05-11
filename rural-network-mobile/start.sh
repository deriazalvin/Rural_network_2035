#!/bin/bash
# start.sh — Met à jour l'IP automatiquement et démarre Expo
# Usage: ./start.sh        (démarre Expo normalement)
#        ./start.sh -c     (avec --clear)
#        ./start.sh -t     (avec --tunnel)

set -e

cd "$(dirname "$0")"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Rural Network Mobile — Démarrage automatique            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Met à jour l'IP
./update-ip.sh

echo ""
echo "🚀 Démarrage de Expo Metro Bundler..."
echo ""

# Lance Expo avec les arguments passés
npx expo start --clear "$@"
