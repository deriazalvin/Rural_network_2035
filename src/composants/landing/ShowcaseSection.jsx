import React from 'react';
import { Wand2, CheckCircle} from 'lucide-react';
import { Map, Truck } from "lucide-react";
/**
 * Composant ShowcaseSection - Section de démonstration des solutions
 */
const ShowcaseSection = () => {
  const showcases = [
    {
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
    badge: Map,
    title: 'Cartographie Intelligente des Villages',
    description: 'Visualisez tous vos villages sur une carte interactive de Madagascar. Ajoutez, modifiez et gérez les données de chaque village avec précision géographique.',
    features: [
        'Positionnement GPS précis des villages',
        'Données de production agricole détaillées',
        'Recherche et filtrage avancés',
        'Import/export de données en masse'
    ]
    },
    {
    image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800&q=80',
    badge: Truck,
    title: 'Gestion Avancée de la Flotte',
    description: 'Gérez votre flotte de camions avec précision. Suivez les capacités, la disponibilité et planifiez les collectes de manière optimale.',
    features: [
        'Suivi en temps réel des véhicules',
        'Gestion des capacités et disponibilités',
        'Planification des tournées',
        'Historique des performances'
    ]
    }
  ];

  return (
    <section className="showcase-section" id="showcase">
      <div className="showcase-container">
        {/* En-tête */}
        <div className="section-header scroll-animate">
          <span className="section-label">
            <Wand2 size={14} style={{ display: 'inline' }} />
            Solutions
          </span>
          <h2 className="section-title">
            Des solutions concrètes pour<br />
            votre réseau logistique
          </h2>
          <p className="section-subtitle">
            Découvrez comment Rural Network 2035 transforme la logistique 
            agricole à Madagascar.
          </p>
        </div>

        {/* Items showcase */}
        {showcases.map((item, index) => (
          <div key={index} className="showcase-item scroll-animate">
            {/* Image */}
            <div className="showcase-image-wrapper">
              <img 
                src={item.image} 
                alt={item.title} 
                className="showcase-image" 
              />
              <div className="showcase-badge">
                <item.badge size={18} color="#fff" />
            </div>
            </div>

            {/* Contenu */}
            <div className="showcase-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              {/* Fonctionnalités */}
              <ul className="showcase-features">
                {item.features.map((feat, i) => (
                  <li key={i}>
                    <CheckCircle size={16} />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShowcaseSection;
