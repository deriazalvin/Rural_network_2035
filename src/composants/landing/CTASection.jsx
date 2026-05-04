import React from 'react';
import { UserPlus, LogIn, Shield } from 'lucide-react';

/**
 * Composant CTASection - Section d'appel à l'action (Call-To-Action)
 */
const CTASection = () => {
  // Redirection vers création de compte
  const handleSignUp = () => {
    window.location.href = '/auth?action=signup';
  };

  // Redirection vers connexion
  const handleLogin = () => {
    window.location.href = '/auth';
  };

  return (
    <section className="cta-section" id="cta">
      {/* Arrière-plan */}
      <div className="cta-bg">
        <div className="cta-bg-pattern"></div>
      </div>

      {/* Particules animées */}
      <div className="hero-particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              background: '#fff'
            }}
          ></div>
        ))}
      </div>

      {/* Contenu CTA */}
      <div className="cta-content scroll-animate">
        <h2>
          Prêt à révolutionner votre<br />
          logistique rurale ?
        </h2>
        <p>
          Rejoignez des milliers d'utilisateurs qui optimisent déjà leurs tournées 
          de collecte avec Rural Network 2035. Essai gratuit, sans engagement.
        </p>

        {/* Boutons CTA */}
        <div className="cta-buttons">
          <button 
            onClick={handleSignUp}
            className="btn-primary" 
            style={{ fontSize: '1.15rem', padding: '18px 45px' }}
          >
            <UserPlus size={18} />
            Créer mon compte gratuitement
          </button>
          <button 
            onClick={handleLogin}
            className="btn-secondary" 
            style={{ fontSize: '1.15rem', padding: '18px 45px' }}
          >
            <LogIn size={18} />
            Se connecter
          </button>
        </div>

        {/* Note de sécurité */}
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '20px' }}>
          <Shield size={14} style={{ display: 'inline', marginRight: '5px' }} />
          Aucune carte bancaire requise • Annulation à tout moment
        </p>
      </div>
    </section>
  );
};

export default CTASection;
