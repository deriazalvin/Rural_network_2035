import { useEffect } from 'react';

/**
 * Hook useScrollAnimation - Gère les animations scroll des éléments
 */
const useScrollAnimation = () => {
  useEffect(() => {
    // Créer un observer pour les éléments avec classe scroll-animate
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

    // Observer tous les éléments à animer
    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
};

export default useScrollAnimation;
