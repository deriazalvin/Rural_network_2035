import React, { useState, useEffect } from 'react';
import { Home, Menu, X, Sun, Moon, ChevronUp } from 'lucide-react';
import LogoRN from './LogoRN';

/**
 * Composant Navbar - Barre de navigation principale
 */
const Navbar = ({ darkMode, setDarkMode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Écouter le scroll de la page
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirection vers authentification
  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent('rn-open-auth', { detail: { mode: 'login' } }));
  };

  // Navigation vers sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenu(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <div className="logo-container">
        <LogoRN size="md" showText={true} />
      </div>

      {/* Liens navigation desktop */}
      <ul className="nav-links">
        <li><a onClick={() => scrollToSection('features')}>Fonctionnalités</a></li>
        <li><a onClick={() => scrollToSection('showcase')}>Solutions</a></li>
        <li><a onClick={() => scrollToSection('how')}>Comment ça marche</a></li>
        <li><a onClick={() => scrollToSection('map')}>Carte</a></li>
        <li><a onClick={() => scrollToSection('testimonials')}>Témoignages </a></li>
      </ul>

      {/* Partie droite - theme toggle et connexion */}
      <div className="nav-right">
        {/* Bouton theme toggle */}
        <div className="toggle-ball" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
                <Moon size={18} color="#f1c40f" />
            ) : (
                <Sun size={18} color="#f39c12" />
            )}
        </div>

        {/* Bouton connexion */}
        <button className="btn-login" onClick={handleLogin}>
          <span className="btn-shimmer"></span>
          <Home size={16} />
          Se connecter
        </button>

        {/* Menu mobile */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
