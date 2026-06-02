/**
 * Écran de Connexion
 * Design premium avec animation Reanimated
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../src/contextes/ContexteTheme';
import { useAuth } from '../src/contextes/ContexteAuth';
import { useI18n } from '../src/contextes/ContexteI18n';
import { Bouton, ChampSaisie } from '../src/composants';
import { COULEURS } from '../src/styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../src/styles/espacements';
import { Mail, Lock, Zap, Sun, ArrowLeft } from 'lucide-react-native';

export default function ConnexionScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { connexion } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  // Animation d'entrée
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 800 });
  }, [progress]);

  const formStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [40, 0]) }],
  }));

  const soumettre = async () => {
    setErreur('');
    if (!email || !motDePasse) {
      setErreur(t('auth.champsVide'));
      return;
    }
    setChargement(true);
    try {
      await connexion(email, motDePasse);
      router.replace('/(tabs)/tableau-bord');
    } catch (err: any) {
      setErreur(err.message || t('auth.erreur'));
    } finally {
      setChargement(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.conteneur, { backgroundColor: theme.fondSecondaire }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Retour accueil */}
        <Pressable onPress={() => router.push('/accueil')} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.texteTertiaire} />
        </Pressable>

        {/* Toggle theme */}
        <Pressable onPress={basculerTheme} style={styles.themeToggle}>
          <Sun size={20} color={theme.primaire} />
        </Pressable>

        <Animated.View style={[formStyle]}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoBadge, { backgroundColor: theme.primaire }]}>
              <Zap size={32} color={COULEURS.blanc} />
            </View>
            <Text style={[styles.titre, { color: theme.texte }]}>
              {t('app.titre')}
            </Text>
            <Text style={[styles.sousTitre, { color: theme.texteTertiaire }]}>
              Plateforme d'optimisation logistique agricole
            </Text>
          </View>

          {/* Formulaire */}
          <View style={[styles.formulaire, { backgroundColor: theme.fondCarte }]}>
            <Text style={[styles.formTitre, { color: theme.texte }]}>
              {t('auth.connexion')}
            </Text>

            {erreur ? (
              <Text style={styles.erreurGlobale}>{erreur}</Text>
            ) : null}

            <ChampSaisie
              etiquette={t('auth.email')}
              placeholder={t('inscription.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icone={<Mail size={18} color={theme.texteTertiaire} />}
            />

            <ChampSaisie
              etiquette={t('auth.motDePasse')}
              placeholder={t('inscription.mdpPlaceholder')}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
              icone={<Lock size={18} color={theme.texteTertiaire} />}
            />

            <Bouton
              titre={t('auth.seConnecter')}
              onPress={soumettre}
              variante="primaire"
              taille="lg"
              chargement={chargement}
              style={{ marginTop: ESPACEMENTS.md }}
            />

            <Pressable
              onPress={() => router.push('/inscription')}
              style={styles.lien}
            >
              <Text style={[styles.lienTexte, { color: theme.texteTertiaire }]}>
                {t('auth.pasEncore')}{' '}
                <Text style={{ color: COULEURS.orange, fontWeight: '700' }}>
                  {t('auth.sinscrire')}
                </Text>
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: ESPACEMENTS.xl,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: ESPACEMENTS.md,
    padding: ESPACEMENTS.sm,
    zIndex: 10,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: ESPACEMENTS.md,
    padding: ESPACEMENTS.sm,
    zIndex: 10,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: ESPACEMENTS.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RAYONS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ESPACEMENTS.md,
  },
  titre: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: ESPACEMENTS.xs,
  },
  sousTitre: {
    fontSize: 13,
    textAlign: 'center',
  },
  formulaire: {
    borderRadius: RAYONS.xl,
    padding: ESPACEMENTS.xl,
  },
  formTitre: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: ESPACEMENTS.lg,
  },
  erreurGlobale: {
    color: COULEURS.rouge,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: ESPACEMENTS.md,
    textAlign: 'center',
  },
  lien: {
    marginTop: ESPACEMENTS.lg,
    alignItems: 'center',
  },
  lienTexte: {
    fontSize: 13,
  },
});
