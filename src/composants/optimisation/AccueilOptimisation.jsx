/**
 * Accueil du module Optimisation de Tournées
 * Responsabilité : orchestrer les sous-composants du formulaire et résultats
 */

import React, { useState } from 'react';
import FormulaireSaisieOptimisation from './FormulaireSaisieOptimisation';
import PanneauResultatsOptimisation from './PanneauResultatsOptimisation';
import { ServiceApiOptimisation } from '../../services/api/ServiceApiOptimisation';
import './AccueilOptimisation.css';

export function AccueilOptimisation({
  villagesDisponibles = [],
  camionsDisponibles = [],
  depotsDisponibles = []
}) {
  const [optimisationEnCours, setOptimisationEnCours] = useState(false);
  const [resultatsOptimisation, setResultatsOptimisation] = useState(null);
  const [erreurOptimisation, setErreurOptimisation] = useState(null);

  const gererSoumissionFormulaire = async (donneesSaisies) => {
    try {
      setOptimisationEnCours(true);
      setErreurOptimisation(null);

      // Appel à l'API via le service avec authentification
      const donnees = await ServiceApiOptimisation.lancerOptimisation(
        donneesSaisies.depotId,
        donneesSaisies.camionIds
      );
      setResultatsOptimisation(donnees);
    } catch (erreur) {
      setErreurOptimisation(erreur.message);
    } finally {
      setOptimisationEnCours(false);
    }
  };

  return (
    <div className="accueil-optimisation">
      <div className="section-formulaire">
        <h2>Optimisation des Tournées</h2>
        <FormulaireSaisieOptimisation
          villagesDisponibles={villagesDisponibles}
          camionsDisponibles={camionsDisponibles}
          depotsDisponibles={depotsDisponibles}
          estEnCours={optimisationEnCours}
          onSoumission={gererSoumissionFormulaire}
        />
      </div>

      {erreurOptimisation && (
        <div className="alerte-erreur">
          {erreurOptimisation}
        </div>
      )}

      {resultatsOptimisation && (
        <div className="section-resultats">
          <PanneauResultatsOptimisation resultats={resultatsOptimisation} />
        </div>
      )}
    </div>
  );
}
