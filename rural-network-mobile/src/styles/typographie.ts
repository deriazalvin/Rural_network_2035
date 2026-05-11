/**
 * Styles typographiques réutilisables
 * Pour garantir une hiérarchie cohérente sur toute l'application
 */
export const TYPOGRAPHIE = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const },
  captionBold: { fontSize: 12, fontWeight: '700' as const },
  overline: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
} as const;
