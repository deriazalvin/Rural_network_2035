import React from 'react';
import { Star, Zap, Check } from 'lucide-react';
import {
  Home,
  Route,
  Truck,
  Brain,
  BarChart3,
  Globe
} from "lucide-react";

// Fonctionnalités de l'application
const FeaturesSection = () => {
  const features = [
    {
      icon: Home,
      iconBg: 'rgba(46,204,113,0.1)',
      title: 'Gestion de Villages',
      description: 'Ajoutez, modifiez et gérez vos villages avec leur position géographique et leur production agricole. Visualisez-les directement sur la carte interactive.',
      image: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=600&q=80',
      tag: 'Gestion',
      tagBg: 'rgba(46,204,113,0.1)',
      tagColor: '#2ecc71'
    },
    {
      icon: Route,
      iconBg: 'rgba(243,156,18,0.1)',
      title: 'Gestion des Routes',
      description: 'Créez des liaisons entre villages avec distance, qualité et état des routes. Visualisez les itinéraires optimaux sur la carte.',
      image: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?w=600&q=80',
      tag: 'Infrastructure',
      tagBg: 'rgba(243,156,18,0.1)',
      tagColor: '#f39c12'
    },
    {
      icon: Truck,
      iconBg: 'rgba(231,76,60,0.1)',
      title: 'Gestion de Camions',
      description: 'Définissez votre flotte de véhicules et leurs capacités. Suivez l\'état, la disponibilité et les performances de chaque camion.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80',
      tag: 'Logistique',
      tagBg: 'rgba(231,76,60,0.1)',
      tagColor: '#e74c3c'
    },
    {
      icon: BarChart3,
      iconBg: 'rgba(52,152,219,0.1)',
      title: 'Analyse de Performance',
      description: 'Comparez les performances des différentes tournées, analysez les coûts et identifiez les axes d\'amélioration.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      tag: 'Analytics',
      tagBg: 'rgba(52,152,219,0.1)',
      tagColor: '#3498db'
    },
    {
      icon: Globe,
      iconBg: 'rgba(26,188,156,0.1)',
      title: 'Carte Interactive',
      description: 'Visualisez l\'ensemble de votre réseau sur une carte interactive avec les villages, routes et positions des camions en temps réel.',
      image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80',
      tag: 'Cartographie',
      tagBg: 'rgba(26,188,156,0.1)',
      tagColor: '#1abc9c'
    }
  ];

  return (
    <section className="features-section" id="features">
      {/* En-tête de section */}
      <div className="section-header scroll-animate">
        <span className="section-label">
          <Star size={14} style={{ display: 'inline' }} />
          Fonctionnalités
        </span>
        <h2 className="section-title">
          Tout ce dont vous avez besoin<br />
          pour <span className="gradient-text">révolutionner</span> la logistique rurale
        </h2>
        <p className="section-subtitle">
          Une suite complète d'outils pour gérer efficacement la collecte des 
          productions agricoles dans les zones rurales de Madagascar.
        </p>
      </div>

      {/* Grille de fonctionnalités */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="feature-card scroll-animate" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Image de la fonctionnalité */}
            <div className="feature-card-image-wrapper">
              <img 
                src={feature.image} 
                alt={feature.title} 
                className="feature-card-image" 
              />
            </div>

            {/* Icône */}
            <div
                className="feature-icon"
                style={{ background: feature.iconBg }}
            >
            <feature.icon size={28} />
            </div>

            {/* Contenu */}
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            {/* Tag */}
            <span 
              className="feature-tag" 
              style={{ 
                background: feature.tagBg, 
                color: feature.tagColor 
              }}
            >
              {feature.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
