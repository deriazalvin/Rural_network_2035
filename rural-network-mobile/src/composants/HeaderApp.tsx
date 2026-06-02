import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contextes/ContexteTheme';
import { useAuth } from '../contextes/ContexteAuth';
import { useRouter } from 'expo-router';
import { ESPACEMENTS, RAYONS } from '../styles/espacements';
import { Settings, LogOut, Sun, Moon } from 'lucide-react-native';
import { ModalParametres } from './ModalParametres';

interface HeaderAppProps {
  icone: React.ReactNode;
  titre: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function HeaderApp({ icone, titre, subtitle, children }: HeaderAppProps) {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/connexion');
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
      <View style={styles.row}>
        <View style={styles.title}>
          {icone}
          <View>
            <Text style={[styles.text, { color: theme.texte }]}>{titre}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: theme.texteTertiaire }]}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.actions}>
          {children}
          <Pressable onPress={basculerTheme} style={[styles.btn, { backgroundColor: theme.carte }]}>
            {mode === 'sombre' ? <Sun size={18} color={theme.primaire} /> : <Moon size={18} color={theme.primaire} />}
          </Pressable>
          <Pressable onPress={() => setModalVisible(true)} style={[styles.btn, { backgroundColor: theme.carte }]}>
            <Settings size={18} color={theme.primaire} />
          </Pressable>
          <Pressable onPress={handleDeconnexion} style={[styles.btn, { backgroundColor: theme.carte }]}>
            <LogOut size={18} color={theme.texteTertiaire} />
          </Pressable>
        </View>
      </View>
      <ModalParametres visible={modalVisible} onFermer={() => setModalVisible(false)} />
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
  subtitle: {
    fontSize: 12,
    marginTop: 2,
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
