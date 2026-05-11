/**
 * Point d'entrée de l'application
 * Affiche la Landing Page si non authentifié, sinon redirige vers le tableau de bord
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/contextes/ContexteAuth';
import { useTheme } from '../src/contextes/ContexteTheme';

export default function IndexScreen() {
  const { estAuthentifie, chargement } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!chargement) {
      if (estAuthentifie) {
        router.replace('/(tabs)/tableau-bord');
      } else {
        // Affiche la Landing Page au lieu de rediriger vers connexion
        router.replace('/accueil');
      }
    }
  }, [chargement, estAuthentifie, router]);

  return (
    <View style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <ActivityIndicator size="large" color={theme.primaire} />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
