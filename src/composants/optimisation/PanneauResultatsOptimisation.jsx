/**
 * Panneau d'Affichage des Résultats d'Optimisation
 * Responsabilité unique : afficher les résultats et statistiques
 */

import React from 'react';
import CarteVisualisationTournees from './CarteVisualisationTournees';
import TableauStatistiquesOptimisation from './TableauStatistiquesOptimisation';

export default function PanneauResultatsOptimisation({ resultats = {} }) {
  const {
    tournees = [],
    distanceTotalKm = 0,
    coutTotal = 0,
    distanceBaseline = 0,
    coutBaseline = 0,
    gainPourcent = 0,
    economieTotal = 0,
    villagesNonDesservis = [],
    dureeCalculMs = 0
  } = resultats;

  return (
    <div className="panneau-resultats-optimisation">
      {/* Section Statistiques */}
      <section className="section-statistiques">
        <h3>📊 Statistiques d'Optimisation</h3>
        <TableauStatistiquesOptimisation
          distanceTotalKm={distanceTotalKm}
          coutTotal={coutTotal}
          distanceBaseline={distanceBaseline}
          coutBaseline={coutBaseline}
          gainPourcent={gainPourcent}
          economieTotal={economieTotal}
          dureeCalculMs={dureeCalculMs}
        />
      </section>

      {/* Section Tournées */}
      <section className="section-tournees">
        <h3>🚚 Tournées Optimisées ({tournees.length})</h3>
        <div className="liste-tournees">
          {tournees.map((tournee, index) => (
            <CarteVisualisationTournees
              key={`tournee-${index}`}
              tournee={tournee}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Section Villages Non Desservis */}
      {villagesNonDesservis.length > 0 && (
        <section className="section-non-desservis">
          <h3>⚠️ Villages Non Desservis ({villagesNonDesservis.length})</h3>
          <ul className="liste-villages">
            {villagesNonDesservis.map((village, idx) => (
              <li key={`non-desservi-${idx}`}>{village}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Bouton d'export */}
      <section className="section-actions">
        <button className="btn-exporter">
          📥 Exporter les Résultats
        </button>
      </section>
    </div>
  );
}
