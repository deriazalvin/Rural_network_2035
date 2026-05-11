import React, { useState, useEffect } from 'react';
import Navbar from '../landing/Navbar';
import HeroSection from '../landing/HeroSection';
import MarketingStrip from '../landing/MarketingStrip';
import FeaturesSection from '../landing/FeaturesSection';
import PromoBanner from '../landing/PromoBanner';
import ShowcaseSection from '../landing/ShowcaseSection';
import HowItWorks from '../landing/HowItWorks';
import StatsSection from '../landing/StatsSection';
import MapPreview from '../landing/MapPreview';
import TestimonialsSection from '../landing/TestimonialsSection';
import CTASection from '../landing/CTASection';
import Footer from '../landing/Footer';
import Loader from '../landing/Loader';
import BackToTop from '../landing/BackToTop';
import NotificationPopup from '../landing/NotificationPopup';
import GlowCursor from '../landing/GlowCursor';
import useScrollAnimation from '../landing/useScrollAnimation';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/pages/landing.css';

/**
 * Page d'accueil principale - Landing Page
 * Regroupe tous les composants pour la page d'accueil avec animations
 */
const LandingPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [loaded, setLoaded] = useState(false);

  // Utiliser le hook d'animation
  useScrollAnimation();

  // Re-observer les éléments après le chargement
  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        document.querySelectorAll('.scroll-animate').forEach((el) => {
          observer.observe(el);
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <>
      {/* Loader d'accueil */}
      <Loader onComplete={() => setLoaded(true)} />

      {/* Effet de lueur qui suit la souris */}
      <GlowCursor />

      {/* Barre de navigation */}
      <Navbar darkMode={darkMode} setDarkMode={toggleDarkMode} />

      {/* Main content */}
      <main>
        {/* Héros - Section principale */}
        <HeroSection />

        {/* Bande de promotion */}
        <MarketingStrip />

        {/* Fonctionnalités */}
        <FeaturesSection />

        {/* Bannière promotionnelle */}
        <PromoBanner />

        {/* Showcase - Démonstration des solutions */}
        <ShowcaseSection />

        {/* Comment ça marche - 4 étapes */}
        <HowItWorks />

        {/* Statistiques */}
        <StatsSection />

        {/* Aperçu de carte */}
        <MapPreview />

        {/* Témoignages clients */}
        <TestimonialsSection />

        {/* Appel à l'action */}
        <CTASection />
      </main>

      {/* Pied de page */}
      <Footer />

      {/* Popup de notification flottante */}
      <NotificationPopup />

      {/* Bouton retour vers le haut */}
      <BackToTop />
    </>
  );
};

export default LandingPage;
