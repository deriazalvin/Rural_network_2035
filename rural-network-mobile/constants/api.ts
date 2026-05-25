
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || '10.35.97.175';
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
