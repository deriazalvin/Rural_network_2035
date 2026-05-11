/**
 * Optimisation des Tournées — Version Mobile
 * Sélection dépôt, sélection camions, lancement, résultats
 */
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { serviceDonnees } from '../../src/services/ServiceDonnees';
import { Carte, Bouton, BarreProgression, Notification } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import {
  Zap,
  MapPin,
  Truck,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react-native';
import type { Notification as NotificationType, ResultatOptimisation } from '../../src/types';

export default function OptimisationScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion } = useAuth();
  const router = useRouter();
  const { villages, camions, sauvegarderOptimisation } = useDonnees();

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/accueil');
  };
  const [depotId, setDepotId] = useState('');
  const [camionsSel, setCamionsSel] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(false);
  const [progres, setProgres] = useState(0);
  const [resultat, setResultat] = useState<ResultatOptimisation | null>(null);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [expandedTours, setExpandedTours] = useState<Set<number>>(new Set());

  const camionsDispo = camions.filter((c) => c.etat === 'DISPONIBLE');

  const toggleCamion = (id: string) => {
    setCamionsSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const lancer = async () => {
    if (!depotId) {
      setNotification({ type: 'avertissement', titre: 'Dépôt requis', message: 'Sélectionnez un dépôt' });
      return;
    }
    if (camionsSel.size === 0) {
      setNotification({ type: 'avertissement', titre: 'Camions requis', message: 'Sélectionnez au moins un camion' });
      return;
    }
    setChargement(true);
    setProgres(0);
    setResultat(null);

    // Animation de progression simulée
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p > 90) p = 90;
      setProgres(p);
    }, 400);

    try {
      const res = await serviceDonnees.optimiserTournees(depotId, Array.from(camionsSel));
      clearInterval(interval);
      setProgres(100);
      setResultat(res);
      await sauvegarderOptimisation(res);
      setNotification({ type: 'succes', titre: 'Optimisation terminée', message: `${res.tournees?.length || 0} tournée(s) calculée(s)` });
    } catch (err: any) {
      clearInterval(interval);
      setNotification({ type: 'erreur', titre: 'Erreur', message: err.message });
    } finally {
      setChargement(false);
    }
  };

  const rotation = useSharedValue(0);
  React.useEffect(() => {
    if (chargement) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1
      );
    } else {
      rotation.value = 0;
    }
  }, [chargement, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggleTour = (idx: number) => {
    setExpandedTours((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <Zap size={22} color={theme.primaire} />
            <Text style={[styles.headerText, { color: theme.texte }]}>Optimisation</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={basculerTheme} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              {mode === 'sombre' ? <Sun size={18} color={theme.primaire} /> : <Moon size={18} color={theme.primaire} />}
            </Pressable>
            <Pressable onPress={handleDeconnexion} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {resultat ? (
          <>
            <Carte style={styles.resultCard} ombre="sm">
              <View style={styles.resultHeader}>
                <Zap size={20} color={COULEURS.emeraude} />
                <Text style={[styles.resultTitle, { color: theme.texte }]}>
                  Résultats d'Optimisation
                </Text>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>Distance</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultat.distanceTotalKm?.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>Gain</Text>
                  <Text style={[styles.resultValue, { color: COULEURS.emeraude }]}>
                    {resultat.gainPourcent?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>Coût</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultat.coutTotal?.toFixed(0)} Ar
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>Camions</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultat.tournees?.length || 0}
                  </Text>
                </View>
              </View>
            </Carte>

            {/* Tournées */}
            {resultat.tournees?.map((t, idx) => (
              <Carte key={idx} style={styles.tourCard} ombre="sm">
                <Pressable onPress={() => toggleTour(idx)} style={styles.tourHeader}>
                  <View style={styles.tourInfo}>
                    <View style={[styles.tourDot, { backgroundColor: t.couleurHex || COULEURS.emeraude }]} />
                    <Text style={[styles.tourName, { color: theme.texte }]}>
                      {t.nom || t.camionNom || `Tournée ${idx + 1}`}
                    </Text>
                  </View>
                  <View style={styles.tourMetrics}>
                    <Text style={[styles.tourMetric, { color: theme.texteSecondaire }]}>
                      {t.distanceTotalKm?.toFixed(1)} km
                    </Text>
                    {expandedTours.has(idx) ? (
                      <ChevronDown size={16} color={theme.texteTertiaire} />
                    ) : (
                      <ChevronRight size={16} color={theme.texteTertiaire} />
                    )}
                  </View>
                </Pressable>

                {expandedTours.has(idx) && (
                  <View style={styles.tourDetails}>
                    {t.etapes?.map((e, eIdx) => (
                      <View key={eIdx} style={styles.stopRow}>
                        <View style={[styles.stopNum, { backgroundColor: t.couleurHex || COULEURS.emeraude }]}>
                          <Text style={styles.stopNumText}>{eIdx + 1}</Text>
                        </View>
                        <View style={styles.stopContent}>
                          <Text style={[styles.stopName, { color: theme.texte }]}>{e.nom}</Text>
                          <Text style={[styles.stopMeta, { color: theme.texteTertiaire }]}>
                            {e.production?.toFixed(0)} kg
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Carte>
            ))}

            <Bouton
              titre="Nouvelle Optimisation"
              onPress={() => setResultat(null)}
              variante="outline"
              style={{ marginTop: ESPACEMENTS.lg }}
            />
          </>
        ) : (
          <>
            {/* Dépôt */}
            <Text style={[styles.sectionTitle, { color: theme.texte }]}>Dépôt de Départ</Text>
            {villages.length === 0 ? (
              <Carte style={styles.alertCard} ombre="sm">
                <AlertCircle size={18} color={COULEURS.rouge} />
                <Text style={[styles.alertText, { color: COULEURS.rouge }]}>
                  Aucun village disponible. Créez des villages d'abord.
                </Text>
              </Carte>
            ) : (
              <View style={styles.depotList}>
                {villages.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() => setDepotId(v.id)}
                    style={[
                      styles.depotItem,
                      {
                        backgroundColor: depotId === v.id ? theme.primaire + '15' : theme.carte,
                        borderColor: depotId === v.id ? theme.primaire : theme.bordure,
                      },
                    ]}
                  >
                    <MapPin size={16} color={depotId === v.id ? theme.primaire : theme.texteTertiaire} />
                    <Text style={[styles.depotText, { color: depotId === v.id ? theme.primaire : theme.texte }]}>
                      {v.nom}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Camions */}
            <Text style={[styles.sectionTitle, { color: theme.texte, marginTop: ESPACEMENTS.lg }]}>
              Sélectionner les Camions
            </Text>
            {camionsDispo.length === 0 ? (
              <Carte style={styles.alertCard} ombre="sm">
                <AlertCircle size={18} color={COULEURS.rouge} />
                <Text style={[styles.alertText, { color: COULEURS.rouge }]}>
                  Aucun camion disponible.
                </Text>
              </Carte>
            ) : (
              <View style={styles.camionGrid}>
                {camionsDispo.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => toggleCamion(c.id)}
                    style={[
                      styles.camionCard,
                      {
                        backgroundColor: camionsSel.has(c.id) ? c.couleurHex + '18' : theme.carte,
                        borderColor: camionsSel.has(c.id) ? c.couleurHex : theme.bordure,
                      },
                    ]}
                  >
                    <View style={styles.camionHeaderRow}>
                      <View style={[styles.camionDot, { backgroundColor: c.couleurHex }]} />
                      <Text style={[styles.camionNom, { color: theme.texte }]}>{c.nom}</Text>
                      <View
                        style={[
                          styles.checkbox,
                          camionsSel.has(c.id) && { backgroundColor: c.couleurHex, borderColor: c.couleurHex },
                        ]}
                      >
                        {camionsSel.has(c.id) && <Text style={{ color: COULEURS.blanc, fontSize: 10, fontWeight: '800' }}>✓</Text>}
                      </View>
                    </View>
                    <Text style={[styles.camionCapa, { color: theme.texteTertiaire }]}>
                      {(c.capaciteKg || 0).toLocaleString('fr-FR')} kg
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Progression */}
            {chargement && (
              <View style={styles.progressArea}>
                <Animated.View style={spinStyle}>
                  <Zap size={28} color={theme.primaire} />
                </Animated.View>
                <Text style={[styles.progressText, { color: theme.texteSecondaire }]}>
                  Optimisation en cours...
                </Text>
                <BarreProgression progres={progres} couleur={theme.primaire} />
              </View>
            )}

            <Bouton
              titre="Lancer l'Optimisation"
              onPress={lancer}
              variante="primaire"
              taille="lg"
              desactive={chargement || !depotId || camionsSel.size === 0}
              style={{ marginTop: ESPACEMENTS.xl }}
            />

            <Carte style={styles.infoCard} ombre="sm">
              <View style={styles.infoRow}>
                <Info size={16} color={COULEURS.bleu} />
                <Text style={[styles.infoTitle, { color: COULEURS.bleu }]}>Optimisation bêta</Text>
              </View>
              <Text style={[styles.infoText, { color: theme.texteTertiaire }]}>
                Algorithme greedy multi-camions. Certains résultats peuvent être en développement.
              </Text>
            </Carte>
          </>
        )}
      </ScrollView>

      {notification && (
        <Notification notification={notification} onFermer={() => setNotification(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1 },
  header: { paddingHorizontal: ESPACEMENTS.lg, paddingTop: ESPACEMENTS.xl, paddingBottom: ESPACEMENTS.lg, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  headerText: { fontSize: 18, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  iconBtn: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: ESPACEMENTS.md },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, padding: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  alertText: { fontSize: 13, fontWeight: '600', flex: 1 },
  depotList: { gap: ESPACEMENTS.sm },
  depotItem: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1.5 },
  depotText: { fontSize: 14, fontWeight: '600' },
  camionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACEMENTS.md },
  camionCard: { width: '47%', borderRadius: RAYONS.md, borderWidth: 1.5, padding: ESPACEMENTS.md },
  camionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.xs },
  camionDot: { width: 10, height: 10, borderRadius: RAYONS.rond },
  camionNom: { fontSize: 13, fontWeight: '600', flex: 1 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center' },
  camionCapa: { fontSize: 11 },
  progressArea: { alignItems: 'center', marginVertical: ESPACEMENTS.xl },
  progressText: { fontSize: 13, fontWeight: '600', marginTop: ESPACEMENTS.md },
  infoCard: { marginTop: ESPACEMENTS.xl, padding: ESPACEMENTS.md, backgroundColor: '#eff6ff' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.xs },
  infoTitle: { fontSize: 13, fontWeight: '700' },
  infoText: { fontSize: 12 },
  resultCard: { padding: ESPACEMENTS.lg, marginBottom: ESPACEMENTS.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.md },
  resultTitle: { fontSize: 16, fontWeight: '700' },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACEMENTS.md },
  resultItem: { flex: 1, minWidth: 70, alignItems: 'center' },
  resultLabel: { fontSize: 11, marginBottom: ESPACEMENTS.xs },
  resultValue: { fontSize: 18, fontWeight: '800' },
  tourCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  tourHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tourInfo: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  tourDot: { width: 10, height: 10, borderRadius: RAYONS.rond },
  tourName: { fontSize: 14, fontWeight: '600' },
  tourMetrics: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  tourMetric: { fontSize: 12, fontWeight: '600' },
  tourDetails: { marginTop: ESPACEMENTS.md },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, paddingVertical: ESPACEMENTS.xs },
  stopNum: { width: 22, height: 22, borderRadius: RAYONS.rond, alignItems: 'center', justifyContent: 'center' },
  stopNumText: { color: COULEURS.blanc, fontSize: 10, fontWeight: '700' },
  stopContent: { flex: 1 },
  stopName: { fontSize: 13, fontWeight: '500' },
  stopMeta: { fontSize: 11, marginTop: 1 },
});
