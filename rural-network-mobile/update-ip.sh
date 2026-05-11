#!/bin/bash
# update-ip.sh — Détecte l'IP locale et met à jour la config mobile
# Usage: ./update-ip.sh

set -e

cd "$(dirname "$0")"

# Récupère la première IP privée (exclut 127.0.0.1)
IP=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '^127' | grep -m1 -E '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)')

if [ -z "$IP" ]; then
    echo "❌ Impossible de détecter l'IP locale."
    echo "   Vérifiez que vous êtes connecté à un réseau WiFi."
    exit 1
fi

echo "✅ IP détectée : $IP"

# Met à jour .env.local
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    sed -i "s/^EXPO_PUBLIC_API_HOST=.*/EXPO_PUBLIC_API_HOST=$IP/" "$ENV_FILE"
    echo "📝 $ENV_FILE mis à jour"
else
    cat > "$ENV_FILE" <<EOF
# Configuration auto-détectée par update-ip.sh
# Modifier ici si besoin, puis relancer Expo
EXPO_PUBLIC_API_HOST=$IP
EXPO_PUBLIC_API_PORT=8080
EXPO_PUBLIC_API_PROTOCOL=http
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENV=development
EOF
    echo "📝 $ENV_FILE créé"
fi

# Met à jour le fallback dans api.ts
API_FILE="constants/api.ts"
if [ -f "$API_FILE" ]; then
    sed -i "s/const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '[^']*';/const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '$IP';/" "$API_FILE"
    echo "📝 $API_FILE mis à jour"
fi

echo ""
echo "Configuration API : http://$IP:8080/api"
echo ""
echo "Relancez Expo avec : npx expo start --clear"
