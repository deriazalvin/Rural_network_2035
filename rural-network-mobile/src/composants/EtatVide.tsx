/**
 * Composant d'état vide réutilisable avec illustration et CTA
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { COULEURS } from '../styles/couleurs';
import { ESPACEMENTS, RAYONS } from '../styles/espacements';
import { TAILLES } from '../styles/espacements';
import { Bouton } from './Bouton';

interface EtatVideProps {
  icone: React.ReactNode;
  titre: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EtatVide({ icone, titre, description, actionLabel, onAction }: EtatVideProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.conteneur, { backgroundColor: theme.carte }]}>
      <View style={[styles.iconeBg, { backgroundColor: theme.primaire + '12' }]}>
        {icone}
      </View>
      <Text style={[styles.titre, { color: theme.texte }]}>{titre}</Text>
      <Text style={[styles.description, { color: theme.texteSecondaire }]}>{description}</Text>
      {actionLabel && onAction && (
        <Bouton
          titre={actionLabel}
          onPress={onAction}
          variante="primaire"
          taille="sm"
          style={styles.bouton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACEMENTS.xl,
    borderRadius: RAYONS.xl,
    margin: ESPACEMENTS.lg,
    minHeight: 280,
  },
  iconeBg: {
    width: 72,
    height: 72,
    borderRadius: RAYONS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ESPACEMENTS.lg,
  },
  titre: {
    fontSize: TAILLES.texte.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: ESPACEMENTS.sm,
  },
  description: {
    fontSize: TAILLES.texte.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: ESPACEMENTS.lg,
    maxWidth: 280,
  },
  bouton: {
    minWidth: 160,
  },
});
