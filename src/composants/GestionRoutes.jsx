import { useState } from 'react';
import { Map, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
      <div className="liste-routes">

        <h3>Routes Enregistrées ({routes.length})</h3>

        {routes.length === 0 ? (
          <p>Aucune route enregistrée</p>
        ) : (
          <div className="grille-cartes">

            {routes.map((route) => (
              <div key={route.id} className={`carte-route ${route.estBloquee ? 'bloquee' : ''}`}>

                <div className="route-info">
                  <h4>
                    {obtenirNomVillage(route.villageDepart_id)} → {obtenirNomVillage(route.village_arrivee_id)}
                  </h4>

                  <p>
                     {route.distance?.toFixed(2) || 'N/A'} km | {route.qualiteRoute}
                  </p>

                  {route.estBloquee && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} /> Bloquée
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onBloquerRoute(route.id, !route.estBloquee)}
                >
                  {route.estBloquee ? 'Débloquer' : 'Bloquer'}
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}