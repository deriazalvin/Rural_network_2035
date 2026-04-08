import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// J'ai retiré useNavigate ici pour éviter l'erreur de contexte
import { ServiceDonnees } from '../services/ServiceDonnees';
import { gestionSession } from '../utilitaires/stockageLocal.js';

const svc = new ServiceDonnees();

export default function AuthForm({ onLogin, mode: initialMode = 'login' }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [mode, setMode] = useState(initialMode === 'signup' || initialMode === 'register' ? 'register' : 'login');
  const [erreur, setErreur] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialMode === 'signup' || initialMode === 'register') setOpen(true);
  }, [initialMode]);

  const submit = async (e) => {
    e.preventDefault();
    setErreur(null);
    try {
      if (mode === 'login') {
        const res = await svc.login({ email, motDePasse });
        gestionSession.sauvegarderToken(res.token);
        window.dispatchEvent(new CustomEvent('rn-user-logged', { detail: res }));
        if (onLogin) onLogin(res);
      } else {
        const res = await svc.register({ email, motDePasse, nom });
        gestionSession.sauvegarderToken(res.token);
        window.dispatchEvent(new CustomEvent('rn-user-logged', { detail: res }));
        if (onLogin) onLogin(res);
      }
    } catch (err) {
      setErreur(err.message || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, var(--beige) 0%, var(--beige-fonce) 100%)' }}>
      <motion.div
        className="relative rounded-xl overflow-hidden shadow-2xl"
        // On garde le hover, mais le bouton retour permettra une fermeture manuelle
        onHoverStart={() => setOpen(true)}
        onHoverEnd={() => setOpen(false)}
        animate={{ height: open ? 520 : 100, width: 400 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ 
          background: 'var(--primary-gradient)',
          borderRadius: 15, 
          cursor: 'pointer' 
        }}
      >
        {/* Bordure tournante */}
        <motion.div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            left: -100,
            top: -100,
            background: 'linear-gradient(90deg, var(--vert-clair), transparent, var(--beige), transparent, var(--vert-clair))',
            borderRadius: '50%',
            opacity: open ? 1 : 0,
            pointerEvents: 'none'
          }}
          animate={{ rotate: open ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        />

        <div style={{ position: 'absolute', inset: 4, background: 'var(--blanc)', borderRadius: 12 }} />

        {/* BOUTON RETOUR : Ferme l'animation */}
        {open && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              // Force la redirection vers l'accueil ou la page précédente
              window.location.href = "/"; 
            }}
            className="absolute top-6 left-6 z-30 p-2 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--vert-principal)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </motion.button>
        )}

        <div style={{ position: 'relative', zIndex: 2 }} className="w-full h-full flex flex-col items-center justify-center p-6">
          <motion.h2
            animate={{ marginBottom: open ? 25 : 0 }}
            className="text-xl font-bold uppercase tracking-widest"
            style={{ color: 'var(--vert-principal)' }}
          >
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
            style={{ display: open ? 'flex' : 'none' }}
          >
            <form onSubmit={submit} className="flex flex-col items-center w-full gap-4">
              {mode === 'register' && (
                <input
                  placeholder="Nom d'utilisateur"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-4/5 px-5 py-3 rounded-full bg-gray-100 text-gray-800 outline-none border border-transparent focus:border-[var(--vert-principal)] transition-all"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-4/5 px-5 py-3 rounded-full bg-gray-100 text-gray-800 outline-none border border-transparent focus:border-[var(--vert-principal)] transition-all"
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-4/5 px-5 py-3 rounded-full bg-gray-100 text-gray-800 outline-none border border-transparent focus:border-[var(--vert-clair)] transition-all"
              />

              {erreur && <div className="text-red-600 text-xs italic font-semibold">{erreur}</div>}

              <button 
                type="submit" 
                className="w-3/5 py-3 mt-2 rounded-full font-bold uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-lg" 
                style={{ background: 'var(--vert-principal)', color: 'var(--blanc)' }}
              >
                {mode === 'login' ? 'Entrer' : 'Créer'}
              </button>

              <div className="flex justify-between w-4/5 mt-4 px-2">
                <a href="#" className="text-[10px] text-gray-500 hover:text-black transition-colors">Oublié ?</a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }} 
                  className="text-[10px] font-bold hover:underline" 
                  style={{ color: 'var(--orange)' }}
                >
                  {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}