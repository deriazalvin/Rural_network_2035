/**
 * Layout racine de l'application
 * Enveloppe tous les screens avec les fournisseurs de contexte
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FournisseurTheme } from '../src/contextes/ContexteTheme';
import { FournisseurAuth, useAuth } from '../src/contextes/ContexteAuth';
import { FournisseurDonnees } from '../src/contextes/ContexteDonnees';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AssistantChat from '../src/composants/AssistantChat';

function AppContent({ children }: { children: React.ReactNode }) {
  const { estAuthentifie } = useAuth();
  return (
    <>
      {children}
      <AssistantChat visible={estAuthentifie} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FournisseurTheme>
        <FournisseurAuth>
          <FournisseurDonnees>
            <StatusBar style="auto" />
            <AppContent>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="connexion" />
                <Stack.Screen name="inscription" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </AppContent>
          </FournisseurDonnees>
        </FournisseurAuth>
      </FournisseurTheme>
    </SafeAreaProvider>
  );
}
