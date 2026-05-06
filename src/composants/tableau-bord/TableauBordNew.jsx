import React, { useState, useEffect } from 'react';
import { 
  BarChart2, MapPin, Map, Package, AlertTriangle, Zap, 
  ChevronDown, Truck, Calendar, Activity, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { useOptimizationStorage } from '../../hooks/useOptimizationStorage';
import { StatCard } from './StatCard';
import { ChartSection } from './ChartSection';
import { OptimizationItem } from './OptimizationItem';
import { NetworkVisualization } from './NetworkVisualization';
import '../../styles/tableau-bord.css';

/**
 * TableauBord refactorisé avec :
 * - Persistance localStorage automatique
 * - Composants modulaires
 * - Animations GSAP/CSS
 * - Design moderne luxe
 * - TOUS les contenus du dashboard
 */
export function TableauBordNew({ 
  villages = [], 
  routes = [], 
  optimisations = [],
  resultatsOptimisation = null,
  onOptimizationSelect = null 
}) {
  const { optimizations, isLoaded, addOptimization, clearHistory } = useOptimizationStorage();
  const [stats, setStats] = useState({
    villages: 0,
    routes: 0,
    production: 0,
    blocked: 0,
    avgGain: 0,
    savings: 0
  });
  const [expandedTours, setExpandedTours] = useState(new Set());

  // Calculer les stats
  useEffect(() => {
    const routesActives = routes.filter(r => !r.estBloquee).length;
    const productionTotale = villages.reduce((sum, v) => sum + parseFloat(v.volumeProduction || 0), 0);
    const routesBloquees = routes.filter(r => r.estBloquee === true).length;

    const gainMoyen = optimizations.length > 0
      ? optimizations.reduce((sum, o) => sum + parseFloat(o.gainPercentage || 0), 0) / optimizations.length
      : 0;

    const economieTotale = optimizations.reduce((sum, o) => sum + parseFloat(o.coutTotal || 0), 0);

    setStats({
      villages: villages.length,
      routes: routesActives,
      production: productionTotale,
      blocked: routesBloquees,
      avgGain: gainMoyen,
      savings: economieTotale
    });
  }, [villages, routes, optimizations]);

  // Animations au montage
  useEffect(() => {
    if (!isLoaded) return;

    // Animer les cartes stat
    const animateCounter = (el, target, duration = 1500) => {
      const start = performance.now();
      const from = 0;

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.floor(from + (target - from) * eased);
        if (el) {
          el.textContent = val.toLocaleString('fr-FR');
        }
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    setTimeout(() => {
      animateCounter(document.getElementById('stat-value-Villages'), stats.villages);
      animateCounter(document.getElementById('stat-value-Routes'), stats.routes);
      animateCounter(document.getElementById('stat-value-Production'), stats.production);
      animateCounter(document.getElementById('stat-value-Bloquées'), stats.blocked);
    }, 300);
  }, [stats, isLoaded]);

  // Préparer les données du chart
  const chartData = optimizations.map(opt => ({
    date: opt.timestamp || opt.date,
    gain: opt.gainPercentage || 0,
    distance: opt.distanceTotale || 0
  })).reverse();

  // Marquer le dernier comme "latest"
  const optimizationsWithLatest = optimizations.map((opt, idx) => ({
    ...opt,
    isLatest: idx === 0
  }));

  const toggleTour = (idx) => {
    const newSet = new Set(expandedTours);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedTours(newSet);
  };

  if (!isLoaded) {
    return (
      <div className="section-carte" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="section-carte" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 
            className="flex items-center gap-3"
            style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              color: 'var(--text-primary)'
            }}
          >
            <BarChart2 size={32} style={{ color: '#22c55e' }} />
            <span>Tableau de Bord Opérationnel</span>
          </h2>
          <div className="tb-live-indicator" style={{ color: 'var(--text-tertiary)' }}>
            <span className="dot"></span>
            Live
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 tb-stagger-children mb-8">
        <StatCard 
          icon={MapPin}
          label="Villages"
          value={stats.villages}
          trend="+3 ce mois"
          colorClass="brand"
          delay={0}
        />
        <StatCard 
          icon={Map}
          label="Routes Actives"
          value={stats.routes}
          trend="96% opérationnel"
          colorClass="blue"
          delay={80}
        />
        <StatCard 
          icon={Package}
          label="Production"
          value={stats.production}
          suffix=" kg"
          trend="+12% vs N-1"
          colorClass="brand"
          delay={160}
        />
        <StatCard 
          icon={AlertTriangle}
          label="Routes Bloquées"
          value={stats.blocked}
          trend="-2 cette semaine"
          colorClass="red"
          delay={240}
        />
        <StatCard 
          icon={Zap}
          label="Gain Moyen"
          value={stats.avgGain}
          suffix="%"
          trend="Record"
          colorClass="brand"
          isDecimal
          delay={320}
        />
        <StatCard 
          icon={Truck}
          label="Économies"
          value={stats.savings}
          suffix=" Ar"
          trend="Cumulées"
          colorClass="amber"
          delay={400}
        />
      </section>

      {/* Résultats Actuels Section - Only if resultatsOptimisation exists */}
      {resultatsOptimisation && (
        <section className="tb-card mb-8" style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,182,224,0.08))',
          border: '2px solid rgba(34,197,94,0.2)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Activity size={20} style={{ color: '#22c55e' }} />
            Résultats de l'Optimisation Courante
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(34,197,94,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(34,197,94,0.2)'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Distance Totale</div>
              <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold' }}>
                {(resultatsOptimisation.distanceTotalKm || 0).toFixed(1)} km
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(59,182,224,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59,182,224,0.2)'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Gain</div>
              <div style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}>
                {(resultatsOptimisation.gainPourcent || 0).toFixed(1)} %
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(245,158,11,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(245,158,11,0.2)'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Coût Total</div>
              <div style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 'bold' }}>
                {(resultatsOptimisation.coutTotal || 0).toFixed(0)} Ar
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(34,197,94,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(34,197,94,0.2)'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Camions Utilisés</div>
              <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: 'bold' }}>
                {resultatsOptimisation.tournees?.length || 0}
              </div>
            </div>
          </div>

          {/* Tours détails */}
          {resultatsOptimisation.tournees?.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>Détail des Tournées</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resultatsOptimisation.tournees.map((tournee, idx) => (
                  <div 
                    key={idx}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'rgba(0,0,0,0.02)'
                    }}
                  >
                    <button
                      onClick={() => toggleTour(idx)}
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
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            backgroundColor: tournee.couleurHex || '#2d5016'
                          }}
                        />
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {tournee.camionNom || `Tournée ${idx + 1}`}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {tournee.etapes?.length || 0} arrêts
                        </span>
                      </div>
                      {expandedTours.has(idx) ? <ChevronDown size={16} /> : <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />}
                    </button>

                    {expandedTours.has(idx) && (
                      <div style={{
                        padding: '12px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--bg)'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          marginBottom: '12px',
                          fontSize: '13px'
                        }}>
                          <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}>Distance</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>
                              {(tournee.distanceTotalKm || 0).toFixed(1)} km
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}>Charge</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>
                              {(tournee.chargeTotalKg || 0).toFixed(0)}/{(tournee.capaciteKg || 0).toFixed(0)} kg
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}>Coût</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
                              {(tournee.coutTotal || 0).toFixed(0)} Ar
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {tournee.etapes?.map((etape, eIdx) => (
                            <div key={eIdx} style={{
                              padding: '8px 10px',
                              background: 'rgba(0,0,0,0.02)',
                              borderRadius: '4px',
                              borderLeft: '3px solid ' + (tournee.couleurHex || '#2d5016')
                            }}>
                              <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                {eIdx + 1}. {etape.villageNom}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                                {(etape.productionCollectee || 0).toFixed(0)} kg | Charge cum.: {(etape.chargeCumulee || 0).toFixed(0)} kg | Distance cum.: {(etape.distanceCumulee || 0).toFixed(1)} km
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Villages non desservis */}
          {resultatsOptimisation.villagesNonDesservis?.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#dc2626', marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#dc2626', fontSize: '13px' }}>
                    {resultatsOptimisation.villagesNonDesservis.length} village(s) non desservi(s)
                  </div>
                  <div style={{ color: '#991b1b', fontSize: '12px', marginTop: '4px' }}>
                    {resultatsOptimisation.villagesNonDesservis.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Network Visualization Section */}
      {resultatsOptimisation && resultatsOptimisation.tournees?.length > 0 && (
        <section className="tb-card mb-8">
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Map size={20} style={{ color: '#3b82f6' }} />
            Visualisation Réseau des Tournées
          </h3>
          <NetworkVisualization 
            tours={resultatsOptimisation.tournees}
          />
        </section>
      )}

      {/* Chart Section */}
      {chartData.length > 0 && (
        <ChartSection chartData={chartData} />
      )}

      {/* Optimizations History Section */}
      <section className="tb-reveal mt-8">
        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)' }}
          >
            <Calendar size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Historique des Optimisations
            </h3>
            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {optimizations.length} optimisation{optimizations.length !== 1 ? 's' : ''} enregistrée{optimizations.length !== 1 ? 's' : ''} (max 50)
            </p>
          </div>
        </div>

        {optimizations.length === 0 ? (
          <div 
            className="tb-card p-12 text-center"
            style={{
              background: 'var(--bg-elevated)',
              border: '2px dashed var(--border)'
            }}
          >
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'rgba(34,197,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Zap size={28} style={{ color: '#22c55e' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Aucune optimisation enregistrée
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Lancez une optimisation pour voir l'historique ici (les données sont sauvegardées automatiquement)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {optimizationsWithLatest.map((opt) => (
              <OptimizationItem
                key={opt.id}
                opt={opt}
                onToggle={(id, isExpanded) => onOptimizationSelect?.(opt)}
              />
            ))}
          </div>
        )}
      </section>

      {optimizations.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={clearHistory}
            className="text-xs font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#dc2626',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            Effacer l'historique
          </button>
        </div>
      )}
    </div>
  );
}
