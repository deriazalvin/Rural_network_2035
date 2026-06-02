/**
 * Optimisation des Tournées — Version Mobile
 * Sélection dépôt, sélection camions, lancement, résultats
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { serviceDonnees } from '../../src/services/ServiceDonnees';
import { useI18n } from '../../src/contextes/ContexteI18n';
import { Carte, Bouton, BarreProgression, Notification } from '../../src/composants';
import { COULEURS } from '../../src/styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../../src/styles/espacements';
import { HeaderApp } from '../../src/composants/HeaderApp';
import {
  Zap,
  MapPin,
  Truck,
  Cloud,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import type { Notification as NotificationType, ResultatOptimisation, OptimisationComparative } from '../../src/types';

export default function OptimisationScreen() {
  const { theme } = useTheme();
  const { villages, camions, optimisations, sauvegarderOptimisation } = useDonnees();
  const { t, langue } = useI18n();
  const [depotId, setDepotId] = useState('');
  const [villagesSel, setVillagesSel] = useState<Set<string>>(new Set());
  const [camionsSel, setCamionsSel] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(false);
  const [progres, setProgres] = useState(0);
  const [resultat, setResultat] = useState<ResultatOptimisation | null>(null);
  const [modeComparatif, setModeComparatif] = useState(false);
  const [resultatComparatif, setResultatComparatif] = useState<OptimisationComparative | null>(null);
  const [resultatValideMobile, setResultatValideMobile] = useState<{resultat: ResultatOptimisation; label: string} | null>(null);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [expandedTours, setExpandedTours] = useState<Set<number>>(new Set());
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number>(-1);
  const [showHistorique, setShowHistorique] = useState(false);
  const [expandedHistTour, setExpandedHistTour] = useState<Set<string>>(new Set());
  const [prixCamburant, setPrixCarburant] = useState(0.15);

  const camionsDispo = camions.filter((c) => c.etat === 'DISPONIBLE');

  const villagesSansDepot = villages.filter((v) => v.id !== depotId);

  const toggleCamion = (id: string) => {
    setCamionsSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleVillage = (id: string) => {
    setVillagesSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const lancer = async (avecMeteo = false) => {
    if (!depotId) {
      setNotification({ type: 'avertissement', titre: t('optimisation.depotRequis'), message: t('optimisation.depotRequisMsg') });
      return;
    }
    if (villagesSel.size === 0) {
      setNotification({ type: 'avertissement', titre: t('optimisation.villagesRequis'), message: t('optimisation.villagesRequisMsg') });
      return;
    }
    if (camionsSel.size === 0) {
      setNotification({ type: 'avertissement', titre: t('optimisation.camionsRequis'), message: t('optimisation.camionsRequisMsg') });
      return;
    }
    setChargement(true);
    setProgres(0);
    if (avecMeteo) setResultatComparatif(null);
    else setResultat(null);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p > 90) p = 90;
      setProgres(p);
    }, 400);

    try {
      const res = await serviceDonnees.calculerOptimisation(
        depotId, Array.from(villagesSel), Array.from(camionsSel), avecMeteo, prixCamburant
      );
      clearInterval(interval);
      setProgres(100);
      setResultat(res);
      await sauvegarderOptimisation(res);
      setNotification({ type: 'succes', titre: t('optimisation.terminee'), message: t('optimisation.termineeMsg').replace('{count}', String(res.tournees?.length || 0)) });
    } catch (err: any) {
      clearInterval(interval);
      setNotification({ type: 'erreur', titre: t('optimisation.erreur'), message: err.message });
    } finally {
      setChargement(false);
    }
  };

  const rotation = useSharedValue(0);
  useEffect(() => {
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

  const validerComparatifMobile = (type: 'standard' | 'meteo') => {
    if (!resultatComparatif) return;
    const resultat = type === 'standard' ? resultatComparatif.resultatStandard : resultatComparatif.resultatAvecMeteo;
    const label = type === 'standard' ? t('optimisation.standard') : t('optimisation.adapteeMeteo');
    setResultatValideMobile({ resultat, label });
    setModeComparatif(false);
    setResultat(resultat);
    sauvegarderOptimisation(resultat);
  };

  const annulerComparatifMobile = () => {
    setModeComparatif(false);
    setResultatComparatif(null);
    setResultatValideMobile(null);
    setResultat(null);
  };

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
      <HeaderApp
        icone={<Zap size={22} color={theme.primaire} />}
        titre={t('optimisation.titre')}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {resultatValideMobile ? (
          <>
            <View style={[styles.resultBadge, { backgroundColor: COULEURS.emeraude + '20', borderColor: COULEURS.emeraude }]}>
              <Text style={{ color: COULEURS.emeraude, fontWeight: '800', fontSize: 13 }}>
                {t('optimisation.valide')} ({resultatValideMobile.label})
              </Text>
            </View>
            <Carte style={styles.resultCard} ombre="sm">
              <View style={styles.resultHeader}>
                <Zap size={20} color={COULEURS.emeraude} />
                <Text style={[styles.resultTitle, { color: theme.texte }]}>
                  {t('optimisation.resultats')}
                </Text>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.distance')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatValideMobile.resultat.distanceTotalKm?.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.gain')}</Text>
                  <Text style={[styles.resultValue, { color: COULEURS.emeraude }]}>
                    {resultatValideMobile.resultat.gainPourcent?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.cout')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatValideMobile.resultat.coutTotal?.toFixed(0)} Ar
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.camions')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatValideMobile.resultat.tournees?.length || 0}
                  </Text>
                </View>
              </View>
            </Carte>
            <Bouton
              titre={t('optimisation.nouvelleComparatif')}
              onPress={annulerComparatifMobile}
              variante="outline"
              style={{ marginTop: ESPACEMENTS.lg }}
            />
          </>
        ) : modeComparatif && resultatComparatif ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.texte, marginBottom: ESPACEMENTS.md }]}>
              {t('optimisation.comparatif')}
            </Text>
            <Text style={[styles.comparatifSubtitle, { color: theme.texteTertiaire }]}>
              {t('optimisation.comparatifSubtitle')}
            </Text>

            {resultatComparatif.villagesTouchesParMeteo?.length > 0 && (
              <View style={[styles.meteoAlert, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
                <Cloud size={16} color="#f59e0b" />
                <Text style={{ color: '#b45309', fontSize: 12, fontWeight: '600', flex: 1 }}>
                  {t('optimisation.meteoDefavorable')} {resultatComparatif.villagesTouchesParMeteo.join(', ')}
                </Text>
              </View>
            )}

            {resultatComparatif.differenceDistance !== undefined && (
              <View style={[styles.comparatifEcart, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
                <Text style={[styles.ecartLabel, { color: theme.texteTertiaire }]}>{t('optimisation.ecartDistance')}</Text>
                <Text style={[styles.ecartValue, { color: '#f59e0b' }]}>
                  +{resultatComparatif.differenceDistance.toFixed(1)} km
                </Text>
                <Text style={[styles.ecartLabel, { color: theme.texteTertiaire }]}>{t('optimisation.ecartCout')}</Text>
                <Text style={[styles.ecartValue, { color: '#f59e0b' }]}>
                  +{resultatComparatif.differenceCout.toFixed(0)} Ar
                </Text>
              </View>
            )}

            {/* Carte Standard */}
            <Carte style={styles.comparatifCard} ombre="sm">
              <View style={[styles.comparatifHeader, { borderBottomColor: theme.bordure }]}>
                <Zap size={18} color="#3b82f6" />
                <Text style={[styles.comparatifTitle, { color: theme.texte }]}>{t('optimisation.standard')}</Text>
                <Text style={[styles.comparatifSous, { color: theme.texteTertiaire }]}>{t('optimisation.standardSous')}</Text>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.distance')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatComparatif.resultatStandard.distanceTotalKm?.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.gain')}</Text>
                  <Text style={[styles.resultValue, { color: COULEURS.emeraude }]}>
                    {resultatComparatif.resultatStandard.gainPourcent?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.cout')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatComparatif.resultatStandard.coutTotal?.toFixed(0)} Ar
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.camions')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatComparatif.resultatStandard.tournees?.length || 0}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => validerComparatifMobile('standard')}
                style={[styles.validerBtn, { backgroundColor: '#3b82f6' }]}
              >
                <Text style={styles.validerBtnText}>{t('optimisation.validerStandard')}</Text>
              </Pressable>
            </Carte>

            {/* Carte Météo */}
            <Carte style={styles.comparatifCard} ombre="sm">
              <View style={[styles.comparatifHeader, { borderBottomColor: theme.bordure }]}>
                <Cloud size={18} color="#8b5cf6" />
                <Text style={[styles.comparatifTitle, { color: theme.texte }]}>{t('optimisation.adapteeMeteo')}</Text>
                <Text style={[styles.comparatifSous, { color: theme.texteTertiaire }]}>{t('optimisation.meteoSous')}</Text>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.distance')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatComparatif.resultatAvecMeteo.distanceTotalKm?.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.gain')}</Text>
                  <Text style={[styles.resultValue, { color: COULEURS.emeraude }]}>
                    {resultatComparatif.resultatAvecMeteo.gainPourcent?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.cout')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatComparatif.resultatAvecMeteo.coutTotal?.toFixed(0)} Ar
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.camions')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultatComparatif.resultatAvecMeteo.tournees?.length || 0}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => validerComparatifMobile('meteo')}
                style={[styles.validerBtn, { backgroundColor: '#8b5cf6' }]}
              >
                <Text style={styles.validerBtnText}>{t('optimisation.validerMeteo')}</Text>
              </Pressable>
            </Carte>

            <Bouton
              titre={t('optimisation.retour')}
              onPress={annulerComparatifMobile}
              variante="outline"
              style={{ marginTop: ESPACEMENTS.md }}
            />
          </>
        ) : resultat ? (
          <>
            <Carte style={styles.resultCard} ombre="sm">
              <View style={styles.resultHeader}>
                <Zap size={20} color={COULEURS.emeraude} />
                <Text style={[styles.resultTitle, { color: theme.texte }]}>
                  {t('optimisation.resultats')}
                </Text>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.distance')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultat.distanceTotalKm?.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.gain')}</Text>
                  <Text style={[styles.resultValue, { color: COULEURS.emeraude }]}>
                    {resultat.gainPourcent?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.cout')}</Text>
                  <Text style={[styles.resultValue, { color: theme.texte }]}>
                    {resultat.coutTotal?.toFixed(0)} Ar
                  </Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: theme.texteTertiaire }]}>{t('optimisation.camions')}</Text>
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
                      {t.nom || t.camionNom || `${t('optimisation.tournee')} ${idx + 1}`}
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
              titre={t('optimisation.nouvelle')}
              onPress={() => setResultat(null)}
              variante="outline"
              style={{ marginTop: ESPACEMENTS.lg }}
            />
          </>
        ) : (
          <>
            {/* Dépôt */}
            <Text style={[styles.sectionTitle, { color: theme.texte }]}>{t('optimisation.depotDepart')}</Text>
            {villages.length === 0 ? (
              <Carte style={styles.alertCard} ombre="sm">
                <AlertCircle size={18} color={COULEURS.rouge} />
                <Text style={[styles.alertText, { color: COULEURS.rouge }]}>
                  {t('optimisation.aucunVillage')}
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

            {/* Villages à desservir */}
            {depotId ? (
              <>
                <Text style={[styles.sectionTitle, { color: theme.texte, marginTop: ESPACEMENTS.lg }]}>
                  {t('optimisation.villagesDesservir')}
                  <Text style={{ fontSize: 12, color: theme.texteTertiaire, fontWeight: '500' }}>
                    {' '}({villagesSel.size}/{villagesSansDepot.length})
                  </Text>
                </Text>
                {villagesSansDepot.length === 0 ? (
                  <Carte style={styles.alertCard} ombre="sm">
                    <AlertCircle size={18} color={COULEURS.rouge} />
                    <Text style={[styles.alertText, { color: COULEURS.rouge }]}>
                      {t('optimisation.aucunAutreVillage')}
                    </Text>
                  </Carte>
                ) : (
                  <View style={styles.villageGrid}>
                    {villagesSansDepot.map((v) => (
                      <Pressable
                        key={v.id}
                        onPress={() => toggleVillage(v.id)}
                        style={[
                          styles.villageItem,
                          {
                            backgroundColor: villagesSel.has(v.id) ? theme.primaire + '15' : theme.carte,
                            borderColor: villagesSel.has(v.id) ? theme.primaire : theme.bordure,
                          },
                        ]}
                      >
                        <MapPin size={14} color={villagesSel.has(v.id) ? theme.primaire : theme.texteTertiaire} />
                        <Text style={[styles.villageText, { color: villagesSel.has(v.id) ? theme.primaire : theme.texte }]}>
                          {v.nom}
                        </Text>
                        <View style={[styles.checkboxSmall, villagesSel.has(v.id) && { backgroundColor: theme.primaire, borderColor: theme.primaire }]}>
                          {villagesSel.has(v.id) && <Text style={{ color: COULEURS.blanc, fontSize: 9, fontWeight: '800' }}>✓</Text>}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            ) : null}

            {/* Camions */}
            <Text style={[styles.sectionTitle, { color: theme.texte, marginTop: ESPACEMENTS.lg }]}>
              {t('optimisation.selectCamions')}
            </Text>
            {camionsDispo.length === 0 ? (
              <Carte style={styles.alertCard} ombre="sm">
                <AlertCircle size={18} color={COULEURS.rouge} />
                <Text style={[styles.alertText, { color: COULEURS.rouge }]}>
                  {t('optimisation.aucunCamion')}
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
                      {(c.capaciteKg || 0).toLocaleString(langue)} kg
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Prix carburant */}
            <View style={[styles.carburantRow, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
              <Text style={[styles.carburantLabel, { color: theme.texte }]}>{t('optimisation.prixCarburant')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <TextInput
                  value={String(prixCamburant)}
                  onChangeText={(t) => setPrixCarburant(parseFloat(t) || 0)}
                  keyboardType="decimal-pad"
                  style={[styles.carburantInput, { backgroundColor: theme.fond, color: theme.texte, borderColor: theme.bordure }]}
                />
                <Text style={[styles.carburantUnite, { color: theme.texteTertiaire }]}>{t('optimisation.uniteKm')}</Text>
              </View>
            </View>

            {/* Progression */}
            {chargement && (
              <View style={styles.progressArea}>
                <Animated.View style={spinStyle}>
                  <Zap size={28} color={theme.primaire} />
                </Animated.View>
                <Text style={[styles.progressText, { color: theme.texteSecondaire }]}>
                  {t('optimisation.enCours')}
                </Text>
                <BarreProgression progres={progres} couleur={theme.primaire} />
              </View>
            )}

            <Pressable
              onPress={() => router.push('/(tabs)/meteo')}
              style={({ pressed }) => [styles.meteoRappel, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Cloud size={20} color={COULEURS.bleu} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.meteoRappelTitre, { color: COULEURS.bleu }]}>
                  {t('optimisation.avantLancer')}
                </Text>
                <Text style={[styles.meteoRappelSous, { color: theme.texteTertiaire }]}>
                  {t('optimisation.verifierMeteo')}
                </Text>
              </View>
            </Pressable>

            <Bouton
              titre={t('optimisation.optimiserClassique')}
              onPress={() => lancer(false)}
              variante="primaire"
              taille="lg"
              desactive={chargement || !depotId || villagesSel.size === 0 || camionsSel.size === 0}
              style={{ marginTop: ESPACEMENTS.xl }}
            />

            <Bouton
              titre={t('optimisation.optimiserMeteo')}
              onPress={() => lancer(true)}
              variante="primaire"
              taille="lg"
              desactive={chargement || !depotId || villagesSel.size === 0 || camionsSel.size === 0}
              style={{ marginTop: ESPACEMENTS.md, backgroundColor: '#8b5cf6' }}
            />

            <Carte style={styles.infoCard} ombre="sm">
              <View style={styles.infoRow}>
                <Info size={16} color={COULEURS.bleu} />
                <Text style={[styles.infoTitle, { color: COULEURS.bleu }]}>{t('optimisation.betaTitre')}</Text>
              </View>
              <Text style={[styles.infoText, { color: theme.texteTertiaire }]}>
                {t('optimisation.betaDesc')}
              </Text>
            </Carte>
          </>
        )}
        {/* Historique des Optimisations */}
        {optimisations.length > 0 && (
          <Carte style={{ marginTop: ESPACEMENTS.xl }} ombre="sm">
            <Pressable onPress={() => { setShowHistorique(!showHistorique); setSelectedHistoryIdx(-1); }} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COULEURS.emeraude }} />
                <Text style={[styles.sectionTitle, { color: theme.texte, marginBottom: 0 }]}>
                  {t('optimisation.historique')}
                </Text>
                <Text style={{ fontSize: 11, color: theme.texteTertiaire, fontWeight: '600' }}>
                  ({optimisations.length})
                </Text>
              </View>
              {showHistorique ? <ChevronDown size={16} color={theme.texteTertiaire} /> : <ChevronRight size={16} color={theme.texteTertiaire} />}
            </Pressable>

            {showHistorique && (
              <View style={{ marginTop: ESPACEMENTS.md }}>
                {/* Barres de performance (gains) */}
                <Text style={[styles.sectionTitle, { color: theme.texteSecondaire, fontSize: 12, marginBottom: ESPACEMENTS.sm }]}>
                  {t('optimisation.gainsRealises')}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: ESPACEMENTS.md }}>
                  <View style={{ flexDirection: 'row', gap: ESPACEMENTS.sm, paddingBottom: ESPACEMENTS.sm }}>
                    {[...optimisations].reverse().map((opt, idx) => {
                      const realIdx = optimisations.length - 1 - idx;
                      const isSelected = selectedHistoryIdx === realIdx;
                      const gain = (opt as any).gainPourcent ?? (opt as any).gainPercentage ?? 0;
                      return (
                        <Pressable
                          key={realIdx}
                          onPress={() => setSelectedHistoryIdx(isSelected ? -1 : realIdx)}
                          style={{
                            alignItems: 'center',
                            width: 60,
                            opacity: isSelected ? 1 : 0.85,
                          }}
                        >
                          <View style={{
                            width: 40,
                            height: 80,
                            borderRadius: RAYONS.md,
                            backgroundColor: theme.carte,
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? COULEURS.emeraude : theme.bordure,
                            justifyContent: 'flex-end',
                            overflow: 'hidden',
                            marginBottom: ESPACEMENTS.xs,
                          }}>
                            <View style={{
                              height: `${Math.max(gain, 2)}%` as any,
                              backgroundColor: isSelected ? COULEURS.emeraude : COULEURS.emeraudeClair,
                              borderRadius: 4,
                              minHeight: 4,
                            }} />
                          </View>
                          <Text style={{ fontSize: 9, color: isSelected ? theme.texte : theme.texteTertiaire, fontWeight: isSelected ? '700' : '500', textAlign: 'center' }}>
                            {gain.toFixed(0)}%
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Détails de l'optimisation sélectionnée */}
                {selectedHistoryIdx >= 0 && selectedHistoryIdx < optimisations.length && (
                  <View style={{ borderTopWidth: 1, borderTopColor: theme.bordure, paddingTop: ESPACEMENTS.md }}>
                    <Text style={[styles.sectionTitle, { color: theme.texte, fontSize: 13, marginBottom: ESPACEMENTS.sm }]}>
                      {t('optimisation.detailsOptim')}
                    </Text>

                    {/* KPIs */}
                    <View style={{ flexDirection: 'row', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.md }}>
                      {[
                        { label: t('optimisation.gain'), value: `${(optimisations[selectedHistoryIdx].gainPourcent ?? 0).toFixed(1)}%`, color: COULEURS.emeraude },
                        { label: t('optimisation.distance'), value: `${(optimisations[selectedHistoryIdx].distanceTotalKm ?? 0).toFixed(1)} km`, color: COULEURS.bleu },
                        { label: t('optimisation.cout'), value: `${(optimisations[selectedHistoryIdx].coutTotal ?? 0).toFixed(0)} Ar`, color: COULEURS.ambre },
                      ].map((kpi, ki) => (
                        <View key={ki} style={{ flex: 1, backgroundColor: theme.carte, borderRadius: RAYONS.md, padding: ESPACEMENTS.sm, alignItems: 'center' }}>
                          <Text style={{ fontSize: 9, color: theme.texteTertiaire, fontWeight: '600', marginBottom: 2 }}>{kpi.label}</Text>
                          <Text style={{ fontSize: 13, color: kpi.color, fontWeight: '800' }}>{kpi.value}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Tournées */}
                    <Text style={[styles.sectionTitle, { color: theme.texteSecondaire, fontSize: 12, marginBottom: ESPACEMENTS.sm }]}>
                      {t('optimisation.tourneesGrains')}
                    </Text>
                    {(optimisations[selectedHistoryIdx].tournees ?? []).map((t, ti) => {
                      const tKey = `${selectedHistoryIdx}-${ti}`;
                      const isExpanded = expandedHistTour.has(tKey);
                      return (
                        <View key={ti} style={{ marginBottom: ESPACEMENTS.sm, backgroundColor: theme.carte, borderRadius: RAYONS.md, overflow: 'hidden' }}>
                          <Pressable onPress={() => {
                            const n = new Set(expandedHistTour);
                            if (n.has(tKey)) n.delete(tKey); else n.add(tKey);
                            setExpandedHistTour(n);
                          }} style={{ flexDirection: 'row', alignItems: 'center', padding: ESPACEMENTS.sm, gap: ESPACEMENTS.sm }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.couleurHex || COULEURS.emeraude }} />
                            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: theme.texte }}>
                              {t.nom || t.camionNom || `${t('optimisation.tournee')} ${ti + 1}`}
                            </Text>
                            <Text style={{ fontSize: 11, color: theme.texteTertiaire, fontWeight: '600' }}>
                              {(t.distanceTotalKm ?? 0).toFixed(1)} km
                            </Text>
                            <Text style={{ fontSize: 11, color: COULEURS.emeraude, fontWeight: '700' }}>
                              {(t.chargeTotalKg ?? 0).toFixed(0)} kg
                            </Text>
                            {isExpanded ? <ChevronDown size={14} color={theme.texteTertiaire} /> : <ChevronRight size={14} color={theme.texteTertiaire} />}
                          </Pressable>
                          {isExpanded && (
                            <View style={{ paddingHorizontal: ESPACEMENTS.sm, paddingBottom: ESPACEMENTS.sm, gap: 2 }}>
                              {(t.etapes ?? []).map((e, ei) => (
                                <View key={ei} style={{ flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, paddingVertical: 3, paddingLeft: ESPACEMENTS.md }}>
                                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: t.couleurHex || COULEURS.emeraude, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: '700' }}>{ei + 1}</Text>
                                  </View>
                                  <Text style={{ flex: 1, fontSize: 12, color: theme.texte }}>{e.nom}</Text>
                                  <Text style={{ fontSize: 11, color: theme.texteTertiaire }}>{(e.production ?? 0).toFixed(0)} kg</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    })}

                    {/* Villages non desservis */}
                    {(optimisations[selectedHistoryIdx].villagesNonDesservis ?? []).length > 0 && (
                      <View style={{ marginTop: ESPACEMENTS.sm, padding: ESPACEMENTS.sm, backgroundColor: COULEURS.rouge + '15', borderRadius: RAYONS.md }}>
                        <Text style={{ fontSize: 11, color: COULEURS.rouge, fontWeight: '600' }}>
                          {t('optimisation.villagesNonDesservis')} {(optimisations[selectedHistoryIdx].villagesNonDesservis ?? []).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </Carte>
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
  villageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACEMENTS.sm },
  villageItem: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.xs, padding: ESPACEMENTS.sm, borderRadius: RAYONS.md, borderWidth: 1.5, width: '48%' },
  villageText: { fontSize: 12, fontWeight: '600', flex: 1 },
  checkboxSmall: { width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center' },
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
  meteoRappel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
    padding: ESPACEMENTS.md,
    backgroundColor: COULEURS.bleu + '12',
    borderWidth: 1.5,
    borderColor: COULEURS.bleu + '40',
    borderRadius: RAYONS.md,
    marginTop: ESPACEMENTS.xl,
  },
  meteoRappelTitre: { fontSize: 13, fontWeight: '700' },
  meteoRappelSous: { fontSize: 11, marginTop: 2 },
  carburantRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1,
    marginTop: ESPACEMENTS.xl,
  },
  carburantLabel: { fontSize: 14, fontWeight: '600' },
  carburantInput: {
    width: 80, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RAYONS.sm,
    borderWidth: 1, fontSize: 15, fontWeight: '700', textAlign: 'center',
  },
  carburantUnite: { fontSize: 12, fontWeight: '600' },
  resultBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: ESPACEMENTS.sm, paddingHorizontal: ESPACEMENTS.lg,
    borderRadius: 20, borderWidth: 1.5, marginBottom: ESPACEMENTS.md,
  },
  comparatifSubtitle: { fontSize: 13, marginBottom: ESPACEMENTS.lg },
  meteoAlert: {
    flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm,
    padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1,
    marginBottom: ESPACEMENTS.md,
  },
  comparatifEcart: {
    flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.md,
    padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1,
    marginBottom: ESPACEMENTS.lg, flexWrap: 'wrap',
  },
  ecartLabel: { fontSize: 11, fontWeight: '600' },
  ecartValue: { fontSize: 14, fontWeight: '800' },
  comparatifCard: { padding: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  comparatifHeader: {
    flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm,
    paddingBottom: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.sm,
    borderBottomWidth: 1, flexWrap: 'wrap',
  },
  comparatifTitle: { fontSize: 15, fontWeight: '700' },
  comparatifSous: { fontSize: 11, marginLeft: 'auto' },
  validerBtn: {
    paddingVertical: ESPACEMENTS.md, borderRadius: RAYONS.md,
    alignItems: 'center', justifyContent: 'center', marginTop: ESPACEMENTS.sm,
  },
  validerBtnText: { color: COULEURS.blanc, fontWeight: '800', fontSize: 14 },
});
