import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, AlertCircle, RefreshCw, Navigation } from 'lucide-react';
import '../../styles/pages/vue-meteo.css';

const CLE_API = '57f5f0cadb44eb75f8b25e368643cb0b';
const URL_OWM = 'https://api.openweathermap.org/data/2.5/weather';

const ICONES_METEO = {
  '01d': <Sun size={48} color="#f59e0b" />,
  '01n': <Sun size={48} color="#f59e0b" />,
  '02d': <Cloud size={48} color="#94a3b8" />,
  '02n': <Cloud size={48} color="#94a3b8" />,
  '03d': <Cloud size={48} color="#94a3b8" />,
  '03n': <Cloud size={48} color="#94a3b8" />,
  '04d': <Cloud size={48} color="#64748b" />,
  '04n': <Cloud size={48} color="#64748b" />,
  '09d': <CloudRain size={48} color="#60a5fa" />,
  '09n': <CloudRain size={48} color="#60a5fa" />,
  '10d': <CloudRain size={48} color="#60a5fa" />,
  '10n': <CloudRain size={48} color="#60a5fa" />,
};

const CONSEILS = [
  { min: 0, max: 15, texte: 'Routes possiblement boueuses - prévoyez des pneus adaptés', icone: '⚠️' },
  { min: 15, max: 25, texte: 'Conditions idéales pour le transport', icone: '✅' },
  { min: 25, max: 35, texte: 'Chaleur élevée - vérifiez l\'état des véhicules', icone: '🌡️' },
  { min: 35, max: 50, texte: 'Risque de surchauffe moteur - évitez les heures chaudes', icone: '🔥' },
];

const VENT_CONSEILS = [
  { min: 0, max: 20, texte: 'Vent favorable', icone: '🍃' },
  { min: 20, max: 40, texte: 'Vent modéré - conduite normale', icone: '💨' },
  { min: 40, max: 100, texte: 'Vent fort - ralentissez sur les routes dégagées', icone: '🌪️' },
];

async function fetchMeteo(lat, lon) {
  const url = `${URL_OWM}?lat=${lat}&lon=${lon}&appid=${CLE_API}&units=metric&lang=fr`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur météo: ${res.status}`);
  const data = await res.json();
  const main = data.main || {};
  const weather = data.weather?.[0] || {};
  const wind = data.wind || {};
  return {
    temperature: main.temp ?? 0,
    ressenti: main.feels_like ?? 0,
    humidite: main.humidity ?? 0,
    description: weather.description ?? '',
    icone: weather.icon ?? '01d',
    ventVitesse: wind.speed ?? 0,
    ville: data.name || 'Inconnu',
    latitude: lat,
    longitude: lon,
  };
}

export function VueMeteo({ villages = [] }) {
  const [meteo, setMeteo] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [villageSelectionne, setVillageSelectionne] = useState(null);
  const [derniereMaj, setDerniereMaj] = useState(null);
  const [geoOk, setGeoOk] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const chargerMeteo = async (village, lat, lon) => {
    if ((lat == null || lon == null) && (!village?.latitude || !village?.longitude)) {
      setErreur('Coordonnées non disponibles');
      return;
    }
    const fLat = lat ?? village.latitude;
    const fLon = lon ?? village.longitude;
    setChargement(true);
    setErreur('');
    try {
      const data = await fetchMeteo(fLat, fLon);
      setMeteo(data);
      setVillageSelectionne(village);
      setDerniereMaj(new Date().toLocaleTimeString('fr-FR'));
    } catch (err) {
      setErreur(err.message || 'Impossible de charger la météo');
    } finally {
      setChargement(false);
    }
  };

  const chargerPosition = () => {
    if (!('geolocation' in navigator)) {
      setErreur('Géolocalisation non supportée par ce navigateur');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoOk(true);
        setGeoLoading(false);
        chargerMeteo(null, pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoOk(false);
        setGeoLoading(false);
        setErreur('Impossible d\'obtenir votre position. Activez la géolocalisation.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getConseil = (temp) => CONSEILS.find(c => temp >= c.min && temp < c.max) || CONSEILS[1];
  const getVentConseil = (vent) => VENT_CONSEILS.find(v => vent >= v.min && vent < v.max) || VENT_CONSEILS[1];

  return (
    <div className="vue-meteo section-carte">
      <h2 className="vue-meteo-title">
        <Cloud size={26} /> Météo
      </h2>

      <div className="meteo-selecteur">
        <label>Sélectionnez un village :</label>
        <div className="meteo-selecteur-row">
          <select
            value={villageSelectionne?.id || ''}
            onChange={(e) => {
              const v = villages.find(v => v.id === e.target.value);
              if (v) chargerMeteo(v);
            }}
          >
            <option value="">Choisir un village...</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
          <button onClick={chargerPosition} className="meteo-position-btn" disabled={geoLoading}>
            <Navigation size={16} /> {geoLoading ? 'Localisation...' : 'Ma position'}
          </button>
        </div>
      </div>

      {chargement && (
        <div className="meteo-loading">
          <RefreshCw size={24} className="spin" />
          <span>Chargement de la météo...</span>
        </div>
      )}

      {erreur && (
        <div className="meteo-error">
          <AlertCircle size={18} />
          <span>{erreur}</span>
        </div>
      )}

      {meteo && !chargement && (
        <div className="meteo-cartes">
          <div className="meteo-principale">
            <div className="meteo-infos">
              <div className="meteo-ville">
                <MapPin size={18} />
                <span>{meteo.ville || villageSelectionne?.nom || 'Position actuelle'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gris)', marginBottom: 8 }}>
                {meteo.latitude.toFixed(4)}, {meteo.longitude.toFixed(4)}
              </div>
              <div className="meteo-temp">
                {ICONES_METEO[meteo.icone] || <Cloud size={48} color="#94a3b8" />}
                <span className="meteo-temp-value">{Math.round(meteo.temperature)}°C</span>
              </div>
              <div className="meteo-desc">{meteo.description}</div>
              <div className="meteo-ressenti">Ressenti {Math.round(meteo.ressenti)}°C</div>
            </div>
            <div className="meteo-details">
              <div className="meteo-detail-item">
                <Droplets size={20} />
                <div>
                  <span className="meteo-detail-label">Humidité</span>
                  <span className="meteo-detail-value">{meteo.humidite}%</span>
                </div>
              </div>
              <div className="meteo-detail-item">
                <Wind size={20} />
                <div>
                  <span className="meteo-detail-label">Vent</span>
                  <span className="meteo-detail-value">{meteo.ventVitesse} km/h</span>
                </div>
              </div>
              <div className="meteo-detail-item">
                <Thermometer size={20} />
                <div>
                  <span className="meteo-detail-label">Température</span>
                  <span className="meteo-detail-value">{Math.round(meteo.temperature)}°C</span>
                </div>
              </div>
            </div>
          </div>

          <div className="meteo-conseils">
            <h3><AlertCircle size={16} /> Conseils pour la collecte</h3>
            <div className="conseil">
              {getConseil(meteo.temperature).icone} {getConseil(meteo.temperature).texte}
            </div>
            <div className="conseil">
              {getVentConseil(meteo.ventVitesse).icone} {getVentConseil(meteo.ventVitesse).texte}
            </div>
            {meteo.humidite > 80 && (
              <div className="conseil conseil-important">
                ⚠️ Humidité très élevée - risque de routes glissantes
              </div>
            )}
          </div>

          {derniereMaj && (
            <div className="meteo-maj">
              Dernière mise à jour : {derniereMaj}
              <button onClick={() => chargerMeteo(villageSelectionne)} className="meteo-refresh-btn">
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
