/**
 * Barre de progression animée
 * Utilisée dans l'écran d'optimisation et de démo
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../contextes/ContexteTheme';
import { RAYONS, ESPACEMENTS } from '../styles/espacements';

interface BarreProgressionProps {
  progres: number; // 0 - 100
  couleur?: string;
  hauteur?: number;
  etiquette?: string;
}

export function BarreProgression({
  progres,
  couleur,
  hauteur = 8,
  etiquette,
}: BarreProgressionProps) {
  const { theme } = useTheme();
  const largeur = useSharedValue(0);

  React.useEffect(() => {
    largeur.value = withTiming(progres, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progres, largeur]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(largeur.value, 100)}%`,
  }));

  return (
    <View>
      {etiquette && (
        <Text style={[styles.etiquette, { color: theme.texteSecondaire }]}>
          {etiquette} {Math.round(progres)}%
        </Text>
      )}
      <View
        style={[
          styles.fond,
          {
            backgroundColor: theme.bordure,
            height: hauteur,
            borderRadius: RAYONS.rond,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.remplissage,
            {
              backgroundColor: couleur || theme.primaire,
              borderRadius: RAYONS.rond,
              height: hauteur,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  etiquette: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: ESPACEMENTS.xs,
  },
  fond: {
    width: '100%',
    overflow: 'hidden',
  },
  remplissage: {},
});
