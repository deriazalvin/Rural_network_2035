import React from 'react';
import { Heart, Star } from 'lucide-react';

/**
 * Composant TestimonialsSection - Section des témoignages clients
 */
const TestimonialsSection = () => {
  const testimonials = [
    {
      text: 'Rural Network 2035 a complètement transformé notre chaîne logistique. Nous avons réduit nos coûts de transport de 35% en seulement 3 mois.',
      name: 'Rakoto Jean',
      role: 'Directeur Logistique, Antananarivo',
      avatar: 'RJ'
    },
    {
      text: 'La fonction d\'optimisation IA est incroyable. Les tournées générées sont toujours plus efficaces que celles planifiées manuellement.',
      name: 'Hery Rasoamanarivo',
      role: 'Chef de Flotte, Fianarantsoa',
      avatar: 'HR'
    },
    {
      text: 'Interface intuitive et support exceptionnel. Nos équipes ont été opérationnelles en une journée. Je recommande vivement !',
      name: 'Nomena Andrianarivelo',
      role: 'Responsable Opérations, Toamasina',
      avatar: 'NA'
    }
  ];

  return (
    <section className="testimonials-section" id="testimonials">
      {/* En-tête */}
      <div className="section-header scroll-animate">
        <span className="section-label">
          <Heart size={14} style={{ display: 'inline' }} />
          Témoignages
        </span>
        <h2 className="section-title">
          Ce que disent nos utilisateurs
        </h2>
        <p className="section-subtitle">
          Des professionnels de la logistique rurale nous font confiance à Madagascar.
        </p>
      </div>

      {/* Grille de témoignages */}
      <div className="testimonials-grid">
        {testimonials.map((t, index) => (
          <div 
            key={index} 
            className="testimonial-card scroll-animate" 
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">{t.text}</p>

            {/* Auteur */}
            <div className="testimonial-author">
              <div className="testimonial-avatar">{t.avatar}</div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
                
                {/* Étoiles */}
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" style={{ display: 'inline', marginRight: '2px' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
