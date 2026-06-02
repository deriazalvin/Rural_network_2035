/**
 * Gestion des Villages — Version Mobile
 * Liste, ajout, édition, filtres, carte, recherche, pagination
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { useI18n } from '../../src/contextes/ContexteI18n';
import { Carte, Bouton, ChampSaisie, Notification, EtatVide } from '../../src/composants';
import { COULEURS } from '../../src/styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../../src/styles/espacements';
import { TAILLES } from '../../src/styles/espacements';
import { HeaderApp } from '../../src/composants/HeaderApp';
import {
  MapPin,
  BarChart2,
  Trash2,
  Edit2,
  Plus,
  X,
  TrendingUp,
  Eye,
  ArrowLeft,
  Search,
  ChevronRight,
} from 'lucide-react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import type { Village, Notification as NotificationType } from '../../src/types';

const ITEMS_PER_PAGE = 10;

function getMarkerColor(volume: number): string {
  if (volume >= 500) return '#ef4444';
  if (volume >= 100) return '#3b82f6';
  return '#22c55e';
}

const VillageItem = React.memo(({ village, theme, t, onView, onEdit, onDelete, getBadge }: {
  village: Village;
  theme: any;
  t: any;
  onView: (v: Village) => void;
  onEdit: (v: Village) => void;
  onDelete: (id: string, nom: string) => void;
  getBadge: (volume: number) => { couleur: string; label: string };
}) => {
  const badge = getBadge(village.volumeProduction);
  return (
    <Carte style={styles.villageCard} ombre="sm">
      <View style={styles.villageHeader}>
        <Text style={[styles.villageNom, { color: theme.texte }]}>{village.nom}</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => onView(village)} style={[styles.actionBtn, { backgroundColor: theme.primaire + '12', borderRadius: 8, padding: 6 }]}>
            <Eye size={16} color={theme.primaire} />
          </Pressable>
          <Pressable onPress={() => onEdit(village)} style={[styles.actionBtn, { backgroundColor: COULEURS.bleu + '12', borderRadius: 8, padding: 6 }]}>
            <Edit2 size={16} color={COULEURS.bleu} />
          </Pressable>
          <Pressable onPress={() => onDelete(village.id, village.nom)} style={[styles.actionBtn, { backgroundColor: COULEURS.rouge + '12', borderRadius: 8, padding: 6 }]}>
            <Trash2 size={16} color={COULEURS.rouge} />
          </Pressable>
        </View>
      </View>
      <View style={[styles.badgeRow, { backgroundColor: badge.couleur + '18', borderColor: badge.couleur }]}>
        <TrendingUp size={14} color={badge.couleur} />
        <Text style={[styles.badgeText, { color: badge.couleur }]}>
          {village.volumeProduction} kg
        </Text>
        <View style={[styles.badgePill, { backgroundColor: badge.couleur + '25' }]}>
          <Text style={[styles.badgePillText, { color: badge.couleur }]}>{badge.label}</Text>
        </View>
      </View>
      <Text style={[styles.coords, { color: theme.texteTertiaire }]}>
        {t('villages.coords').replace('{lat}', village.latitude.toFixed(4)).replace('{lon}', village.longitude.toFixed(4))}
      </Text>
    </Carte>
  );
});

export default function VillagesScreen() {
  const { theme } = useTheme();
  const { villages, ajouterVillage, supprimerVillage, chargement } = useDonnees();
  const { t } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);
  const [filtre, setFiltre] = useState<'tous' | 'faible' | 'moyen' | 'eleve'>('tous');
  const [edition, setEdition] = useState<Village | null>(null);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [modalNotif, setModalNotif] = useState<NotificationType | null>(null);
  const [villageSelectionne, setVillageSelectionne] = useState<Village | null>(null);
  const [recherche, setRecherche] = useState('');
  const [pageCourante, setPageCourante] = useState(1);

  const [nom, setNom] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [prod, setProd] = useState('');

  // Nominatim
  const [rechercheAdresse, setRechercheAdresse] = useState('');
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [chargementNominatim, setChargementNominatim] = useState(false);

  const rechercherNominatim = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setChargementNominatim(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'RuralNetworkApp/1.0' } }
      );
      const data = await res.json();
      setSuggestions(data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      })));
    } catch {
      setSuggestions([]);
    } finally {
      setChargementNominatim(false);
    }
  }, []);

  const selectionnerSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    setNom(s.display_name.split(',')[0]);
    setLat(s.lat);
    setLon(s.lon);
    setRechercheAdresse(s.display_name);
    setSuggestions([]);
  };

  const getBadge = (volume: number) => {
    if (volume >= 500) return { couleur: COULEURS.emeraude, label: t('villages.eleve') };
    if (volume >= 100) return { couleur: COULEURS.emeraudeClair, label: t('villages.moyen') };
    return { couleur: '#6ee7b7', label: t('villages.faible') };
  };

  const villagesFiltres = villages.filter((v) => {
    if (filtre === 'tous') return true;
    if (filtre === 'faible') return v.volumeProduction < 100;
    if (filtre === 'moyen') return v.volumeProduction >= 100 && v.volumeProduction < 500;
    return v.volumeProduction >= 500;
  }).filter((v) => {
    if (!recherche) return true;
    return v.nom.toLowerCase().includes(recherche.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(villagesFiltres.length / ITEMS_PER_PAGE));
  const pageCouranteClamped = Math.min(pageCourante, totalPages);
  const indexDebut = (pageCouranteClamped - 1) * ITEMS_PER_PAGE;
  const villagesPage = villagesFiltres.slice(indexDebut, indexDebut + ITEMS_PER_PAGE);

  const totalVillages = villages.length;
  const productionTotale = villages.reduce((s, v) => s + (v.volumeProduction || 0), 0);
  const moyenne = totalVillages > 0 ? (productionTotale / totalVillages).toFixed(2) : '0';

  const ouvrirAjout = () => {
    setEdition(null);
    setNom('');
    setLat('');
    setLon('');
    setProd('');
    setRechercheAdresse('');
    setSuggestions([]);
    setModalVisible(true);
  };

  const ouvrirEdition = (v: Village) => {
    setEdition(v);
    setNom(v.nom);
    setLat(v.latitude.toString());
    setLon(v.longitude.toString());
    setProd(v.volumeProduction.toString());
    setModalVisible(true);
  };

  const soumettre = async () => {
    if (!nom || !lat || !lon || !prod) {
      setNotification({ type: 'erreur', titre: t('villages.champsIncomplets'), message: t('villages.champsIncompletsMsg') });
      return;
    }
    try {
      if (edition) {
        await supprimerVillage(edition.id);
      }
      await ajouterVillage({
        nom,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        volumeProduction: parseFloat(prod),
      });
      setModalVisible(false);
      setNotification({ type: 'succes', titre: t('villages.enregistre'), message: t('villages.enregistreMsg').replace('{nom}', nom) });
    } catch (err: any) {
      setNotification({ type: 'erreur', titre: t('villages.erreur'), message: err.message });
    }
  };

  const handleSupprimer = async (id: string, nomVillage: string) => {
    try {
      await supprimerVillage(id);
      setNotification({ type: 'succes', titre: t('villages.supprime'), message: t('villages.supprimeMsg').replace('{nomVillage}', nomVillage) });
    } catch (err: any) {
      setNotification({ type: 'erreur', titre: t('villages.erreur'), message: err.message });
    }
  };

  const filtres: { cle: typeof filtre; label: string }[] = [
    { cle: 'tous', label: t('villages.filtreTous') },
    { cle: 'faible', label: t('villages.filtreFaible') },
    { cle: 'moyen', label: t('villages.filtreMoyen') },
    { cle: 'eleve', label: t('villages.filtreEleve') },
  ];

  // Vue détaillée d'un village
  if (villageSelectionne) {
    const v = villageSelectionne;
    const badge = getBadge(v.volumeProduction);
    const markerColor = getMarkerColor(v.volumeProduction);
    const rayonCercle = Math.sqrt(v.volumeProduction || 1) * 50;
    return (
      <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
        <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => setVillageSelectionne(null)} style={styles.iconBtn}>
              <ArrowLeft size={22} color={theme.primaire} />
            </Pressable>
            <View style={styles.headerTitle}>
              <MapPin size={20} color={theme.primaire} />
              <Text style={[styles.headerText, { color: theme.texte }]} numberOfLines={1}>{v.nom}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Carte style={styles.detailMapCard} ombre="sm">
            {v.latitude && v.longitude && (
              <MapView
                style={styles.detailMap}
                initialRegion={{
                  latitude: v.latitude,
                  longitude: v.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{ latitude: v.latitude, longitude: v.longitude }}
                  title={v.nom}
                  pinColor={markerColor}
                />
                <Circle
                  center={{ latitude: v.latitude, longitude: v.longitude }}
                  radius={rayonCercle}
                  strokeColor={markerColor}
                  fillColor={markerColor + '25'}
                  strokeWidth={2}
                />
              </MapView>
            )}
          </Carte>

          <View style={[styles.badgeRow, { backgroundColor: badge.couleur + '18', borderColor: badge.couleur }]}>
            <TrendingUp size={16} color={badge.couleur} />
            <Text style={[styles.badgeText, { color: badge.couleur }]}>
              {v.volumeProduction} kg
            </Text>
            <View style={[styles.badgePill, { backgroundColor: badge.couleur + '25' }]}>
              <Text style={[styles.badgePillText, { color: badge.couleur }]}>{badge.label}</Text>
            </View>
          </View>

          <View style={styles.detailCoordsRow}>
            <View style={[styles.detailCoordItem, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
              <Text style={[styles.detailCoordLabel, { color: theme.texteTertiaire }]}>{t('villages.latLabel')}</Text>
              <Text style={[styles.detailCoordValue, { color: theme.texte }]}>{v.latitude.toFixed(6)}</Text>
            </View>
            <View style={[styles.detailCoordItem, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
              <Text style={[styles.detailCoordLabel, { color: theme.texteTertiaire }]}>{t('villages.lonLabel')}</Text>
              <Text style={[styles.detailCoordValue, { color: theme.texte }]}>{v.longitude.toFixed(6)}</Text>
            </View>
          </View>

          <View style={styles.detailActions}>
            <Pressable
              onPress={() => { ouvrirEdition(v); setVillageSelectionne(null); }}
              style={[styles.detailActionBtn, { backgroundColor: theme.primaire + '15' }]}
            >
              <Edit2 size={16} color={theme.primaire} />
              <Text style={[styles.detailActionText, { color: theme.primaire }]}>{t('villages.modifier')}</Text>
            </Pressable>
            <Pressable
              onPress={() => { handleSupprimer(v.id, v.nom); setVillageSelectionne(null); }}
              style={[styles.detailActionBtn, { backgroundColor: COULEURS.rouge + '15' }]}
            >
              <Trash2 size={16} color={COULEURS.rouge} />
              <Text style={[styles.detailActionText, { color: COULEURS.rouge }]}>{t('commun.supprimer')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Vue liste
  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <HeaderApp
        icone={<MapPin size={22} color={theme.primaire} />}
        titre={t('villages.titre')}
      >
        <Pressable onPress={ouvrirAjout} style={[styles.btnAjout, { backgroundColor: theme.primaire }]}>
          <Plus size={18} color={COULEURS.blanc} />
        </Pressable>
      </HeaderApp>

      <View style={[styles.scroll, { paddingBottom: 0 }]}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('villages.total')}</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{totalVillages}</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('villages.production')}</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{(productionTotale / 1000).toFixed(2)} t</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('villages.moyenne')}</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{moyenne} kg</Text>
          </Carte>
        </View>

        {/* Search + Filtres */}
        <View style={[styles.searchRow, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
          <Search size={16} color={theme.texteTertiaire} />
          <TextInput
            placeholder={t('villages.rechercher')}
            placeholderTextColor={theme.texteTertiaire}
            value={recherche}
            onChangeText={(text) => { setRecherche(text); setPageCourante(1); }}
            style={[styles.searchInput, { color: theme.texte }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtreRow}
        >
          {filtres.map((f) => (
            <Pressable
              key={f.cle}
              onPress={() => setFiltre(f.cle)}
              style={[
                styles.filtrePill,
                {
                  backgroundColor: filtre === f.cle ? theme.primaire : theme.carte,
                  borderColor: filtre === f.cle ? theme.primaire : theme.bordure,
                },
              ]}
            >
              <Text
                style={[
                  styles.filtreText,
                  { color: filtre === f.cle ? COULEURS.blanc : theme.texteSecondaire },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={villagesPage}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <VillageItem
            village={item}
            theme={theme}
            t={t}
            onView={setVillageSelectionne}
            onEdit={ouvrirEdition}
            onDelete={handleSupprimer}
            getBadge={getBadge}
          />
        )}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: theme.texte }]}>
            {t('villages.sectionTitre')} ({villagesPage.length}/{villagesFiltres.length})
          </Text>
        }
        ListEmptyComponent={
          <EtatVide
            icone={<MapPin size={32} color={theme.primaire} />}
            titre={t('villages.vide')}
            description={t('villages.videDesc')}
            actionLabel={t('villages.videCTA')}
            onAction={ouvrirAjout}
          />
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.paginationRow}>
              <Pressable
                disabled={pageCouranteClamped <= 1}
                onPress={() => setPageCourante(p => Math.max(1, p - 1))}
                style={[styles.pageBtn, { opacity: pageCouranteClamped <= 1 ? 0.4 : 1, borderColor: theme.bordure }]}
              >
                <Text style={[styles.pageBtnText, { color: theme.texte }]}>{t('villages.pagePrecedente')}</Text>
              </Pressable>
              <Text style={[styles.pageInfo, { color: theme.texteTertiaire }]}>
                {pageCouranteClamped}/{totalPages}
              </Text>
              <Pressable
                disabled={pageCouranteClamped >= totalPages}
                onPress={() => setPageCourante(p => Math.min(totalPages, p + 1))}
                style={[styles.pageBtn, { opacity: pageCouranteClamped >= totalPages ? 0.4 : 1, borderColor: theme.bordure }]}
              >
                <ChevronRight size={16} color={theme.texte} />
              </Pressable>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: ESPACEMENTS.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal Ajout/Édition */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={[styles.modalContenu, { backgroundColor: theme.fond }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitre, { color: theme.texte }]}>
                  {edition ? t('villages.modifier') : t('villages.ajouter')} un Village
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <X size={22} color={theme.texteTertiaire} />
                </Pressable>
              </View>
              {/* Recherche Nominatim */}
              <Text style={[styles.selectLabel, { color: theme.texteTertiaire }]}>{t('villages.rechercheAdresse')}</Text>
              <View style={[styles.nominatimInput, { borderColor: theme.bordure, backgroundColor: theme.carte }]}>
                <TextInput
                  placeholder={t('villages.adressePlaceholder')}
                  placeholderTextColor={theme.texteTertiaire}
                  value={rechercheAdresse}
                  onChangeText={(text) => {
                    setRechercheAdresse(text);
                    rechercherNominatim(text);
                  }}
                  style={{ flex: 1, color: theme.texte, fontSize: 14 }}
                />
                {chargementNominatim && <ActivityIndicator size="small" color={theme.primaire} />}
              </View>

              {suggestions.length > 0 && (
                <View style={[styles.suggestionsBox, { backgroundColor: theme.carte, borderColor: theme.bordure }]}>
                  {suggestions.map((s, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => selectionnerSuggestion(s)}
                      style={[styles.suggestionItem, { borderBottomColor: theme.bordure }]}
                    >
                      <MapPin size={14} color={theme.primaire} />
                      <Text style={[styles.suggestionText, { color: theme.texte }]} numberOfLines={1}>
                        {s.display_name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <ChampSaisie etiquette={t('villages.nomLabel')} placeholder={t('villages.nomPlaceholder')} value={nom} onChangeText={setNom} />
              <View style={{ flexDirection: 'row', gap: ESPACEMENTS.md }}>
                <View style={{ flex: 1 }}>
                  <ChampSaisie etiquette={t('villages.latLabel')} placeholder={t('villages.latPlaceholder')} value={lat} onChangeText={setLat} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <ChampSaisie etiquette={t('villages.lonLabel')} placeholder={t('villages.lonPlaceholder')} value={lon} onChangeText={setLon} keyboardType="numeric" />
                </View>
              </View>
              <ChampSaisie etiquette={t('villages.prodLabel')} placeholder={t('villages.prodPlaceholder')} value={prod} onChangeText={setProd} keyboardType="numeric" />
              <Bouton
                titre={edition ? t('villages.modifier') : t('villages.ajouter')}
                onPress={soumettre}
                variante="primaire"
                taille="lg"
              />
              {modalNotif && (
                <View style={{ marginTop: ESPACEMENTS.md }}>
                  <Notification notification={modalNotif} onFermer={() => setModalNotif(null)} />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, flex: 1 },
  headerText: { fontSize: 18, fontWeight: '800', flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  headerUser: { fontSize: 13, fontWeight: '600', maxWidth: 100 },
  iconBtn: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  btnAjout: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  statsRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  statCard: { flex: 1, alignItems: 'center', padding: ESPACEMENTS.md },
  statLabel: { fontSize: 11, fontWeight: '600', marginBottom: ESPACEMENTS.xs },
  statValue: { fontSize: 18, fontWeight: '800' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, paddingHorizontal: ESPACEMENTS.md, paddingVertical: ESPACEMENTS.xs, borderRadius: RAYONS.md, borderWidth: 1, marginBottom: ESPACEMENTS.md },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: ESPACEMENTS.sm },
  filtreRow: { flexDirection: 'row', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.md },
  filtrePill: { paddingHorizontal: ESPACEMENTS.md, paddingVertical: ESPACEMENTS.sm, borderRadius: RAYONS.rond, borderWidth: 1.5 },
  filtreText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: ESPACEMENTS.md },
  videCard: { alignItems: 'center', padding: ESPACEMENTS.xl },
  videText: { marginTop: ESPACEMENTS.md, fontSize: 13 },
  villageCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  villageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.sm },
  villageNom: { fontSize: 15, fontWeight: '700', flex: 1 },
  actions: { flexDirection: 'row', gap: ESPACEMENTS.xs },
  actionBtn: { padding: ESPACEMENTS.xs },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, padding: ESPACEMENTS.sm, borderRadius: RAYONS.md, borderWidth: 1, marginBottom: ESPACEMENTS.xs },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RAYONS.rond },
  badgePillText: { fontSize: 10, fontWeight: '700' },
  coords: { fontSize: 11 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContenu: { borderTopLeftRadius: RAYONS.xl, borderTopRightRadius: RAYONS.xl, padding: ESPACEMENTS.xl, paddingBottom: ESPACEMENTS.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.lg },
  modalTitre: { fontSize: 18, fontWeight: '800' },
  selectLabel: { fontSize: 12, fontWeight: '600', marginBottom: ESPACEMENTS.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  nominatimInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: RAYONS.md, paddingHorizontal: ESPACEMENTS.md, height: 48, marginBottom: ESPACEMENTS.md },
  suggestionsBox: { borderWidth: 1, borderRadius: RAYONS.md, marginBottom: ESPACEMENTS.md, maxHeight: 160, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, padding: ESPACEMENTS.md, borderBottomWidth: 1 },
  suggestionText: { fontSize: 13, fontWeight: '500', flex: 1 },
  // Detail view styles
  detailMapCard: { marginBottom: ESPACEMENTS.md, overflow: 'hidden', padding: 0 },
  detailMap: { width: '100%', height: 280 },
  detailCoordsRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  detailCoordItem: { flex: 1, padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1 },
  detailCoordLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailCoordValue: { fontSize: 14, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  detailActions: { flexDirection: 'row', gap: ESPACEMENTS.md },
  detailActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.xs, paddingVertical: ESPACEMENTS.md, borderRadius: RAYONS.md },
  detailActionText: { fontSize: 14, fontWeight: '700' },
  // Pagination
  paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.md, marginTop: ESPACEMENTS.md, marginBottom: ESPACEMENTS.lg },
  pageBtn: { paddingHorizontal: ESPACEMENTS.md, paddingVertical: ESPACEMENTS.sm, borderRadius: RAYONS.md, borderWidth: 1 },
  pageBtnText: { fontSize: 13, fontWeight: '600' },
  pageInfo: { fontSize: 13, fontWeight: '600' },
});
