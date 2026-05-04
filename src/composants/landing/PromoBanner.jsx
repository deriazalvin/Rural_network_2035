import React from 'react';
import { Gift } from 'lucide-react';
import { Target } from "lucide-react";
/**
 * Composant PromoBanner - Bannière promotionnelle avec offre spéciale
 */
const PromoBanner = () => {
  // Scroll vers section CTA
  const scrollToCTA = () => {
    const element = document.getElementById('cta');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="promo-section scroll-animate">
      <div className="promo-banner">
        {/* Texte promo */}
        <div className="promo-text">
          <h2>
            <Target
                size={28}
                color="#e74c3c"
                strokeWidth={2.5}
                style={{
                display: 'inline',
                verticalAlign: 'middle',
                marginRight: '8px'
                }}
            />
            Offre Spéciale Lancement
            </h2>
          <p>
            Rejoignez les 2,500+ villages déjà connectés au réseau Rural Network 2035. 
            Bénéficiez d'un essai gratuit de 30 jours avec toutes les fonctionnalités 
            premium, y compris l'optimisation IA avancée.
          </p>
          <button className="promo-btn" onClick={scrollToCTA}>
            <Gift size={18} />
            Essai gratuit 30 jours
          </button>
        </div>

        {/* Image promo */}
        <div className="promo-visual">
          <img 
            className="promo-image" 
            src="https://images.unsplash.com/photo-1559523182-a284c3fb7cff?w=600&q=80" 
            alt="Madagascar paysage rural" 
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
