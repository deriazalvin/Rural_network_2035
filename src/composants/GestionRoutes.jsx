import React, { useState, useEffect } from 'react';
import { Map, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Clock, ArrowRight, MapPin, Eye, Navigation, Edit } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import '../styles/gestion-routes.css';
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
    <div className="gestion-routes-container section-carte">

      <h2 className="gestion-routes-title">
        <Map size={26} />
        Gestion des Routes
      </h2>

      {/* === BARRE D'ONGLETS === */}
      <div className="route-tabs">
        <button
          onClick={() => setVueActive('gestion')}
          className={`route-tab ${vueActive === 'gestion' ? 'active' : ''}`}
        >
          <Map size={20} />
          Gestion des Routes
        </button>

        <button
          onClick={() => setVueActive('itineraire')}
          className={`route-tab navigation ${vueActive === 'itineraire' ? 'active' : ''}`}
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
            <div className="slider-group">
              <label className="slider-label">
                <span>Qualité de la route :</span>
                <span>{qualite.icon} {qualite.label}</span>
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={qualiteValue}
                onChange={(e) => setQualiteValue(parseInt(e.target.value))}
                className="slider"
              />

              <div className="slider-values">
                <span>Mauvaise</span>
                <span>Moyenne</span>
                <span>Bonne</span>
              </div>
            </div>

            {/* CHECKBOX */}
            <div className={`route-action-banner ${estBloquee ? 'route-bloquee' : ''}`}>
              <input
                type="checkbox"
                checked={estBloquee}
                onChange={(e) => setEstBloquee(e.target.checked)}
                className="checkbox"
              />

              <label>
                <span className="route-action-label">
                  <AlertTriangle size={16} /> Route bloquée
                </span>
              </label>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {routeEnEdition ? 'Modifier la Route' : 'Ajouter la Route'}
              </button>
              {routeEnEdition && (
                <button 
                  type="button" 
                  onClick={annulerEdition}
                  className="btn btn-secondary"
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
              <h3 className="section-subtitle section-subtitle-success">
                <CheckCircle size={20} />
                <span>Routes Actives ({routes.filter(r => !r.estBloquee).length})</span>
              </h3>
              
              <div className="routes-card-grid">
                {routes.filter(route => !route.estBloquee).map((route) => (
                  <div key={route.id} className="carte-route">
                    <div className="carte-route-buttons">
                      <button
                        onClick={() => demarrerEdition(route)}
                        className="route-card-button edit"
                        title="Modifier la route"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => gererSelectionRoute(route)}
                        className="route-card-button view"
                        title="Voir l'itinéraire"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    <div className="route-summary">
                      <MapPin size={16} />
                      <div className="route-text">
                        {obtenirNomVillage(route.villageDepart_id)}
                        <ArrowRight size={14} className="text-muted" />
                        {obtenirNomVillage(route.village_arrivee_id)}
                      </div>
                    </div>

                    <div className="route-details">
                      <span>
                        <strong>{route.distance?.toFixed(1)}</strong> km
                      </span>
                      <span>
                        <Clock size={14} /> {formaterDuree(route.dureeMinutes)}
                      </span>
                      <span className={`route-quality ${route.qualiteRoute === 'BONNE' ? 'route-quality-good' : route.qualiteRoute === 'MOYENNE' ? 'route-quality-medium' : 'route-quality-bad'}`}>
                        {route.qualiteRoute}
                      </span>
                    </div>

                    <button 
                      onClick={() => onBloquerRoute(route.id, true)}
                      className="btn-route-block"
                    >
                      <AlertTriangle size={16} /> Bloquer la route
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* --- SECTION 2 : ROUTES BLOQUÉES --- */}
            {routes.some(r => r.estBloquee) && (
              <div className="liste-routes bloquees">
                <h3 className="section-subtitle section-subtitle-danger">
                  <AlertTriangle size={20} />
                  <span>Routes Interrompues ({routes.filter(r => r.estBloquee).length})</span>
                </h3>
                
                <div className="routes-card-grid">
                  {routes.filter(r => r.estBloquee).map((route) => (
                    <div key={route.id} className="carte-route bloquee">
                      <div className="carte-route-buttons">
                        <button
                          onClick={() => demarrerEdition(route)}
                          className="route-card-button edit"
                          title="Modifier la route"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => gererSelectionRoute(route)}
                          className="route-card-button view"
                          title="Voir l'itinéraire"
                        >
                          <Eye size={18} />
                        </button>
                      </div>

                      <div className="route-summary">
                        <MapPin size={16} />
                        <div className="route-text blocked">
                          {obtenirNomVillage(route.villageDepart_id)} → {obtenirNomVillage(route.village_arrivee_id)}
                        </div>
                      </div>
                      <div className="route-details blocked-status">
                        <AlertTriangle size={14} /> ACCÈS INTERROMPU
                      </div>

                      <button 
                        onClick={() => onBloquerRoute(route.id, false)}
                        className="btn-route-reactiver"
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
        <div className="vue-itineraire-empty">
          <Navigation size={48} />
          <p>Sélectionnez une route pour voir son itinéraire</p>
          <button
            onClick={() => setVueActive('gestion')}
            className="btn-return-gestion"
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
    <div className="vue-itineraire-container">
      <MapContainer center={centerMap} zoom={13} className="vue-itineraire-map">
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
      <div className="vue-itineraire-panel">
        <h3>{obtenirNomVillage(route.villageDepart_id)} → {obtenirNomVillage(route.village_arrivee_id)}</h3>

        <div className="vue-itineraire-details">
          <div className="info-row">
            <MapPin size={20} color="#2E7D32" />
            <div>
              <span>Distance</span>
              <span>{route.distance?.toFixed(1)} km</span>
            </div>
          </div>

          <div className="info-row">
            <Clock size={20} color="#2563eb" />
            <div>
              <span>Durée estimée</span>
              <span>{formaterDuree(route.dureeMinutes)}</span>
            </div>
          </div>

          <div className="info-row">
            <CheckCircle size={20} color={route.qualiteRoute === 'BONNE' ? '#2E7D32' : '#F9A825'} />
            <div>
              <span>Qualité</span>
              <span className={route.qualiteRoute === 'BONNE' ? 'quality-good' : route.qualiteRoute === 'MOYENNE' ? 'quality-medium' : 'quality-bad'}>
                {route.qualiteRoute}
              </span>
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