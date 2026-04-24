import React, { useState, useMemo } from 'react';
import { Zap, MapPin, Truck, AlertCircle, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [tourneeExpandue, setTourneeExpandue] = useState(new Set());

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
    if (!depot) {
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
      const response = await fetch('/api/optimisations/multi-camions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depotId: depot.id,
          camionIds: Array.from(camionsSelectiones)
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
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

  const bascularTournee = (index) => {
    const nouvelEnsemble = new Set(tourneeExpandue);
    if (nouvelEnsemble.has(index)) {
      nouvelEnsemble.delete(index);
    } else {
      nouvelEnsemble.add(index);
    }
    setTourneeExpandue(nouvelEnsemble);
  };

  // Si résultat disponible, afficher le tableau de bord
  if (resultatOptimisation) {
    return (
      <div className="section-carte">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={26} color="#2d5016" />
          Résultats de l'Optimisation
        </h2>

        {/* === MÉTRIQUES === */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            border: '2px solid #e8dfc8'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Distance Totale</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2563eb' }}>
              {(resultatOptimisation.distanceTotalKm || 0).toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>km</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
              vs {(resultatOptimisation.distanceBaselinKm || 0).toFixed(1)} km baseline
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            border: '2px solid #e8dfc8'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Coût Total</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#d97706' }}>
              {(resultatOptimisation.coutTotal || 0).toFixed(0)} <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ar</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
              Économie: {(resultatOptimisation.economieTotal || 0).toFixed(0)} Ar
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            border: '2px solid #e8dfc8'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Gain</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#6b9d4a' }}>
              {(resultatOptimisation.gainPourcent || 0).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>De réduction</div>
          </div>

          <div style={{
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            border: '2px solid #e8dfc8'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Camions Utilisés</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#4a7c2c' }}>
              {resultatOptimisation.tournees?.length || 0}
            </div>
          </div>
        </div>

        {/* === DÉTAIL DES TOURNÉES === */}
        <h3 style={{ marginTop: '24px' }}>Détail des Tournées</h3>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resultatOptimisation.tournees?.map((tournee, idx) => (
            <div key={idx} style={{
              border: '2px solid #e8dfc8',
              borderRadius: '8px',
              background: '#f3f4f6',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => bascularTournee(idx)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e8dfc8'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: tournee.couleurHex || '#2d5016'
                    }}
                  />
                  <span style={{ fontWeight: '600', color: '#2d5016' }}>{tournee.camionNom}</span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>({tournee.etapes?.length || 0} arrêts)</span>
                </div>
                {tourneeExpandue.has(idx) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {tourneeExpandue.has(idx) && (
                <div style={{
                  padding: '12px',
                  borderTop: '2px solid #e8dfc8',
                  background: '#ffffff'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '12px',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <div style={{ color: '#6b7280', fontWeight: '600' }}>Distance</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2563eb' }}>
                        {(tournee.distanceTotalKm || 0).toFixed(1)} km
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontWeight: '600' }}>Charge</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#6b9d4a' }}>
                        {(tournee.chargeTotalKg || 0).toFixed(0)}/{(tournee.capaciteKg || 0).toFixed(0)} kg
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280', fontWeight: '600' }}>Coût</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d97706' }}>
                        {(tournee.coutTotal || 0).toFixed(0)} Ar
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {tournee.etapes?.map((etape, eIdx) => (
                      <div key={eIdx} style={{
                        padding: '8px',
                        background: '#f9fafb',
                        borderRadius: '4px',
                        borderLeft: '3px solid ' + (tournee.couleurHex || '#2d5016')
                      }}>
                        <div style={{ fontWeight: '600', color: '#2d5016' }}>{eIdx + 1}. {etape.villageNom}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>
                          Collecte: {(etape.productionCollectee || 0).toFixed(0)} kg | 
                          Charge cum.: {(etape.chargeCumulee || 0).toFixed(0)} kg | 
                          Distance cum.: {(etape.distanceCumulee || 0).toFixed(1)} km
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* === VILLAGES NON DESSERVIS === */}
        {resultatOptimisation.villagesNonDesservis?.length > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: '#fef3c7',
            border: '2px solid #fcd34d',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={18} color="#d97706" style={{ marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#d97706' }}>Villages non desservis ({resultatOptimisation.villagesNonDesservis.length})</strong>
              <div style={{ fontSize: '0.9rem', color: '#92400e', marginTop: '4px' }}>
                {resultatOptimisation.villagesNonDesservis.join(', ')}
              </div>
            </div>
          </div>
        )}

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
        {depot ? (
          <div style={{
            padding: '12px',
            background: '#f3f4f6',
            border: '2px solid #2d5016',
            borderRadius: '8px',
            marginTop: '8px',
            fontWeight: '600',
            color: '#2d5016'
          }}>
            📍 {depot.nom}
          </div>
        ) : (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            marginTop: '8px',
            color: '#991b1b'
          }}>
            ⚠️ Aucun dépôt sélectionné. Créez un village et configurez-le comme dépôt.
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
