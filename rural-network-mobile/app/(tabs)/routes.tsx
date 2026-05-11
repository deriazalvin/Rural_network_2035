/**
 * Gestion des Routes — Version Mobile
 * Ajout, édition, liste actives/bloquées, qualité
 */
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { Carte, Bouton, Notification, EtatVide } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import {
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  X,
  ArrowRight,
  Eye,
  Navigation,
  AlertOctagon,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { Notification as NotificationType, RouteItem } from '../../src/types';

export default function RoutesScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion, utilisateur } = useAuth();
  const router = useRouter();
  const { villages, routes, ajouterRoute, modifierRoute, chargement } = useDonnees();
  const [modalVisible, setModalVisible] = useState(false);
  const [departId, setDepartId] = useState('');
  const [arriveeId, setArriveeId] = useState('');
  const [qualite, setQualite] = useState(50);
  const [estBloquee, setEstBloquee] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [modalNotif, setModalNotif] = useState<NotificationType | null>(null);
  const [vue, setVue] = useState<'actives' | 'bloquees'>('actives');
  const [itineraireModal, setItineraireModal] = useState<RouteItem | null>(null);
  const [edition, setEdition] = useState<RouteItem | null>(null);

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/accueil');
  };

  const getQualiteInfo = (value: number) => {
    if (value <= 33) return { label: 'Mauvaise', couleur: COULEURS.rouge, icone: <XCircle size={14} color={COULEURS.rouge} /> };
    if (value >= 66) return { label: 'Bonne', couleur: COULEURS.succes, icone: <CheckCircle size={14} color={COULEURS.succes} /> };
    return { label: 'Moyenne', couleur: COULEURS.ambre, icone: <AlertTriangle size={14} color={COULEURS.ambre} /> };
  };

  const qualiteInfo = getQualiteInfo(qualite);

  const obtenirNomVillage = (id: string) => villages.find((v) => v.id === id)?.nom || 'Inconnu';

  /** Décode une polyline encodée (algorithme Google) en tableau de coordonnées {lat, lng} */
  const decodePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const ouvrirAjout = () => {
    setEdition(null);
    setDepartId('');
    setArriveeId('');
    setQualite(50);
    setEstBloquee(false);
    setModalVisible(true);
  };

  const ouvrirEdition = (route: RouteItem) => {
    setEdition(route);
    setDepartId(route.villageDepart_id || '');
    setArriveeId(route.village_arrivee_id || '');
    setQualite(route.qualiteRoute === 'BONNE' ? 80 : route.qualiteRoute === 'MOYENNE' ? 50 : 20);
    setEstBloquee(route.estBloquee || false);
    setModalVisible(true);
  };

  const soumettre = async () => {
    if (!departId || !arriveeId) {
      setModalNotif({ type: 'erreur', titre: 'Villages requis', message: 'Sélectionnez un village de départ et un village d\'arrivée' });
      return;
    }
    if (departId === arriveeId) {
      setModalNotif({ type: 'erreur', titre: 'Villages invalides', message: 'Le départ et l\'arrivée doivent être différents' });
      return;
    }
    let q: RouteItem['qualiteRoute'] = 'MOYENNE';
    if (qualite <= 33) q = 'MAUVAISE';
    else if (qualite >= 66) q = 'BONNE';

    try {
      if (edition) {
        await modifierRoute(edition.id, {
          villageDepart_id: departId,
          village_arrivee_id: arriveeId,
          qualiteRoute: q,
          estBloquee,
        });
        setNotification({ type: 'succes', titre: 'Route modifiée', message: 'La route a été modifiée avec succès' });
      } else {
        await ajouterRoute({
          villageDepart_id: departId,
          village_arrivee_id: arriveeId,
          qualiteRoute: q,
          estBloquee,
        });
        setNotification({ type: 'succes', titre: 'Route ajoutée', message: 'La route a été créée avec succès' });
      }
      setModalVisible(false);
      setEdition(null);
      setDepartId('');
      setArriveeId('');
      setQualite(50);
      setEstBloquee(false);
    } catch (err: any) {
      setModalNotif({ type: 'erreur', titre: 'Erreur', message: err.message });
    }
  };

  const routesActives = routes.filter((r) => !r.estBloquee);
  const routesBloquees = routes.filter((r) => r.estBloquee);

  const ItemRoute = ({ route }: { route: RouteItem }) => {
    const vd = villages.find((v) => v.id === route.villageDepart_id);
    const va = villages.find((v) => v.id === route.village_arrivee_id);
    return (
      <Carte style={styles.routeCard} ombre="sm">
        <View style={styles.routeHeader}>
          <View style={styles.routeNames}>
            <MapPin size={14} color={theme.texteTertiaire} />
            <Text style={[styles.routeText, { color: theme.texte }]}>
              {vd?.nom || 'Inconnu'}
            </Text>
            <ArrowRight size={14} color={theme.texteTertiaire} />
            <Text style={[styles.routeText, { color: theme.texte }]}>
              {va?.nom || 'Inconnu'}
            </Text>
          </View>
        </View>
        <View style={styles.routeMeta}>
          <Text style={[styles.routeDist, { color: theme.texteSecondaire }]}>
            {route.distance?.toFixed(1)} km
          </Text>
          <View style={[styles.qualiteBadge, { backgroundColor: getQualiteInfo(route.qualiteRoute === 'BONNE' ? 70 : route.qualiteRoute === 'MOYENNE' ? 50 : 20).couleur + '18' }]}>
            {getQualiteInfo(route.qualiteRoute === 'BONNE' ? 70 : route.qualiteRoute === 'MOYENNE' ? 50 : 20).icone}
            <Text style={[styles.qualiteText, { color: getQualiteInfo(route.qualiteRoute === 'BONNE' ? 70 : route.qualiteRoute === 'MOYENNE' ? 50 : 20).couleur }]}>
              {route.qualiteRoute}
            </Text>
          </View>
        </View>
        <View style={styles.routeActionsRow}>
          <Pressable onPress={() => setItineraireModal(route)} style={[styles.btnItineraire, { backgroundColor: theme.primaire + '12' }]}>
            <Navigation size={14} color={theme.primaire} />
            <Text style={[styles.btnItineraireText, { color: theme.primaire }]}>Voir itinéraire</Text>
          </Pressable>
          <Pressable onPress={() => ouvrirEdition(route)} style={[styles.btnItineraire, { backgroundColor: theme.primaire + '12' }]}>
            <Text style={[styles.btnItineraireText, { color: theme.primaire }]}>Modifier</Text>
          </Pressable>
          <Pressable
            onPress={() => modifierRoute(route.id, { estBloquee: !route.estBloquee })}
            style={[
              styles.actionRoute,
              { backgroundColor: route.estBloquee ? COULEURS.succes + '15' : COULEURS.rouge + '15' },
            ]}
          >
            <Text style={[styles.actionRouteText, { color: route.estBloquee ? COULEURS.succes : COULEURS.rouge }]}>
              {route.estBloquee ? 'Réactiver' : 'Bloquer'}
            </Text>
          </Pressable>
        </View>
      </Carte>
    );
  };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <MapPin size={22} color={theme.primaire} />
            <Text style={[styles.headerText, { color: theme.texte }]}>Gestion des Routes</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={basculerTheme} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              {mode === 'sombre' ? <Sun size={18} color={theme.primaire} /> : <Moon size={18} color={theme.primaire} />}
            </Pressable>
            <Pressable onPress={handleDeconnexion} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
            {utilisateur && (
              <Text style={[styles.headerUser, { color: theme.primaire }]}>
                {utilisateur.nom || 'Utilisateur'}
              </Text>
            )}
            <Pressable onPress={ouvrirAjout} style={[styles.btnAjout, { backgroundColor: theme.primaire }]}>
              <Plus size={18} color={COULEURS.blanc} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>Total</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{routes.length}</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>Actives</Text>
            <Text style={[styles.statValue, { color: COULEURS.succes }]}>{routesActives.length}</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>Bloquées</Text>
            <Text style={[styles.statValue, { color: COULEURS.rouge }]}>{routesBloquees.length}</Text>
          </Carte>
        </View>

        {/* Onglets */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setVue('actives')}
            style={[styles.tab, { borderBottomColor: vue === 'actives' ? theme.primaire : 'transparent' }]}
          >
            <Text style={[styles.tabText, { color: vue === 'actives' ? theme.primaire : theme.texteTertiaire }]}>
              Actives ({routesActives.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVue('bloquees')}
            style={[styles.tab, { borderBottomColor: vue === 'bloquees' ? COULEURS.rouge : 'transparent' }]}
          >
            <Text style={[styles.tabText, { color: vue === 'bloquees' ? COULEURS.rouge : theme.texteTertiaire }]}>
              Bloquées ({routesBloquees.length})
            </Text>
          </Pressable>
        </View>

        {/* Liste */}
        {(vue === 'actives' ? routesActives : routesBloquees).length === 0 ? (
          <EtatVide
            icone={<MapPin size={32} color={theme.primaire} />}
            titre={vue === 'actives' ? 'Aucune route active' : 'Aucune route bloquée'}
            description={vue === 'actives' ? 'Ajoutez des routes entre vos villages pour les visualiser ici.' : 'Toutes vos routes sont actuellement opérationnelles.'}
            actionLabel={vue === 'actives' ? 'Ajouter une route' : undefined}
            onAction={vue === 'actives' ? () => setModalVisible(true) : undefined}
          />
        ) : (
          (vue === 'actives' ? routesActives : routesBloquees).map((r) => (
            <ItemRoute key={r.id} route={r} />
          ))
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContenu, { backgroundColor: theme.fond }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitre, { color: theme.texte }]}>{edition ? 'Modifier la Route' : 'Nouvelle Route'}</Text>
              <Pressable onPress={() => { setModalVisible(false); setEdition(null); }}>
                <X size={22} color={theme.texteTertiaire} />
              </Pressable>
            </View>

            <Text style={[styles.selectLabel, { color: theme.texteSecondaire }]}>Départ</Text>
            <View style={[styles.selectBox, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
              {villages.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setDepartId(v.id)}
                  disabled={v.id === arriveeId}
                  style={[
                    styles.selectItem,
                    departId === v.id && { backgroundColor: theme.primaire + '15' },
                    v.id === arriveeId && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[styles.selectItemText, { color: departId === v.id ? theme.primaire : theme.texte }]}>
                    {v.nom}
                  </Text>
                  {departId === v.id && <CheckCircle size={16} color={theme.primaire} />}
                </Pressable>
              ))}
            </View>

            <Text style={[styles.selectLabel, { color: theme.texteSecondaire, marginTop: ESPACEMENTS.lg }]}>Arrivée</Text>
            <View style={[styles.selectBox, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
              {villages.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setArriveeId(v.id)}
                  disabled={v.id === departId}
                  style={[
                    styles.selectItem,
                    arriveeId === v.id && { backgroundColor: theme.primaire + '15' },
                    v.id === departId && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[styles.selectItemText, { color: arriveeId === v.id ? theme.primaire : theme.texte }]}>
                    {v.nom}
                  </Text>
                  {arriveeId === v.id && <CheckCircle size={16} color={theme.primaire} />}
                </Pressable>
              ))}
            </View>

            <Text style={[styles.selectLabel, { color: theme.texteSecondaire, marginTop: ESPACEMENTS.lg }]}>
              Qualité : <Text style={{ color: qualiteInfo.couleur, fontWeight: '800' }}>{qualiteInfo.label}</Text>
            </Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${qualite}%`, backgroundColor: qualiteInfo.couleur }]} />
            </View>
            <View style={styles.qualiteButtons}>
              <Pressable
                onPress={() => setQualite(20)}
                style={[styles.qualiteBtn, qualite <= 33 && { borderColor: COULEURS.rouge, backgroundColor: COULEURS.rouge + '12' }]}
              >
                <XCircle size={14} color={qualite <= 33 ? COULEURS.rouge : theme.texteTertiaire} />
                <Text style={[styles.qualiteBtnText, { color: qualite <= 33 ? COULEURS.rouge : theme.texteTertiaire }]}>Mauvaise</Text>
              </Pressable>
              <Pressable
                onPress={() => setQualite(50)}
                style={[styles.qualiteBtn, qualite > 33 && qualite < 66 && { borderColor: COULEURS.ambre, backgroundColor: COULEURS.ambre + '12' }]}
              >
                <AlertTriangle size={14} color={qualite > 33 && qualite < 66 ? COULEURS.ambre : theme.texteTertiaire} />
                <Text style={[styles.qualiteBtnText, { color: qualite > 33 && qualite < 66 ? COULEURS.ambre : theme.texteTertiaire }]}>Moyenne</Text>
              </Pressable>
              <Pressable
                onPress={() => setQualite(80)}
                style={[styles.qualiteBtn, qualite >= 66 && { borderColor: COULEURS.succes, backgroundColor: COULEURS.succes + '12' }]}
              >
                <CheckCircle size={14} color={qualite >= 66 ? COULEURS.succes : theme.texteTertiaire} />
                <Text style={[styles.qualiteBtnText, { color: qualite >= 66 ? COULEURS.succes : theme.texteTertiaire }]}>Bonne</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setEstBloquee(!estBloquee)} style={[styles.bloquerRow, { marginTop: ESPACEMENTS.lg }]}>
              <View style={[styles.checkbox, estBloquee && { backgroundColor: COULEURS.rouge, borderColor: COULEURS.rouge }]}>
                {estBloquee && <X size={12} color={COULEURS.blanc} />}
              </View>
              <Text style={[styles.bloquerText, { color: estBloquee ? COULEURS.rouge : theme.texteSecondaire }]}>
                Route bloquée
              </Text>
            </Pressable>

            <Bouton titre={edition ? 'Enregistrer les modifications' : 'Ajouter la Route'} onPress={soumettre} variante="primaire" taille="lg" style={{ marginTop: ESPACEMENTS.lg }} />

            {modalNotif && (
              <View style={{ marginTop: ESPACEMENTS.md }}>
                <Notification notification={modalNotif} onFermer={() => setModalNotif(null)} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Itinéraire */}
      <Modal visible={!!itineraireModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.itineraireModal, { backgroundColor: theme.fond }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitre, { color: theme.texte }]}>Itinéraire</Text>
              <Pressable onPress={() => setItineraireModal(null)}>
                <X size={22} color={theme.texteTertiaire} />
              </Pressable>
            </View>
            {itineraireModal && (
              <>
                {/* Carte */}
                {(() => {
                  const vDep = villages.find((v) => v.id === itineraireModal.villageDepart_id);
                  const vArr = villages.find((v) => v.id === itineraireModal.village_arrivee_id);
                  const chemin = itineraireModal.geometry ? decodePolyline(itineraireModal.geometry) : [];
                  const hasCoords = vDep && vArr;
                  const latMin = hasCoords ? Math.min(vDep.latitude, vArr.latitude, ...(chemin.map(p => p.latitude))) : 0;
                  const latMax = hasCoords ? Math.max(vDep.latitude, vArr.latitude, ...(chemin.map(p => p.latitude))) : 0;
                  const lngMin = hasCoords ? Math.min(vDep.longitude, vArr.longitude, ...(chemin.map(p => p.longitude))) : 0;
                  const lngMax = hasCoords ? Math.max(vDep.longitude, vArr.longitude, ...(chemin.map(p => p.longitude))) : 0;
                  const region = hasCoords ? {
                    latitude: (latMin + latMax) / 2,
                    longitude: (lngMin + lngMax) / 2,
                    latitudeDelta: Math.max(Math.abs(latMax - latMin) * 1.5, 0.05),
                    longitudeDelta: Math.max(Math.abs(lngMax - lngMin) * 1.5, 0.05),
                  } : undefined;
                  return (
                    <>
                      {region && (
                        <MapView
                          style={styles.itineraireMap}
                          region={region}
                        >
                          {vDep && (
                            <Marker
                              coordinate={{ latitude: vDep.latitude, longitude: vDep.longitude }}
                              title={vDep.nom}
                              pinColor="green"
                            />
                          )}
                          {vArr && (
                            <Marker
                              coordinate={{ latitude: vArr.latitude, longitude: vArr.longitude }}
                              title={vArr.nom}
                              pinColor="red"
                            />
                          )}
                          {chemin.length > 0 && (
                            <Polyline
                              coordinates={chemin}
                              strokeColor="#2563eb"
                              strokeWidth={4}
                            />
                          )}
                          {!chemin.length && vDep && vArr && (
                            <Polyline
                              coordinates={[
                                { latitude: vDep.latitude, longitude: vDep.longitude },
                                { latitude: vArr.latitude, longitude: vArr.longitude },
                              ]}
                              strokeColor="#2563eb"
                              strokeWidth={3}
                              lineDashPattern={[5, 5]}
                            />
                          )}
                        </MapView>
                      )}
                      <View style={styles.itineraireRow}>
                        <MapPin size={18} color={theme.primaire} />
                        <View>
                          <Text style={[styles.itineraireLabel, { color: theme.texte }]}>Départ</Text>
                          <Text style={[styles.itineraireValue, { color: theme.texteSecondaire }]}>
                            {obtenirNomVillage(itineraireModal.villageDepart_id)}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.itineraireLine, { backgroundColor: theme.bordure }]} />
                      <View style={styles.itineraireRow}>
                        <MapPin size={18} color={COULEURS.rouge} />
                        <View>
                          <Text style={[styles.itineraireLabel, { color: theme.texte }]}>Arrivée</Text>
                          <Text style={[styles.itineraireValue, { color: theme.texteSecondaire }]}>
                            {obtenirNomVillage(itineraireModal.village_arrivee_id)}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.itineraireDetail, { backgroundColor: theme.carte }]}>
                        <Text style={[styles.itineraireDetailText, { color: theme.texte }]}>
                          Distance : {itineraireModal.distance?.toFixed(1)} km
                        </Text>
                        <Text style={[styles.itineraireDetailText, { color: theme.texte }]}>
                          Qualité : {itineraireModal.qualiteRoute}
                        </Text>
                        <Text style={[styles.itineraireDetailText, { color: theme.texte }]}>
                          État : {itineraireModal.estBloquee ? 'Bloquée' : 'Active'}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </>
            )}
          </View>
        </View>
      </Modal>

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
  headerUser: { fontSize: 13, fontWeight: '600', maxWidth: 100 },
  iconBtn: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  btnAjout: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  statsRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  statCard: { flex: 1, alignItems: 'center', padding: ESPACEMENTS.md },
  statLabel: { fontSize: 11, fontWeight: '600', marginBottom: ESPACEMENTS.xs },
  statValue: { fontSize: 18, fontWeight: '800' },
  tabRow: { flexDirection: 'row', marginBottom: ESPACEMENTS.md },
  tab: { flex: 1, paddingVertical: ESPACEMENTS.md, borderBottomWidth: 2, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  routeCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ESPACEMENTS.sm },
  routeNames: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  routeText: { fontSize: 14, fontWeight: '600' },
  routeMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: ESPACEMENTS.sm },
  routeDist: { fontSize: 13, fontWeight: '500' },
  qualiteBadge: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.xs, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RAYONS.rond },
  qualiteText: { fontSize: 11, fontWeight: '700' },
  routeActionsRow: { flexDirection: 'row', gap: ESPACEMENTS.sm, marginTop: ESPACEMENTS.sm },
  btnItineraire: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.xs, paddingVertical: ESPACEMENTS.sm, borderRadius: RAYONS.md },
  btnItineraireText: { fontSize: 12, fontWeight: '700' },
  actionRoute: { flex: 1, padding: ESPACEMENTS.sm, borderRadius: RAYONS.md, alignItems: 'center' },
  actionRouteText: { fontSize: 12, fontWeight: '700' },
  itineraireModal: { borderRadius: RAYONS.xl, padding: ESPACEMENTS.xl, margin: ESPACEMENTS.lg, marginTop: 'auto', marginBottom: 'auto', backgroundColor: COULEURS.blanc, maxHeight: '90%' },
  itineraireMap: { width: '100%', height: 220, borderRadius: RAYONS.lg, marginBottom: ESPACEMENTS.md },
  itineraireRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  itineraireLine: { width: 2, height: 20, marginLeft: 8, marginBottom: ESPACEMENTS.md },
  itineraireLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  itineraireValue: { fontSize: 14, fontWeight: '500' },
  itineraireDetail: { borderRadius: RAYONS.md, padding: ESPACEMENTS.md, marginTop: ESPACEMENTS.md },
  itineraireDetailText: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContenu: { borderTopLeftRadius: RAYONS.xl, borderTopRightRadius: RAYONS.xl, padding: ESPACEMENTS.xl, paddingBottom: ESPACEMENTS.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.lg },
  modalTitre: { fontSize: 18, fontWeight: '800' },
  selectLabel: { fontSize: 12, fontWeight: '600', marginBottom: ESPACEMENTS.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  selectBox: { borderRadius: RAYONS.md, borderWidth: 1.5, maxHeight: 140 },
  selectItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: ESPACEMENTS.md },
  selectItemText: { fontSize: 14, fontWeight: '500' },
  sliderTrack: { height: 8, backgroundColor: '#e2e8f0', borderRadius: RAYONS.rond, overflow: 'hidden' },
  sliderFill: { height: '100%', borderRadius: RAYONS.rond },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: ESPACEMENTS.xs },
  qualiteButtons: { flexDirection: 'row', gap: ESPACEMENTS.sm, marginTop: ESPACEMENTS.sm },
  qualiteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.xs, paddingVertical: ESPACEMENTS.sm, borderRadius: RAYONS.md, borderWidth: 1.5, borderColor: '#e2e8f0' },
  qualiteBtnText: { fontSize: 12, fontWeight: '700' },
  bloquerRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center' },
  bloquerText: { fontSize: 13, fontWeight: '600' },
});
