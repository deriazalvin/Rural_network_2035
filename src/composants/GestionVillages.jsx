  import { useState, useRef } from 'react';
  import { MapPin, BarChart2, Clock, Trash2 } from 'lucide-react';
  import NominatimService from '../services/NominatimService';
  import "leaflet/dist/leaflet.css";
  import { MapContainer, TileLayer, Marker, Popup , Polyline  } from 'react-leaflet';
  import markerIcon from "leaflet/dist/images/marker-icon.png";
  import markerShadow from "leaflet/dist/images/marker-shadow.png";

  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  export function GestionVillages({ villages, onAjouterVillage, onSupprimerVillage }) {
    const [nom, setNom] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [volumeProduction, setVolumeProduction] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const nominatimService = useRef(new NominatimService());
    const debounceTimer = useRef(null);

    const handleNomChange = (value) => {
      setNom(value);
      
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

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
      setNom(suggestion.displayName);
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

      onAjouterVillage({
        nom,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        volumeProduction: parseFloat(volumeProduction)
      });

      setNom('');
      setLatitude('');
      setLongitude('');
      setVolumeProduction('');
      setSuggestions([]);
    };

    return (
      <div className="section-carte">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={26} />
          Gestion des Villages
        </h2>

        <form onSubmit={gererAjout} className="formulaire">
          <div className="grille-formulaire">
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Nom du village"
                value={nom}
                onChange={(e) => handleNomChange(e.target.value)}
                onFocus={() => nom.length >= 2 && setShowSuggestions(true)}
                className="champ-saisie"
                style={{ width: '100%' }}
              />
              {loading && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}>
                  <Clock size={16} />
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  marginTop: '2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none',
                        fontSize: '0.9rem',
                        color: '#374151',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
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
              placeholder="Longitude "
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
          <button type="submit" className="bouton-principal">
            Ajouter le Village
          </button>
        </form>

        <div className="liste-villages">
          <h3>Villages Enregistrés ({villages.length})</h3>
          {villages.length === 0 ? (
            <p className="texte-vide">Aucun village enregistré</p>
          ) : (
            <div className="grille-cartes">
              {villages.map((village) => (
                <div key={village.id} className="carte-village">
                  <div className="carte-entete">
                    <h4>{village.nom}</h4>
                    <button
                      onClick={() => onSupprimerVillage(village.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="detail-village">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart2 size={14} /> Production: {village.volumeProduction} kg
                    </span>
                  </p>
                  <p className="detail-village-secondaire">
                    Lat: {village.latitude.toFixed(4)}, Lon: {village.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    );
  }