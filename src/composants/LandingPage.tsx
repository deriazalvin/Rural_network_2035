import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, Play, Zap, CheckCircle, Shield, Globe, Sparkles, TrendingUp, Users, MapPin } from 'lucide-react';
import './landing.css';

const cosmosData = [
  { id: 1, src: "https://images.unsplash.com/photo-1599350912550-b1f38734de78?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", t: "10%", l: "5%", w: "w-48 h-64", f: 40 },   // Haut Gauche
  { id: 10, src: "https://media.istockphoto.com/id/453912461/fr/photo/avenue-de-baobab-%C3%A0-madagascar.webp?a=1&b=1&s=612x612&w=0&k=20&c=G0CmEfn-BB2X-ZaouQa7dH0kz88-_QSyPDVPYbSJxUw=", t: "5%", l: "75%", w: "w-40 h-40", f: -40 }, // Haut Droite
  { id: 7, src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhbnNwb3J0fGVufDB8fDB8fHww", t: "25%", l: "45%", w: "w-44 h-56", f: 15 },  // MILIEU HAUT (Derrière titre)
  
  { id: 3, src: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dHJhbnNwb3J0fGVufDB8fDB8fHww", t: "45%", l: "2%", w: "w-48 h-64", f: 25 },   // Milieu Gauche
  { id: 8, src: "https://images.unsplash.com/photo-1543747053-002e0d064454?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGF5c2Fuc3xlbnwwfHwwfHx8MA%3D%3D", t: "50%", l: "80%", w: "w-44 h-60", f: -20 }, // Milieu Droite
  { id: 4, src: "https://media.istockphoto.com/id/2182349666/fr/photo/vue-sur-les-collines-et-les-montagnes-le-long-de-la-route-principale-de-madagascar.webp?a=1&b=1&s=612x612&w=0&k=20&c=K9DXYL89lRaU4xW6AGgmBH_qcttTTyOePOGUEeORjDA=", t: "65%", l: "35%", w: "w-52 h-68", f: -30 }, // MILIEU BAS
  
  { id: 9, src: "https://plus.unsplash.com/premium_photo-1683980578016-a1f980719ec2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b3B0aW1pc2F0aW9ufGVufDB8fDB8fHww", t: "80%", l: "15%", w: "w-48 h-56", f: 35 },  // Bas Gauche
  { id: 2, src: "https://media.istockphoto.com/id/2187192503/fr/photo/pi%C3%A8ces-et-fl%C3%A8ches-num%C3%A9riques-illustrant-la-croissance-et-le-succ%C3%A8s-financiers.webp?a=1&b=1&s=612x612&w=0&k=20&c=p910jz68FyOiR6B0-pc33pI7glI83VIEMeEPYDm2v7s=", t: "75%", l: "70%", w: "w-56 h-72", f: -45 }, // Bas Droite
  { id: 5, src: "https://media.istockphoto.com/id/1176323241/fr/photo/route-pav%C3%A9e-panoramique-avec-des-nids-de-poule-poussi%C3%A9reux-menant-%C3%A0-morondava-madagascar.webp?a=1&b=1&s=612x612&w=0&k=20&c=lbJCQ4dDivfH2Uqf4HsfbWE3qGcr4qVj0hmBx45XPWA=", t: "90%", l: "50%", w: "w-52 h-64", f: 40 },  // TOUT EN BAS MILIEU
  { id: 6, src: "https://plus.unsplash.com/premium_photo-1682309712356-bf909c90c02d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXZhbnRhZ2V8ZW58MHx8MHx8fDA%3D", t: "15%", l: "25%", w: "w-40 h-52", f: -15 }, // Éparpillée
];

export default function AgriLogPremium() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => setMouse({ 
      x: (e.clientX / window.innerWidth) - 0.5, 
      y: (e.clientY / window.innerHeight) - 0.5 
    });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="relative overflow-hidden">
      
      {/* 1. NAVBAR DYNAMIQUE */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="master-container h-24 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-2.5 rounded-2xl text-white shadow-xl shadow-green-100">
              <Leaf size={28} strokeWidth={3} />
            </div>
            <div>
              <span className="block font-black text-2xl tracking-tighter leading-none">Rural Network 2035</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black italic">Mada 2035</span>
            </div>
          </div>
          <button
            className="hidden md:block btn-agrilog text-xs py-3 px-8"
            onClick={() => window.dispatchEvent(new CustomEvent('rn-open-auth', { detail: { mode: 'login' } }))}
          >
            DÉMARRER
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION + COSMOS TOTAL (10 IMAGES) */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20">
        <div className="absolute inset-0 pointer-events-none w-full h-full">
        {cosmosData.map((img, index) => (
        <motion.img
          key={img.id}
          src={img.src}
          className={`cosmos-image hidden xl:block ${img.w}`}
          style={{ 
            top: img.t, 
            left: img.l, 
            x: mouse.x * img.f, 
            y: mouse.y * img.f,
            zIndex: img.z || 1
          }}
          // État initial : Invisible et légèrement plus petit
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          
          // État final : Apparaît à sa place
          animate={{ 
            opacity: img.op || 1, 
            scale: 1, 
            y: 0 
          }}
          
          // Le secret est ici : le délai progressif
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            // On multiplie l'index par 0.2 pour qu'elles arrivent les unes après les autres
            delay: index * 0.2 
          }}
        />
          ))}
        </div>

        <div className="master-container text-center relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-2 rounded-full text-[11px] font-black mb-12 border border-green-100 uppercase tracking-widest">
            <Sparkles size={16} fill="currentColor" /> Intelligence Artificielle pour Madagascar
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[0.95] mb-12">
            L'avenir de la <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">collecte agricole.</span>
          </h1>

          <p className="w-full text-center text-lg md:text-2xl text-slate-900 mb-16 max-w-3xl mx-auto leading-relaxed font-black">
            Optimisez vos tournées rurales, réduisez drastiquement vos coûts de transport et sauvez vos récoltes grâce à notre algorithme de pointe.
          </p>    

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <button
              className="btn-agrilog text-xl px-12 py-6"
              onClick={() => window.dispatchEvent(new CustomEvent('rn-open-auth', { detail: { mode: 'login' } }))}
            >
              Commencer maintenant <ArrowRight />
            </button>
            <button className="group flex items-center gap-4 font-black text-xl text-slate-900">
              <div className="p-5 bg-white border-2 border-slate-100 rounded-full group-hover:scale-110 transition-transform"><Play fill="currentColor" /></div>
              Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* 3. IMPACT (STATISTIQUES) */}
      <section className="py-40 bg-slate-50/50">
        <div className="master-container">
          <div className="card-grid">
            {[
              { label: "Réduction Coûts", val: "30%", icon: <TrendingUp />, c: "text-green-600" },
              { label: "Pertes Évitées", val: "25%", icon: <Leaf />, c: "text-emerald-600" },
              { label: "Efficacité IA", val: "40%", icon: <Zap />, c: "text-amber-500" },
              { label: "Villages Connectés", val: "100+", icon: <Users />, c: "text-blue-600" }
            ].map((stat, i) => (
              <div key={i} className="card-item text-center">
                <div className={`${stat.c} mb-8 flex justify-center scale-[1.5]`}>{stat.icon}</div>
                <div className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">{stat.val}</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROCESSUS (PAS DE CHEVAUCHEMENT) */}
      <section className="py-40">
        <div className="master-container">
          <div className="mb-24 max-w-2xl">
            <span className="text-green-600 font-black uppercase tracking-[0.3em] text-xs">Méthodologie</span>
            <h2 className="text-4xl md:text-6xl font-black mt-6 tracking-tighter">Comment nous transformons la logistique ?</h2>
          </div>

          <div className="card-grid">
            {[
              { num: "01", title: "Collecte de données", desc: "Saisie intelligente des capacités de production directement depuis les zones enclavées." },
              { num: "02", title: "Algorithme Dijkstra", desc: "Calcul instantané du chemin le plus court en tenant compte de l'état réel des routes malgaches." },
              { num: "03", title: "Optimisation de Tournée", desc: "Regroupement stratégique des collectes pour minimiser les trajets à vide." }
            ].map((step, i) => (
              <div key={i} className="card-item">
                <span className="bg-number">{step.num}</span>
                <div className="relative z-10 pt-12">
                  <h3 className="text-2xl font-black mb-6 text-slate-900">{step.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER PREMIUM */}
      <footer className="footer-premium">
        <div className="master-container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="footer-logo-box"><Leaf className="text-white" size={28} /></div>
                <div>
                  <span className="block font-black text-2xl text-slate-900">Rural Network 2035</span>
                  <span className="text-[10px] uppercase tracking-widest text-green-600 font-black">Madagascar 2035</span>
                </div>
              </div>
              <p className="footer-text-muted">Optimisation logistique par IA pour le désenclavement rural.</p>
            </div>
            <div className="footer-nav-col">
              <h4 className="footer-heading">Plateforme</h4>
              <ul className="footer-links">
                <li><a href="#">Solutions</a></li>
                <li><a href="#">Algorithme</a></li>
              </ul>
            </div>
            <div className="footer-nav-col">
              <h4 className="footer-heading">Institution</h4>
              <ul className="footer-links">
                <li><span className="text-slate-400">ESMIA INNOVATION</span></li>
                <li><a href="#" className="text-green-600 font-bold">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Rural Network 2035 — Tous droits réservés.</p>
            <p className="footer-dev"><span className="name-tag">ALVIN DERIAZ</span></p>
          </div>
        </div>
      </footer>
      </div>
  );
}