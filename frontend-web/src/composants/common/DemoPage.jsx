import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, BarChart3, MapPin, Route, Truck, Zap, ChevronRight,
  TrendingUp, Package, AlertTriangle, CheckCircle, RotateCcw,
  ArrowRight, Target, Award, Clock, Activity, Cloud, Thermometer,
  Wind, Droplets, Bot, Sun, Moon, Users, Layers
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import '../../styles/tableau-bord.css';
import '../../styles/globals.css';

const VILLAGES = [
  { id: 1, nom: 'Fianarantsoa', lat: -21.43, lon: 47.08, prod: 680, badge: 'Élevée' },
  { id: 2, nom: 'Ambalavao', lat: -21.83, lon: 46.93, prod: 450, badge: 'Moyenne' },
  { id: 3, nom: 'Manakara', lat: -22.13, lon: 48.00, prod: 320, badge: 'Moyenne' },
  { id: 4, nom: 'Mananjary', lat: -21.22, lon: 48.35, prod: 520, badge: 'Élevée' },
  { id: 5, nom: 'Ikongo', lat: -21.88, lon: 47.43, prod: 280, badge: 'Faible' },
  { id: 6, nom: 'Vohipeno', lat: -22.35, lon: 47.83, prod: 190, badge: 'Faible' },
];

const ROUTES = [
  { d: 'Fianarantsoa', a: 'Ambalavao', dist: 75, qual: 'BONNE', bloc: false },
  { d: 'Fianarantsoa', a: 'Mananjary', dist: 95, qual: 'MOYENNE', bloc: false },
  { d: 'Fianarantsoa', a: 'Manakara', dist: 85, qual: 'BONNE', bloc: false },
  { d: 'Manakara', a: 'Vohipeno', dist: 45, qual: 'MAUVAISE', bloc: true },
  { d: 'Ambalavao', a: 'Ikongo', dist: 55, qual: 'MOYENNE', bloc: false },
];

const CAMIONS = [
  { nom: 'Camion A', cap: 5000, etat: 'DISPONIBLE' },
  { nom: 'Camion B', cap: 3000, etat: 'DISPONIBLE' },
  { nom: 'Camion C', cap: 2000, etat: 'EN_PANNE' },
];

const METEO = [
  { ville: 'Fianarantsoa', temp: 28, ressenti: 31, desc: 'Ensoleillé', humidite: 45, vent: 12, icone: '☀️' },
  { ville: 'Manakara', temp: 32, ressenti: 36, desc: 'Pluie légère', humidite: 78, vent: 8, icone: '🌦️' },
];

const OPTIM_RESULTS = {
  standard: { dist: 285, gain: 32.1, cout: 228, essence: 228, temps: '5h05', camions: 2 },
  weatherAdjusted: { dist: 312, gain: 27.4, cout: 250, essence: 250, temps: '5h40', camions: 2 },
  naive: { dist: 420, cout: 336, essence: 336, temps: '7h30' },
};

