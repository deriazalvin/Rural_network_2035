/**
 * Tableau d'Affichage des Statistiques
 * Responsabilité unique : afficher les chiffres et métriques
 */

import React from 'react';

export default function TableauStatistiquesOptimisation({
  distanceTotalKm = 0,
  coutTotal = 0,
  distanceBaseline = 0,
  coutBaseline = 0,
  gainPourcent = 0,
  economieTotal = 0,
  dureeCalculMs = 0
}) {
  const statistiques = [
    { label: 'Distance Optimisée', valeur: `${distanceTotalKm.toFixed(2)} km` },
    { label: 'Coût Optimisé', valeur: `${coutTotal.toFixed(2)} Ar` },
    { label: 'Distance Baseline', valeur: `${distanceBaseline.toFixed(2)} km` },
    { label: 'Coût Baseline', valeur: `${coutBaseline.toFixed(2)} Ar` },
    { label: 'Gain %', valeur: `${gainPourcent.toFixed(2)}%`, couleur: 'vert' },
    { label: 'Économies', valeur: `${economieTotal.toFixed(2)} Ar`, couleur: 'vert' },
    { label: 'Temps Calcul', valeur: `${dureeCalculMs}ms` }
  ];

  return (
    <div className="tableau-statistiques">
      <table>
        <tbody>
          {statistiques.map((stat, idx) => (
            <tr key={`stat-${idx}`} className={stat.couleur ? `rang-${stat.couleur}` : ''}>
              <td className="label-stat">{stat.label}</td>
              <td className="valeur-stat">{stat.valeur}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
