/**
 * Bouton réutilisable premium
 * Variantes : primaire, secondaire, danger, outline, ghost
 */
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { COULEURS, RAYONS, ESPACEMENTS } from '../styles/couleurs';
import { OMBRES } from '../styles/espacements';

type Variante = 'primaire' | 'secondaire' | 'danger' | 'outline' | 'ghost';

interface BoutonProps {
  titre: string;
  onPress: () => void;
  variante?: Variante;
  taille?: 'sm' | 'md' | 'lg';
  desactive?: boolean;
  chargement?: boolean;
  icone?: React.ReactNode;
  style?: ViewStyle;
}

export function Bouton({
  titre,
  onPress,
  variante = 'primaire',
  taille = 'md',
  desactive = false,
  chargement = false,
  icone,
  style,
}: BoutonProps) {
  const { theme } = useTheme();

  const stylesVariantes = {
    primaire: {
      fond: theme.primaire,
      texte: COULEURS.blanc,
      bordure: theme.primaire,
    },
    secondaire: {
      fond: theme.carte,
      texte: theme.texte,
      bordure: theme.bordure,
    },
    danger: {
      fond: COULEURS.rouge,
      texte: COULEURS.blanc,
      bordure: COULEURS.rouge,
    },
    outline: {
      fond: 'transparent',
      texte: theme.primaire,
      bordure: theme.primaire,
    },
    ghost: {
      fond: 'transparent',
      texte: theme.texteSecondaire,
      bordure: 'transparent',
    },
  };

  const tailles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, texte: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 20, texte: 14 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, texte: 16 },
  };

  const s = stylesVariantes[variante];
  const t = tailles[taille];

  return (
    <Pressable
      onPress={onPress}
      disabled={desactive || chargement}
      style={({ pressed }) => [
        styles.bouton,
        {
          backgroundColor: s.fond,
          borderColor: s.bordure,
          borderWidth: variante === 'ghost' ? 0 : 1.5,
          paddingVertical: t.paddingVertical,
          paddingHorizontal: t.paddingHorizontal,
          opacity: desactive ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !desactive ? 0.97 : 1 }],
        },
        variante === 'primaire' && OMBRES.md,
        style,
      ]}
    >
      {chargement ? (
        <ActivityIndicator color={s.texte} size="small" />
      ) : (
        <>
          {icone}
          <Text style={[styles.texte, { color: s.texte, fontSize: t.texte }]}>
            {titre}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    borderRadius: RAYONS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: ESPACEMENTS.sm,
  },
  texte: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
