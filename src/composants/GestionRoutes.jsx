import { useState } from 'react';
import { Map, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Clock, ArrowRight, MapPin } from 'lucide-react';
export function GestionRoutes({ villages, routes, onAjouterRoute, onBloquerRoute }) {
  const [villageDepart, setVillageDepart] = useState('');
  const [villageArrivee, setVillageArrivee] = useState('');
  const [qualiteValue, setQualiteValue] = useState(50);
  const [estBloquee, setEstBloquee] = useState(false);

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

    onAjouterRoute({
      villageDepart_id: villageDepart,
      village_arrivee_id: villageArrivee,
      qualiteRoute: qualite,
      estBloquee
    });

    setVillageDepart('');
    setVillageArrivee('');
    setQualiteValue(50);
    setEstBloquee(false);
  };

  const obtenirNomVillage = (id) => {
    const village = villages.find(v => v.id === id);
    return village ? village.nom : 'Inconnu';
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

        <button type="submit" className="bouton-principal">
          Ajouter la Route
        </button>
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
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb', height: '100%'
              }}>
                <div className="route-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', color: '#111827' }}>
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
                  justifyContent: 'space-between', // Pousse le bouton en bas
                  minHeight: '200px',
                  backgroundColor: '#fef2f2',
                  borderLeft: '5px solid #dc2626',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div className="route-info">
                    <h4 style={{ 
                      textDecoration: 'line-through', 
                      color: '#9ca3af',
                      fontSize: '0.95rem',
                      marginBottom: '8px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2, // Limite à 2 lignes
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
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
                      marginTop: 'auto', // Sécurité supplémentaire pour le placement
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

    </div>
  );
}