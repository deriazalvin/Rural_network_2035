/**
 * Indicateur Live/Pause avec animation pulsante
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../contextes/ContexteTheme';
import { COULEURS, RAYONS, ESPACEMENTS } from '../styles/couleurs';

interface IndicateurLiveProps {
  actif: boolean;
  onPress?: () => void;
}

export function IndicateurLive({ actif, onPress }: IndicateurLiveProps) {
  const { theme } = useTheme();
  const echelle = useSharedValue(1);

  React.useEffect(() => {
    if (actif) {
      echelle.value = withRepeat(
        withTiming(1.6, { duration: 1200 }),
        -1,
        true
      );
    } else {
      echelle.value = 1;
    }
  }, [actif, echelle]);

  const stylePulse = useAnimatedStyle(() => ({
    transform: [{ scale: echelle.value }],
    opacity: 0.4,
  }));

  return (
    <Pressable onPress={onPress} style={styles.conteneur}>
      <View style={styles.dotWrapper}>
        <Animated.View
          style={[
            styles.pulse,
            stylePulse,
            { backgroundColor: actif ? COULEURS.succes : COULEURS.rouge },
          ]}
        />
        <View
          style={[
            styles.dot,
            { backgroundColor: actif ? COULEURS.succes : COULEURS.rouge },
          ]}
        />
      </View>
      <Text style={[styles.texte, { color: theme.texteSecondaire }]}>
        {actif ? 'LIVE' : 'PAUSE'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RAYONS.full,
  },
  dotWrapper: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RAYONS.full,
    position: 'absolute',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: RAYONS.full,
    position: 'absolute',
  },
  texte: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
