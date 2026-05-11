/**
 * Layout racine de l'application
 * Enveloppe tous les screens avec les fournisseurs de contexte
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FournisseurTheme } from '../src/contextes/ContexteTheme';
import { FournisseurAuth } from '../src/contextes/ContexteAuth';
import { FournisseurDonnees } from '../src/contextes/ContexteDonnees';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FournisseurTheme>
        <FournisseurAuth>
          <FournisseurDonnees>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="connexion" />
              <Stack.Screen name="inscription" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </FournisseurDonnees>
        </FournisseurAuth>
      </FournisseurTheme>
    </SafeAreaProvider>
  );
}
