import React, { useState, useEffect } from 'react';
import {
  BarChart3, MapPin, Route, Package, AlertTriangle, TrendingUp,
  Truck, Calendar, Activity, Zap, ChevronDown, ChevronRight,
  Target, Award, Clock, Users, Eye, EyeOff, Play, Pause, Star
} from 'lucide-react';
import { StatCard } from './StatCard';
import { OptimizationItem } from './OptimizationItem';
import { NetworkVisualization } from './NetworkVisualization';
import { GraphiqueSimple } from './GraphiqueSimple';
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
  // Utilise d'abord le résultat actuel, puis l'historique
  const historyData = optimisations && optimisations.length > 0 
    ? optimisations 
    : [];
  
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
    console.log('📈 TableauBordNew - Data received:', {
      historyDataLength: historyData.length,
      historyData: historyData,
      resultatsOptimisation: resultatsOptimisation
    });

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
            <GraphiqueSimple
              donnees={historyData.length > 0 ? historyData.map(opt => ({
                date: opt.timestamp || opt.dateHeure || opt.date,
                gain: opt.gainPercentage || 0,
                distance: opt.distanceTotale || 0,
                cout: opt.coutTotal || 0
              })).reverse() : []}
              onSelect={(idx) => setOptimSelectionnee(historyData[historyData.length - 1 - idx])}
            />

            {/* Détails de l'optimisation sélectionnée */}
            {historyData.length > 0 && (() => {
              const selectedOpt = optimSelectionnee || historyData[0];
              const toursList = selectedOpt?.toursList || selectedOpt?.tournees || [];
              const gainPct = selectedOpt?.gainPercentage || 0;
              const distTot = selectedOpt?.distanceTotale || 0;
              const coutTot = selectedOpt?.coutTotal || 0;
              const unserved = selectedOpt?.unserved || selectedOpt?.villagesNonDesservis || [];
              return (
                <div className="optim-detail-section" style={{ marginTop: '2rem' }}>
                  <div className="history-header">
                    <Activity className="section-icon" />
                    <h3 style={{ fontSize: '1.1rem' }}>
                      {optimSelectionnee ? 'Optimisation Sélectionnée' : 'Dernière Optimisation'}
                    </h3>
                    {optimSelectionnee && (
                      <span className="tb-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Star size={12} /> Sélectionnée
                      </span>
                    )}
                  </div>

                  {/* KPIs */}
                  <div className="charts-grid" style={{ marginBottom: '1rem' }}>
                    <div className="chart-card" style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.25rem' }}>Gain réalisé</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>+{gainPct.toFixed(1)}%</p>
                    </div>
                    <div className="chart-card" style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.25rem' }}>Distance totale</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{distTot.toFixed(1)} km</p>
                    </div>
                    <div className="chart-card" style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.25rem' }}>Coût total</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{coutTot.toLocaleString('fr-FR')} Ar</p>
                    </div>
                    <div className="chart-card" style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.25rem' }}>Tournées</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{toursList.length}</p>
                    </div>
                  </div>

                  {/* Tournées et Grains réalisés */}
                  {toursList.length > 0 && (
                    <div className="chart-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Truck size={18} style={{ color: 'var(--text-tertiary)' }} />
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          Performances des Tournées et Grains réalisés
                        </h4>
                      </div>

                      {toursList.map((tour, ti) => {
                        const steps = tour.steps || tour.etapes || [];
                        const totalGrains = steps.reduce((s, st) => s + (st.production || st.productionCollectee || 0), 0);
                        return (
                          <div key={ti} style={{
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            marginBottom: '0.75rem',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              background: 'var(--bg)',
                              borderBottom: '1px solid var(--border-subtle)',
                            }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: tour.color || '#22c55e', flexShrink: 0 }} />
                              <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                {tour.name || `Tournée ${ti + 1}`}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {(tour.distance || tour.distanceTotale || 0).toFixed(1)} km
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                                {(tour.load || tour.chargeTotale || 0).toLocaleString('fr-FR')} kg
                              </span>
                            </div>

                            {/* Steps/étapes - Grains collectés */}
                            <div style={{ padding: '0.5rem 1rem' }}>
                              {steps.map((step, si) => (
                                <div key={si} style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.4rem 0',
                                  borderBottom: si < steps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                }}>
                                  <div style={{
                                    width: 22, height: 22, borderRadius: '50%',
                                    background: tour.color || '#22c55e',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                  }}>
                                    <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>{si + 1}</span>
                                  </div>
                                  <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                    {step.village || step.nomVillage || `Étape ${si + 1}`}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 700, fontFamily: 'monospace' }}>
                                    {(step.production || step.productionCollectee || 0).toLocaleString('fr-FR')} kg
                                  </span>
                                </div>
                              ))}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                                  Total grains : <strong style={{ color: '#22c55e' }}>{totalGrains.toLocaleString('fr-FR')} kg</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Villages non desservis */}
                  {unserved.length > 0 && (
                    <div className="chart-card" style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>Villages non desservis</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unserved.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

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
