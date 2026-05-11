/**
 * Carte de statistique avec valeur animée, icône et tendance
 * Équivalent mobile du StatCard web
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../contextes/ContexteTheme';
import { Carte } from './Carte';
import { COULEURS, RAYONS, ESPACEMENTS } from '../styles/couleurs';
import { TAILLES } from '../styles/espacements';

interface CarteStatistiqueProps {
  label: string;
  valeur: number;
  unite?: string;
  icone: React.ReactNode;
  couleur: string;
  tendance?: string;
  tendancePositive?: boolean;
}

export function CarteStatistique({
  label,
  valeur,
  unite = '',
  icone,
  couleur,
  tendance,
  tendancePositive = true,
}: CarteStatistiqueProps) {
  const { theme } = useTheme();
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(valeur, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [valeur, animValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.min((animValue.value / (valeur || 1)) * 100, 100)}%`,
    };
  });

  const displayValue = () => {
    if (unite === '%') return `${Math.round(valeur)}%`;
    if (valeur > 999) return `${valeur.toLocaleString('fr-FR')}${unite ? ' ' + unite : ''}`;
    return `${valeur}${unite ? ' ' + unite : ''}`;
  };

  return (
    <Carte ombre="sm" style={styles.carte}>
      <View style={styles.entete}>
        <View style={[styles.badgeIcone, { backgroundColor: couleur + '18' }]}>
          {icone}
        </View>
        <Text style={[styles.label, { color: theme.texteTertiaire }]}>{label}</Text>
      </View>

      <Text style={[styles.valeur, { color: theme.texte }]}>
        {displayValue()}
      </Text>

      {tendance && (
        <View style={styles.tendance}>
          <Text
            style={[
              styles.tendanceTexte,
              { color: tendancePositive ? COULEURS.succes : COULEURS.rouge },
            ]}
          >
            {tendance}
          </Text>
        </View>
      )}

      {/* Barre de progression décorative */}
      <View style={[styles.barreFond, { backgroundColor: theme.bordure }]}>
        <Animated.View
          style={[
            styles.barreRemplie,
            { backgroundColor: couleur },
            animatedStyle,
          ]}
        />
      </View>
    </Carte>
  );
}

const styles = StyleSheet.create({
  carte: {
    flex: 1,
    minWidth: 140,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
    marginBottom: ESPACEMENTS.sm,
  },
  badgeIcone: {
    width: 32,
    height: 32,
    borderRadius: RAYONS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: TAILLES.texte.sm,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  valeur: {
    fontSize: TAILLES.texte['3xl'],
    fontWeight: '800',
    marginBottom: ESPACEMENTS.xs,
  },
  tendance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tendanceTexte: {
    fontSize: TAILLES.texte.sm,
    fontWeight: '700',
  },
  barreFond: {
    height: 4,
    borderRadius: RAYONS.rond,
    marginTop: ESPACEMENTS.sm,
    overflow: 'hidden',
  },
  barreRemplie: {
    height: '100%',
    borderRadius: RAYONS.rond,
  },
});
