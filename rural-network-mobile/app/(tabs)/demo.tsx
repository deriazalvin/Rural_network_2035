/**
 * Mode Démo — Simulation immersive du réseau rural
 * Auto-play des étapes : Tableau de bord → Villages → Routes → Optimisation → Résultats
 * Animations Reanimated fluides
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { Carte, CarteStatistique, BarreProgression, Notification } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import {
  BarChart3,
  MapPin,
  Route,
  Truck,
  Zap,
  TrendingUp,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
  Activity,
  Package,
  AlertTriangle,
  Clock,
  Award,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react-native';
import type { Notification as NotificationType } from '../../src/types';

type Etape = 'tableau' | 'villages' | 'routes' | 'optimisation' | 'resultats';

const ETAPES: { id: Etape; label: string; icone: React.ReactNode; couleur: string }[] = [
  { id: 'tableau', label: 'Tableau de bord', icone: <BarChart3 size={16} color={COULEURS.bleuClair} />, couleur: COULEURS.bleuClair },
  { id: 'villages', label: 'Villages', icone: <MapPin size={16} color={COULEURS.emeraude} />, couleur: COULEURS.emeraude },
  { id: 'routes', label: 'Routes', icone: <Route size={16} color={COULEURS.bleu} />, couleur: COULEURS.bleu },
  { id: 'optimisation', label: 'Optimisation', icone: <Zap size={16} color={COULEURS.ambre} />, couleur: COULEURS.ambre },
  { id: 'resultats', label: 'Résultats', icone: <TrendingUp size={16} color={COULEURS.rouge} />, couleur: COULEURS.rouge },
];

const VILLAGES_DEMO = [
  { id: 1, nom: 'Ambalavao', lat: -21.83, lon: 46.93, prod: 450 },
  { id: 2, nom: 'Manakara', lat: -22.13, lon: 48.0, prod: 320 },
  { id: 3, nom: 'Fianarantsoa', lat: -21.43, lon: 47.08, prod: 680 },
  { id: 4, nom: 'Mananjary', lat: -21.22, lon: 48.35, prod: 520 },
];

export default function DemoScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion } = useAuth();
  const router = useRouter();

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/accueil');
  };
  const { width } = useWindowDimensions();
  const [etape, setEtape] = useState(0);
  const [progres, setProgres] = useState(0);
  const [toast, setToast] = useState<NotificationType | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const etapeActuelle = ETAPES[etape];

  useEffect(() => {
    if (!autoPlay) return;
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => { setEtape(1); showToast('Nouveau village détecté : Mananjary', 'info'); }, 4000));
    t.push(setTimeout(() => { setEtape(2); showToast('Route Fianarantsoa → Mananjary ajoutée', 'succes'); }, 9000));
    t.push(setTimeout(() => { setEtape(3); runProgress(); }, 14000));
    t.push(setTimeout(() => { setEtape(4); showToast('Optimisation terminée ! Gain 32,1%', 'succes'); }, 22000));
    return () => t.forEach(clearTimeout);
  }, [autoPlay]);

  const showToast = (message: string, type: NotificationType['type']) => {
    setToast({ type, titre: type === 'succes' ? 'Succès' : 'Info', message });
    setTimeout(() => setToast(null), 3000);
  };

  const runProgress = () => {
    setProgres(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 4;
      setProgres(p);
      if (p >= 100) clearInterval(iv);
    }, 100);
  };

  const restart = () => {
    setEtape(0);
    setProgres(0);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 100);
  };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <View style={[styles.iconBadge, { backgroundColor: COULEURS.ambre + '18' }]}>
              <Zap size={18} color={COULEURS.ambre} />
            </View>
            <View>
              <Text style={[styles.headerTitre, { color: theme.texte }]}>Mode Démo</Text>
              <Text style={[styles.headerSousTitre, { color: theme.texteTertiaire }]}>
                Simulation du réseau rural
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={restart} style={styles.btnRestart}>
              <RotateCcw size={18} color={COULEURS.bleu} />
            </Pressable>
            <Pressable onPress={basculerTheme} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              {mode === 'sombre' ? <Sun size={18} color={theme.primaire} /> : <Moon size={18} color={theme.primaire} />}
            </Pressable>
            <Pressable onPress={handleDeconnexion} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
          </View>
        </View>

        {/* Pipeline */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipeline}>
          {ETAPES.map((e, i) => (
            <Pressable key={e.id} onPress={() => setEtape(i)} style={styles.pipelineItem}>
              <View
                style={[
                  styles.pipelineDot,
                  {
                    backgroundColor: i <= etape ? e.couleur : theme.bordure,
                    borderColor: i === etape ? e.couleur : theme.bordure,
                  },
                ]}
              >
                {i < etape && <Text style={{ color: COULEURS.blanc, fontSize: 10, fontWeight: '800' }}>✓</Text>}
                {i === etape && <View style={[styles.pipelineActive, { backgroundColor: e.couleur }]} />}
              </View>
              <Text
                style={[
                  styles.pipelineLabel,
                  { color: i === etape ? e.couleur : theme.texteTertiaire },
                ]}
              >
                {e.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {etape === 0 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Villages" valeur={3} icone={<MapPin size={16} color={COULEURS.emeraude} />} couleur={COULEURS.emeraude} tendance="+1 ce mois" />
              </View>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Routes" valeur={1} icone={<Route size={16} color={COULEURS.bleu} />} couleur={COULEURS.bleu} tendance="100%" />
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Production" valeur={1450} unite="kg" icone={<Package size={16} color={COULEURS.bleuClair} />} couleur={COULEURS.bleuClair} tendance="+12%" />
              </View>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Efficacité" valeur={87} unite="%" icone={<Zap size={16} color={COULEURS.ambre} />} couleur={COULEURS.ambre} tendance="Record" />
              </View>
            </View>
            <Carte style={styles.chartCard} ombre="sm">
              <Text style={[styles.chartTitle, { color: theme.texte }]}>Historique des Optimisations</Text>
              <View style={styles.miniBars}>
                {[18, 24, 29, 32].map((h, i) => (
                  <View key={i} style={styles.miniBarCol}>
                    <View style={[styles.miniBarWrapper, { height: 100 }]}>
                      <View style={[styles.miniBar, { height: h * 3, backgroundColor: COULEURS.emeraude, opacity: 0.5 + i * 0.1 }]} />
                    </View>
                    <Text style={[styles.miniBarLabel, { color: theme.texteTertiaire }]}>{['Jan','Fév','Mar','Avr'][i]}</Text>
                  </View>
                ))}
              </View>
            </Carte>
          </Animated.View>
        )}

        {etape === 1 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre, { color: theme.texte }]}>Gestion des Villages</Text>
            {VILLAGES_DEMO.map((v) => (
              <Carte key={v.id} style={styles.demoCard} ombre="sm">
                <Text style={[styles.demoNom, { color: theme.texte }]}>{v.nom}</Text>
                <Text style={[styles.demoMeta, { color: theme.texteTertiaire }]}>
                  Production: {v.prod} kg · Lat: {v.lat.toFixed(2)}, Lon: {v.lon.toFixed(2)}
                </Text>
              </Carte>
            ))}
            <Carte style={[styles.demoCard, { borderColor: COULEURS.emeraude }]} ombre="sm">
              <Text style={[styles.demoNom, { color: COULEURS.emeraude }]}>+ Mananjary</Text>
              <Text style={[styles.demoMeta, { color: theme.texteTertiaire }]}>520 kg · En cours d'ajout...</Text>
            </Carte>
          </Animated.View>
        )}

        {etape === 2 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre, { color: theme.texte }]}>Gestion des Routes</Text>
            <Carte style={styles.demoCard} ombre="sm">
              <Text style={[styles.demoNom, { color: theme.texte }]}>Ambalavao → Fianarantsoa</Text>
              <Text style={[styles.demoMeta, { color: theme.texteTertiaire }]}>75 km · 1h45 · Bonne</Text>
            </Carte>
            <Carte style={[styles.demoCard, { borderColor: COULEURS.bleu }]} ombre="sm">
              <Text style={[styles.demoNom, { color: COULEURS.bleu }]}>+ Fianarantsoa → Mananjary</Text>
              <Text style={[styles.demoMeta, { color: theme.texteTertiaire }]}>95 km · 2h10 · Moyenne</Text>
            </Carte>
          </Animated.View>
        )}

        {etape === 3 && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.centerCol}>
            <Text style={[styles.etapeTitre, { color: theme.texte }]}>Optimisation en cours</Text>
            <Animated.View style={styles.spinnerWrapper}>
              <Zap size={48} color={COULEURS.ambre} />
            </Animated.View>
            <BarreProgression progres={progres} couleur={COULEURS.ambre} etiquette="Calcul de l'algorithme" />
            <View style={styles.stepsList}>
              {['Initialisation', 'Chargement des données', 'Calcul des distances', 'Optimisation greedy', 'Génération des tournées'].map((s, i) => (
                <View key={s} style={styles.stepRow}>
                  <View style={[styles.stepDot, { backgroundColor: progres > i * 20 ? COULEURS.ambre : theme.bordure }]} />
                  <Text style={[styles.stepText, { color: progres > i * 20 ? theme.texte : theme.texteTertiaire }]}>{s}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {etape === 4 && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text style={[styles.etapeTitre, { color: theme.texte }]}>Résultats d'Optimisation</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Distance" valeur={285} unite="km" icone={<Route size={16} color={COULEURS.bleu} />} couleur={COULEURS.bleu} />
              </View>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Gain" valeur={32.1} unite="%" icone={<TrendingUp size={16} color={COULEURS.emeraude} />} couleur={COULEURS.emeraude} />
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Coût" valeur={228} unite="L" icone={<Package size={16} color={COULEURS.bleuClair} />} couleur={COULEURS.bleuClair} />
              </View>
              <View style={styles.metricHalf}>
                <CarteStatistique label="Temps" valeur={5} unite="h05" icone={<Clock size={16} color={COULEURS.vertClair} />} couleur={COULEURS.vertClair} />
              </View>
            </View>

            <Carte style={styles.resultCard} ombre="sm">
              <Text style={[styles.resultTitle, { color: theme.texte }]}>Comparaison</Text>
              <View style={styles.compareRow}>
                <View style={[styles.compareBox, { backgroundColor: theme.carte }]}>
                  <Text style={[styles.compareLabel, { color: theme.texteTertiaire }]}>Naïve</Text>
                  <Text style={[styles.compareValue, { color: theme.texte }]}>420 km</Text>
                </View>
                <ChevronRight size={20} color={COULEURS.emeraude} />
                <View style={[styles.compareBox, { backgroundColor: COULEURS.emeraude + '10', borderColor: COULEURS.emeraude }]}>
                  <Text style={[styles.compareLabel, { color: COULEURS.emeraude }]}>Optimisée</Text>
                  <Text style={[styles.compareValue, { color: COULEURS.emeraude }]}>285 km</Text>
                </View>
              </View>
            </Carte>
          </Animated.View>
        )}
      </ScrollView>

      {toast && <Notification notification={toast} onFermer={() => setToast(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1 },
  header: { paddingHorizontal: ESPACEMENTS.lg, paddingTop: ESPACEMENTS.xl, paddingBottom: ESPACEMENTS.lg, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.md },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  iconBtn: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  iconBadge: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  headerTitre: { fontSize: 16, fontWeight: '800' },
  headerSousTitre: { fontSize: 11, color: '#94a3b8' },
  btnRestart: { padding: ESPACEMENTS.sm },
  pipeline: { flexDirection: 'row', gap: ESPACEMENTS.lg, paddingVertical: ESPACEMENTS.sm },
  pipelineItem: { alignItems: 'center', gap: ESPACEMENTS.xs },
  pipelineDot: { width: 24, height: 24, borderRadius: RAYONS.rond, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pipelineActive: { width: 10, height: 10, borderRadius: RAYONS.rond },
  pipelineLabel: { fontSize: 10, fontWeight: '600' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  metricsRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  metricHalf: { flex: 1 },
  chartCard: { padding: ESPACEMENTS.lg, marginTop: ESPACEMENTS.md },
  chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: ESPACEMENTS.md },
  miniBars: { flexDirection: 'row', justifyContent: 'space-around', height: 120 },
  miniBarCol: { flex: 1, alignItems: 'center' },
  miniBarWrapper: { width: '50%', justifyContent: 'flex-end' },
  miniBar: { width: '100%', borderRadius: RAYONS.sm },
  miniBarLabel: { fontSize: 10, marginTop: ESPACEMENTS.xs },
  etapeTitre: { fontSize: 18, fontWeight: '800', marginBottom: ESPACEMENTS.lg },
  demoCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  demoNom: { fontSize: 15, fontWeight: '700' },
  demoMeta: { fontSize: 12, marginTop: ESPACEMENTS.xs },
  centerCol: { alignItems: 'center', paddingVertical: ESPACEMENTS.xl },
  spinnerWrapper: { marginBottom: ESPACEMENTS.xl },
  stepsList: { width: '100%', marginTop: ESPACEMENTS.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, paddingVertical: ESPACEMENTS.sm },
  stepDot: { width: 8, height: 8, borderRadius: RAYONS.rond },
  stepText: { fontSize: 13, fontWeight: '500' },
  resultCard: { padding: ESPACEMENTS.lg, marginTop: ESPACEMENTS.md },
  resultTitle: { fontSize: 15, fontWeight: '700', marginBottom: ESPACEMENTS.md },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.md },
  compareBox: { flex: 1, padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1, alignItems: 'center' },
  compareLabel: { fontSize: 11, fontWeight: '600', marginBottom: ESPACEMENTS.xs },
  compareValue: { fontSize: 18, fontWeight: '800' },
});
