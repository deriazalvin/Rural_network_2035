import { useState } from 'react';

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

    // Convert slider value to quality
    let qualite = 'MOYENNE';
    if (qualiteValue <= 33) qualite = 'MAUVAISE';
    else if (qualiteValue >= 66) qualite = 'BONNE';

    onAjouterRoute({
      village_depart_id: villageDepart,
      village_arrivee_id: villageArrivee,
      qualite_route: qualite,
      est_bloquee: estBloquee
      // Distance will be auto-calculated by backend!
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

  const getQualiteLabel = (value) => {
    if (value <= 33) return '❌ Mauvaise';
    if (value >= 66) return '✅ Bonne';
    return '⚠️ Moyenne';
  };

  const getQualiteEmoji = (qualiteText) => {
    if (qualiteText === 'BONNE') return '✅';
    if (qualiteText === 'MAUVAISE') return '❌';
    return '⚠️';
  };

  return (
    <div className="section-carte">
      <h2>🛣️ Gestion des Routes</h2>

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

        {/* Quality Slider */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 600,
            color: 'var(--gris-fonce)'
          }}>
            Qualité de la route: {getQualiteLabel(qualiteValue)}
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

        {/* Route Blocked Checkbox */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '12px',
          background: estBloquee ? '#fee2e2' : 'var(--gris-clair)',
          borderRadius: '6px',
          transition: 'background 0.2s'
        }}>
          <input
            type="checkbox"
            id="estBloquee"
            checked={estBloquee}
            onChange={(e) => setEstBloquee(e.target.checked)}
            style={{ 
              width: '18px', 
              height: '18px', 
              cursor: 'pointer',
              accentColor: 'var(--vert-principal)'
            }}
          />
          <label htmlFor="estBloquee" style={{ 
            cursor: 'pointer', 
            fontWeight: 500,
            color: estBloquee ? 'var(--rouge)' : 'var(--gris-fonce)'
          }}>
            🚧 Route bloquée
          </label>
        </div>

        <button type="submit" className="bouton-principal">
          Ajouter la Route (distance auto-calculée)
        </button>
      </form>

      <div className="liste-routes">
        <h3>Routes Enregistrées ({routes.length})</h3>
        {routes.length === 0 ? (
          <p className="texte-vide">Aucune route enregistrée</p>
        ) : (
          <div className="grille-cartes">
            {routes.map((route) => (
              <div key={route.id} className={`carte-route ${route.est_bloquee ? 'bloquee' : ''}`}>
                <div className="route-info">
                  <h4>
                    {obtenirNomVillage(route.village_depart_id)} → {obtenirNomVillage(route.village_arrivee_id)}
                  </h4>
                  <p className="detail-route">
                    📏 {route.distance?.toFixed(2) || 'N/A'} km | {getQualiteEmoji(route.qualite_route)} {route.qualite_route}
                  </p>
                  {route.est_bloquee && (
                    <span className="badge-bloquee">🚧 Bloquée</span>
                  )}
                </div>
                <button
                  onClick={() => onBloquerRoute(route.id, !route.est_bloquee)}
                  className={route.est_bloquee ? 'bouton-debloquer' : 'bouton-bloquer'}
                >
                  {route.est_bloquee ? 'Débloquer' : 'Bloquer'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}