/**
 * Carte (Card) réutilisable avec fond, bordure, radius et ombre
 */
import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { RAYONS } from '../styles/couleurs';
import { OMBRES, ESPACEMENTS } from '../styles/espacements';

interface CarteProps {
  children: React.ReactNode;
  style?: ViewStyle;
  ombre?: 'sm' | 'md' | 'lg' | 'none';
  padding?: 'sm' | 'md' | 'lg';
}

export function Carte({ children, style, ombre = 'sm', padding = 'md' }: CarteProps) {
  const { theme } = useTheme();

  const paddings = { sm: ESPACEMENTS.md, md: ESPACEMENTS.base, lg: ESPACEMENTS.xl };

  return (
    <View
      style={[
        styles.carte,
        {
          backgroundColor: theme.fondCarte,
          borderColor: theme.bordure,
          borderWidth: 1,
          padding: paddings[padding],
        },
        ombre !== 'none' ? OMBRES[ombre] : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    borderRadius: RAYONS.lg,
  },
});
