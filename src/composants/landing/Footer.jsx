import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import LogoRN from './LogoRN';

/**
 * Composant Footer - Pied de page avec liens et informations
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Section Marque */}
        <div className="footer-brand">
          <LogoRN size="md" showText={true} />
          <p>
            Rural Network 2035 — La plateforme de référence pour l'optimisation 
            de la logistique agricole rurale à Madagascar. Connecter, collecter, 
            optimiser.
          </p>

          {/* Icônes réseaux sociaux */}
          <div className="footer-social">
            <div className="social-icon">
              <Facebook size={16} />
            </div>
            <div className="social-icon">
              <Twitter size={16} />
            </div>
            <div className="social-icon">
              <Linkedin size={16} />
            </div>
            <div className="social-icon">
              <Instagram size={16} />
            </div>
          </div>
        </div>

        {/* Colonne 1 - Produit */}
        <div className="footer-column">
          <h4>Produit</h4>
          <ul className="footer-links">
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#">Tarifs</a></li>
            <li><a href="#">API</a></li>
            <li><a href="#">Intégrations</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>

        {/* Colonne 2 - Entreprise */}
        <div className="footer-column">
          <h4>Entreprise</h4>
          <ul className="footer-links">
            <li><a href="#">À propos</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Carrières</a></li>
            <li><a href="#">Partenaires</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Colonne 3 - Support */}
        <div className="footer-column">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><a href="#">Centre d'aide</a></li>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Tutoriels</a></li>
            <li><a href="#">Statut</a></li>
            <li><a href="#">Communauté</a></li>
          </ul>
        </div>
      </div>

      {/* Bas du footer */}
      <div className="footer-bottom">
        <span>© {currentYear} Rural Network 2035. Tous droits réservés.</span>
        <span>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', marginRight: '20px' }}>
            Politique de confidentialité
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Conditions d'utilisation
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
