/**
 * Système de couleurs inspiré de l'identité visuelle web
 * Adapté pour React Native avec des valeurs hex explicites
 */

export const COULEURS = {
  // Primaires
  vertPrincipal: '#2d5016',
  vertSecondaire: '#4a7c2c',
  vertClair: '#6b9d4a',
  emeraude: '#10b981',
  emeraudeClair: '#34d399',

  // Fonds clair
  beige: '#f5f1e8',
  beigeFonce: '#e8dfc8',
  blanc: '#ffffff',
  grisClair: '#f3f4f6',

  // Fonds sombre
  sombrePrincipal: '#0f172a',
  sombreSecondaire: '#1e293b',
  sombreTertiaire: '#334155',

  // Texte
  textePrincipal: '#0f172a',
  texteSecondaire: '#475569',
  texteTertiaire: '#94a3b8',
  texteClair: '#f8fafc',

  // Accents
  orange: '#d97706',
  rouge: '#dc2626',
  bleu: '#2563eb',
  bleuClair: '#3b82f6',
  ambre: '#f59e0b',

  // Status
  succes: '#22c55e',
  avertissement: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Bordures
  bordure: '#e2e8f0',
  bordureSombre: '#334155',

  // Transparents
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export type Couleur = keyof typeof COULEURS;

/**
 * Thèmes clair et sombre prêts à l'emploi
 */
export const THEME_CLAIR = {
  fond: COULEURS.blanc,
  fondSecondaire: COULEURS.beige,
  fondCarte: COULEURS.blanc,
  texte: COULEURS.textePrincipal,
  texteSecondaire: COULEURS.texteSecondaire,
  texteTertiaire: COULEURS.texteTertiaire,
  bordure: COULEURS.bordure,
  primaire: COULEURS.vertPrincipal,
  accent: COULEURS.vertClair,
  carte: COULEURS.grisClair,
  statutBar: 'dark',
} as const;

export const THEME_SOMBRE = {
  fond: COULEURS.sombrePrincipal,
  fondSecondaire: COULEURS.sombreSecondaire,
  fondCarte: COULEURS.sombreSecondaire,
  texte: COULEURS.texteClair,
  texteSecondaire: '#cbd5e1',
  texteTertiaire: '#94a3b8',
  bordure: COULEURS.bordureSombre,
  primaire: COULEURS.emeraude,
  accent: COULEURS.emeraudeClair,
  carte: COULEURS.sombreTertiaire,
  statutBar: 'light',
} as const;

export type Theme = typeof THEME_CLAIR;
/**
 * Espacements du design system
 */
export const ESPACEMENTS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Rayons des bordures
 */
export const RAYONS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  rond: 9999,
} as const;