export default function DemoPage({ onBack }) {
  const { darkMode } = useTheme();
  const { t } = useI18n();
  const [etape, setEtape] = useState(0);
  const [toast, setToast] = useState(null);
  const [progres, setProgres] = useState(0);
  const [counters, setCounters] = useState({ villages:0, routes:0, production:0, eff:0, uptime:0, gain:0, savings:0 });
  const [typing, setTyping] = useState({ nom:'', lat:'', lon:'', prod:'' });
  const [iaMsg, setIaMsg] = useState([]);
  const [iaStep, setIaStep] = useState(0);

  const ETAPES = [
    { id:0, label:t('demo.dashboard'), icon:BarChart3 },
    { id:1, label:t('demo.villages'), icon:MapPin },
    { id:2, label:t('demo.routes'), icon:Route },
    { id:3, label:'Camions', icon:Truck },
    { id:4, label:t('nav.meteo'), icon:Cloud },
    { id:5, label:t('demo.optimisation'), icon:Zap },
    { id:6, label:t('demo.resultats'), icon:TrendingUp },
  ];

  useEffect(() => {
    const targets = { villages:6, routes:5, production:2440, eff:87, uptime:98, gain:32, savings:108 };
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const pct = Math.min((Date.now()-start)/duration, 1);
      setCounters({
        villages: Math.floor(targets.villages*pct),
        routes: Math.floor(targets.routes*pct),
        production: Math.floor(targets.production*pct),
        eff: Math.floor(targets.eff*pct),
        uptime: Math.floor(targets.uptime*pct),
        gain: Math.floor(targets.gain*pct),
        savings: Math.floor(targets.savings*pct),
      });
      if (pct<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const to = [];
    to.push(setTimeout(() => { setEtape(1); animerSaisie(); toastMsg('Création du village Ikongo (280 kg)','info'); }, 4000));
    to.push(setTimeout(() => { setEtape(2); toastMsg('Route Ambalavao → Ikongo ajoutée (55 km)','success'); }, 9000));
    to.push(setTimeout(() => { setEtape(3); toastMsg('Camion C marqué EN_PANNE','warning'); }, 13000));
    to.push(setTimeout(() => { setEtape(4); toastMsg('Météo chargée pour 6 villages','info'); }, 17000));
    to.push(setTimeout(() => { setEtape(5); animerOptim(); toastMsg('Lancement optimisation multi-camions...','info'); }, 21000));
    to.push(setTimeout(() => { setEtape(6); animerIA(); toastMsg('Optimisation terminée ! Gain 32,1%','success'); }, 27000));
    return () => to.forEach(clearTimeout);
  }, []);

  function toastMsg(msg, type) { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  function animerSaisie() {
    setTyping({nom:'',lat:'',lon:'',prod:''});
    setTimeout(()=>{ let i=0; const iv=setInterval(()=>{ i++; setTyping(p=>({...p,nom:'Ikongo'.slice(0,i)})); if(i>=6) clearInterval(iv); },60); },300);
    setTimeout(()=>{ let i=0; const iv=setInterval(()=>{ i++; setTyping(p=>({...p,lat:'-21.880000'.slice(0,i)})); if(i>=10) clearInterval(iv); },40); },900);
    setTimeout(()=>{ let i=0; const iv=setInterval(()=>{ i++; setTyping(p=>({...p,lon:'47.430000'.slice(0,i)})); if(i>=10) clearInterval(iv); },40); },1600);
    setTimeout(()=>{ let i=0; const iv=setInterval(()=>{ i++; setTyping(p=>({...p,prod:'280'.slice(0,i)})); if(i>=3) clearInterval(iv); },80); },2200);
  }

  function animerOptim() {
    setProgres(0);
    const iv = setInterval(() => setProgres(p => { if(p>=100){clearInterval(iv);return 100;} return p+2; }), 60);
  }

  function animerIA() {
    const msgs = [
      { role:'user', txt:'Quel est le meilleur itinéraire pour collecter la production ?' },
      { role:'ia', txt:'En optimisant avec vos 2 camions disponibles et un dépôt à Fianarantsoa, voici le plan optimal :\n- Camion A (5t) : Fianarantsoa → Ambalavao (450 kg) → Retour (165 km)\n- Camion B (3t) : Fianarantsoa → Mananjary (520 kg) → Manakara (320 kg) → Retour (120 km)\nGain total : 32,1% par rapport à la tournée naïve.' },
      { role:'user', txt:'Et avec la météo ?' },
      { role:'ia', txt:'La comparaison météo est disponible : avec les pluies à Manakara et la chaleur à Fianarantsoa, l\'optimisation ajustée donne 312 km (27,4% de gain). La version standard reste plus performante aujourd\'hui.' },
    ];
    let i=0;
    const iv = setInterval(() => {
      if (i < msgs.length) {
        setIaMsg(m => [...m, msgs[i]]);
        setIaStep(i+1);
        i++;
      } else {
        clearInterval(iv);
      }
    }, 2000);
  }

  function restart() {
    setEtape(0); setProgres(0); setToast(null); setIaMsg([]); setIaStep(0);
  }

  return (
    <div className="dashboard-container" style={{ minHeight:'100vh' }}>
      {toast && (
        <div className="fixed top-4 right-4 z-[100]" style={{ animation:'slideIn 0.3s ease' }}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type==='success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-300' :
            toast.type==='warning' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-300' :
            'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-300'
          }`}>
            {toast.type==='success' ? <CheckCircle size={18} /> : toast.type==='warning' ? <AlertTriangle size={18} /> : <Zap size={18} />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon"><Layers size={28} /></div>
            <div>
              <h1>{t('demo.titre')}</h1>
              <p>Rural Network 2035 — Plateforme complète de pilotage</p>
            </div>
          </div>
          <div className="header-controls">
            <button onClick={restart} className="live-indicator" style={{background:'rgba(59,130,246,0.1)',borderColor:'rgba(59,130,246,0.2)',color:'#3b82f6'}}>
              <RotateCcw size={14} /><span>{t('demo.rejouer')}</span>
            </button>
            <button onClick={onBack} className="live-indicator" style={{background:'rgba(34,197,94,0.1)',borderColor:'rgba(34,197,94,0.2)',color:'#22c55e'}}>
              <ArrowLeft size={14} /><span>{t('demo.retour')}</span>
            </button>
          </div>
        </div>
        <nav className="dashboard-nav">
          {ETAPES.map((s,i) => (
            <button key={i} className={`nav-tab ${etape===i?'active':''}`} onClick={()=>setEtape(i)}>
              <s.icon size={16} /><span>{s.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* ÉTAPE 0: TABLEAU DE BORD */}
      {etape===0 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <section className="metrics-grid">
            <div className="metric-card primary"><div className="metric-header"><MapPin className="metric-icon" /><span>Villages</span></div>
              <div className="metric-value">{counters.villages}</div><div className="metric-trend positive"><TrendingUp size={14} />+2 ce mois</div></div>
            <div className="metric-card success"><div className="metric-header"><Route className="metric-icon" /><span>Routes</span></div>
              <div className="metric-value">{counters.routes}</div><div className="metric-trend positive"><TrendingUp size={14} />80% actives</div></div>
            <div className="metric-card info"><div className="metric-header"><Package className="metric-icon" /><span>Production</span></div>
              <div className="metric-value">{counters.production.toLocaleString('fr-FR')}<span className="metric-unit"> kg</span></div>
              <div className="metric-trend positive"><TrendingUp size={14} />+12% vs N-1</div></div>
            <div className="metric-card warning"><div className="metric-header"><AlertTriangle className="metric-icon" /><span>Routes Bloquées</span></div>
              <div className="metric-value">1</div><div className="metric-trend positive"><TrendingUp size={14} />Vohipeno bloquée</div></div>
            <div className="metric-card accent"><div className="metric-header"><Zap className="metric-icon" /><span>Efficacité</span></div>
              <div className="metric-value">{counters.eff}<span className="metric-unit">%</span></div><div className="metric-trend positive"><Award size={14} />Record</div></div>
            <div className="metric-card secondary"><div className="metric-header"><Clock className="metric-icon" /><span>Disponibilité</span></div>
              <div className="metric-value">{counters.uptime}<span className="metric-unit">%</span></div><div className="metric-trend positive"><TrendingUp size={14} />Stable</div></div>
            <div className="metric-card primary"><div className="metric-header"><TrendingUp className="metric-icon" /><span>Gain moyen</span></div>
              <div className="metric-value">{counters.gain}<span className="metric-unit">%</span></div><div className="metric-trend positive"><Award size={14} />Optimisation</div></div>
            <div className="metric-card success"><div className="metric-header"><Droplets className="metric-icon" /><span>Économie</span></div>
              <div className="metric-value">{counters.savings}<span className="metric-unit"> L</span></div><div className="metric-trend positive"><TrendingUp size={14} />Carburant</div></div>
          </section>

          <div className="tb-grid-2 mt-6">
            <section className="tb-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(52,211,153,0.15)'}}>
                  <TrendingUp size={20} style={{color:'#34d399'}} /></div>
                <div><h3 className="font-bold" style={{color:'var(--text-primary)'}}>Historique des Optimisations</h3>
                  <p className="text-xs" style={{color:'var(--text-tertiary)'}}>Évolution des gains sur 4 mois</p></div>
              </div>
              <div className="h-48 flex items-end gap-4 px-4">
                {[
                  {mois:'Jan',gain:18,dist:420},
                  {mois:'Fév',gain:24,dist:380},
                  {mois:'Mar',gain:29,dist:310},
                  {mois:'Avr',gain:35,dist:275},
                ].map((d,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end" style={{height:120}}>
                      <div className="flex-1 rounded-t-md" style={{height:`${(d.gain/40)*100}%`,background:'#34d399'}} />
                      <div className="flex-1 rounded-t-md" style={{height:`${(d.dist/500)*100}%`,background:'#fbbf24'}} />
                    </div>
                    <span className="text-[10px]" style={{color:'var(--text-tertiary)'}}>{d.mois}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="tb-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(59,130,246,0.15)'}}>
                  <MapPin size={20} style={{color:'#3b82f6'}} /></div>
                <div><h3 className="font-bold" style={{color:'var(--text-primary)'}}>Carte du Réseau</h3>
                  <p className="text-xs" style={{color:'var(--text-tertiary)'}}>6 villages · 5 routes · 3 camions</p></div>
              </div>
              <div className="relative rounded-xl overflow-hidden border" style={{borderColor:'var(--border-subtle)',height:260,background:'#e5e7eb'}}>
                <iframe title="map" src="https://www.openstreetmap.org/export/embed.html?bbox=46.5%2C-22.5%2C48.5%2C-21.0&layer=mapnik" width="100%" height="100%" style={{border:0}} />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {VILLAGES.map(v => (
                    <span key={v.id} className="text-[10px] px-2 py-0.5 rounded-md bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 font-medium shadow-sm">{v.nom}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ÉTAPE 1: VILLAGES */}
      {etape===1 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <div className="section-carte p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><MapPin size={26} />Gestion des Villages</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card"><div className="stat-label">Total Villages</div><div className="stat-value">{VILLAGES.length}</div></div>
              <div className="stat-card"><div className="stat-label">Production Totale</div><div className="stat-value">2,44 <span className="stat-unit">tonnes</span></div></div>
              <div className="stat-card"><div className="stat-label">Moyenne/Village</div><div className="stat-value">407 <span className="stat-unit">kg</span></div></div>
            </div>

            <form className="formulaire mb-6" onSubmit={e=>e.preventDefault()}>
              <div className="grille-formulaire">
                <input className="champ-saisie" value={typing.nom} placeholder="Nom du village" readOnly />
                <input className="champ-saisie" value={typing.lat} placeholder="Latitude" readOnly />
                <input className="champ-saisie" value={typing.lon} placeholder="Longitude" readOnly />
                <input className="champ-saisie" value={typing.prod} placeholder="Production (kg)" readOnly />
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VILLAGES.map(v => (
                <div key={v.id} className="rounded-xl border p-4" style={{borderColor:'var(--border-subtle)',background:'var(--bg-card)'}}>
                  <h4 className="font-bold mb-2">{v.nom}</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      v.badge==='Élevée' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      v.badge==='Moyenne' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>{v.prod} kg</span>
                    <span className="text-xs opacity-60">{v.badge}</span>
                  </div>
                  <p className="text-xs opacity-50">Lat: {v.lat.toFixed(4)}, Lon: {v.lon.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ÉTAPE 2: ROUTES */}
      {etape===2 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <div className="section-carte p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Route size={26} />Gestion des Routes</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card"><div className="stat-label">Total Routes</div><div className="stat-value">{ROUTES.length}</div></div>
              <div className="stat-card"><div className="stat-label">Distance Totale</div><div className="stat-value">355 <span className="stat-unit">km</span></div></div>
              <div className="stat-card"><div className="stat-label">Routes Actives</div><div className="stat-value">4</div></div>
            </div>

            <div className="space-y-3">
              {ROUTES.map((r,i) => (
                <div key={i} className="rounded-xl border p-4 flex items-center justify-between" style={{borderColor: r.bloc ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)', background: r.bloc ? 'rgba(239,68,68,0.05)' : 'var(--bg-card)'}}>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="opacity-50" />
                    <span className="font-medium">{r.d} <ArrowRight size={14} className="inline opacity-50" /> {r.a}</span>
                    <span className="text-sm opacity-60">{r.dist} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      r.qual==='BONNE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      r.qual==='MOYENNE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>{r.qual}</span>
                    {r.bloc && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">BLOQUÉE</span>}
                    {!r.bloc && <CheckCircle size={16} className="text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ÉTAPE 3: CAMIONS */}
      {etape===3 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <div className="section-carte p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Truck size={26} />Gestion des Camions</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card"><div className="stat-label">Total Camions</div><div className="stat-value">{CAMIONS.length}</div></div>
              <div className="stat-card"><div className="stat-label">Disponibles</div><div className="stat-value">2</div></div>
              <div className="stat-card"><div className="stat-label">Capacité Totale</div><div className="stat-value">10 <span className="stat-unit">tonnes</span></div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CAMIONS.map((c,i) => (
                <div key={i} className="rounded-xl border p-4" style={{
                  borderColor: c.etat==='DISPONIBLE' ? 'rgba(34,197,94,0.3)' :
                    c.etat==='EN_PANNE' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)',
                  background: 'var(--bg-card)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{background:['#22c55e','#3b82f6','#ef4444'][i]}} />
                    <h4 className="font-bold">{c.nom}</h4>
                  </div>
                  <p className="text-sm mb-2">Capacité: {(c.cap/1000).toFixed(1)} tonne(s)</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    c.etat==='DISPONIBLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    c.etat==='OCCUPE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>{c.etat}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ÉTAPE 4: MÉTÉO */}
      {etape===4 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <div className="section-carte p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Cloud size={26} />Météo des Villages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {METEO.map((m,i) => (
                <div key={i} className="rounded-xl border p-6" style={{borderColor:'var(--border-subtle)',background:'var(--bg-card)'}}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{m.ville}</h3>
                      <p className="text-sm opacity-60">{m.desc}</p>
                    </div>
                    <span className="text-4xl">{m.icone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center"><Thermometer size={20} className="mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold">{m.temp}°</p><p className="text-xs opacity-60">Ressenti {m.ressenti}°</p></div>
                    <div className="text-center"><Droplets size={20} className="mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold">{m.humidite}%</p><p className="text-xs opacity-60">Humidité</p></div>
                    <div className="text-center"><Wind size={20} className="mx-auto mb-1 text-cyan-500" />
                      <p className="text-2xl font-bold">{m.vent}</p><p className="text-xs opacity-60">km/h</p></div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg" style={{background:darkMode?'rgba(34,197,94,0.1)':'rgba(34,197,94,0.08)'}}>
                    <p className="text-sm">
                      {m.temp > 30 ? '⚠️ Chaleur élevée — risque de routes dégradées' :
                       m.humidite > 70 ? '⚠️ Humidité élevée — visibilité réduite' : '✅ Conditions favorables pour le transport'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ÉTAPE 5: OPTIMISATION */}
      {etape===5 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <div className="section-carte p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Zap size={26} />Optimisation Multi-Camions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6" style={{borderColor:'var(--border-subtle)',background:'var(--bg-card)'}}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Target size={20} />Paramètres</h3>
                <div className="space-y-4">
                  <div><label className="text-sm font-medium block mb-1">Dépôt</label>
                    <select className="champ-saisie w-full"><option>Fianarantsoa</option></select></div>
                  <div><label className="text-sm font-medium block mb-1">Camions disponibles</label>
                    <div className="space-y-2">
                      {['Camion A (5t)','Camion B (3t)'].map((c,i)=>(
                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg border" style={{borderColor:'rgba(34,197,94,0.3)',background:'rgba(34,197,94,0.05)'}}>
                          <Truck size={18} /><span className="flex-1">{c}</span><CheckCircle size={16} className="text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary flex-1" disabled={progres<100}>Optimisation std</button>
                    <button className="btn flex-1" style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6',border:'1px solid rgba(59,130,246,0.2)'}} disabled={progres<100}>Avec météo</button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6" style={{borderColor:'var(--border-subtle)',background:'var(--bg-card)'}}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={20} />Progression</h3>
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(251,191,36,0.15)'}}>
                    <Zap size={32} style={{color:'#fbbf24'}} className={progres<100?'animate-spin':''} />
                  </div>
                  <p className="text-sm mb-4 opacity-60">Algorithme Greedy Nearest-Neighbor + Dijkstra</p>
                  <div className="h-2 rounded-full overflow-hidden" style={{background:'var(--border-subtle)'}}>
                    <div className="h-full rounded-full transition-all" style={{width:`${progres}%`,background:'linear-gradient(90deg,#22c55e,#16a34a)'}} />
                  </div>
                  <p className="text-xs mt-2 font-mono">{progres}%</p>
                  <div className="mt-4 space-y-2">
                    {['Calcul des distances (Dijkstra)','Vérification capacités','Construction tournées Greedy','Comparaison avec/sans météo'].map((l,i)=>(
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${progres>(i+1)*25?'bg-green-500':'bg-gray-300 dark:bg-gray-600'}`} />
                        <span className="text-xs opacity-70">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ÉTAPE 6: RÉSULTATS + IA */}
      {etape===6 && (
        <main className="dashboard-main" style={{animation:'tbFadeIn 0.5s ease'}}>
          <section className="section-carte p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(52,211,153,0.15)'}}>
                <TrendingUp size={20} style={{color:'#34d399'}} /></div>
              <div><h2 className="text-xl font-bold">Résultats d'Optimisation</h2>
                <p className="text-xs opacity-60">Tournée multi-camions · Dépôt Fianarantsoa</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-5 rounded-xl border" style={{borderColor:'var(--border-subtle)',background:'var(--bg-card)'}}>
                <div className="flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-amber-500" /><h4 className="font-bold">Tournée Naïve</h4></div>
                <div className="space-y-2">
                  {Object.entries(OPTIM_RESULTS.naive).map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="opacity-60">{k==='dist'?'Distance':k==='cout'?'Coût':'Durée'}</span>
                      <span className="font-bold">{v}{k==='dist'?' km':k==='cout'?' Ar':'h'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl border relative overflow-hidden" style={{borderColor:'rgba(52,211,153,0.3)',background:'var(--bg-card)'}}>
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold text-white" style={{background:'#10b981'}}>GAGNANT</div>
                <div className="flex items-center gap-2 mb-4"><CheckCircle size={18} className="text-green-500" /><h4 className="font-bold">Tournée Optimisée (Standard)</h4></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="opacity-60">Distance</span><span className="font-bold text-green-500">{OPTIM_RESULTS.standard.dist} km</span></div>
                  <div className="flex justify-between text-sm"><span className="opacity-60">Gain</span><span className="font-bold text-green-500">{OPTIM_RESULTS.standard.gain}%</span></div>
                  <div className="flex justify-between text-sm"><span className="opacity-60">Carburant</span><span className="font-bold text-green-500">{OPTIM_RESULTS.standard.essence} L</span></div>
                  <div className="flex justify-between text-sm"><span className="opacity-60">Camions</span><span className="font-bold text-green-500">{OPTIM_RESULTS.standard.camions}</span></div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border mb-6" style={{borderColor:'rgba(59,130,246,0.3)',background:'rgba(59,130,246,0.05)'}}>
              <div className="flex items-center gap-2 mb-4"><Cloud size={18} className="text-blue-500" /><h4 className="font-bold">Avec Ajustement Météo</h4></div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="opacity-60">Distance (ajustée)</span><span className="font-bold text-blue-500">{OPTIM_RESULTS.weatherAdjusted.dist} km</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-60">Gain</span><span className="font-bold text-blue-500">{OPTIM_RESULTS.weatherAdjusted.gain}%</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-60">Villages affectés</span><span className="font-bold">Manakara (pluie), Fianarantsoa (chaleur)</span></div>
              </div>
            </div>

            {/* Détail des tournées */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Truck size={20} />Détail des Tournées</h3>
              {[
                { nom:'Camion A', cap:'5 000', charge:'3 200', dist:'165,0', cout:'132', couleur:'#22c55e', etapes:[
                  {nom:'Dépôt → Fianarantsoa',coll:0,cumul:0},
                  {nom:'Ambalavao',coll:450,cumul:75},
                  {nom:'Retour Dépôt',coll:0,cumul:165},
                ]},
                { nom:'Camion B', cap:'3 000', charge:'2 000', dist:'120,0', cout:'96', couleur:'#3b82f6', etapes:[
                  {nom:'Dépôt → Fianarantsoa',coll:0,cumul:0},
                  {nom:'Mananjary',coll:520,cumul:95},
                  {nom:'Manakara',coll:320,cumul:120},
                  {nom:'Retour Dépôt',coll:0,cumul:120},
                ]},
              ].map((t,i)=>(
                <div key={i} className="rounded-xl border p-4" style={{borderColor:'var(--border-subtle)',background:'var(--bg-card)'}}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{background:t.couleur}} />
                      <span className="font-bold text-sm">{t.nom}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'var(--border-subtle)',color:'var(--text-secondary)'}}>{t.etapes.length-1} arrêts</span>
                    </div>
                    <div className="flex gap-3 text-xs opacity-60">
                      <span><strong>{t.dist}</strong> km</span>
                      <span><strong>{t.charge}</strong> / {t.cap} kg</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {t.etapes.map((e,ei)=>(
                      <div key={ei} className="flex items-center gap-3 p-2 rounded-lg" style={{background:ei===0||ei===t.etapes.length-1?'var(--border-subtle)':'transparent'}}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{background:t.couleur}}>{ei+1}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{e.nom}</div>
                          <div className="text-xs opacity-50">{e.coll>0?`${e.coll} kg collectés`:'Point de départ / retour'} · {e.cumul.toFixed(1)} km</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Assistant IA */}
            <div className="rounded-xl border p-6" style={{borderColor:'rgba(34,197,94,0.2)',background:'var(--bg-card)'}}>
              <div className="flex items-center gap-3 mb-4">
                <Bot size={24} className="text-green-500" />
                <div><h3 className="font-bold">Assistant IA</h3><p className="text-xs opacity-60">Posez des questions sur vos données</p></div>
              </div>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {iaMsg.map((m,i)=>(
                  <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      m.role==='user' ? 'bg-green-500 text-white rounded-br-md' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }`}>{m.txt.split('\n').map((l,li)=>(
                      <p key={li}>{l}</p>
                    ))}</div>
                  </div>
                ))}
                {iaStep===0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-xl text-sm bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-bl-md">
                      En attente de votre question...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 champ-saisie" placeholder="Posez votre question..." disabled value="" />
                <button className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold">Envoyer</button>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
        @keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes tbFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
