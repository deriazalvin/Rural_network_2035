import React, { useState, useEffect } from 'react';
import LogoRN from './LogoRN';

/**
 * Composant Loader - Écran de chargement avec animation
 */
const Loader = ({ onComplete }) => {
  const [hidden, setHidden] = useState(false);

  // Masquer le loader après 2 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`loader ${hidden ? 'hidden' : ''}`}>
      <div className="loader-content">
        {/* Logo animé */}
        <div className="loader-logo">
          <span className="loader-letter">R</span>
          <span className="loader-letter">N</span>
        </div>

        {/* Barre de progression */}
        <div className="loader-bar">
          <div className="loader-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
