import React, { useState, useMemo, useEffect } from 'react';
import { Zap, MapPin, Truck, AlertCircle, AlertTriangle, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { TableauBordNew } from './tableau-bord/TableauBordNew';
import { useOptimizationIntegration } from '../hooks/useOptimizationIntegration';

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
      <div className="section-carte">
        <TableauBordNew 
          villages={villages}
          routes={[]}
          resultatsOptimisation={resultatOptimisation}
          onOptimizationSelect={onOptimiser}
        />
        
        <button
          onClick={() => onValidation(resultatOptimisation)}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '12px',
            background: '#2d5016',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4a7c2c';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2d5016';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Save size={16} />
          Valider cette Optimisation
        </button>
      </div>
    );
  }

  // Écran initial: sélection du dépôt et des camions
  return (
    <div className="section-carte">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={26} color="#2d5016" />
        Optimisation des Tournées
      </h2>

      {erreur && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px',
          background: '#fee2e2',
          borderLeft: '4px solid #dc2626',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <AlertCircle size={18} color="#dc2626" style={{ marginTop: '2px' }} />
          <span style={{ color: '#991b1b', fontSize: '0.9rem' }}>{erreur}</span>
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
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              borderRadius: '8px',
              border: '2px solid #2d5016',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: '#2d5016',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <option value="">Choisir un dépôt...</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.nom}
              </option>
            ))}
          </select>
        ) : (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            marginTop: '8px',
            color: '#991b1b'
          }}>
            ⚠️ Aucun village disponible. Créez des villages pour choisir un dépôt.
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>Sélectionner les Camions</h3>
        
        {camionsDisponibles.length === 0 ? (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            marginTop: '8px',
            color: '#991b1b'
          }}>
            ⚠️ Aucun camion disponible. Créez des camions et assurez-vous qu'ils sont en état "Disponible".
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
                style={{
                  padding: '12px',
                  background: camionsSelectiones.has(camion.id) ? '#dbeafe' : '#f3f4f6',
                  border: `2px solid ${camionsSelectiones.has(camion.id) ? '#2563eb' : '#e8dfc8'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  color: '#2d5016'
                }}>
                  <input
                    type="checkbox"
                    checked={camionsSelectiones.has(camion.id)}
                    onChange={() => {}}
                    style={{ cursor: 'pointer' }}
                  />
                  <Truck size={16} />
                  {camion.nom}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px' }}>
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
        background: '#dbeafe',
        border: '2px solid #2563eb',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '0.9rem', color: '#0c4a6e', fontWeight: '600' }}>
          ℹ️ Optimisation en version bêta
        </div>
        <div style={{ fontSize: '0.85rem', color: '#1e40af', marginTop: '4px' }}>
          Cette interface teste l'intégration de l'algorithme greedy multi-camions. Certaines fonctionnalités peuvent être en développement.
        </div>
      </div>
    </div>
  );
}
