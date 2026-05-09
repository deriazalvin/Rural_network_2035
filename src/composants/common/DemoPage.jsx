import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, BarChart3, MapPin, Route, Truck, Zap, ChevronRight,
  TrendingUp, Package, AlertTriangle, CheckCircle, RotateCcw,
  Plus, ArrowRight, Target, Award, Clock, Activity, Calendar,
  TrendingUp as Trend, Users, EyeOff
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tableau-bord.css';
import '../../styles/pages/gestion-villages.css';
import '../../styles/pages/gestion-routes.css';
import '../../styles/pages/optimisation-tournees.css';
import '../../styles/globals.css';

/**
 * DemoPage immersive — Simulation du réseau rural
 * Affichée depuis le dashboard en mode Pause
 */
export default function DemoPage({ onBack }) {
  const { darkMode } = useTheme();
  const [demoStep, setDemoStep] = useState(0);
  const [toast, setToast] = useState(null);
  const [progress, setProgress] = useState(0);
  const [animatedCount, setAnimatedCount] = useState({ villages: 0, routes: 0, production: 0, efficiency: 0, uptime: 0 });
  const [typingField, setTypingField] = useState({ nom: '', lat: '', lon: '', prod: '' });
  const [typingRoute, setTypingRoute] = useState({ depart: '', arrivee: '', dist: '' });

  const steps = [
    { label: 'Tableau de bord', icon: BarChart3 },
    { label: 'Villages', icon: MapPin },
    { label: 'Routes', icon: Route },
    { label: 'Optimisation', icon: Zap },
    { label: 'Résultats', icon: TrendingUp },
  ];

  const villages = [
    { id: 1, nom: 'Ambalavao', lat: -21.83, lon: 46.93, prod: 450 },
    { id: 2, nom: 'Manakara', lat: -22.13, lon: 48.00, prod: 320 },
    { id: 3, nom: 'Fianarantsoa', lat: -21.43, lon: 47.08, prod: 680 },
    { id: 4, nom: 'Mananjary', lat: -21.22, lon: 48.35, prod: 520 },
  ];
  const routes = [
    { id: 1, depart: 'Ambalavao', arrivee: 'Fianarantsoa', dist: 75, duree: '1h45', qualite: 'BONNE', bloquee: false },
    { id: 2, depart: 'Fianarantsoa', arrivee: 'Mananjary', dist: 95, duree: '2h10', qualite: 'MOYENNE', bloquee: false },
  ];

  // Animate dashboard counters on mount
  useEffect(() => {
    const targets = { villages: 3, routes: 1, production: 1450, efficiency: 87, uptime: 98 };
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setAnimatedCount({
        villages: Math.floor(targets.villages * pct),
        routes: Math.floor(targets.routes * pct),
        production: Math.floor(targets.production * pct),
        efficiency: Math.floor(targets.efficiency * pct),
        uptime: Math.floor(targets.uptime * pct),
      });
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Timeline automatique
  useEffect(() => {
    const t = [];
    t.push(setTimeout(() => { setDemoStep(1); typeVillageFields(); showToast('Nouveau village détecté : Mananjary', 'info'); }, 5000));
    t.push(setTimeout(() => { setDemoStep(2); typeRouteFields(); showToast('Route Fianarantsoa → Mananjary ajoutée', 'success'); }, 11000));
    t.push(setTimeout(() => { setDemoStep(3); runOptim(); }, 16000));
    t.push(setTimeout(() => { setDemoStep(4); }, 24000));
    return () => t.forEach(clearTimeout);
  }, []);

  function showToast(msg, type) { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function typeText(field, text, delay = 50) {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypingField(prev => ({ ...prev, [field]: text.slice(0, i) }));
      if (i >= text.length) clearInterval(iv);
    }, delay);
  }

  function typeVillageFields() {
    setTypingField({ nom: '', lat: '', lon: '', prod: '' });
    setTimeout(() => typeText('nom', 'Mananjary', 60), 300);
    setTimeout(() => typeText('lat', '-21.220000', 40), 900);
    setTimeout(() => typeText('lon', '48.350000', 40), 1600);
    setTimeout(() => typeText('prod', '520', 80), 2200);
  }

  function typeRouteFields() {
    setTypingRoute({ depart: '', arrivee: '', dist: '' });
    setTimeout(() => typeText('depart', 'Fianarantsoa', 60), 300);
    setTimeout(() => typeText('arrivee', 'Mananjary', 60), 900);
    setTimeout(() => typeText('dist', '95', 80), 1600);
  }

  function runOptim() {
    setProgress(0);
    const iv = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(iv); return 100; } return p + 2; }), 80);
  }

  function restart() {
    setDemoStep(0); setProgress(0); setToast(null);
    const t = [];
    t.push(setTimeout(() => { setDemoStep(1); showToast('Nouveau village détecté : Mananjary', 'info'); }, 5000));
    t.push(setTimeout(() => { setDemoStep(2); showToast('Route Fianarantsoa → Mananjary ajoutée', 'success'); }, 10000));
    t.push(setTimeout(() => { setDemoStep(3); runOptim(); }, 15000));
    t.push(setTimeout(() => { setDemoStep(4); }, 23000));
    return () => t.forEach(clearTimeout);
  }

  const chartData = [
    { date: '2025-01-10', gain: 18, distance: 320 },
    { date: '2025-02-15', gain: 24, distance: 290 },
    { date: '2025-03-22', gain: 29, distance: 310 },
    { date: '2025-04-05', gain: 32, distance: 285 },
  ];

  const getBadge = (p) => {
    if (p >= 500) return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Élevée' };
    if (p >= 100) return { bg: 'rgba(16,185,129,0.1)', color: '#34d399', label: 'Moyenne' };
    return { bg: 'rgba(16,185,129,0.08)', color: '#6ee7b7', label: 'Faible' };
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100]" style={{ animation: 'slideIn 0.3s ease' }}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-300'
              : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-300'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <Zap size={18} />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header identique au vrai dashboard */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1>Mode Démo — Simulation</h1>
              <p>Réseau Rural Intelligent - Madagascar 2035</p>
            </div>
          </div>
          <div className="header-controls">
            <button onClick={restart} className="live-indicator" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
              <RotateCcw size={14} /><span>Rejouer</span>
            </button>
            <button onClick={onBack} className="live-indicator" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
              <ArrowLeft size={14} /><span>Retour au Live</span>
            </button>
          </div>
        </div>
        <nav className="dashboard-nav">
          {steps.map((s, i) => (
            <button key={i} className={`nav-tab ${demoStep === i ? 'active' : ''}`} onClick={() => setDemoStep(i)}>
              <s.icon size={16} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* ========== ÉTAPE 0 : TABLEAU DE BORD ========== */}
      {demoStep === 0 && (
        <main className="dashboard-main" style={{ animation: 'tbFadeIn 0.5s ease' }}>
          <section className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-header"><MapPin className="metric-icon" /><span className="metric-label">Villages Connectés</span></div>
              <div className="metric-value">{animatedCount.villages}</div>
              <div className="metric-trend positive"><Trend size={14} />+1 ce mois</div>
            </div>
            <div className="metric-card success">
              <div className="metric-header"><Route className="metric-icon" /><span className="metric-label">Routes Actives</span></div>
              <div className="metric-value">{animatedCount.routes}</div>
              <div className="metric-trend positive"><Trend size={14} />100% opérationnel</div>
            </div>
            <div className="metric-card info">
              <div className="metric-header"><Package className="metric-icon" /><span className="metric-label">Production Totale</span></div>
              <div className="metric-value">{animatedCount.production.toLocaleString('fr-FR')}</div><span className="metric-unit">kg</span>
              <div className="metric-trend positive"><Trend size={14} />+12% vs N-1</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-header"><AlertTriangle className="metric-icon" /><span className="metric-label">Routes Bloquées</span></div>
              <div className="metric-value">0</div>
              <div className="metric-trend positive"><Trend size={14} />-2 cette semaine</div>
            </div>
            <div className="metric-card accent">
              <div className="metric-header"><Zap className="metric-icon" /><span className="metric-label">Efficacité</span></div>
              <div className="metric-value">{animatedCount.efficiency}</div><span className="metric-unit">%</span>
              <div className="metric-trend positive"><Award size={14} />Record</div>
            </div>
            <div className="metric-card secondary">
              <div className="metric-header"><Clock className="metric-icon" /><span className="metric-label">Disponibilité</span></div>
              <div className="metric-value">{animatedCount.uptime}</div><span className="metric-unit">%</span>
              <div className="metric-trend positive"><Trend size={14} />Stable</div>
            </div>
          </section>

          {/* Chart + Map */}
          <div className="tb-grid-2 mt-6">
            <section className="tb-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <Trend size={20} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Historique des Optimisations</h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Évolution des gains et distances</p>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400" /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Gain (%)</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Distance (km)</span></div>
              </div>
              <div className="h-48 flex items-end gap-4 px-4">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end" style={{ height: 120 }}>
                      <div className="flex-1 rounded-t-md" style={{ height: `${(d.gain / 40) * 100}%`, background: '#34d399' }} />
                      <div className="flex-1 rounded-t-md" style={{ height: `${(d.distance / 400) * 100}%`, background: '#fbbf24' }} />
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Carte simulée */}
            <section className="tb-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <MapPin size={20} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Carte du Réseau</h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>4 villages · 2 routes actives</p>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-subtle)', height: 260, background: '#e5e7eb' }}>
                <iframe title="carte-demo" src="https://www.openstreetmap.org/export/embed.html?bbox=46.5%2C-22.5%2C48.5%2C-21.0&layer=mapnik&marker=-21.43%2C47.08" width="100%" height="100%" style={{ border: 0 }} />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {villages.slice(0,3).map(v => (
                    <span key={v.id} className="text-[10px] px-2 py-0.5 rounded-md bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 font-medium shadow-sm">{v.nom}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ========== ÉTAPE 1 : GESTION VILLAGES ========== */}
      {demoStep === 1 && (
        <main className="dashboard-main" style={{ animation: 'tbFadeIn 0.5s ease' }}>
          <div className="gestion-villages-container section-carte">
            <h2 className="gestion-villages-title"><MapPin size={26} />Gestion des Villages</h2>
            <div className="gestion-stats">
              <div className="stat-card"><div className="stat-label">Total Villages</div><div className="stat-value">4</div></div>
              <div className="stat-card"><div className="stat-label">Production Totale</div><div className="stat-value">1,97 <span className="stat-unit">tonnes</span></div></div>
              <div className="stat-card"><div className="stat-label">Moyenne/Village</div><div className="stat-value">492 <span className="stat-unit">kg</span></div></div>
            </div>

            <form className="formulaire" onSubmit={(e) => e.preventDefault()}>
              <div className="grille-formulaire">
                <input className="champ-saisie" value={typingField.nom} placeholder="Nom du village" readOnly />
                <input className="champ-saisie" value={typingField.lat} placeholder="Latitude" readOnly />
                <input className="champ-saisie" value={typingField.lon} placeholder="Longitude" readOnly />
                <input className="champ-saisie" value={typingField.prod} placeholder="Production (kg)" readOnly />
              </div>
              <div className="form-buttons">
                <button className={`btn btn-primary ${!typingField.prod ? 'opacity-50' : ''}`}>
                  {typingField.prod ? 'Ajouter le Village' : 'Saisie en cours...'}
                </button>
              </div>
            </form>

            <div className="liste-villages">
              <div className="village-toolbar"><h3>Villages Enregistrés (4)</h3></div>
              <div className="village-card-grid">
                {villages.map((v) => {
                  const b = getBadge(v.prod);
                  return (
                    <div key={v.id} className="carte-village">
                      <div className="carte-entete"><h4>{v.nom}</h4></div>
                      <div className="badge-row" style={{ background: b.bg, borderColor: b.color }}>
                        <Trend size={16} color={b.color} />
                        <span style={{ fontWeight: 600, color: b.color }}>{v.prod} kg</span>
                        <span className="badge-pill" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                      </div>
                      <p className="detail-village-secondaire">Lat: {v.lat.toFixed(4)}, Lon: {v.lon.toFixed(4)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carte village simulée */}
            <div className="village-map-card mt-6" style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ height: 300, background: '#1f2937', position: 'relative' }}>
                <iframe title="carte-villages" src="https://www.openstreetmap.org/export/embed.html?bbox=46.5%2C-22.5%2C48.5%2C-21.0&layer=mapnik" width="100%" height="100%" style={{ border: 0, filter: darkMode ? 'brightness(0.7) contrast(1.1)' : 'none' }} />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  {villages.map(v => (
                    <span key={v.id} className="text-[10px] px-2 py-1 rounded-md bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 font-medium shadow">{v.nom}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========== ÉTAPE 2 : GESTION ROUTES ========== */}
      {demoStep === 2 && (
        <main className="dashboard-main" style={{ animation: 'tbFadeIn 0.5s ease' }}>
          <div className="gestion-routes-container section-carte">
            <h2 className="gestion-routes-title"><Route size={26} />Gestion des Routes</h2>
            <div className="routes-stats">
              <div className="stat-card"><div className="stat-label">Total Routes</div><div className="stat-value">2</div></div>
              <div className="stat-card"><div className="stat-label">Distance Totale</div><div className="stat-value">170 <span className="stat-unit">km</span></div></div>
              <div className="stat-card"><div className="stat-label">Routes Actives</div><div className="stat-value">2</div></div>
            </div>

            <form className="formulaire" onSubmit={(e) => e.preventDefault()}>
              <div className="grille-formulaire">
                <select className="champ-saisie"><option>{typingRoute.depart || 'Départ...'}</option></select>
                <select className="champ-saisie"><option>{typingRoute.arrivee || 'Arrivée...'}</option></select>
                <input className="champ-saisie" value={typingRoute.dist} placeholder="Distance (km)" readOnly />
              </div>
              <div className="form-buttons">
                <button className={`btn btn-primary ${!typingRoute.dist ? 'opacity-50' : ''}`}>
                  {typingRoute.dist ? 'Ajouter la Route' : 'Saisie en cours...'}
                </button>
              </div>
            </form>

            <div className="gestion-flux-routes">
              <div className="liste-routes">
                <h3 className="section-subtitle section-subtitle-success"><CheckCircle size={20} /><span>Routes Actives (2)</span></h3>
                <div className="routes-card-grid">
                  {routes.map((r) => (
                    <div key={r.id} className="carte-route">
                      <div className="route-summary">
                        <MapPin size={16} />
                        <div className="route-text">{r.depart} <ArrowRight size={14} /> {r.arrivee}</div>
                      </div>
                      <div className="route-details">
                        <span><strong>{r.dist}</strong> km</span>
                        <span><Clock size={14} /> {r.duree}</span>
                        <span className={`route-quality ${r.qualite === 'BONNE' ? 'route-quality-good' : 'route-quality-medium'}`}>{r.qualite}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========== ÉTAPE 3 : OPTIMISATION ========== */}
      {demoStep === 3 && (
        <main className="dashboard-main" style={{ animation: 'tbFadeIn 0.5s ease' }}>
          <div className="optimisation-tournees-container section-carte">
            <h2 className="optimisation-tournees-title"><Zap size={26} />Optimisation des Tournées</h2>
            <div className="optimisation-content">
              <div className="form-section">
                <h3 className="section-title"><Target size={20} />Paramètres</h3>
                <div className="form-group">
                  <label>Dépôt</label>
                  <select className="champ-saisie"><option>Fianarantsoa</option></select>
                </div>
                <div className="form-group">
                  <label>Camions disponibles</label>
                  <div className="camion-list">
                    {['Camion A (5t)', 'Camion B (3t)'].map((c, i) => (
                      <div key={i} className="camion-item selected">
                        <Truck size={18} />
                        <span>{c}</span>
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary w-full mt-4" disabled={progress < 100}>
                  {progress < 100 ? 'Optimisation en cours...' : 'Voir les résultats'}
                </button>
              </div>

              <div className="resultat-section">
                <h3 className="section-title"><Activity size={20} />Progression</h3>
                <div className="p-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(251,191,36,0.15)' }}>
                    <Zap size={32} style={{ color: '#fbbf24' }} className={progress < 100 ? 'animate-spin' : ''} />
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>Algorithme Dijkstra + contraintes de capacité</p>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                  </div>
                  <p className="text-xs mt-2 font-mono">{progress}%</p>
                  <div className="mt-4 space-y-2">
                    {['Analyse des distances','Vérification capacités','Calcul optimal','Génération itinéraire'].map((l,i)=> (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progress > (i+1)*25 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========== ÉTAPE 4 : RÉSULTATS ========== */}
      {demoStep === 4 && (
        <main className="dashboard-main" style={{ animation: 'tbFadeIn 0.5s ease' }}>
          <section className="optimization-results">
            <div className="section-header">
              <Activity className="section-icon" /><h2>Résultats d'Optimisation</h2>
              <div className="optimization-badge"><Zap size={14} />Terminé</div>
            </div>
            <div className="results-grid">
              <div className="result-item">
                <div className="result-icon"><Route /></div>
                <div className="result-content"><span className="result-label">Distance Totale</span><span className="result-value">285,0 km</span></div>
              </div>
              <div className="result-item">
                <div className="result-icon"><Trend /></div>
                <div className="result-content"><span className="result-label">Gain Réalisé</span><span className="result-value">32,1%</span></div>
              </div>
              <div className="result-item">
                <div className="result-icon"><Package /></div>
                <div className="result-content"><span className="result-label">Coût Total</span><span className="result-value">228 Ar</span></div>
              </div>
              <div className="result-item">
                <div className="result-icon"><Truck /></div>
                <div className="result-content"><span className="result-label">Camions Utilisés</span><span className="result-value">2</span></div>
              </div>
            </div>
          </section>

          {/* Comparaison */}
          <section className="tb-card p-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/30"><Trend size={20} className="text-green-600 dark:text-green-400" /></div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Comparaison des tournées</h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Naïve vs Optimisée</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
                <div className="flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-amber-500" /><h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Tournée Naïve</h4></div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Distance</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>420 km</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Carburant</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>336 L</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Durée</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>7h30</span></div>
                </div>
              </div>
              <div className="p-5 rounded-xl border relative overflow-hidden" style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'var(--bg-card)' }}>
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold text-white" style={{ background: '#10b981' }}>GAGNANT</div>
                <div className="flex items-center gap-2 mb-4"><CheckCircle size={18} className="text-green-500" /><h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Tournée Optimisée</h4></div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Distance</span><span className="font-bold text-green-500">285 km</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Carburant</span><span className="font-bold text-green-500">228 L</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Durée</span><span className="font-bold text-green-500">5h05</span></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}><Trend size={20} className="text-green-500" /></div><div><p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gain</p><p className="text-xl font-bold text-green-500">32,1%</p></div></div>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}><Package size={20} className="text-blue-500" /></div><div><p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Économie</p><p className="text-xl font-bold text-blue-500">108 L</p></div></div>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)' }}><Truck size={20} className="text-amber-500" /></div><div><p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Temps gagné</p><p className="text-xl font-bold text-amber-500">2h25</p></div></div>
            </div>
          </section>

          {/* Détail des tournées */}
          <section className="tb-card p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                <Truck size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Détail des Tournées Optimisées</h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>2 camions · 4 arrêts</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { nom: 'Camion A', capacite: '5 000', charge: '3 200', dist: '165,0', cout: '132', couleur: '#22c55e', etapes: [
                  { nom: 'Dépôt — Fianarantsoa', collecte: 0, cumul: 0 },
                  { nom: 'Ambalavao', collecte: 450, cumul: 75.0 },
                  { nom: 'Retour Dépôt', collecte: 0, cumul: 165.0 }
                ]},
                { nom: 'Camion B', capacite: '3 000', charge: '2 000', dist: '120,0', cout: '96', couleur: '#3b82f6', etapes: [
                  { nom: 'Dépôt — Fianarantsoa', collecte: 0, cumul: 0 },
                  { nom: 'Mananjary', collecte: 520, cumul: 95.0 },
                  { nom: 'Manakara', collecte: 320, cumul: 120.0 },
                  { nom: 'Retour Dépôt', collecte: 0, cumul: 120.0 }
                ]}
              ].map((tournee, idx) => (
                <div key={idx} className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: tournee.couleur }} />
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tournee.nom}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>{tournee.etapes.length - 1} arrêts</span>
                    </div>
                    <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span><strong>{tournee.dist}</strong> km</span>
                      <span><strong>{tournee.charge}</strong> / {tournee.capacite} kg</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tournee.etapes.map((etape, eIdx) => (
                      <div key={eIdx} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: eIdx === 0 || eIdx === tournee.etapes.length - 1 ? 'var(--border-subtle)' : 'transparent' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: tournee.couleur }}>{eIdx + 1}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{etape.nom}</div>
                          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{etape.collecte > 0 ? `${etape.collecte} kg collectés` : 'Point de départ / retour'} · {etape.cumul.toFixed(1)} km cumulés</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes tbFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .camion-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
        .camion-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border-radius: 12px; border: 1px solid var(--border); cursor: pointer; }
        .camion-item.selected { border-color: #22c55e; background: rgba(34,197,94,0.08); }
      `}</style>
    </div>
  );
}
