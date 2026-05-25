import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useAuth } from '../../src/contextes/ContexteAuth';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { Carte } from '../../src/composants';
import { COULEURS, RAYONS, ESPACEMENTS } from '../../src/styles/couleurs';
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  AlertCircle,
  RefreshCw,
  CloudSun,
  Navigation,
  LogOut,
} from 'lucide-react-native';

const CLE_API = '57f5f0cadb44eb75f8b25e368643cb0b';

const ICONES_METEO: Record<string, React.ReactNode> = {
  '01d': <Sun size={40} color="#f59e0b" />,
  '01n': <Sun size={40} color="#f59e0b" />,
  '02d': <CloudSun size={40} color="#94a3b8" />,
  '02n': <CloudSun size={40} color="#94a3b8" />,
  '03d': <Cloud size={40} color="#94a3b8" />,
  '03n': <Cloud size={40} color="#94a3b8" />,
  '04d': <Cloud size={40} color="#64748b" />,
  '04n': <Cloud size={40} color="#64748b" />,
  '09d': <CloudRain size={40} color="#60a5fa" />,
  '09n': <CloudRain size={40} color="#60a5fa" />,
  '10d': <CloudRain size={40} color="#60a5fa" />,
  '10n': <CloudRain size={40} color="#60a5fa" />,
};

async function fetchMeteo(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CLE_API}&units=metric&lang=fr`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur météo: ${res.status}`);
  const data = await res.json();
  const m = data.main || {};
  const w = data.weather?.[0] || {};
  const wi = data.wind || {};
  return {
    temperature: m.temp ?? 0,
    ressenti: m.feels_like ?? 0,
    humidite: m.humidity ?? 0,
    description: w.description ?? '',
    icone: w.icon ?? '01d',
    ventVitesse: wi.speed ?? 0,
    ville: data.name || 'Inconnu',
    latitude: lat,
    longitude: lon,
  };
}

