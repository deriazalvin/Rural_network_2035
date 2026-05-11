/**
 * Gestion des Villages — Version Mobile
 * Liste, ajout, édition, filtres, carte
 */
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
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
} from 'react-native';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { Carte, Bouton, ChampSaisie, Notification, EtatVide } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import { TAILLES } from '../../src/styles/espacements';
import {
  MapPin,
  BarChart2,
  Trash2,
  Edit2,
  Plus,
  X,
  TrendingUp,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react-native';
import type { Village, Notification as NotificationType } from '../../src/types';

export default function VillagesScreen() {
  const { theme, mode, basculerTheme } = useTheme();
  const { deconnexion, utilisateur } = useAuth();
  const router = useRouter();
  const { villages, ajouterVillage, supprimerVillage, chargement } = useDonnees();

  const handleDeconnexion = async () => {
    await deconnexion();
    router.replace('/accueil');
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [filtre, setFiltre] = useState<'tous' | 'faible' | 'moyen' | 'eleve'>('tous');
  const [edition, setEdition] = useState<Village | null>(null);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [modalNotif, setModalNotif] = useState<NotificationType | null>(null);

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
    if (volume >= 500) return { couleur: COULEURS.emeraude, label: 'Élevée' };
    if (volume >= 100) return { couleur: COULEURS.emeraudeClair, label: 'Moyenne' };
    return { couleur: '#6ee7b7', label: 'Faible' };
  };

  const villagesFiltres = villages.filter((v) => {
    if (filtre === 'tous') return true;
    if (filtre === 'faible') return v.volumeProduction < 100;
    if (filtre === 'moyen') return v.volumeProduction >= 100 && v.volumeProduction < 500;
    return v.volumeProduction >= 500;
  });

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
      setNotification({ type: 'erreur', titre: 'Champs incomplets', message: 'Remplissez tous les champs' });
      return;
    }
    try {
      if (edition) {
        // Pour la simplicité, suppression + ajout (le backend gère les PUT)
        await supprimerVillage(edition.id);
      }
      await ajouterVillage({
        nom,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        volumeProduction: parseFloat(prod),
      });
      setModalVisible(false);
      setNotification({ type: 'succes', titre: 'Village enregistré', message: `${nom} a été ajouté avec succès` });
    } catch (err: any) {
      setNotification({ type: 'erreur', titre: 'Erreur', message: err.message });
    }
  };

  const handleSupprimer = async (id: string, nomVillage: string) => {
    try {
      await supprimerVillage(id);
      setNotification({ type: 'succes', titre: 'Supprimé', message: `${nomVillage} a été supprimé` });
    } catch (err: any) {
      setNotification({ type: 'erreur', titre: 'Erreur', message: err.message });
    }
  };

  const filtres: { cle: typeof filtre; label: string }[] = [
    { cle: 'tous', label: 'Tous' },
    { cle: 'faible', label: '< 100kg' },
    { cle: 'moyen', label: '100-500kg' },
    { cle: 'eleve', label: '> 500kg' },
  ];

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <MapPin size={22} color={theme.primaire} />
            <Text style={[styles.headerText, { color: theme.texte }]}>Gestion des Villages</Text>
          </View>
          <View style={styles.headerActions}>
            {utilisateur && (
              <Text style={[styles.headerUser, { color: theme.primaire }]}>
                {utilisateur.nom || 'Utilisateur'}
              </Text>
            )}
            <Pressable onPress={basculerTheme} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              {mode === 'sombre' ? <Sun size={18} color={theme.primaire} /> : <Moon size={18} color={theme.primaire} />}
            </Pressable>
            <Pressable onPress={handleDeconnexion} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
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
            <Text style={[styles.statValue, { color: theme.texte }]}>{totalVillages}</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>Production</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{(productionTotale / 1000).toFixed(2)} t</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>Moyenne</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{moyenne} kg</Text>
          </Carte>
        </View>

        {/* Filtres */}
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

        {/* Liste Villages */}
        <Text style={[styles.sectionTitle, { color: theme.texte }]}>
          Villages ({villagesFiltres.length}/{villages.length})
        </Text>

        {villagesFiltres.length === 0 ? (
          <EtatVide
            icone={<MapPin size={32} color={theme.primaire} />}
            titre="Aucun village enregistré"
            description="Ajoutez vos villages pour commencer à cartographier votre réseau rural."
            actionLabel="Ajouter un village"
            onAction={ouvrirAjout}
          />
        ) : (
          villagesFiltres.map((v) => {
            const badge = getBadge(v.volumeProduction);
            return (
              <Carte key={v.id} style={styles.villageCard} ombre="sm">
                <View style={styles.villageHeader}>
                  <Text style={[styles.villageNom, { color: theme.texte }]}>{v.nom}</Text>
                  <View style={styles.actions}>
                    <Pressable onPress={() => ouvrirEdition(v)} style={styles.actionBtn}>
                      <Edit2 size={16} color={COULEURS.bleu} />
                    </Pressable>
                    <Pressable onPress={() => handleSupprimer(v.id, v.nom)} style={styles.actionBtn}>
                      <Trash2 size={16} color={COULEURS.rouge} />
                    </Pressable>
                  </View>
                </View>
                <View style={[styles.badgeRow, { backgroundColor: badge.couleur + '18', borderColor: badge.couleur }]}>
                  <TrendingUp size={14} color={badge.couleur} />
                  <Text style={[styles.badgeText, { color: badge.couleur }]}>
                    {v.volumeProduction} kg
                  </Text>
                  <View style={[styles.badgePill, { backgroundColor: badge.couleur + '25' }]}>
                    <Text style={[styles.badgePillText, { color: badge.couleur }]}>{badge.label}</Text>
                  </View>
                </View>
                <Text style={[styles.coords, { color: theme.texteTertiaire }]}>
                  Lat: {v.latitude.toFixed(4)}, Lon: {v.longitude.toFixed(4)}
                </Text>
              </Carte>
            );
          })
        )}
      </ScrollView>

      {/* Modal Ajout/Édition */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContenu, { backgroundColor: theme.fond }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitre, { color: theme.texte }]}>
                {edition ? 'Modifier' : 'Ajouter'} un Village
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <X size={22} color={theme.texteTertiaire} />
              </Pressable>
            </View>
            {/* Recherche Nominatim */}
            <Text style={[styles.selectLabel, { color: theme.texteTertiaire }]}>RECHERCHER UNE ADRESSE</Text>
            <View style={[styles.nominatimInput, { borderColor: theme.bordure, backgroundColor: theme.carte }]}>
              <TextInput
                placeholder="Mananjary, Madagascar..."
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

            <ChampSaisie etiquette="Nom du village" placeholder="Mananjary" value={nom} onChangeText={setNom} />
            <View style={{ flexDirection: 'row', gap: ESPACEMENTS.md }}>
              <View style={{ flex: 1 }}>
                <ChampSaisie etiquette="Latitude" placeholder="-21.2200" value={lat} onChangeText={setLat} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <ChampSaisie etiquette="Longitude" placeholder="48.3500" value={lon} onChangeText={setLon} keyboardType="numeric" />
              </View>
            </View>
            <ChampSaisie etiquette="Production (kg)" placeholder="520" value={prod} onChangeText={setProd} keyboardType="numeric" />
            <Bouton
              titre={edition ? 'Modifier' : 'Ajouter'}
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
  filtreRow: { flexDirection: 'row', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.md },
  filtrePill: { paddingHorizontal: ESPACEMENTS.md, paddingVertical: ESPACEMENTS.sm, borderRadius: RAYONS.rond, borderWidth: 1.5 },
  filtreText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: ESPACEMENTS.md },
  videCard: { alignItems: 'center', padding: ESPACEMENTS.xl },
  videText: { marginTop: ESPACEMENTS.md, fontSize: 13 },
  villageCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  villageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.sm },
  villageNom: { fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: ESPACEMENTS.sm },
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
});
