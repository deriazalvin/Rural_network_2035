import React from 'react';
import { Rocket, Play } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { Map, Truck, BarChart3 } from "lucide-react";

const HeroSection = () => {
  // Redirection vers les sections appropriées
  const handleGetStarted = () => {
    window.location.href = '/app';
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      {/* Images de fond */}
      <div className="hero-bg-images">
        <img 
          src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80" 
          alt="Madagascar paysage" 
        />
      </div>

      {/* Overlay dégradé */}
      <div className="hero-overlay"></div>

      {/* Particules animées */}
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`
            }}
          ></div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="hero-content">
        {/* Texte héro */}
        <div className="hero-text">

          {/* Titre principal */}
          <h1>
            Réseau Rural<br />
            <span className="gradient-text">Madagascar 2035</span>
          </h1>

          {/* Sous-titre */}
          <p className="hero-subtitle">
            Optimisez la collecte des productions agricoles à Madagascar. 
            Gérez vos villages, vos routes, vos camions et planifiez des tournées 
            intelligentes pour un réseau logistique rural performant.
          </p>

          {/* Boutons d'action */}
          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="btn-primary">
              <Rocket size={18} />
              Commencer maintenant
            </button>
            <button onClick={scrollToFeatures} className="btn-secondary">
              <Play size={18} />
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* Statistiques héro */}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">
                <AnimatedCounter end={2500} suffix="+" />
              </div>
              <div className="hero-stat-label">Villages connectés</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="hero-stat-label">Efficacité optimisée</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">
                <AnimatedCounter end={35} suffix="%" />
              </div>
              <div className="hero-stat-label">Économie de carburant</div>
            </div>
          </div>
        </div>

        {/* Visuel 3D */}
        <div className="hero-visual">
          <div className="hero-3d-card">
            <img 
              className="hero-main-image" 
              src="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&q=80" 
              alt="Madagascar route rurale" 
            />
            
            {/* Cartes flottantes */}
            <div className="floating-card floating-card-1">
                <div
                    className="floating-card-icon"
                    style={{ background: 'rgba(46,204,113,0.1)' }}
                >
                    <Map size={22} color="#2ecc71" strokeWidth={2.5} />
                </div>

                <div className="floating-card-title">Cartographie</div>
                <div className="floating-card-sub">2,500+ villages</div>
                </div>

                <div className="floating-card floating-card-2">
                <div
                    className="floating-card-icon"
                    style={{ background: 'rgba(243,156,18,0.1)' }}
                >
                    <Truck size={22} color="#f39c12" strokeWidth={2.5} />
                </div>

                <div className="floating-card-title">Flotte active</div>
                <div className="floating-card-sub">150 camions</div>
                </div>

                <div className="floating-card floating-card-3">
                <div
                    className="floating-card-icon"
                    style={{ background: 'rgba(231,76,60,0.1)' }}
                >
                    <BarChart3 size={22} color="#e74c3c" strokeWidth={2.5} />
                </div>

                <div className="floating-card-title">Optimisation</div>
                <div className="floating-card-sub">-35% coûts</div>
                </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
