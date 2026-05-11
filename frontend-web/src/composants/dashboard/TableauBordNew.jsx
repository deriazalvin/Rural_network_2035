import React, { useState, useEffect } from 'react';
import {
  BarChart3, MapPin, Route, Package, AlertTriangle, TrendingUp,
  Truck, Calendar, Activity, Zap, ChevronDown, ChevronRight,
  Target, Award, Clock, Users, Eye, EyeOff, Play, Pause
} from 'lucide-react';
import { StatCard } from './StatCard';
import { ChartSection } from './ChartSection';
import { OptimizationItem } from './OptimizationItem';
import { NetworkVisualization } from './NetworkVisualization';
import DemoPage from '../common/DemoPage';
import '../../styles/tableau-bord.css';

/**
 * Nouveau Tableau de Bord Ultra-Moderne avec :
 * - Design Glassmorphism & Neumorphism
 * - Animations fluides et micro-interactions
 * - Layout responsive et adaptatif
 * - Métriques en temps réel avec indicateurs visuels
 * - Interface immersive et professionnelle
 */
export function TableauBordNew({
  villages = [],
  routes = [],
  optimisations = [],
  resultatsOptimisation = null,
  onOptimizationSelect = null,
  onEffacerHistorique = null
}) {
  const historyData = optimisations || [];
  const [stats, setStats] = useState({
    villages: 0,
    routes: 0,
    production: 0,
    blocked: 0,
    avgGain: 0,
    savings: 0,
    efficiency: 0,
    uptime: 0
  });
  const [expandedTours, setExpandedTours] = useState(new Set());
  const [activeView, setActiveView] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [optimSelectionnee, setOptimSelectionnee] = useState(null);

  // Calculer les stats avancées
  useEffect(() => {
    const routesActives = routes.filter(r => !r.estBloquee).length;
    const productionTotale = villages.reduce((sum, v) => sum + parseFloat(v.volumeProduction || 0), 0);
    const routesBloquees = routes.filter(r => r.estBloquee === true).length;
    const totalRoutes = routes.length;

    const gainMoyen = historyData.length > 0
      ? historyData.reduce((sum, o) => sum + parseFloat(o.gainPercentage || 0), 0) / historyData.length
      : 0;

    const economieTotale = historyData.reduce((sum, o) => sum + parseFloat(o.coutTotal || 0), 0);

    // Calculer l'efficacité opérationnelle
    const efficiency = totalRoutes > 0 ? ((routesActives / totalRoutes) * 100) : 100;

    // Calculer le taux de disponibilité
    const uptime = totalRoutes > 0 ? ((totalRoutes - routesBloquees) / totalRoutes) * 100 : 100;

    setStats({
      villages: villages.length,
      routes: routesActives,
      production: productionTotale,
      blocked: routesBloquees,
      avgGain: gainMoyen,
      savings: economieTotale,
      efficiency: efficiency,
      uptime: uptime
    });
  }, [villages, routes, optimisations]);

  // Animation des compteurs au montage
  useEffect(() => {
    const animateValue = (elementId, targetValue, duration = 2000, isDecimal = false) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const start = performance.now();
      const from = 0;

      function update(current) {
        const elapsed = current - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = from + (targetValue - from) * eased;

        if (isDecimal) {
          element.textContent = value.toFixed(1);
        } else {
          element.textContent = Math.floor(value).toLocaleString('fr-FR');
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    };

    setTimeout(() => {
      animateValue('stat-villages', stats.villages);
      animateValue('stat-routes', stats.routes);
      animateValue('stat-production', stats.production);
      animateValue('stat-blocked', stats.blocked);
      animateValue('stat-efficiency', stats.efficiency, 2000, true);
      animateValue('stat-uptime', stats.uptime, 2000, true);
    }, 500);
  }, [stats]);

  const toggleTour = (idx) => {
    const newSet = new Set(expandedTours);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedTours(newSet);
  };

  if (!isLiveMode) {
    return <DemoPage onBack={() => setIsLiveMode(true)} />;
  }

  return (
    <div className="dashboard-container">
      {/* Header Principal avec Contrôles */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1>Tableau de Bord Opérationnel</h1>
              <p>Réseau Rural Intelligent - Madagascar 2035</p>
            </div>
          </div>

          <div className="header-controls">
            <div className="live-indicator" onClick={() => setIsLiveMode(!isLiveMode)}>
              <div className={`live-dot ${isLiveMode ? 'active' : ''}`}></div>
              <span>{isLiveMode ? 'LIVE' : 'PAUSE'}</span>
              {isLiveMode ? <Pause size={14} /> : <Play size={14} />}
            </div>

            <div className="date-display">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <nav className="dashboard-nav">
          <button
            className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <Target size={18} />
            Vue d'ensemble
          </button>
          <button
            className={`nav-tab ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <TrendingUp size={18} />
            Analytics
          </button>
        </nav>
      </header>

      {/* Contenu Principal */}
      <main className="dashboard-main">
        {activeView === 'overview' && (
          <>
            {/* Métriques Principales */}
            <section className="metrics-grid">
              <div className="metric-card primary">
                <div className="metric-header">
                  <MapPin className="metric-icon" />
                  <span className="metric-label">Villages Connectés</span>
                </div>
                <div className="metric-value" id="stat-villages">0</div>
                <div className="metric-trend positive">
                  <TrendingUp size={14} />
                  +3 ce mois
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-header">
                  <Route className="metric-icon" />
                  <span className="metric-label">Routes Actives</span>
                </div>
                <div className="metric-value" id="stat-routes">0</div>
                <div className="metric-trend positive">
                  <TrendingUp size={14} />
                  96% opérationnel
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-header">
                  <Package className="metric-icon" />
                  <span className="metric-label">Production Totale</span>
                </div>
                <div className="metric-value" id="stat-production">0</div>
                <span className="metric-unit">kg</span>
                <div className="metric-trend positive">
                  <TrendingUp size={14} />
                  +12% vs N-1
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-header">
                  <AlertTriangle className="metric-icon" />
                  <span className="metric-label">Routes Bloquées</span>
                </div>
                <div className="metric-value" id="stat-blocked">0</div>
                <div className="metric-trend negative">
                  <TrendingUp size={14} />
                  -2 cette semaine
                </div>
              </div>

              <div className="metric-card accent">
                <div className="metric-header">
                  <Zap className="metric-icon" />
                  <span className="metric-label">Efficacité</span>
                </div>
                <div className="metric-value" id="stat-efficiency">0</div>
                <span className="metric-unit">%</span>
                <div className="metric-trend positive">
                  <Award size={14} />
                  Record
                </div>
              </div>

              <div className="metric-card secondary">
                <div className="metric-header">
                  <Clock className="metric-icon" />
                  <span className="metric-label">Disponibilité</span>
                </div>
                <div className="metric-value" id="stat-uptime">0</div>
                <span className="metric-unit">%</span>
                <div className="metric-trend positive">
                  <TrendingUp size={14} />
                  Stable
                </div>
              </div>
            </section>

            {/* Résultats d'Optimisation Active */}
            {resultatsOptimisation && (
              <section className="optimization-results">
                <div className="section-header">
                  <Activity className="section-icon" />
                  <h2>Résultats d'Optimisation Active</h2>
                  <div className="optimization-badge">
                    <Zap size={14} />
                    En cours
                  </div>
                </div>

                <div className="results-grid">
                  <div className="result-item">
                    <div className="result-icon">
                      <Route />
                    </div>
                    <div className="result-content">
                      <span className="result-label">Distance Totale</span>
                      <span className="result-value">{(resultatsOptimisation.distanceTotalKm || 0).toFixed(1)} km</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-icon">
                      <TrendingUp />
                    </div>
                    <div className="result-content">
                      <span className="result-label">Gain Réalisé</span>
                      <span className="result-value">{(resultatsOptimisation.gainPourcent || 0).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-icon">
                      <Package />
                    </div>
                    <div className="result-content">
                      <span className="result-label">Coût Total</span>
                      <span className="result-value">{(resultatsOptimisation.coutTotal || 0).toFixed(0)} Ar</span>
                    </div>
                  </div>

                  <div className="result-item">
                    <div className="result-icon">
                      <Truck />
                    </div>
                    <div className="result-content">
                      <span className="result-label">Camions Utilisés</span>
                      <span className="result-value">{resultatsOptimisation.tournees?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Détails des Tournées */}
                {resultatsOptimisation.tournees?.length > 0 && (
                  <div className="tours-section">
                    <h3>Détail des Tournées Optimisées</h3>
                    <div className="tours-list">
                      {resultatsOptimisation.tournees.map((tournee, idx) => (
                        <div key={idx} className="tour-card">
                          <button
                            className="tour-header"
                            onClick={() => toggleTour(idx)}
                          >
                            <div className="tour-info">
                              <div
                                className="tour-color"
                                style={{ backgroundColor: tournee.couleurHex || '#22c55e' }}
                              ></div>
                              <span className="tour-name">
                                {tournee.nom || `Tournée ${idx + 1}`}
                              </span>
                              <span className="tour-stops">
                                {tournee.etapes?.length || 0} arrêts
                              </span>
                            </div>
                            <div className="tour-metrics">
                              <span className="metric">{(tournee.distanceTotalKm || 0).toFixed(1)} km</span>
                              <span className="metric">{(tournee.chargeTotalKg || 0).toFixed(0)} kg</span>
                              {expandedTours.has(idx) ?
                                <ChevronDown size={18} /> :
                                <ChevronRight size={18} />
                              }
                            </div>
                          </button>

                          {expandedTours.has(idx) && (
                            <div className="tour-details">
                              <div className="tour-stats">
                                <div className="stat">
                                  <span className="stat-label">Distance totale</span>
                                  <span className="stat-value">{(tournee.distanceTotalKm || 0).toFixed(1)} km</span>
                                </div>
                                <div className="stat">
                                  <span className="stat-label">Charge utile</span>
                                  <span className="stat-value">
                                    {(tournee.chargeTotalKg || 0).toFixed(0)} / {(tournee.capaciteKg || 0).toFixed(0)} kg
                                  </span>
                                </div>
                                <div className="stat">
                                  <span className="stat-label">Coût estimé</span>
                                  <span className="stat-value">{(tournee.coutTotal || 0).toFixed(0)} Ar</span>
                                </div>
                              </div>

                              <div className="tour-stops-list">
                                {tournee.etapes?.map((etape, eIdx) => (
                                  <div key={eIdx} className="stop-item">
                                    <div className="stop-number">{eIdx + 1}</div>
                                    <div className="stop-content">
                                      <div className="stop-name">{etape.nom}</div>
                                      <div className="stop-details">
                                        <span>{(etape.production || 0).toFixed(0)} kg collectés</span>
                                        <span>{(etape.distanceCumulee || 0).toFixed(1)} km cumulés</span>
                                      </div>
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

                {/* Alertes */}
                {resultatsOptimisation.villagesNonDesservis?.length > 0 && (
                  <div className="alert-section">
                    <div className="alert-header">
                      <AlertTriangle className="alert-icon" />
                      <span className="alert-title">Villages non desservis</span>
                    </div>
                    <div className="alert-content">
                      <p>{resultatsOptimisation.villagesNonDesservis.length} village(s) nécessitent une attention particulière :</p>
                      <div className="unserved-villages">
                        {resultatsOptimisation.villagesNonDesservis.map((village, idx) => (
                          <span key={idx} className="village-tag">{village}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Visualisation Réseau */}
            {resultatsOptimisation && resultatsOptimisation.tournees?.length > 0 && (
              <section className="network-section">
                <div className="section-header">
                  <MapPin className="section-icon" />
                  <h2>Visualisation du Réseau</h2>
                </div>
                <NetworkVisualization tours={resultatsOptimisation.tournees} />
              </section>
            )}

            {/* Historique des Optimisations — affiché comme dans l'app mobile */}
            <section className="history-section">
              <div className="history-header">
                <Calendar className="section-icon" />
                <h3>Historique des Optimisations</h3>
                <span className="history-count">{historyData.length} optimisations</span>
              </div>

              {historyData.length === 0 ? (
                <div className="empty-state">
                  <Zap className="empty-icon" />
                  <h4>Aucune optimisation enregistrée</h4>
                  <p>Lancez votre première optimisation pour commencer à suivre les performances</p>
                </div>
              ) : (
                <div className="optimizations-list">
                  {historyData.slice(0, 10).map((opt) => (
                    <OptimizationItem
                      key={opt.id}
                      opt={opt}
                      onToggle={(id, isExpanded) => onOptimizationSelect?.(opt)}
                    />
                  ))}
                </div>
              )}

              {historyData.length > 0 && (
                <div className="history-actions">
                  <button
                    className="clear-history-btn"
                    onClick={async () => {
                      if (window.confirm('Voulez-vous vraiment effacer l\'historique des optimisations ?')) {
                        try {
                          await onEffacerHistorique?.();
                        } catch (e) {
                          console.error('Erreur effacement backend:', e);
                        }
                        window.localStorage.removeItem('rn_optimisations');
                        window.localStorage.removeItem('optimization_history');
                        window.location.reload();
                      }
                    }}
                  >
                    <EyeOff size={16} />
                    Effacer l'historique
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {activeView === 'analytics' && (
          <section className="analytics-view">
            <div className="section-header">
              <TrendingUp className="section-icon" />
              <h2>Analyse et Tendances</h2>
            </div>

            {/* Graphiques */}
            {historyData.length > 0 && (
              <ChartSection
                chartData={historyData.map(opt => ({
                  date: opt.timestamp || opt.dateHeure || opt.date,
                  gain: opt.gainPercentage || 0,
                  distance: opt.distanceTotale || 0
                })).reverse()}
                onSelect={(idx) => setOptimSelectionnee(historyData[historyData.length - 1 - idx])}
              />
            )}

            {/* Détails de l'optimisation sélectionnée */}
            {historyData.length > 0 && (
              <div className="optim-detail-section" style={{ marginTop: '2rem' }}>
                <div className="history-header">
                  <Activity className="section-icon" />
                  <h3>{optimSelectionnee ? 'Optimisation Sélectionnée' : 'Dernière Optimisation'}</h3>
                </div>
                <OptimizationItem
                  opt={optimSelectionnee || historyData[0]}
                  optIdx={0}
                  onToggle={() => {}}
                />
              </div>
            )}

            {/* Historique des Optimisations */}
            <div className="history-section">
              <div className="history-header">
                <Calendar className="section-icon" />
                <h3>Historique des Optimisations</h3>
                <span className="history-count">{historyData.length} optimisations</span>
              </div>

              {historyData.length === 0 ? (
                <div className="empty-state">
                  <Zap className="empty-icon" />
                  <h4>Aucune optimisation enregistrée</h4>
                  <p>Lancez votre première optimisation pour commencer à suivre les performances</p>
                </div>
              ) : (
                <div className="optimizations-list">
                  {historyData.slice(0, 10).map((opt) => (
                    <OptimizationItem
                      key={opt.id}
                      opt={opt}
                      onToggle={(id, isExpanded) => onOptimizationSelect?.(opt)}
                    />
                  ))}
                </div>
              )}

              {historyData.length > 0 && (
                <div className="history-actions">
                  <button
                    className="clear-history-btn"
                    onClick={async () => {
                      if (window.confirm('Voulez-vous vraiment effacer l\'historique des optimisations ?')) {
                        try {
                          await onEffacerHistorique?.();
                        } catch (e) {
                          console.error('Erreur effacement backend:', e);
                        }
                        window.localStorage.removeItem('rn_optimisations');
                        window.localStorage.removeItem('optimization_history');
                        window.location.reload();
                      }
                    }}
                  >
                    <EyeOff size={16} />
                    Effacer l'historique
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
