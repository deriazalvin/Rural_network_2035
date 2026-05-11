/**
 * Hook pour animer un compteur numérique
 * Utilise react-native-reanimated pour une animation fluide 60fps
 */
import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';

export function useCompteurAnime(target: number, duration = 1500, suffix = '') {
  const valeur = useSharedValue(0);

  useEffect(() => {
    valeur.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, duration, valeur]);

  return valeur;
}

export function useProgressionAnime(target: number, duration = 1200) {
  const valeur = useSharedValue(0);

  useEffect(() => {
    valeur.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, duration, valeur]);

  return valeur;
}
