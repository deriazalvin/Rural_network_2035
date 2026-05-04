import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * Composant BackToTop - Bouton retour vers le haut de la page
 */
const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  // Afficher le bouton quand la page est scrollée
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Retourner au haut de la page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Retour vers le haut"
    >
      <ChevronUp size={20} />
    </button>
  );
};

export default BackToTop;
