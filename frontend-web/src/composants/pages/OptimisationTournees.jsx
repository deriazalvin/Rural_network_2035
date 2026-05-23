import React, { useState, useMemo, useEffect } from 'react';
import { Zap, MapPin, Truck, AlertCircle, AlertTriangle, ChevronDown, ChevronRight, Save, Info } from 'lucide-react';
import { TableauBordNew } from '../dashboard/TableauBordNew';
import { useOptimizationIntegration } from '../../hooks/useOptimizationIntegration';
import { useOptimizationStorage } from '../../hooks/useOptimizationStorage';
import '../../styles/pages/optimisation-tournees.css';

/**
 * Composant OptimisationTournees
 * Gère l'optimisation multi-camions des tournées de collecte
 */
export function OptimisationTournees({ 
  villages = [], 
  camions = [],
  depot = null,
  resultatOptimisation = null,
  onOptimiser = () => {},
  onValidation = () => {}
}) {
  const [camionsSelectiones, setCamionsSelectiones] = useState(new Set());
  const [depotSelectionne, setDepotSelectionne] = useState(depot);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const { processOptimizationResult } = useOptimizationIntegration();
  const { optimizations, isLoaded } = useOptimizationStorage();

  // Memoize empty routes array to prevent unnecessary re-renders
  const emptyRoutes = useMemo(() => [], []);

  useEffect(() => {
    setDepotSelectionne(depot);
  }, [depot]);

  // Auto-sauvegarder dans localStorage via le hook quand résultat disponible
  useEffect(() => {
    if (resultatOptimisation) {
      processOptimizationResult(resultatOptimisation);
    }
  }, [resultatOptimisation, processOptimizationResult]);

  const camionsDisponibles = camions.filter(c => c.etat === 'DISPONIBLE');

  const toggleCamion = (camionId) => {
    setCamionsSelectiones(prev => {
      const nouveau = new Set(prev); // On copie le Set actuel
      if (nouveau.has(camionId)) {
        nouveau.delete(camionId);
      } else {
        nouveau.add(camionId);
      }
      return nouveau; // On retourne le nouveau Set pour mettre à jour l'état
    });
  };

  const lancerOptimisation = async () => {
    if (!depotSelectionne) {
      setErreur('Sélectionnez un dépôt.');
      return;
    }
    if (camionsSelectiones.size === 0) {
      setErreur('Sélectionnez au moins un camion.');
      return;
    }

    setChargement(true);
    setErreur('');
    
    try {
      const token = localStorage.getItem('rn_token');
      const response = await fetch('/api/optimisations/multi-camions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          depotId: depotSelectionne.id,
          camionIds: Array.from(camionsSelectiones)
        })
      });

      if (!response.ok) {
        const text = await response.text();
        let message = `Erreur ${response.status}`;
        try {
          const json = JSON.parse(text);
          message = json.message || json.error || message;
        } catch (e) {
          if (text) message = text;
        }
        throw new Error(message);
      }

      const resultat = await response.json();
      onOptimiser(resultat);
    } catch (err) {
      setErreur(`Erreur d'optimisation: ${err.message}`);
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  // Si résultat disponible, afficher le tableau de bord
  if (resultatOptimisation) {
    return (
      <div className="optimisation-tournees-container section-carte">
        <TableauBordNew 
          villages={villages}
          routes={emptyRoutes}
          optimisations={optimizations}
          resultatsOptimisation={resultatOptimisation}
          onOptimizationSelect={onOptimiser}
        />
        
        <button
          onClick={() => onValidation(resultatOptimisation)}
          className="btn btn-validate"
          style={{ width: '100%', marginTop: '24px' }}
        >
          <Save size={16} />
          Valider cette Optimisation
        </button>
      </div>
    );
  }

  // Écran initial: sélection du dépôt et des camions
  return (
    <div className="optimisation-tournees-container section-carte">
      <h2 className="optimisation-tournees-title">
        <Zap size={26} />
        Optimisation des Tournées
      </h2>

      {erreur && (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{erreur}</span>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h3>Dépôt de Départ</h3>
        {villages.length > 0 ? (
          <select
            value={depotSelectionne?.id || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedVillage = villages.find(v => v.id === selectedId);
              setDepotSelectionne(selectedVillage);
            }}
            className="optimisation-select"
          >
            <option value="">Choisir un dépôt...</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.nom}
              </option>
            ))}
          </select>
        ) : (
          <div className="optimisation-alert optimisation-alert-error">
            <AlertTriangle size={16} />
            <span>Aucun village disponible. Créez des villages pour choisir un dépôt.</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>Sélectionner les Camions</h3>
        
        {camionsDisponibles.length === 0 ? (
          <div className="optimisation-alert optimisation-alert-error">
            <AlertTriangle size={16} />
            <span>Aucun camion disponible. Créez des camions et assurez-vous qu'ils sont en état "Disponible".</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            {camionsDisponibles.map((camion) => (
              <div
                key={camion.id}
                onClick={() => toggleCamion(camion.id)}
                className={`optimisation-camion-card ${camionsSelectiones.has(camion.id) ? 'selected' : ''}`}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div className="optimisation-camion-header">
                  <input
                    type="checkbox"
                    checked={camionsSelectiones.has(camion.id)}
                    onChange={() => {}}
                    style={{ cursor: 'pointer' }}
                  />
                  <Truck size={16} />
                  {camion.nom}
                </div>
                <div className="optimisation-camion-capacity">
                  Capacité: {(camion.capaciteKg || 0).toLocaleString('fr-FR')} kg
                </div>
                <div style={{
                  marginTop: '6px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: camion.couleurHex || '#2d5016'
                }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={lancerOptimisation}
        disabled={chargement || !depot || camionsSelectiones.size === 0}
        className="bouton-principal"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: (chargement || !depot || camionsSelectiones.size === 0) ? 0.5 : 1
        }}
      >
        <Zap size={18} />
        {chargement ? 'Optimisation en cours...' : 'Lancer l\'Optimisation'}
      </button>

      <div style={{
        marginTop: '24px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.12)',
        border: '2px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={16} /> Optimisation en version bêta
        </div>
        <div style={{ fontSize: '0.85rem', color: '#93c5fd', marginTop: '4px' }}>
          Cette interface teste l'intégration de l'algorithme greedy multi-camions. Certaines fonctionnalités peuvent être en développement.
        </div>
      </div>
    </div>
  );
}
