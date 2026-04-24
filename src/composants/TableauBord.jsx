import React, { useState } from 'react';
import { BarChart2, MapPin, Map, Package, AlertTriangle, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TableauBord({ villages, routes, optimisations = [] }) {
  const [detailExpandu, setDetailExpandu] = useState(null);

  const calculerStatistiques = () => {
    const nombreVillages = villages.length;
    const routesActives = routes.filter(r => !r.estBloquee).length;
    const productionTotale = villages.reduce((sum, v) => sum + parseFloat(v.volumeProduction || 0), 0);
    const routesBloquees = routes.filter(r => r.estBloquee === true).length;

    // Calculer le gain moyen à partir des optimisations
    const gainMoyen = optimisations.length > 0
      ? optimisations.reduce((sum, o) => sum + parseFloat(o.gainPercentage || 0), 0) / optimisations.length
      : 0;

    // Calculer l'économie totale à partir des optimisations
    const economieTotale = optimisations.reduce((sum, o) => sum + parseFloat(o.coutTotal || 0), 0);

    // Production totale historique (somme de toutes les productions depuis le début)
    const productionTotaleHistorique = villages.reduce((sum, v) => sum + parseFloat(v.productionTotaleHistorique || 0), 0);

    // Distance totale sauvegardée
    const distanceTotaleSauvegardee = optimisations.reduce((sum, o) => sum + parseFloat(o.distanceTotale || 0), 0);

    return {  
      nombreVillages,
      nombreRoutes: routesActives,
      productionTotale,
      productionTotaleHistorique,
      routesBloquees,
      gainMoyen,
      economieTotale,
      distanceTotaleSauvegardee
    };
  };

  const stats = calculerStatistiques();

  const topVillage = villages.length > 0
    ? villages.reduce((best, village) => {
        const production = parseFloat(village.productionTotaleHistorique || village.volumeProduction || 0);
        const bestProduction = parseFloat(best.productionTotaleHistorique || best.volumeProduction || 0);
        return production > bestProduction ? village : best;
      }, villages[0])
    : null;

  const topProduction = topVillage ? parseFloat(topVillage.productionTotaleHistorique || topVillage.volumeProduction || 0) : 0;
  const topShare = stats.productionTotaleHistorique > 0 ? Math.min(1, topProduction / stats.productionTotaleHistorique) : 0;

  return (
    <div className="section-carte dashboard">
      <h2 className="dashboard-title">
        <BarChart2 size={26} />
        Tableau de Bord
      </h2>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="stat-cards">
            <div className="card-stat">
              <div className="card-icon"><MapPin size={20} /></div>
              <div>
                <div className="card-value">{stats.nombreVillages}</div>
                <div className="card-label">Villages</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><Map size={20} /></div>
              <div>
                <div className="card-value">{stats.nombreRoutes}</div>
                <div className="card-label">Routes</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><Package size={20} /></div>
              <div>
                <div className="card-value">{stats.productionTotaleHistorique.toFixed(0)} kg</div>
                <div className="card-label">Production Totale</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><AlertTriangle size={20} /></div>
              <div>
                <div className="card-value">{stats.routesBloquees}</div>
                <div className="card-label">Bloquées</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><BarChart2 size={20} /></div>
              <div>
                <div className="card-value">{stats.gainMoyen.toFixed(1)}%</div>
                <div className="card-label">Gain Moyen</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><DollarSign size={20} /></div>
              <div>
                <div className="card-value">{stats.economieTotale.toFixed(0)} Ar</div>
                <div className="card-label">Économies</div>
              </div>
            </div>
          </div>

          <div className="chart-area">
            <h3>Historique des Optimisations</h3>
            <div className="chart-placeholder">
              {optimisations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  (Aucune optimisation enregistrée)
                </div>
              ) : (
                <Line
                  options={{
                    responsive: true,
                    interaction: { mode: 'index', intersect: false },
                    stacked: false,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: { 
                        type: 'linear', 
                        position: 'left', 
                        title: { display: true, text: 'Gain (%)' },
                        beginAtZero: true
                      },
                      y1: { 
                        type: 'linear', 
                        position: 'right', 
                        grid: { drawOnChartArea: false }, 
                        title: { display: true, text: 'Distance (km)' },
                        beginAtZero: true
                      }
                    }
                  }}
                  data={{
                    labels: optimisations.map(o => new Date(o.dateHeure).toLocaleDateString('fr-FR')),
                    datasets: [
                      {
                        label: 'Gain (%)',
                        data: optimisations.map(o => parseFloat(o.gainPercentage || 0)),
                        borderColor: 'rgba(46,125,50,0.9)',
                        backgroundColor: 'rgba(46,125,50,0.2)',
                        yAxisID: 'y',
                        fill: true,
                        tension: 0.3
                      },
                      {
                        label: 'Distance (km)',
                        data: optimisations.map(o => parseFloat(o.distanceTotale || 0)),
                        borderColor: 'rgba(37,99,235,0.9)',
                        backgroundColor: 'rgba(37,99,235,0.2)',
                        yAxisID: 'y1',
                        fill: false,
                        tension: 0.3
                      }
                    ]
                  }}
                />
              )}
            </div>

            {optimisations.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '12px', color: '#2d5016', fontWeight: '600' }}>Détails des Optimisations</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {optimisations.map((opt, idx) => (
                    <div key={opt.id || idx}>
                      <button
                        onClick={() => setDetailExpandu(detailExpandu === idx ? null : idx)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: idx === 0 ? '#dbeafe' : '#f3f4f6',
                          border: `2px solid ${idx === 0 ? '#2563eb' : '#e8dfc8'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: '600',
                          color: '#2d5016',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = idx === 0 ? '#bfdbfe' : '#e5e7eb'}
                        onMouseLeave={(e) => e.target.style.background = idx === 0 ? '#dbeafe' : '#f3f4f6'}
                      >
                        <span>
                          {idx === 0 && '⭐ '}
                          {new Date(opt.dateHeure).toLocaleDateString('fr-FR')} - {new Date(opt.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' • '} {opt.gainPercentage?.toFixed(1)}% | {opt.distanceTotale?.toFixed(1)} km
                        </span>
                        {detailExpandu === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {detailExpandu === idx && (
                        <div style={{
                          padding: '12px',
                          background: '#f9fafb',
                          border: '2px solid #e8dfc8',
                          borderTop: 'none',
                          borderRadius: '0 0 6px 6px',
                          fontSize: '0.9rem'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Gain</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2d5016' }}>
                                {opt.gainPercentage?.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Distance</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2563eb' }}>
                                {opt.distanceTotale?.toFixed(2)} km
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Coût Total</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d97706' }}>
                                {opt.coutTotal?.toFixed(0)} Ar
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Tournées</div>
                              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#7c3aed' }}>
                                {opt.nbTournees || 0}
                              </div>
                            </div>
                          </div>

                          {opt.villagesNonDesservis && opt.villagesNonDesservis.length > 0 && (
                            <div style={{
                              padding: '8px',
                              background: '#fef3c7',
                              border: '1px solid #fcd34d',
                              borderRadius: '4px',
                              color: '#92400e',
                              fontSize: '0.85rem'
                            }}>
                              <strong>Villages non desservis:</strong> {opt.villagesNonDesservis.join(', ')}
                            </div>
                          )}

                          {opt.tournees && opt.tournees.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontWeight: '600', color: '#2d5016', marginBottom: '8px' }}>Tournées:</div>
                              {opt.tournees.map((t, tIdx) => (
                                <div key={tIdx} style={{
                                  padding: '8px',
                                  background: '#ffffff',
                                  border: '1px solid #e8dfc8',
                                  borderRadius: '4px',
                                  marginBottom: '8px',
                                  fontSize: '0.85rem'
                                }}>
                                  <div style={{ fontWeight: '600', color: t.couleurHex || '#2d5016', marginBottom: '4px' }}>
                                    Camion {tIdx + 1}: {t.nomCamion}
                                  </div>
                                  <div style={{ color: '#6b7280' }}>
                                    Distance: {t.distanceTotale?.toFixed(1)} km | Charge: {t.chargeTotale?.toFixed(0)} kg
                                  </div>
                                  {t.etapes && t.etapes.length > 0 && (
                                    <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #e8dfc8' }}>
                                      {t.etapes.map((e, eIdx) => (
                                        <div key={eIdx} style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>
                                          {eIdx + 1}. {e.villageNom}: {e.productionCollectee?.toFixed(0)} kg
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="dashboard-side">
          <div className="side-card big-circle">
            <div className="circle-value">{stats.economieTotale.toFixed(0)} Ar</div>
            <div className="circle-label">Économies Totales</div>
          </div>

          <div className="side-card small">
            <h4>Résumé</h4>
            <div className="side-row"><strong>{stats.nombreVillages}</strong> Villages</div>
            <div className="side-row"><strong>{stats.nombreRoutes}</strong> Routes</div>
            <div className="side-row"><strong>{stats.routesBloquees}</strong> Bloquées</div>
            <div className="side-row"><strong>{optimisations.length}</strong> Optimisations</div>
          </div>

          <div className="side-card top-village-card">
            <h4>Village le plus producteur</h4>
            {topVillage ? (
              <>
                <div className="top-village-name">{topVillage.nom}</div>
                <div className="top-village-stat">{topProduction.toFixed(0)} kg</div>
                <div className="top-village-bar">
                  <div className="top-village-fill" style={{ width: `${topShare * 100}%` }} />
                </div>
                <div className="top-village-note">
                  {Math.round(topShare * 100)} % de la production totale
                </div>
                {topVillage.collecteRestante !== undefined && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f0fdf4', borderRadius: '4px', fontSize: '0.85rem', color: '#166534' }}>
                    <strong>Collecte restante:</strong> {topVillage.collecteRestante?.toFixed(0)} kg
                  </div>
                )}
              </>
            ) : (
              <p>Aucun village enregistré</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