export default function MeteoScreen() {
  const { theme } = useTheme();
  const { deconnexion } = useAuth();
  const { villages } = useDonnees();

  const [meteo, setMeteo] = useState<any>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [villageSel, setVillageSel] = useState<string>('');
  const [geoOk, setGeoOk] = useState<boolean | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const chargerMeteo = async (lat: number, lon: number, village?: any) => {
    setChargement(true);
    setErreur('');
    try {
      const data = await fetchMeteo(lat, lon);
      setMeteo(data);
      setVillageSel(village?.id || '');
    } catch (err: any) {
      setErreur(err.message || 'Impossible de charger la météo');
    } finally {
      setChargement(false);
    }
  };

  const chargerPosition = () => {
    if (!navigator.geolocation) {
      setErreur('Géolocalisation non supportée');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoOk(true);
        setGeoLoading(false);
        chargerMeteo(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoOk(false);
        setGeoLoading(false);
        setErreur('Activez la géolocalisation dans les paramètres');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <View style={[styles.header, { backgroundColor: theme.fondCarte, borderBottomColor: theme.bordure }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <Cloud size={22} color={theme.primaire} />
            <Text style={[styles.headerText, { color: theme.texte }]}>Météo</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={deconnexion} style={[styles.iconBtn, { backgroundColor: theme.carte }]}>
              <LogOut size={18} color={theme.texteTertiaire} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.label, { color: theme.texte }]}>Sélectionnez un village :</Text>
        <View style={styles.villageList}>
          {villages.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => { chargerMeteo(v.latitude, v.longitude, v); }}
              style={[
                styles.villageItem,
                {
                  backgroundColor: villageSel === v.id ? theme.primaire + '20' : theme.carte,
                  borderColor: villageSel === v.id ? theme.primaire : theme.bordure,
                },
              ]}
            >
              <MapPin size={16} color={villageSel === v.id ? theme.primaire : theme.texteTertiaire} />
              <Text style={[styles.villageText, { color: villageSel === v.id ? theme.primaire : theme.texte }]}>
                {v.nom}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={chargerPosition}
          disabled={geoLoading}
          style={[styles.positionBtn, { borderColor: COULEURS.bleu }]}
        >
          <Navigation size={16} color={COULEURS.bleu} />
          <Text style={[styles.positionText, { color: COULEURS.bleu }]}>
            {geoLoading ? 'Localisation...' : 'Ma position'}
          </Text>
        </Pressable>

        {chargement && (
          <View style={styles.loadingRow}>
            <RefreshCw size={20} color={theme.primaire} />
            <Text style={[styles.loadingText, { color: theme.texteSecondaire }]}>Chargement...</Text>
          </View>
        )}

        {erreur ? (
          <Carte style={styles.errorCard} ombre="sm">
            <AlertCircle size={18} color={COULEURS.rouge} />
            <Text style={[styles.errorText, { color: COULEURS.rouge }]}>{erreur}</Text>
          </Carte>
        ) : null}

        {meteo && !chargement ? (
          <View style={{ marginTop: ESPACEMENTS.lg }}>
            <Carte style={styles.meteoCard} ombre="md">
              <View style={styles.meteoHeader}>
                <View style={styles.villeRow}>
                  <MapPin size={16} color={theme.primaire} />
                  <Text style={[styles.villeText, { color: theme.texte }]}>
                    {meteo.ville || villages.find(v => v.id === villageSel)?.nom || 'Position actuelle'}
                  </Text>
                </View>
                <Text style={[styles.coords, { color: theme.texteTertiaire }]}>
                  {meteo.latitude.toFixed(4)}, {meteo.longitude.toFixed(4)}
                </Text>
                <View style={styles.tempRow}>
                  {ICONES_METEO[meteo.icone] || <Cloud size={40} color="#94a3b8" />}
                  <Text style={[styles.grandTemp, { color: theme.texte }]}>
                    {Math.round(meteo.temperature)}°C
                  </Text>
                </View>
                <Text style={[styles.desc, { color: theme.texteSecondaire }]}>
                  {meteo.description}
                </Text>
                <Text style={[styles.ressenti, { color: theme.texteTertiaire }]}>
                  Ressenti {Math.round(meteo.ressenti)}°C
                </Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={[styles.detailItem, { backgroundColor: theme.carte }]}>
                  <Droplets size={18} color={COULEURS.bleu} />
                  <Text style={[styles.detailLabel, { color: theme.texteTertiaire }]}>Humidité</Text>
                  <Text style={[styles.detailValue, { color: theme.texte }]}>{meteo.humidite}%</Text>
                </View>
                <View style={[styles.detailItem, { backgroundColor: theme.carte }]}>
                  <Wind size={18} color={COULEURS.bleu} />
                  <Text style={[styles.detailLabel, { color: theme.texteTertiaire }]}>Vent</Text>
                  <Text style={[styles.detailValue, { color: theme.texte }]}>{meteo.ventVitesse} km/h</Text>
                </View>
                <View style={[styles.detailItem, { backgroundColor: theme.carte }]}>
                  <Thermometer size={18} color={COULEURS.bleu} />
                  <Text style={[styles.detailLabel, { color: theme.texteTertiaire }]}>Temp.</Text>
                  <Text style={[styles.detailValue, { color: theme.texte }]}>{Math.round(meteo.temperature)}°C</Text>
                </View>
              </View>
            </Carte>

            <Carte style={styles.conseilsCard} ombre="sm">
              <Text style={[styles.conseilsTitle, { color: COULEURS.bleu }]}>
                <AlertCircle size={14} color={COULEURS.bleu} /> Conseils
              </Text>
              <Text style={[styles.conseilText, { color: theme.texte }]}>
                {meteo.temperature < 15 ? '[ATTENTION] Routes possiblement boueuses' :
                 meteo.temperature < 25 ? '[OK] Conditions idéales pour le transport' :
                 meteo.temperature < 35 ? '[CHALEUR] Chaleur élevée - vérifiez les véhicules' :
                 '[CANICULE] Risque de surchauffe'}
              </Text>
              {meteo.humidite > 80 && (
                <Text style={[styles.conseilText, { color: COULEURS.rouge }]}>
                  [ATTENTION] Humidite tres elevee - routes glissantes
                </Text>
              )}
            </Carte>

            <Pressable
              onPress={() => {
                if (villageSel) {
                  const v = villages.find(x => x.id === villageSel);
                  if (v) chargerMeteo(v.latitude, v.longitude, v);
                }
              }}
              style={[styles.refreshBtn, { borderColor: theme.primaire }]}
            >
              <RefreshCw size={14} color={theme.primaire} />
              <Text style={[styles.refreshText, { color: theme.primaire }]}>Actualiser</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
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
  label: { fontSize: 14, fontWeight: '600', marginBottom: ESPACEMENTS.md },
  villageList: { gap: ESPACEMENTS.sm },
  villageItem: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1.5 },
  villageText: { fontSize: 14, fontWeight: '600' },
  positionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.sm,
    padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1.5, marginTop: ESPACEMENTS.md,
  },
  positionText: { fontSize: 14, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, marginTop: ESPACEMENTS.lg },
  loadingText: { fontSize: 14, fontWeight: '500' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.sm, padding: ESPACEMENTS.md, marginTop: ESPACEMENTS.lg },
  errorText: { fontSize: 13, fontWeight: '600', flex: 1 },
  meteoCard: { padding: ESPACEMENTS.lg, marginBottom: ESPACEMENTS.md },
  meteoHeader: { alignItems: 'center', marginBottom: ESPACEMENTS.lg },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.xs, marginBottom: 2 },
  villeText: { fontSize: 16, fontWeight: '700' },
  coords: { fontSize: 11, marginBottom: ESPACEMENTS.md },
  tempRow: { flexDirection: 'row', alignItems: 'center', gap: ESPACEMENTS.md, marginBottom: ESPACEMENTS.sm },
  grandTemp: { fontSize: 48, fontWeight: '800' },
  desc: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize', marginBottom: ESPACEMENTS.xs },
  ressenti: { fontSize: 12 },
  detailGrid: { flexDirection: 'row', gap: ESPACEMENTS.sm },
  detailItem: { flex: 1, alignItems: 'center', padding: ESPACEMENTS.md, borderRadius: RAYONS.md, gap: ESPACEMENTS.xs },
  detailLabel: { fontSize: 11, fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '800' },
  conseilsCard: { padding: ESPACEMENTS.md, marginBottom: ESPACEMENTS.md },
  conseilsTitle: { fontSize: 13, fontWeight: '700', marginBottom: ESPACEMENTS.sm },
  conseilText: { fontSize: 13, fontWeight: '500', paddingVertical: 4 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.xs, padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1.5 },
  refreshText: { fontSize: 13, fontWeight: '700' },
});
