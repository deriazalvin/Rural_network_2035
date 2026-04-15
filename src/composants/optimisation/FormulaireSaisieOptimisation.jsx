/**
 * Formulaire de Saisie pour l'Optimisation
 * Responsabilité unique : collecter les données auprès de l'utilisateur
 */

import React, { useState } from 'react';

export default function FormulaireSaisieOptimisation({
  villagesDisponibles = [],
  camionsDisponibles = [],
  depotsDisponibles = [],
  estEnCours = false,
  onSoumission = () => {}
}) {
  const [depotSelectionne, setDepotSelectionne] = useState('');
  const [camionsSelectionnes, setCamionsSelectionnes] = useState([]);

  const gererChangementCamion = (idCamion, estCoché) => {
    if (estCoché) {
      setCamionsSelectionnes([...camionsSelectionnes, idCamion]);
    } else {
      setCamionsSelectionnes(camionsSelectionnes.filter(id => id !== idCamion));
    }
  };

  const gererSoumission = (e) => {
    e.preventDefault();
    
    if (!depotSelectionne) {
      alert('Veuillez sélectionner un dépôt');
      return;
    }
    
    if (camionsSelectionnes.length === 0) {
      alert('Veuillez sélectionner au moins un camion');
      return;
    }

    onSoumission({
      depotId: depotSelectionne,
      camionIds: camionsSelectionnes
    });
  };

  return (
    <form className="formulaire-optimisation" onSubmit={gererSoumission}>
      {/* Sélection du dépôt */}
      <div className="groupe-formulaire">
        <label htmlFor="select-depot">Dépôt de Départ :</label>
        <select
          id="select-depot"
          value={depotSelectionne}
          onChange={(e) => setDepotSelectionne(e.target.value)}
          disabled={estEnCours}
        >
          <option value="">-- Choisir un dépôt --</option>
          {depotsDisponibles.map(depot => (
            <option key={depot.id} value={depot.id}>
              {depot.nom} ({depot.latitude.toFixed(2)}, {depot.longitude.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* Sélection des camions */}
      <div className="groupe-formulaire">
        <label>Camions à Utiliser :</label>
        <div className="liste-camions-checkbox">
          {camionsDisponibles.map(camion => (
            <label key={camion.id} className="checkbox-camion">
              <input
                type="checkbox"
                checked={camionsSelectionnes.includes(camion.id)}
                onChange={(e) => gererChangementCamion(camion.id, e.target.checked)}
                disabled={estEnCours}
              />
              <span>{camion.nom} - Capacité: {camion.capaciteKg} kg</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        className="btn-optimiser"
        disabled={estEnCours}
      >
        {estEnCours ? 'Optimisation en cours...' : 'Lancer l\'Optimisation'}
      </button>
    </form>
  );
}
