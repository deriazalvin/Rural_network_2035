/**
 * Gestion de la Flotte (Camions) — Version Mobile
 * Ajout, suppression, changement d'état, couleurs
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { useI18n } from '../../src/contextes/ContexteI18n';
import { Carte, Bouton, ChampSaisie, Notification, EtatVide } from '../../src/composants';
import { COULEURS } from '../../src/styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../../src/styles/espacements';
import { HeaderApp } from '../../src/composants/HeaderApp';
import {
  Truck,
  Plus,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react-native';
import type { Camion as CamionType, Notification as NotificationType } from '../../src/types';

const COULEURS_DISPONIBLES = [
  { label: 'Vert', valeur: '#10b981' },
  { label: 'Violet', valeur: '#7c3aed' },
  { label: 'Orange', valeur: '#fb923c' },
  { label: 'Rouge', valeur: '#ef4444' },
  { label: 'Bleu', valeur: '#3b82f6' },
];

const ETATS: CamionType['etat'][] = ['DISPONIBLE', 'OCCUPE', 'EN_PANNE'];

export default function CamionsScreen() {
  const { theme } = useTheme();
  const { camions, ajouterCamion, supprimerCamion, modifierEtatCamion } = useDonnees();
  const { t, langue } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);
  const [nom, setNom] = useState('');
  const [capacite, setCapacite] = useState('');
  const [couleur, setCouleur] = useState(COULEURS_DISPONIBLES[0].valeur);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [modalNotif, setModalNotif] = useState<NotificationType | null>(null);

  const couleursUtilisees = camions.map((c) => c.couleurHex);
  const couleursRestantes = COULEURS_DISPONIBLES.filter(
    (c) => !couleursUtilisees.includes(c.valeur)
  );

  const soumettre = async () => {
    if (!nom || !capacite) {
      setModalNotif({ type: 'erreur', titre: t('camions.champsIncomplets'), message: t('camions.champsIncompletsMsg') });
      return;
    }
    if (isNaN(parseFloat(capacite)) || parseFloat(capacite) <= 0) {
      setModalNotif({ type: 'erreur', titre: t('camions.capaInvalide'), message: t('camions.capaInvalideMsg') });
      return;
    }
    try {
      await ajouterCamion({
        nom,
        capaciteKg: parseFloat(capacite),
        couleurHex: couleur,
        etat: 'DISPONIBLE',
      });
      setModalVisible(false);
      setNom('');
      setCapacite('');
      setNotification({ type: 'succes', titre: t('camions.ajoute'), message: t('camions.ajouteMsg').replace('{nom}', nom) });
    } catch (err: any) {
      setModalNotif({ type: 'erreur', titre: t('camions.erreur'), message: err.message });
    }
  };

  const getEtatCouleur = (etat: CamionType['etat']) => {
    switch (etat) {
      case 'DISPONIBLE': return COULEURS.succes;
      case 'OCCUPE': return COULEURS.ambre;
      case 'EN_PANNE': return COULEURS.rouge;
      default: return COULEURS.texteTertiaire;
    }
  };

  const getEtatLabel = (etat: CamionType['etat']) => {
    switch (etat) {
      case 'DISPONIBLE': return t('camions.etatDisponible');
      case 'OCCUPE': return t('camions.etatOccupe');
      case 'EN_PANNE': return t('camions.etatPanne');
      default: return etat;
    }
  };

  const handleEtatChange = async (id: string, etat: CamionType['etat']) => {
    try {
      await modifierEtatCamion(id, etat);
    } catch (err: any) {
      setNotification({ type: 'erreur', titre: t('camions.erreur'), message: err.message });
    }
  };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <HeaderApp
        icone={<Truck size={22} color={theme.primaire} />}
        titre={t('camions.titre')}
      >
        <Pressable onPress={() => setModalVisible(true)} style={[styles.btnAjout, { backgroundColor: theme.primaire }]}>
          <Plus size={18} color={COULEURS.blanc} />
        </Pressable>
      </HeaderApp>

      <View style={[styles.scroll, { paddingBottom: 0 }]}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('camions.total')}</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>{camions.length}</Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('camions.disponibles')}</Text>
            <Text style={[styles.statValue, { color: COULEURS.succes }]}>
              {camions.filter((c) => c.etat === 'DISPONIBLE').length}
            </Text>
          </Carte>
          <Carte style={styles.statCard} ombre="sm">
            <Text style={[styles.statLabel, { color: theme.texteTertiaire }]}>{t('camions.capacite')}</Text>
            <Text style={[styles.statValue, { color: theme.texte }]}>
              {(camions.reduce((s, c) => s + (c.capaciteKg || 0), 0) / 1000).toFixed(1)}t
            </Text>
          </Carte>
        </View>
      </View>

      <FlatList
        data={camions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: camion }) => (
          <Carte key={camion.id} style={styles.camionCard} ombre="sm">
            <View style={styles.camionHeader}>
              <View style={styles.camionTitle}>
                <View style={[styles.camionDot, { backgroundColor: camion.couleurHex }]} />
                <Text style={[styles.camionNom, { color: theme.texte }]}>{camion.nom}</Text>
              </View>
              <Pressable onPress={() => supprimerCamion(camion.id)}>
                <Trash2 size={18} color={COULEURS.rouge} />
              </Pressable>
            </View>

            <Text style={[styles.camionCapa, { color: theme.texteSecondaire }]}>
              {t('camions.capaciteLabel')} {(camion.capaciteKg || 0).toLocaleString(langue)} kg
            </Text>

            <View style={styles.etatRow}>
              {ETATS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => handleEtatChange(camion.id, e)}
                  style={[
                    styles.etatPill,
                    {
                      backgroundColor:
                        camion.etat === e
                          ? getEtatCouleur(e) + '20'
                          : theme.carte,
                      borderColor:
                        camion.etat === e ? getEtatCouleur(e) : theme.bordure,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.etatPillText,
                      {
                        color:
                          camion.etat === e
                            ? getEtatCouleur(e)
                            : theme.texteTertiaire,
                      },
                    ]}
                  >
                    {getEtatLabel(e)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.etatBanner, { backgroundColor: getEtatCouleur(camion.etat) + '12' }]}>
              <Text style={[styles.etatBannerText, { color: getEtatCouleur(camion.etat) }]}>
                {getEtatLabel(camion.etat)}
              </Text>
            </View>
          </Carte>
        )}
        ListEmptyComponent={
          <EtatVide
            icone={<Truck size={32} color={theme.primaire} />}
            titre={t('camions.vide')}
            description={t('camions.videDesc')}
            actionLabel={t('camions.videCTA')}
            onAction={() => setModalVisible(true)}
          />
        }
        contentContainerStyle={{ padding: ESPACEMENTS.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal */}
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
                <Text style={[styles.modalTitre, { color: theme.texte }]}>{t('camions.ajouterTitre')}</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <X size={22} color={theme.texteTertiaire} />
                </Pressable>
              </View>
              <ChampSaisie etiquette={t('camions.nomLabel')} placeholder={t('camions.nomPlaceholder')} value={nom} onChangeText={setNom} />
              <ChampSaisie etiquette={t('camions.capaLabel')} placeholder={t('camions.capaPlaceholder')} value={capacite} onChangeText={setCapacite} keyboardType="numeric" />
              <Text style={[styles.selectLabel, { color: theme.texteSecondaire }]}>{t('camions.couleurLabel')}</Text>
              <View style={styles.couleursRow}>
                {couleursRestantes.map((c) => (
                  <Pressable
                    key={c.valeur}
                    onPress={() => setCouleur(c.valeur)}
                    style={[
                      styles.couleurCircle,
                      { backgroundColor: c.valeur },
                      couleur === c.valeur && styles.couleurActive,
                    ]}
                  />
                ))}
              </View>
              {couleursRestantes.length === 0 && (
                <Text style={{ color: COULEURS.rouge, fontSize: 12, marginBottom: ESPACEMENTS.md }}>
                  {t('camions.couleursEpuisees')}
                </Text>
              )}
              <Bouton titre={t('camions.ajouterBtn')} onPress={soumettre} variante="primaire" taille="lg" style={{ marginTop: ESPACEMENTS.lg }} />
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
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  headerText: { fontSize: 18, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  iconBtn: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  btnAjout: { width: 36, height: 36, borderRadius: RAYONS.md, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: ESPACEMENTS.lg, paddingBottom: ESPACEMENTS.xxl },
  statsRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  statCard: { flex: 1, alignItems: 'center', padding: ESPACEMENTS.md },
  statLabel: { fontSize: 11, fontWeight: '600', marginBottom: ESPACEMENTS.xs },
  statValue: { fontSize: 18, fontWeight: '800' },
  camionCard: { marginBottom: ESPACEMENTS.md, padding: ESPACEMENTS.md },
  camionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.sm },
  camionTitle: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm },
  camionDot: { width: 14, height: 14, borderRadius: RAYONS.rond },
  camionNom: { fontSize: 15, fontWeight: '700' },
  camionCapa: { fontSize: 13, marginBottom: ESPACEMENTS.sm },
  etatRow: { flexDirection: 'row', gap: ESPACEMENTS.sm, marginBottom: ESPACEMENTS.sm },
  etatPill: { flex: 1, paddingVertical: ESPACEMENTS.sm, borderRadius: RAYONS.md, borderWidth: 1.5, alignItems: 'center' },
  etatPillText: { fontSize: 11, fontWeight: '700' },
  etatBanner: { padding: ESPACEMENTS.sm, borderRadius: RAYONS.md, alignItems: 'center' },
  etatBannerText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContenu: { borderTopLeftRadius: RAYONS.xl, borderTopRightRadius: RAYONS.xl, padding: ESPACEMENTS.xl, paddingBottom: ESPACEMENTS.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ESPACEMENTS.lg },
  modalTitre: { fontSize: 18, fontWeight: '800' },
  selectLabel: { fontSize: 12, fontWeight: '600', marginBottom: ESPACEMENTS.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  couleursRow: { flexDirection: 'row', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  couleurCircle: { width: 36, height: 36, borderRadius: RAYONS.rond },
  couleurActive: { borderWidth: 3, borderColor: COULEURS.blanc, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
});
