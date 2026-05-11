/**
 * Tableau de Bord Opérationnel — Version Mobile
 * Dashboard immersif avec métriques animées, graphique historique, résultats d'optimisation
 */
import React, { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { Carte, CarteStatistique, IndicateurLive, Notification } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import { TAILLES } from '../../src/styles/espacements';
import {
  MapPin,
  Route,
  Package,
  AlertTriangle,
  Zap,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Calendar,
  BarChart3,
  WifiOff,
  Sun,
  Moon,
  LogOut,
  Trash2,
} from 'lucide-react-native';
import type { Notification as NotificationType } from '../../src/types';

export default function TableauBordScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion, utilisateur } = useAuth();
  const router = useRouter();
  const { villages, routes, optimisations, chargement, recharger, enLigne, supprimerOptimisations } = useDonnees();

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/accueil');
  };
  const [rafraichissant, setRafraichissant] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [expandedTours, setExpandedTours] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<NotificationType | null>(null);

  const stats = useMemo(() => {
    const routesActives = routes.filter((r) => !r.estBloquee).length;
    const productionTotale = villages.reduce(
      (sum, v) => sum + (v.volumeProduction || 0),
      0
    );
    const routesBloquees = routes.filter((r) => r.estBloquee).length;
    const totalRoutes = routes.length;
    const gainMoyen =
      optimisations.length > 0
        ? optimisations.reduce((s, o) => s + (o.gainPourcent || 0), 0) /
          optimisations.length
        : 0;
    const efficiency = totalRoutes > 0 ? (routesActives / totalRoutes) * 100 : 100;
    const uptime = totalRoutes > 0 ? ((totalRoutes - routesBloquees) / totalRoutes) * 100 : 100;
    return {
      villages: villages.length,
      routes: routesActives,
      production: productionTotale,
      blocked: routesBloquees,
      avgGain: gainMoyen,
      efficiency,
      uptime,
    };
  }, [villages, routes, optimisations]);

  const onRefresh = async () => {
    setRafraichissant(true);
    await recharger();
    setRafraichissant(false);
  };

  const toggleTour = (idx: number) => {
    setExpandedTours((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const derniereOptim = optimisations[0];

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <View style={[styles.iconBadge, { backgroundColor: theme.primaire + '18' }]}>
              <BarChart3 size={22} color={theme.primaire} />
            </View>
            <View>
              <Text style={[styles.headerTitre, { color: theme.texte }]}>Tableau de Bord</Text>
              <Text style={[styles.headerSousTitre, { color: theme.texteTertiaire }]}>
                Réseau Rural Intelligent
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {utilisateur && (
              <Text style={[styles.headerUser, { color: theme.primaire }]}>
                {utilisateur.nom || 'Utilisateur'}
              </Text>
            )}
            <IndicateurLive actif={liveMode && enLigne} onPress={() => setLiveMode(!liveMode)} />
            <Pressable onPress={basculerTheme} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              {mode === 'sombre' ? <Sun size={18} color={theme.primaire} /> : <Moon size={18} color={theme.primaire} />}
            </Pressable>
            <Pressable onPress={handleDeconnexion} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.texteTertiaire} />
          <Text style={[styles.dateText, { color: theme.texteTertiaire }]}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
      </View>

      {!enLigne && (
        <View style={[styles.offlineBanner, { backgroundColor: COULEURS.ambre + '15', borderColor: COULEURS.ambre }]}
        >
          <WifiOff size={14} color={COULEURS.ambre} />
          <Text style={[styles.offlineText, { color: COULEURS.ambre }]}>
            Mode hors-ligne — Données en cache
          </Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={rafraichissant} onRefresh={onRefresh} tintColor={theme.primaire} />
        }
      >
        {/* Métriques */}
        <View style={styles.metricsRow}>
          <View style={styles.metricHalf}>
            <CarteStatistique
              label="Villages"
              valeur={stats.villages}
              icone={<MapPin size={18} color={COULEURS.emeraude} />}
              couleur={COULEURS.emeraude}
              tendance="+3 ce mois"
            />
          </View>
          <View style={styles.metricHalf}>
            <CarteStatistique
              label="Routes"
              valeur={stats.routes}
              icone={<Route size={18} color={COULEURS.bleu} />}
              couleur={COULEURS.bleu}
              tendance="96% opérationnel"
            />
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricHalf}>
            <CarteStatistique
              label="Production"
              valeur={stats.production}
              unite="kg"
              icone={<Package size={18} color={COULEURS.bleuClair} />}
              couleur={COULEURS.bleuClair}
              tendance="+12% vs N-1"
            />
          </View>
          <View style={styles.metricHalf}>
            <CarteStatistique
              label="Bloquées"
              valeur={stats.blocked}
              icone={<AlertTriangle size={18} color={COULEURS.ambre} />}
              couleur={COULEURS.ambre}
              tendance="-2 cette semaine"
              tendancePositive={false}
            />
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricHalf}>
            <CarteStatistique
              label="Efficacité"
              valeur={stats.efficiency}
              unite="%"
              icone={<Zap size={18} color={COULEURS.orange} />}
              couleur={COULEURS.orange}
              tendance="Record"
            />
          </View>
          <View style={styles.metricHalf}>
            <CarteStatistique
              label="Disponibilité"
              valeur={stats.uptime}
              unite="%"
              icone={<Clock size={18} color={COULEURS.vertClair} />}
              couleur={COULEURS.vertClair}
              tendance="Stable"
            />
          </View>
        </View>

        {/* Graphique Historique */}
        {optimisations.length > 0 && (
          <Carte style={styles.chartCard} ombre="sm">
            <View style={styles.chartHeader}>
              <TrendingUp size={18} color={COULEURS.emeraude} />
              <Text style={[styles.chartTitle, { color: theme.texte }]}>
                Historique des Optimisations
              </Text>
              <Pressable
                onPress={async () => {
                  try {
                    await supprimerOptimisations();
                    setNotification({ type: 'succes', titre: 'Historique effacé', message: 'Les optimisations ont été supprimées' });
                  } catch (err: any) {
                    setNotification({ type: 'erreur', titre: 'Erreur', message: err.message });
                  }
                }}
                style={{ padding: ESPACEMENTS.sm }}
              >
                <Trash2 size={16} color={COULEURS.rouge} />
              </Pressable>
            </View>
            <View style={styles.barsContainer}>
              {optimisations.slice(0, 6).map((opt, i) => {
                const h = Math.min((opt.gainPourcent || 0) / 50, 1) * 120;
                return (
                  <View key={i} style={styles.barColumn}>
                    <View style={[styles.barWrapper, { height: 120 }]}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: h,
                            backgroundColor: COULEURS.emeraude,
                            opacity: 0.7 + i * 0.05,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: theme.texteTertiaire }]}>
                      Opt. {i + 1}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COULEURS.emeraude }]} />
                <Text style={[styles.legendText, { color: theme.texteTertiaire }]}>Gain (%)</Text>
              </View>
            </View>
          </Carte>
        )}

        {/* Dernière Optimisation */}
        {derniereOptim && (
          <Carte style={styles.optimCard} ombre="sm">
            <View style={styles.optimHeader}>
              <Zap size={18} color={COULEURS.emeraude} />
              <Text style={[styles.optimTitle, { color: theme.texte }]}>
                Dernière Optimisation
              </Text>
              <View style={styles.optimBadge}>
                <Text style={styles.optimBadgeText}>Terminé</Text>
              </View>
            </View>
            <View style={styles.optimGrid}>
              <View style={styles.optimItem}>
                <Route size={18} color={theme.texteTertiaire} />
                <Text style={[styles.optimLabel, { color: theme.texteTertiaire }]}>
                  Distance
                </Text>
                <Text style={[styles.optimValue, { color: theme.texte }]}>
                  {derniereOptim.distanceTotalKm?.toFixed(1)} km
                </Text>
              </View>
              <View style={styles.optimItem}>
                <TrendingUp size={18} color={COULEURS.emeraude} />
                <Text style={[styles.optimLabel, { color: theme.texteTertiaire }]}>
                  Gain
                </Text>
                <Text style={[styles.optimValue, { color: COULEURS.emeraude }]}>
                  {derniereOptim.gainPourcent?.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.optimItem}>
                <Package size={18} color={theme.texteTertiaire} />
                <Text style={[styles.optimLabel, { color: theme.texteTertiaire }]}>
                  Coût
                </Text>
                <Text style={[styles.optimValue, { color: theme.texte }]}>
                  {derniereOptim.coutTotal?.toFixed(0)} Ar
                </Text>
              </View>
              <View style={styles.optimItem}>
                <Zap size={18} color={theme.texteTertiaire} />
                <Text style={[styles.optimLabel, { color: theme.texteTertiaire }]}>
                  Tournées
                </Text>
                <Text style={[styles.optimValue, { color: theme.texte }]}>
                  {derniereOptim.tournees?.length || 0}
                </Text>
              </View>
            </View>

            {/* Détails tournées */}
            {derniereOptim.tournees && derniereOptim.tournees.length > 0 && (
              <View style={styles.toursSection}>
                <Text style={[styles.toursTitle, { color: theme.texte }]}>
                  Détail des Tournées
                </Text>
                {derniereOptim.tournees.map((tournee, idx) => (
                  <View key={idx}>
                    <Pressable
                      onPress={() => toggleTour(idx)}
                      style={[
                        styles.tourHeader,
                        { borderBottomColor: theme.bordure },
                      ]}
                    >
                      <View style={styles.tourInfo}>
                        <View
                          style={[
                            styles.tourDot,
                            { backgroundColor: tournee.couleurHex || COULEURS.emeraude },
                          ]}
                        />
                        <Text style={[styles.tourName, { color: theme.texte }]}>
                          {tournee.nom || tournee.camionNom || `Tournée ${idx + 1}`}
                        </Text>
                        <Text style={[styles.tourStops, { color: theme.texteTertiaire }]}>
                          {tournee.etapes?.length || 0} arrêts
                        </Text>
                      </View>
                      <View style={styles.tourMetrics}>
                        <Text style={[styles.tourMetric, { color: theme.texteSecondaire }]}>
                          {tournee.distanceTotalKm?.toFixed(1)} km
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
                        {tournee.etapes?.map((etape, eIdx) => (
                          <View key={eIdx} style={styles.stopRow}>
                            <View
                              style={[
                                styles.stopNum,
                                {
                                  backgroundColor:
                                    tournee.couleurHex || COULEURS.emeraude,
                                },
                              ]}
                            >
                              <Text style={styles.stopNumText}>{eIdx + 1}</Text>
                            </View>
                            <View style={styles.stopContent}>
                              <Text style={[styles.stopName, { color: theme.texte }]}>
                                {etape.nom}
                              </Text>
                              <Text style={[styles.stopMeta, { color: theme.texteTertiaire }]}>
                                {etape.production?.toFixed(0)} kg
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACEMENTS.sm,
    paddingHorizontal: ESPACEMENTS.lg,
    paddingVertical: ESPACEMENTS.sm,
    borderBottomWidth: 1,
    marginHorizontal: ESPACEMENTS.lg,
    marginTop: ESPACEMENTS.sm,
    borderRadius: RAYONS.lg,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: ESPACEMENTS.lg,
    paddingTop: ESPACEMENTS.xl + 24,
    paddingBottom: ESPACEMENTS.lg,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ESPACEMENTS.sm,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: RAYONS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitre: { fontSize: 18, fontWeight: '800' },
  headerSousTitre: { fontSize: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  headerUser: { fontSize: 13, fontWeight: '600', maxWidth: 100 },
  iconBtn: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.xs },
  dateText: { fontSize: 12, fontWeight: '500' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  metricsRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  metricHalf: { flex: 1 },
  chartCard: { marginTop: ESPACEMENTS.md, padding: ESPACEMENTS.lg },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.md },
  chartTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140, marginVertical: ESPACEMENTS.md },
  barColumn: { flex: 1, alignItems: 'center' },
  barWrapper: { width: '60%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: RAYONS.sm, minHeight: 4 },
  barLabel: { fontSize: 9, marginTop: ESPACEMENTS.xs },
  legendRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginTop: ESPACEMENTS.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.xs },
  legendDot: { width: 8, height: 8, borderRadius: RAYONS.rond },
  legendText: { fontSize: 11 },
  optimCard: { marginTop: ESPACEMENTS.md, padding: ESPACEMENTS.lg },
  optimHeader: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.md },
  optimTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  optimBadge: { backgroundColor: COULEURS.emeraude, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RAYONS.rond },
  optimBadgeText: { color: COULEURS.blanc, fontSize: 10, fontWeight: '700' },
  optimGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACEMENTS.md },
  optimItem: { flex: 1, minWidth: 70, alignItems: 'center', padding: ESPACEMENTS.md },
  optimLabel: { fontSize: 11, marginTop: ESPACEMENTS.xs },
  optimValue: { fontSize: 16, fontWeight: '800', marginTop: ESPACEMENTS.xs },
  toursSection: { marginTop: ESPACEMENTS.lg },
  toursTitle: { fontSize: 14, fontWeight: '700', marginBottom: ESPACEMENTS.md },
  tourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ESPACEMENTS.md,
    borderBottomWidth: 1,
  },
  tourInfo: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  tourDot: { width: 10, height: 10, borderRadius: RAYONS.rond },
  tourName: { fontSize: 13, fontWeight: '600' },
  tourStops: { fontSize: 11 },
  tourMetrics: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  tourMetric: { fontSize: 12, fontWeight: '600' },
  tourDetails: { paddingVertical: ESPACEMENTS.md },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, paddingVertical: ESPACEMENTS.xs },
  stopNum: { width: 22, height: 22, borderRadius: RAYONS.rond, alignItems: 'center', justifyContent: 'center' },
  stopNumText: { color: COULEURS.blanc, fontSize: 10, fontWeight: '700' },
  stopContent: { flex: 1 },
  stopName: { fontSize: 13, fontWeight: '500' },
  stopMeta: { fontSize: 11, marginTop: 1 },
});
