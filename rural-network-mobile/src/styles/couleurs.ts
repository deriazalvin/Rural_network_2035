export const COULEURS = {
  // Primaires
  emeraude: '#22c55e',
  emeraudeClair: '#4ade80',

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

export const THEME_CLAIR = {
  fond: COULEURS.blanc,
  fondSecondaire: COULEURS.beige,
  fondCarte: COULEURS.blanc,
  texte: COULEURS.textePrincipal,
  texteSecondaire: COULEURS.texteSecondaire,
  texteTertiaire: COULEURS.texteTertiaire,
  bordure: COULEURS.bordure,
  primaire: COULEURS.emeraude,
  accent: COULEURS.emeraudeClair,
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
