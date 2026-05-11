/**
 * Header commun pour les écrans principaux
 * Titre + icône + boutons mode nuit / déconnexion
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { useAuth } from '../contextes/ContexteAuth';
import { useRouter } from 'expo-router';
import { ESPACEMENTS, RAYONS } from '../styles/espacements';
import { Sun, Moon, LogOut } from 'lucide-react-native';

interface HeaderAppProps {
  icone: React.ReactNode;
  titre: string;
}

export function HeaderApp({ icone, titre }: HeaderAppProps) {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion } = useAuth();
  const router = useRouter();

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/connexion');
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
      <View style={styles.row}>
        <View style={styles.title}>
          {icone}
          <Text style={[styles.text, { color: theme.texte }]}>{titre}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={basculerTheme} style={[styles.btn, { backgroundColor: theme.carte }]}>
            {mode === 'dark' ? (
              <Sun size={18} color={theme.primaire} />
            ) : (
              <Moon size={18} color={theme.primaire} />
            )}
          </Pressable>
          <Pressable onPress={handleDeconnexion} style={[styles.btn, { backgroundColor: theme.carte }]}>
            <LogOut size={18} color={theme.texteTertiaire} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: ESPACEMENTS.lg,
    paddingTop: ESPACEMENTS.xl,
    paddingBottom: ESPACEMENTS.lg,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: RAYONS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
