/**
 * Espacements et rayons constants
 * Pour garantir la cohérence visuelle sur toute l'application
 */

export const ESPACEMENTS = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  xxl: 32,
} as const;

export const RAYONS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
  rond: 9999,
} as const;

export const TAILLES = {
  icone: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  },
  texte: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
  },
} as const;

export const OMBRES = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
} as const;
