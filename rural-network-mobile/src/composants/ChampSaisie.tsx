/**
 * Champ de saisie premium réutilisable
 * Supporte icône, erreur, multiligne
 */
import React from 'react';
import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { COULEURS, RAYONS, ESPACEMENTS } from '../styles/couleurs';

interface ChampSaisieProps extends TextInputProps {
  icone?: React.ReactNode;
  erreur?: string;
  etiquette?: string;
}

export function ChampSaisie({ icone, erreur, etiquette, style, ...props }: ChampSaisieProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.conteneur}>
      {etiquette && (
        <Text style={[styles.etiquette, { color: theme.texteSecondaire }]}>{etiquette}</Text>
      )}
      <View
        style={[
          styles.champ,
          {
            backgroundColor: theme.carte,
            borderColor: erreur ? COULEURS.rouge : theme.bordure,
          },
        ]}
      >
        {icone && <View style={styles.icone}>{icone}</View>}
        <TextInput
          placeholderTextColor={theme.texteTertiaire}
          style={[
            styles.input,
            { color: theme.texte },
            style,
          ]}
          {...props}
        />
      </View>
      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    marginBottom: ESPACEMENTS.md,
  },
  etiquette: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: ESPACEMENTS.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  champ: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RAYONS.md,
    borderWidth: 1.5,
    paddingHorizontal: ESPACEMENTS.md,
    paddingVertical: ESPACEMENTS.sm,
  },
  icone: {
    marginRight: ESPACEMENTS.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  erreur: {
    color: COULEURS.rouge,
    fontSize: 11,
    marginTop: ESPACEMENTS.xs,
    fontWeight: '600',
  },
});
