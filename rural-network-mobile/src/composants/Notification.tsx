/**
 * Toast / Notification flottante
 * Succès, Erreur, Info, Avertissement
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../contextes/ContexteTheme';
import { COULEURS } from '../styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../styles/espacements';
import { OMBRES } from '../styles/espacements';
import { X } from 'lucide-react-native';
import type { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType;
  onFermer: () => void;
}

const couleursParType = {
  succes: { fond: '#dcfce7', bordure: '#86efac', texte: '#166534', icone: COULEURS.succes },
  erreur: { fond: '#fee2e2', bordure: '#fca5a5', texte: '#991b1b', icone: COULEURS.rouge },
  info: { fond: '#dbeafe', bordure: '#93c5fd', texte: '#1e40af', icone: COULEURS.bleu },
  avertissement: { fond: '#fef3c7', bordure: '#fcd34d', texte: '#92400e', icone: COULEURS.ambre },
};

export function Notification({ notification, onFermer }: NotificationProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(0, { duration: 4000 }),
      withTiming(-100, { duration: 300 })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(1, { duration: 4000 }),
      withTiming(0, { duration: 300 })
    );

    const timer = setTimeout(onFermer, 4600);
    return () => clearTimeout(timer);
  }, [notification, translateY, opacity, onFermer]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const c = couleursParType[notification.type];

  return (
    <Animated.View style={[styles.conteneur, animStyle]}>
      <View
        style={[
          styles.carte,
          {
            backgroundColor: c.fond,
            borderColor: c.bordure,
            borderLeftColor: c.icone,
            borderLeftWidth: 4,
          },
          OMBRES.md,
        ]}
      >
        <View style={styles.contenu}>
          <Text style={[styles.titre, { color: c.texte }]}>{notification.titre}</Text>
          <Text style={[styles.message, { color: c.texte }]}>{notification.message}</Text>
        </View>
        <Pressable onPress={onFermer} style={styles.fermer}>
          <X size={16} color={c.texte} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    position: 'absolute',
    top: 80,
    left: ESPACEMENTS.md,
    right: ESPACEMENTS.md,
    zIndex: 9999,
    elevation: 20,
  },
  carte: {
    borderRadius: RAYONS.lg,
    borderWidth: 1.5,
    padding: ESPACEMENTS.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  contenu: {
    flex: 1,
  },
  titre: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    opacity: 0.9,
  },
  fermer: {
    padding: ESPACEMENTS.xs,
    marginLeft: ESPACEMENTS.sm,
  },
});
