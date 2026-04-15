/**
 * Carte de Visualisation des Tournées
 * Responsabilité unique : afficher une tournée sur une carte
 */

import React, { useState } from 'react';

export default function CarteVisualisationTournees({ tournee = {}, index = 0 }) {
  const [expandu, setExpandu] = useState(false);

  const {
    camionId = '',
    camionNom = '',
    couleurHex = '#0ea5e9',
    distanceTotalKm = 0,
    chargeTotalKg = 0,
    capaciteKg = 0,
    coutTotal = 0,
    etapes = []
  } = tournee;

  const tauxOccupation = ((chargeTotalKg / capaciteKg) * 100).toFixed(2);

  return (
    <div className="carte-tournee" style={{ borderLeftColor: couleurHex }}>
      <div className="entete-tournee" onClick={() => setExpandu(!expandu)}>
        <div className="info-rapide">
          <h4>{camionNom}</h4>
          <div className="metriques-rapides">
            <span className="metrique">{distanceTotalKm.toFixed(2)} km</span>
            <span className="metrique">{coutTotal.toFixed(2)} Ar</span>
            <span className={`metrique occupation occupation-${tauxOccupation > 80 ? 'elevee' : 'normal'}`}>
              {tauxOccupation}%
            </span>
          </div>
        </div>
        <button className="btn-expand">
          {expandu ? '▼' : '▶'}
        </button>
      </div>

      {expandu && (
        <div className="details-tournee">
          <div className="info-detaillee">
            <p><strong>Charge :</strong> {chargeTotalKg.toFixed(2)} / {capaciteKg} kg</p>
            <p><strong>Étapes :</strong> {etapes.length}</p>
          </div>

          {/* Liste des étapes */}
          <div className="liste-etapes">
            <h5>Itinéraire :</h5>
            <ol>
              {etapes.map((etape, idx) => (
                <li key={`etape-${idx}`}>
                  <strong>{etape.nomVillage}</strong>
                  <div className="details-etape">
                    <span>Distance cumulée: {etape.distanceCumuleeKm.toFixed(2)} km</span>
                    <span>Charge cumulée: {etape.chargeCumuleeKg.toFixed(2)} kg</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
