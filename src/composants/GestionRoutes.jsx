import React, { useState, useEffect } from 'react';
import { Map, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Clock, ArrowRight, MapPin, Eye, Navigation, Edit } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';

export function GestionRoutes({ villages, routes, onAjouterRoute, onModifierRoute, onBloquerRoute }) {
  const [villageDepart, setVillageDepart] = useState('');
  const [villageArrivee, setVillageArrivee] = useState('');
  const [qualiteValue, setQualiteValue] = useState(50);
  const [estBloquee, setEstBloquee] = useState(false);
  const [vueActive, setVueActive] = useState('gestion');
  const [routeSelectionnee, setRouteSelectionnee] = useState(null);
  const [routeEnEdition, setRouteEnEdition] = useState(null);

  const gererAjout = (e) => {
    e.preventDefault();

    if (!villageDepart || !villageArrivee) {
      alert('Veuillez sélectionner les deux villages');
      return;
    }

    if (villageDepart === villageArrivee) {
      alert('Le village de départ et d\'arrivée doivent être différents');
      return;
    }

    let qualite = 'MOYENNE';
    if (qualiteValue <= 33) qualite = 'MAUVAISE';
    else if (qualiteValue >= 66) qualite = 'BONNE';

    const donneesRoute = {
      villageDepart_id: villageDepart,
      village_arrivee_id: villageArrivee,
      qualiteRoute: qualite,
      estBloquee
    };

    if (routeEnEdition) {
      // Mode édition
      onModifierRoute(routeEnEdition.id, donneesRoute);
      annulerEdition();
    } else {
      // Mode ajout
      onAjouterRoute(donneesRoute);
      setVillageDepart('');
      setVillageArrivee('');
      setQualiteValue(50);
      setEstBloquee(false);
    }
  };

  const demarrerEdition = (route) => {
    setRouteEnEdition(route);
    setVillageDepart(route.villageDepart_id);
    setVillageArrivee(route.village_arrivee_id);
    
    // Déterminer la valeur de qualité basée sur qualiteRoute
    if (route.qualiteRoute === 'MAUVAISE') {
      setQualiteValue(30);
    } else if (route.qualiteRoute === 'BONNE') {
      setQualiteValue(70);
    } else {
      setQualiteValue(50);
    }
    
    setEstBloquee(route.estBloquee || false);
  };

  const annulerEdition = () => {
    setRouteEnEdition(null);
    setVillageDepart('');
    setVillageArrivee('');
    setQualiteValue(50);
    setEstBloquee(false);
  };

  const obtenirNomVillage = (id) => {
    const village = villages.find(v => v.id === id);
    return village ? village.nom : 'Inconnu';
  };

  const obtenirVillageComplet = (id) => {
    return villages.find(v => v.id === id);
  };

  const gererSelectionRoute = (route) => {
    setRouteSelectionnee(route);
    setVueActive('itineraire');
  };

  // fonction propre (label + icône)
  const getQualite = (value) => {
    if (value <= 33) {
      return { label: "Mauvaise", icon: <XCircle size={18} color="#D32F2F" /> };
    }
    if (value >= 66) {
      return { label: "Bonne", icon: <CheckCircle size={18} color="#2E7D32" /> };
    }
    return { label: "Moyenne", icon: <AlertTriangle size={18} color="#F9A825" /> };
  };

  const qualite = getQualite(qualiteValue);

  const formaterDuree = (minutes) => {
    if (!minutes || minutes === 0) return "En calcul...";
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <div className="section-carte">

      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Map size={26} color="#2E7D32" />
        Gestion des Routes
      </h2>

      {/* === BARRE D'ONGLETS === */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setVueActive('gestion')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: vueActive === 'gestion' ? '600' : '500',
            color: vueActive === 'gestion' ? '#2E7D32' : '#9ca3af',
            borderBottom: vueActive === 'gestion' ? '3px solid #2E7D32' : 'none',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          <Map size={20} />
          Gestion des Routes
        </button>

        <button
          onClick={() => setVueActive('itineraire')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: vueActive === 'itineraire' ? '600' : '500',
            color: vueActive === 'itineraire' ? '#2563eb' : '#9ca3af',
            borderBottom: vueActive === 'itineraire' ? '3px solid #2563eb' : 'none',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          <Navigation size={20} />
          Itinéraire
        </button>
      </div>

      {/* === VUE GESTION === */}
      {vueActive === 'gestion' && (
        <>
          <form onSubmit={gererAjout} className="formulaire">

            <div className="grille-formulaire">
              <select
                value={villageDepart}
                onChange={(e) => setVillageDepart(e.target.value)}
                className="champ-saisie"
              >
                <option value="">Village de départ</option>
                {villages.map(v => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>

              <select
                value={villageArrivee}
                onChange={(e) => setVillageArrivee(e.target.value)}
                className="champ-saisie"
              >
                <option value="">Village d'arrivée</option>
                {villages.map(v => (
                  <option key={v.id} value={v.id}>{v.nom}</option>
                ))}
              </select>
            </div>

            {/* QUALITY SLIDER */}
            <div style={{ marginBottom: '16px' }}>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontWeight: 600,
                color: 'var(--gris-fonce)'
              }}>
                Qualité de la route :
                {qualite.icon}
                {qualite.label}
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={qualiteValue}
                onChange={(e) => setQualiteValue(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'linear-gradient(to right, #dc2626, #f59e0b, #10b981)'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '0.75rem',
                color: 'var(--gris)'
              }}>
                <span>Mauvaise</span>
                <span>Moyenne</span>
                <span>Bonne</span>
              </div>
            </div>

            {/* CHECKBOX */}
            <div style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              background: estBloquee ? '#fee2e2' : 'var(--gris-clair)',
              borderRadius: '6px'
            }}>
              <input
                type="checkbox"
                checked={estBloquee}
                onChange={(e) => setEstBloquee(e.target.checked)}
              />

              <label style={{
                cursor: 'pointer',
                fontWeight: 500
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> Route bloquée
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="bouton-principal">
                {routeEnEdition ? 'Modifier la Route' : 'Ajouter la Route'}
              </button>
              {routeEnEdition && (
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

          {/* LISTE */}
          <div className="gestion-flux-routes">
        
            {/* --- SECTION 1 : ROUTES ACTIVES --- */}
            <div className="liste-routes">
              <h3 className="flex items-center gap-2 mb-4" style={{ color: '#2e7d32' }}>
                <CheckCircle size={20} /> 
                <span>Routes Actives ({routes.filter(r => !r.estBloquee).length})</span>
              </h3>
              
              <div className="grille-cartes" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {routes.filter(route => !route.estBloquee).map((route) => (
                  <div key={route.id} className="carte-route" style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    background: 'white', borderRadius: '12px', padding: '16px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb', height: '100%',
                    position: 'relative'
                  }}>
                    {/* Icône Eye en haut à droite */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => demarrerEdition(route)}
                        style={{
                          background: '#dbeafe',
                          color: '#0c4a6e',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                        onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
                        title="Modifier la route"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => gererSelectionRoute(route)}
                        style={{
                          background: '#9ca3af',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                        onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                        title="Voir l'itinéraire"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    <div className="route-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', color: '#111827', paddingRight: '40px' }}>
                        <MapPin size={16} className="text-green-600" />
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.25rem' }}>
                          {obtenirNomVillage(route.villageDepart_id)} 
                          <ArrowRight size={14} style={{ margin: '0 4px', color: '#9ca3af' }} />
                          {obtenirNomVillage(route.village_arrivee_id)}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#4b5563' }}>
                          <strong>{route.distance?.toFixed(1)}</strong> km
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#2563eb', fontWeight: '500' }}>
                          <Clock size={14} /> {formaterDuree(route.dureeMinutes)}
                        </span>
                        <span style={{
                          fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px',
                          backgroundColor: route.qualiteRoute === 'BONNE' ? '#dcfce7' : '#fef3c7',
                          color: route.qualiteRoute === 'BONNE' ? '#166534' : '#92400e'
                        }}>
                          {route.qualiteRoute}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onBloquerRoute(route.id, true)}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '6px', 
                        backgroundColor: '#ef4444', color: 'white', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s'
                      }}
                    >
                      <AlertTriangle size={16} /> Bloquer la route
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* --- SECTION 2 : ROUTES BLOQUÉES --- */}
            {routes.some(r => r.estBloquee) && (
              <div className="liste-routes bloquees mt-10 opacity-75">
                <h3 className="flex items-center gap-2 mb-4" style={{ color: '#d32f2f' }}>
                  <AlertTriangle size={20} /> 
                  <span>Routes Interrompues ({routes.filter(r => r.estBloquee).length})</span>
                </h3>
                
                {/* Conteneur commun pour les deux sections */}
                <div className="grille-cartes" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {routes.filter(r => r.estBloquee).map((route) => (
                    <div key={route.id} className="carte-route bloquee" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '200px',
                      backgroundColor: '#fef2f2',
                      borderLeft: '5px solid #dc2626',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      position: 'relative'
                    }}>
                      {/* Icône Eye en haut à droite */}
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => demarrerEdition(route)}
                          style={{
                            background: '#dbeafe',
                            color: '#0c4a6e',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#9370db'}
                          onMouseLeave={(e) => e.target.style.background = '#a78bfa'}
                          title="Modifier la route"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => gererSelectionRoute(route)}
                          style={{
                            background: '#9ca3af',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                            color: 'white'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#6b7280'}
                          onMouseLeave={(e) => e.target.style.background = '#9ca3af'}
                          title="Voir l'itinéraire"
                        >
                          <Eye size={18} />
                        </button>
                      </div>

                      <div className="route-info">
                        <h4 style={{ 
                          textDecoration: 'line-through', 
                          color: '#9ca3af',
                          fontSize: '0.95rem',
                          marginBottom: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          paddingRight: '40px'
                        }}>
                          {obtenirNomVillage(route.villageDepart_id)} → {obtenirNomVillage(route.village_arrivee_id)}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          <AlertTriangle size={14} /> ACCÈS INTERROMPU
                        </div>
                      </div>

                      <button 
                        onClick={() => onBloquerRoute(route.id, false)}
                        style={{
                          marginTop: 'auto',
                          backgroundColor: '#059669',
                          color: 'white',
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <CheckCircle size={18} /> Réactiver la voie
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* === VUE ITINÉRAIRE === */}
      {vueActive === 'itineraire' && routeSelectionnee && (
        <VueItineraire route={routeSelectionnee} villages={villages} obtenirNomVillage={obtenirNomVillage} obtenirVillageComplet={obtenirVillageComplet} formaterDuree={formaterDuree} />
      )}

      {vueActive === 'itineraire' && !routeSelectionnee && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          color: '#9ca3af',
          gap: '16px'
        }}>
          <Navigation size={48} />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Sélectionnez une route pour voir son itinéraire</p>
          <button
            onClick={() => setVueActive('gestion')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '8px'
            }}
          >
            Retour à la gestion
          </button>
        </div>
      )}

    </div>
  );
}

/* === COMPOSANT VUE ITINÉRAIRE === */
function VueItineraire({ route, villages, obtenirNomVillage, obtenirVillageComplet, formaterDuree }) {
  const villageDepart = obtenirVillageComplet(route.villageDepart_id);
  const villageArrivee = obtenirVillageComplet(route.village_arrivee_id);

  // Coordonnées des villages (latitude, longitude)
  const coordDepart = villageDepart && villageDepart.latitude && villageDepart.longitude 
    ? [villageDepart.latitude, villageDepart.longitude]
    : [33.5731, -7.5898]; // Coordonnées par défaut (Maroc)

  const coordArrivee = villageArrivee && villageArrivee.latitude && villageArrivee.longitude
    ? [villageArrivee.latitude, villageArrivee.longitude]
    : [33.5731, -7.5898];

  // Décoder la géométrie OSRM si disponible
  let cheminPoints = [coordDepart, coordArrivee]; // Fallback : simple ligne droite
  
  if (route.geometry) {
    try {
      // Décoder la polyline encodée
      const decodedPoints = polyline.decode(route.geometry);
      // Convertir en format [lat, lng] utilisé par Leaflet
      cheminPoints = decodedPoints.map(([lat, lng]) => [lat, lng]);
    } catch (error) {
      console.warn('Erreur lors du décodage de la polyline:', error);
      // Garder le fallback en cas d'erreur
    }
  }

  // Centre de la carte (entre les deux points)
  const centerMap = [
    (coordDepart[0] + coordArrivee[0]) / 2,
    (coordDepart[1] + coordArrivee[1]) / 2
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
      <MapContainer center={centerMap} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Sous-composant pour utiliser useMap */}
        <MapContent 
          coordDepart={coordDepart}
          coordArrivee={coordArrivee}
          cheminPoints={cheminPoints}
          route={route}
          obtenirNomVillage={obtenirNomVillage}
        />
      </MapContainer>

      {/* Panneau flottant avec informations */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        maxWidth: '350px',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>
          {obtenirNomVillage(route.villageDepart_id)} → {obtenirNomVillage(route.village_arrivee_id)}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Distance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <MapPin size={20} color="#2E7D32" />
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Distance</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>{route.distance?.toFixed(1)} km</div>
            </div>
          </div>

          {/* Durée */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <Clock size={20} color="#2563eb" />
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Durée estimée</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>{formaterDuree(route.dureeMinutes)}</div>
            </div>
          </div>

          {/* Qualité */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <CheckCircle size={20} color={route.qualiteRoute === 'BONNE' ? '#2E7D32' : '#F9A825'} />
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Qualité</div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: route.qualiteRoute === 'BONNE' ? '#2E7D32' : route.qualiteRoute === 'MOYENNE' ? '#F9A825' : '#dc2626'
              }}>
                {route.qualiteRoute}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === SOUS-COMPOSANT POUR AFFICHER LE TRACÉ ET AJUSTER LA CARTE === */
function MapContent({ coordDepart, coordArrivee, cheminPoints, route, obtenirNomVillage }) {
  const map = useMap();

  // Ajuster la carte au tracé complet à la première montée
  React.useEffect(() => {
    if (map && cheminPoints && cheminPoints.length > 0) {
      // Créer des limites englobant tous les points de la polyline
      const bounds = L.latLngBounds(cheminPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, cheminPoints]);

  return (
    <>
      {/* Marqueur départ */}
      <Marker position={coordDepart} icon={L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })}>
        <Popup>{obtenirNomVillage(route.villageDepart_id)}</Popup>
      </Marker>

      {/* Marqueur arrivée */}
      <Marker position={coordArrivee} icon={L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })}>
        <Popup>{obtenirNomVillage(route.village_arrivee_id)}</Popup>
      </Marker>

      {/* Tracé de la route (coordonnées OSRM réelles) */}
      <Polyline 
        positions={cheminPoints} 
        color="#2563eb" 
        weight={4} 
        opacity={0.9}
        dashArray={route.geometry ? undefined : '5, 5'} // Pointillés si ligne par défaut
      />
    </>
  );
}