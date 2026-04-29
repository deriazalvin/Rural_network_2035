  import { useState, useRef } from 'react';
  import { MapPin, BarChart2, Clock, Trash2, Home, Edit } from 'lucide-react';
  import NominatimService from '../services/NominatimService';
  import "leaflet/dist/leaflet.css";
  import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
  import L from 'leaflet';
  import markerIcon from "leaflet/dist/images/marker-icon.png";
  import markerShadow from "leaflet/dist/images/marker-shadow.png";

  delete L.Icon.Default.prototype._getIconUrl;

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
    const [filtreProduction, setFiltreProduction] = useState('tous'); // 'tous', 'faible', 'moyen', 'eleve'
    const [villageEnEdition, setVillageEnEdition] = useState(null);
    const nominatimService = useRef(new NominatimService());
    const debounceTimer = useRef(null);

    // Fonction pour obtenir la couleur du badge selon le volume
    const getBadgeColor = (volume) => {
      if (volume >= 500) return { bg: '#dcfce7', color: '#166534', label: 'Élevée' }; // Vert
      if (volume >= 100) return { bg: '#dbeafe', color: '#0c4a6e', label: 'Moyenne' }; // Bleu
      return { bg: '#f3f4f6', color: '#374151', label: 'Faible' }; // Gris
    };

    // Fonction pour filtrer les villages
    const villagesFiltres = villages.filter(village => {
      if (filtreProduction === 'tous') return true;
      if (filtreProduction === 'faible') return village.volumeProduction < 100;
      if (filtreProduction === 'moyen') return village.volumeProduction >= 100 && village.volumeProduction < 500;
      if (filtreProduction === 'eleve') return village.volumeProduction >= 500;
      return true;
    });

    // Calcul des statistiques
    const totalVillages = villages.length;
    const productionTotale = villages.reduce((sum, v) => sum + v.volumeProduction, 0);
    const moyenneParVillage = totalVillages > 0 ? (productionTotale / totalVillages).toFixed(2) : 0;



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

      if (villageEnEdition) {
        // Mode édition
        onModifierVillage(villageEnEdition.id, {
          nom,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          volumeProduction: parseFloat(volumeProduction)
        });
        annulerEdition();
      } else {
        // Mode ajout
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
      <div className="section-carte">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={26} />
          Gestion des Villages
        </h2>

        {/* === BARRE DE STATISTIQUES === */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)',
          borderRadius: '12px',
          border: '1px solid #e0f2fe'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Villages</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>{totalVillages}</div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Production Totale</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
              {(productionTotale / 1000).toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>tonnes</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moyenne/Village</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {moyenneParVillage} <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>kg</span>
            </div>
          </div>
        </div>

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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="bouton-principal">
              {villageEnEdition ? 'Modifier le Village' : 'Ajouter le Village'}
            </button>
            {villageEnEdition && (
              <button 
                type="button" 
                onClick={annulerEdition}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="liste-villages">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <h3 style={{ margin: 0 }}>Villages Enregistrés ({villagesFiltres.length}/{villages.length})</h3>
            
            {/* === FILTRE DE PRODUCTION === */}
            <select
              value={filtreProduction}
              onChange={(e) => setFiltreProduction(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#374151',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
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
              {/* === LISTE DES VILLAGES AVEC BADGES === */}
              <div className="grille-cartes">
                {villagesFiltres.map((village) => {
                  const badgeInfo = getBadgeColor(village.volumeProduction);
                  return (
                    <div key={village.id} className="carte-village">
                      <div className="carte-entete">
                        <h4>{village.nom}</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => demarrerEdition(village)}
                            style={{
                              background: '#dbeafe',
                              color: '#0c4a6e',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onSupprimerVillage(village.id)}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* === BADGE PRODUCTION === */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        padding: '12px',
                        background: badgeInfo.bg,
                        borderRadius: '8px',
                        border: `1.5px solid ${badgeInfo.color}`
                      }}>
                        <BarChart2 size={16} color={badgeInfo.color} />
                        <span style={{ fontWeight: '600', color: badgeInfo.color }}>
                          {village.volumeProduction} kg
                        </span>
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          padding: '4px 8px',
                          background: badgeInfo.color,
                          color: 'white',
                          borderRadius: '4px'
                        }}>
                          {badgeInfo.label}
                        </span>
                      </div>

                      {/* === AFFICHAGE COLLECTE RESTANTE === */}
                      {village.collecteRestante !== undefined && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            padding: '8px 12px',
                            background: '#f0fdf4',
                            borderRadius: '6px',
                            border: '1px solid #86efac',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600', textTransform: 'uppercase' }}>
                              Production Totale
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#166534', marginTop: '2px' }}>
                              {(village.productionTotaleHistorique || 0).toFixed(0)} kg
                            </div>
                          </div>
                          <div style={{
                            padding: '8px 12px',
                            background: '#fef3c7',
                            borderRadius: '6px',
                            border: '1px solid #fcd34d',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600', textTransform: 'uppercase' }}>
                              Collecte Restante
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#92400e', marginTop: '2px' }}>
                              {Math.max(0, village.collecteRestante).toFixed(0)} kg
                            </div>
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

              {/* === CARTE DES VILLAGES === */}
              <div style={{
                marginBottom: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                height: '400px',
                border: '1px solid #e5e7eb'
              }}>
                <MapContainer
                  center={[33.5731, -7.5898]}
                  zoom={5}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* === MARQUEURS DES VILLAGES FILTRÉS === */}
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
                        shadowSize: [41, 41]
                      })}
                    >
                      <Popup>
                        <div style={{ fontSize: '0.9rem' }}>
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