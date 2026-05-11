import React, { useState, useRef } from 'react';
import { MapPin, BarChart2, Clock, Trash2, Edit } from 'lucide-react';
import NominatimService from '../../services/NominatimService';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../../styles/pages/gestion-villages.css';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export function GestionVillages({ villages, onAjouterVillage, onModifierVillage, onSupprimerVillage }) {
  const [nom, setNom] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [volumeProduction, setVolumeProduction] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtreProduction, setFiltreProduction] = useState('tous');
  const [villageEnEdition, setVillageEnEdition] = useState(null);
  const nominatimService = useRef(new NominatimService());
  const debounceTimer = useRef(null);

  const getBadgeColor = (volume) => {
    if (volume >= 500) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Élevée', tone: 'eleve' };
    if (volume >= 100) return { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', label: 'Moyenne', tone: 'moyen' };
    return { bg: 'rgba(16, 185, 129, 0.08)', color: '#6ee7b7', label: 'Faible', tone: 'faible' };
  };

  const villagesFiltres = villages.filter((village) => {
    if (filtreProduction === 'tous') return true;
    if (filtreProduction === 'faible') return village.volumeProduction < 100;
    if (filtreProduction === 'moyen') return village.volumeProduction >= 100 && village.volumeProduction < 500;
    if (filtreProduction === 'eleve') return village.volumeProduction >= 500;
    return true;
  });

  const totalVillages = villages.length;
  const productionTotale = villages.reduce((sum, v) => sum + v.volumeProduction, 0);
  const moyenneParVillage = totalVillages > 0 ? (productionTotale / totalVillages).toFixed(2) : 0;

  const handleNomChange = (value) => {
    setNom(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      const results = await nominatimService.current.autocomplete(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setLoading(false);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    // Extraire le nom court (première partie avant la virgule)
    const nomCourt = suggestion.displayName.split(',')[0].trim();
    setNom(nomCourt);
    setLatitude(suggestion.latitude);
    setLongitude(suggestion.longitude);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const gererAjout = (e) => {
    e.preventDefault();

    if (!nom || !latitude || !longitude || !volumeProduction) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (villageEnEdition) {
      onModifierVillage(villageEnEdition.id, {
        nom,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        volumeProduction: parseFloat(volumeProduction),
      });
      annulerEdition();
    } else {
      onAjouterVillage({
        nom,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        volumeProduction: parseFloat(volumeProduction),
      });
      setNom('');
      setLatitude('');
      setLongitude('');
      setVolumeProduction('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const demarrerEdition = (village) => {
    setVillageEnEdition(village);
    setNom(village.nom);
    setLatitude(village.latitude.toString());
    setLongitude(village.longitude.toString());
    setVolumeProduction(village.volumeProduction.toString());
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const annulerEdition = () => {
    setVillageEnEdition(null);
    setNom('');
    setLatitude('');
    setLongitude('');
    setVolumeProduction('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="gestion-villages-container section-carte">
      <h2 className="gestion-villages-title">
        <MapPin size={26} />
        Gestion des Villages
      </h2>

      <div className="gestion-stats">
        <div className="stat-card">
          <div className="stat-label">Total Villages</div>
          <div className="stat-value">{totalVillages}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Production Totale</div>
          <div className="stat-value">
            {(productionTotale / 1000).toFixed(2)} <span className="stat-unit">tonnes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Moyenne/Village</div>
          <div className="stat-value">
            {moyenneParVillage} <span className="stat-unit">kg</span>
          </div>
        </div>
      </div>

      <form onSubmit={gererAjout} className="formulaire">
        <div className="grille-formulaire">
          <div className="suggestions-wrapper">
            <input
              type="text"
              placeholder="Nom du village"
              value={nom}
              onChange={(e) => handleNomChange(e.target.value)}
              onFocus={() => nom.length >= 2 && setShowSuggestions(true)}
              className="champ-saisie"
            />
            {loading && (
              <div className="suggestion-loader">
                <Clock size={16} />
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item"
                  >
                    {suggestion.displayName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="number"
            step="0.000001"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="champ-saisie"
          />
          <input
            type="number"
            step="0.000001"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="champ-saisie"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Production (kg)"
            value={volumeProduction}
            onChange={(e) => setVolumeProduction(e.target.value)}
            className="champ-saisie"
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            {villageEnEdition ? 'Modifier le Village' : 'Ajouter le Village'}
          </button>
          {villageEnEdition && (
            <button type="button" onClick={annulerEdition} className="btn btn-secondary">
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="liste-villages">
        <div className="village-toolbar">
          <h3>Villages Enregistrés ({villagesFiltres.length}/{villages.length})</h3>
          <select
            value={filtreProduction}
            onChange={(e) => setFiltreProduction(e.target.value)}
            className="select-filter"
          >
            <option value="tous">Tous les villages</option>
            <option value="faible">Faible Production (&lt; 100 kg)</option>
            <option value="moyen">Moyen Production (100-500 kg)</option>
            <option value="eleve">Élevée Production (&gt; 500 kg)</option>
          </select>
        </div>

        {villages.length === 0 ? (
          <p className="texte-vide">Aucun village enregistré</p>
        ) : (
          <>
            <div className="village-card-grid">
              {villagesFiltres.map((village) => {
                const badgeInfo = getBadgeColor(village.volumeProduction);
                return (
                  <div key={village.id} className="carte-village">
                    <div className="carte-entete">
                      <h4>{village.nom}</h4>
                      <div className="card-actions">
                        <button onClick={() => demarrerEdition(village)} className="card-action-button edit" title="Modifier le village">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => onSupprimerVillage(village.id)} className="card-action-button delete" title="Supprimer le village">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="badge-row" style={{ background: badgeInfo.bg, borderColor: badgeInfo.color }}>
                      <BarChart2 size={16} color={badgeInfo.color} />
                      <span style={{ fontWeight: 600, color: badgeInfo.color }}>{village.volumeProduction} kg</span>
                      <span className={`badge-pill ${badgeInfo.tone}`}>{badgeInfo.label}</span>
                    </div>

                    {village.collecteRestante !== undefined && (
                      <div className="card-stat-grid">
                        <div className="card-stat-block">
                          <div className="card-stat-title">Production Totale</div>
                          <div className="card-stat-value">{(village.productionTotaleHistorique || 0).toFixed(0)} kg</div>
                        </div>
                        <div className="card-stat-block warning">
                          <div className="card-stat-title warning">Collecte Restante</div>
                          <div className="card-stat-value">{Math.max(0, village.collecteRestante).toFixed(0)} kg</div>
                        </div>
                      </div>
                    )}

                    <p className="detail-village-secondaire">
                      Lat: {village.latitude.toFixed(4)}, Lon: {village.longitude.toFixed(4)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="village-map-card">
              <MapContainer center={[33.5731, -7.5898]} zoom={5} className="village-map-container">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {villagesFiltres.map((village) => (
                  <Marker
                    key={village.id}
                    position={[village.latitude, village.longitude]}
                    icon={L.icon({
                      iconUrl: markerIcon,
                      shadowUrl: markerShadow,
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41],
                    })}
                  >
                    <Popup>
                      <div className="map-popup-detail">
                        <strong>{village.nom}</strong><br />
                        Production: {village.volumeProduction} kg<br />
                        Lat: {village.latitude.toFixed(4)}, Lon: {village.longitude.toFixed(4)}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
