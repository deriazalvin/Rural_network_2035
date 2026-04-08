import { useState } from 'react';

export function GestionVillages({ villages, onAjouterVillage, onSupprimerVillage }) {
  const [nom, setNom] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [volumeProduction, setVolumeProduction] = useState('');

  const gererAjout = (e) => {
    e.preventDefault();

    if (!nom || !latitude || !longitude || !volumeProduction) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    onAjouterVillage({
      nom,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      volume_production: parseFloat(volumeProduction)
    });

    setNom('');
    setLatitude('');
    setLongitude('');
    setVolumeProduction('');
  };

  return (
    <div className="section-carte">
      <h2>📍 Gestion des Villages</h2>

      <form onSubmit={gererAjout} className="formulaire">
        <div className="grille-formulaire">
          <input
            type="text"
            placeholder="Nom du village"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="champ-saisie"
          />
          <input
            type="number"
            step="0.000001"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="champ-saisie"
          />
          <input
            type="number"
            step="0.000001"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="champ-saisie"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Production (kg)"
            value={volumeProduction}
            onChange={(e) => setVolumeProduction(e.target.value)}
            className="champ-saisie"
          />
        </div>
        <button type="submit" className="bouton-principal">
          Ajouter le Village
        </button>
      </form>

      <div className="liste-villages">
        <h3>Villages Enregistrés ({villages.length})</h3>
        {villages.length === 0 ? (
          <p className="texte-vide">Aucun village enregistré</p>
        ) : (
          <div className="grille-cartes">
            {villages.map((village) => (
              <div key={village.id} className="carte-village">
                <div className="carte-entete">
                  <h4>{village.nom}</h4>
                  <button
                    onClick={() => onSupprimerVillage(village.id)}
                    className="bouton-supprimer"
                  >
                    ×
                  </button>
                </div>
                <p className="detail-village">
                  📊 Production: {village.volume_production} kg
                </p>
                <p className="detail-village-secondaire">
                  Lat: {village.latitude.toFixed(4)}, Lon: {village.longitude.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
