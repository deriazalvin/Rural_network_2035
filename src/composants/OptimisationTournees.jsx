import { useState } from 'react';
import { Truck, BarChart2 } from 'lucide-react';

export function OptimisationTournees({ villages, onOptimiser, resultatsOptimisation }) {
  const [villageDepart, setVillageDepart] = useState('');
  const [villagesSelectionnes, setVillagesSelectionnes] = useState([]);
  const [capaciteCamion, setCapaciteCamion] = useState('5000');

  const gererOptimisation = (e) => {
    e.preventDefault();

    if (!villageDepart) {
      alert('Veuillez sélectionner un village de départ');
      return;
    }

    if (villagesSelectionnes.length === 0) {
      alert('Veuillez sélectionner au moins un village à visiter');
      return;
    }

    onOptimiser({
      villageDepart,
      villagesAVisiter: villagesSelectionnes,
      capaciteCamion: parseFloat(capaciteCamion)
    });
  };

  const toggleVillage = (villageId) => {
    if (villageId === villageDepart) return;

    if (villagesSelectionnes.includes(villageId)) {
      setVillagesSelectionnes(villagesSelectionnes.filter(id => id !== villageId));
    } else {
      setVillagesSelectionnes([...villagesSelectionnes, villageId]);
    }
  };

  const obtenirNomVillage = (id) => {
    const village = villages.find(v => v.id === id);
    return village ? village.nom : 'Inconnu';
  };

  return (
    <div className="section-carte">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Truck size={26} />
        Optimisation des Tournées
      </h2>

      <form onSubmit={gererOptimisation} className="formulaire">
        <div className="grille-formulaire">
          <select
            value={villageDepart}
            onChange={(e) => {
              setVillageDepart(e.target.value);
              setVillagesSelectionnes(villagesSelectionnes.filter(id => id !== e.target.value));
            }}
            className="champ-saisie"
          >
            <option value="">Point de départ (dépôt)</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>

          <input
            type="number"
            step="100"
            placeholder="Capacité camion (kg)"
            value={capaciteCamion}
            onChange={(e) => setCapaciteCamion(e.target.value)}
            className="champ-saisie"
          />
        </div>

        <div className="selection-villages">
          <h4>Villages à visiter:</h4>
          <div className="grille-selection">
            {villages
              .filter(v => v.id !== villageDepart)
              .map(village => (
                <label key={village.id} className="checkbox-village">
                  <input
                    type="checkbox"
                    checked={villagesSelectionnes.includes(village.id)}
                    onChange={() => toggleVillage(village.id)}
                  />
                  <span>{village.nom} ({village.volume_production} kg)</span>
                </label>
              ))}
          </div>
        </div>

        <button type="submit" className="bouton-principal">
          Calculer les Tournées
        </button>
      </form>

      {resultatsOptimisation && (
        <div className="resultats-optimisation">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} /> Résultats de l'Optimisation
          </h3>

          <div className="grille-comparaison">
            <div className="carte-resultat naive">
              <h4>Solution Naïve</h4>
              <p className="distance-totale">{resultatsOptimisation.naive.distanceTotale.toFixed(2)} km</p>
              <p className="itineraire">
                {resultatsOptimisation.naive.itineraire.map(id => obtenirNomVillage(id)).join(' → ')}
              </p>
              <p className="charge">Charge: {resultatsOptimisation.naive.chargeFinale} kg</p>
            </div>

            <div className="carte-resultat optimisee">
              <h4>Solution Optimisée</h4>
              <p className="distance-totale">{resultatsOptimisation.optimisee.distanceTotale.toFixed(2)} km</p>
              <p className="itineraire">
                {resultatsOptimisation.optimisee.itineraire.map(id => obtenirNomVillage(id)).join(' → ')}
              </p>
              <p className="charge">Charge: {resultatsOptimisation.optimisee.chargeFinale} kg</p>
            </div>
          </div>

          <div className="statistiques">
            <div className="stat-item gain">
              <h4>Réduction de distance</h4>
              <p className="stat-valeur">{resultatsOptimisation.reductionPourcentage.toFixed(2)}%</p>
              <p className="stat-detail">
                Économie: {resultatsOptimisation.economieDistance.toFixed(2)} km
              </p>
            </div>

            <div className="stat-item economie">
              <h4>Économie Carburant</h4>
              <p className="stat-valeur">{resultatsOptimisation.economieCarburant.toFixed(0)} Ar</p>
              <p className="stat-detail">
                Coût par km: 0.8 Ar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
