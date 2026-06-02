import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useTheme } from '../../src/contextes/ContexteTheme';
import { useDonnees } from '../../src/contextes/ContexteDonnees';
import { useI18n } from '../../src/contextes/ContexteI18n';
import { Carte } from '../../src/composants';
import { COULEURS } from '../../src/styles/couleurs';
import { RAYONS, ESPACEMENTS } from '../../src/styles/espacements';
import { HeaderApp } from '../../src/composants/HeaderApp';
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

async function fetchMeteo(lat: number, lon: number, lang: string = 'fr') {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CLE_API}&units=metric&lang=${lang === 'mg' ? 'fr' : lang}`;
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
  const { villages } = useDonnees();
  const { t, langue } = useI18n();

  const [meteo, setMeteo] = useState<any>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [villageSel, setVillageSel] = useState<string>('');
  const [geoOk, setGeoOk] = useState<boolean | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (meteo && !chargement) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [meteo, chargement]);

  const chargerMeteo = async (lat: number, lon: number, village?: any) => {
    setChargement(true);
    setErreur('');
    try {
      const data = await fetchMeteo(lat, lon, langue);
      setMeteo(data);
      setVillageSel(village?.id || '');
    } catch (err: any) {
      setErreur(err.message || t('meteo.erreurChargement'));
    } finally {
      setChargement(false);
    }
  };

  const chargerPosition = () => {
    if (!navigator.geolocation) {
      setErreur(t('meteo.geolocNonSupportee'));
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
        setErreur(t('meteo.geolocDesactivee'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <SafeAreaView style={[styles.conteneur, { backgroundColor: theme.fond }]}>
      <HeaderApp
        icone={<Cloud size={22} color={theme.primaire} />}
        titre={t('meteo.titre')}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.label, { color: theme.texte }]}>{t('meteo.selection')}</Text>
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
            {geoLoading ? t('meteo.localisation') : t('meteo.maPosition')}
          </Text>
        </Pressable>

        {chargement && (
          <View style={styles.loadingRow}>
            <RefreshCw size={20} color={theme.primaire} />
            <Text style={[styles.loadingText, { color: theme.texteSecondaire }]}>{t('meteo.chargement')}</Text>
          </View>
        )}

        {erreur ? (
          <Carte style={styles.errorCard} ombre="sm">
            <AlertCircle size={18} color={COULEURS.rouge} />
            <Text style={[styles.errorText, { color: COULEURS.rouge }]}>{erreur}</Text>
          </Carte>
        ) : null}

        {meteo && !chargement ? (
          <Animated.View style={{ marginTop: ESPACEMENTS.lg, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Carte style={styles.meteoCard} ombre="md">
              <View style={styles.meteoHeader}>
                <View style={styles.villeRow}>
                  <MapPin size={16} color={theme.primaire} />
                  <Text style={[styles.villeText, { color: theme.texte }]}>
                    {meteo.ville || villages.find(v => v.id === villageSel)?.nom || t('meteo.positionActuelle')}
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
                  {t('meteo.ressenti').replace('{temp}', String(Math.round(meteo.ressenti)))}
                </Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={[styles.detailItem, { backgroundColor: theme.carte }]}>
                  <Droplets size={18} color={COULEURS.bleu} />
                  <Text style={[styles.detailLabel, { color: theme.texteTertiaire }]}>{t('meteo.humidite')}</Text>
                  <Text style={[styles.detailValue, { color: theme.texte }]}>{meteo.humidite}%</Text>
                </View>
                <View style={[styles.detailItem, { backgroundColor: theme.carte }]}>
                  <Wind size={18} color={COULEURS.bleu} />
                  <Text style={[styles.detailLabel, { color: theme.texteTertiaire }]}>{t('meteo.vent')}</Text>
                  <Text style={[styles.detailValue, { color: theme.texte }]}>{meteo.ventVitesse} km/h</Text>
                </View>
                <View style={[styles.detailItem, { backgroundColor: theme.carte }]}>
                  <Thermometer size={18} color={COULEURS.bleu} />
                  <Text style={[styles.detailLabel, { color: theme.texteTertiaire }]}>{t('meteo.temp')}</Text>
                  <Text style={[styles.detailValue, { color: theme.texte }]}>{Math.round(meteo.temperature)}°C</Text>
                </View>
              </View>
            </Carte>

            <Carte style={styles.conseilsCard} ombre="sm">
              <Text style={[styles.conseilsTitle, { color: COULEURS.bleu }]}>
                <AlertCircle size={14} color={COULEURS.bleu} /> {t('meteo.conseils')}
              </Text>
              <View style={styles.conseilRow}>
                {meteo.temperature < 15 ? <CloudRain size={16} color={COULEURS.bleuClair} /> :
                 meteo.temperature < 25 ? <Sun size={16} color="#f59e0b" /> :
                 meteo.temperature < 35 ? <Thermometer size={16} color={COULEURS.orange} /> :
                 <AlertCircle size={16} color={COULEURS.rouge} />}
                <Text style={[styles.conseilText, { color: theme.texte }]}>
                  {meteo.temperature < 15 ? t('meteo.conseilBoue') :
                   meteo.temperature < 25 ? t('meteo.conseilOk') :
                   meteo.temperature < 35 ? t('meteo.conseilChaleur') :
                   t('meteo.conseilCanicule')}
                </Text>
              </View>
              {meteo.humidite > 80 && (
                <View style={styles.conseilRow}>
                  <Droplets size={16} color={COULEURS.bleu} />
                  <Text style={[styles.conseilText, { color: COULEURS.rouge }]}>
                    {t('meteo.conseilHumidite')}
                  </Text>
                </View>
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
              <Text style={[styles.refreshText, { color: theme.primaire }]}>{t('meteo.actualiser')}</Text>
            </Pressable>
          </Animated.View>
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
  conseilRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  conseilText: { fontSize: 13, fontWeight: '500', flex: 1 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ESPACEMENTS.xs, padding: ESPACEMENTS.md, borderRadius: RAYONS.md, borderWidth: 1.5 },
  refreshText: { fontSize: 13, fontWeight: '700' },
});
