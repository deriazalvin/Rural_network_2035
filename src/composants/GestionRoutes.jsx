import { useState } from 'react';

export function GestionRoutes({ villages, routes, onAjouterRoute, onBloquerRoute }) {
  const [villageDepart, setVillageDepart] = useState('');
  const [villageArrivee, setVillageArrivee] = useState('');
  const [distance, setDistance] = useState('');
  const [qualite, setQualite] = useState('moyenne');

  const gererAjout = (e) => {
    e.preventDefault();

    if (!villageDepart || !villageArrivee || !distance) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (villageDepart === villageArrivee) {
      alert('Le village de départ et d\'arrivée doivent être différents');
      return;
    }

    onAjouterRoute({
      village_depart_id: villageDepart,
      village_arrivee_id: villageArrivee,
      distance: parseFloat(distance),
      qualite_route: qualite,
      est_bloquee: false
    });

    setVillageDepart('');
    setVillageArrivee('');
    setDistance('');
    setQualite('moyenne');
  };

  const obtenirNomVillage = (id) => {
    const village = villages.find(v => v.id === id);
    return village ? village.nom : 'Inconnu';
  };

  const getQualiteEmoji = (qualite) => {
    const emojis = { 'bonne': '✅', 'moyenne': '⚠️', 'mauvaise': '❌' };
    return emojis[qualite] || '⚠️';
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

          <input
            type="number"
            step="0.1"
            placeholder="Distance (km)"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="champ-saisie"
          />

          <select
            value={qualite}
            onChange={(e) => setQualite(e.target.value)}
            className="champ-saisie"
          >
            <option value="bonne">Bonne</option>
            <option value="moyenne">Moyenne</option>
            <option value="mauvaise">Mauvaise</option>
          </select>
        </div>
        <button type="submit" className="bouton-principal">
          Ajouter la Route
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
                    📏 {route.distance} km | {getQualiteEmoji(route.qualite_route)} {route.qualite_route}
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
