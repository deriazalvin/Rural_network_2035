/**
 * Écran d'Inscription
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
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { useTheme } from '../src/contextes/ContexteTheme';
import { useAuth } from '../src/contextes/ContexteAuth';
import { useI18n } from '../src/contextes/ContexteI18n';
import { Bouton, ChampSaisie } from '../src/composants';
import { COULEURS } from '../src/styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../src/styles/espacements';
import { User, Mail, Lock, ArrowLeft, Zap, Sun } from 'lucide-react-native';

export default function InscriptionScreen() {
  const { theme, basculerTheme } = useTheme();
  const { inscription } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

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
    if (!nom || !email || !motDePasse) {
      setErreur(t('auth.champsVide'));
      return;
    }
    setChargement(true);
    try {
      await inscription(email, motDePasse, nom);
      router.replace('/(tabs)/tableau-bord');
    } catch (err: any) {
      setErreur(err.message || t('inscription.erreur'));
    } finally {
      setChargement(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.conteneur, { backgroundColor: theme.fondSecondaire }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.push('/accueil')} style={styles.retour}>
          <ArrowLeft size={22} color={theme.texte} />
        </Pressable>
        <Pressable onPress={basculerTheme} style={styles.themeToggle}>
          <Sun size={20} color={theme.primaire} />
        </Pressable>

        <Animated.View style={formStyle}>
          <View style={styles.logoSection}>
            <View style={[styles.logoBadge, { backgroundColor: theme.primaire }]}>
              <Zap size={32} color={COULEURS.blanc} />
            </View>
            <Text style={[styles.titre, { color: theme.texte }]}>
              {t('inscription.titre')}
            </Text>
            <Text style={[styles.sousTitre, { color: theme.texteTertiaire }]}>
              {t('inscription.sousTitre')}
            </Text>
          </View>

          <View style={[styles.formulaire, { backgroundColor: theme.fondCarte }]}>
            {erreur ? <Text style={styles.erreurGlobale}>{erreur}</Text> : null}

            <ChampSaisie
              etiquette={t('inscription.nom')}
              placeholder={t('inscription.nomPlaceholder')}
              value={nom}
              onChangeText={setNom}
              icone={<User size={18} color={theme.texteTertiaire} />}
            />

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
              titre={t('inscription.sinscrire')}
              onPress={soumettre}
              variante="primaire"
              taille="lg"
              chargement={chargement}
              style={{ marginTop: ESPACEMENTS.md }}
            />

            <Pressable onPress={() => router.back()} style={styles.lien}>
              <Text style={[styles.lienTexte, { color: theme.texteTertiaire }]}>
                {t('inscription.dejaCompte')}{' '}
                <Text style={{ color: COULEURS.orange, fontWeight: '700' }}>
                  {t('inscription.seConnecter')}
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
  conteneur: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: ESPACEMENTS.xl },
  retour: { position: 'absolute', top: 50, left: ESPACEMENTS.md, padding: ESPACEMENTS.sm, zIndex: 10 },
  themeToggle: { position: 'absolute', top: 50, right: ESPACEMENTS.md, padding: ESPACEMENTS.sm, zIndex: 10 },
  logoBadge: { width: 64, height: 64, borderRadius: RAYONS.xl, alignItems: 'center', justifyContent: 'center', marginBottom: ESPACEMENTS.md },
  logoSection: { alignItems: 'center', marginBottom: ESPACEMENTS.xl },
  titre: { fontSize: 26, fontWeight: '800', marginBottom: ESPACEMENTS.xs },
  sousTitre: { fontSize: 13 },
  formulaire: { borderRadius: RAYONS.xl, padding: ESPACEMENTS.xl },
  erreurGlobale: { color: COULEURS.rouge, fontSize: 12, fontWeight: '600', marginBottom: ESPACEMENTS.md, textAlign: 'center' },
  lien: { marginTop: ESPACEMENTS.lg, alignItems: 'center' },
  lienTexte: { fontSize: 13 },
});
