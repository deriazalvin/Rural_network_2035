/**
 * Configuration API centralisée
 * Pointe vers le backend Spring Boot
 *
 * UTILISER LES VARIABLES D'ENVIRONNEMENT (.env.local) :
 * - EXPO_PUBLIC_API_HOST : '10.0.2.2' (émulateur) | 'IP.locale' | 'localhost'
 * - EXPO_PUBLIC_API_PORT : '8080'
 * - EXPO_PUBLIC_API_PROTOCOL : 'http' | 'https'
 *
 * Pour changer l'IP: modifie .env.local et redémarre Expo
 */

// Charger config depuis env variables (avec fallback)
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '192.168.88.30';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '8080';
const API_PROTOCOL = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';

export const API_CONFIG = {
  baseUrl: __DEV__ 
    ? `${API_PROTOCOL}://${API_HOST}:${API_PORT}/api` 
    : 'https://api.ruralnetwork.mg/api',
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

export const CLES_STOCKAGE = {
  token: 'rn_mobile_token',
  utilisateur: 'rn_mobile_user',
  theme: 'rn_mobile_theme',
  villages: 'rn_mobile_villages',
  routes: 'rn_mobile_routes',
  camions: 'rn_mobile_camions',
  optimisations: 'rn_mobile_optimisations',
  enAttente: 'rn_mobile_pending',
} as const;
