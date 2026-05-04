import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import { Home, Truck, Route, PackageCheck } from "lucide-react";
/**
 * Composant StatsSection - Section des statistiques clés
 */
const StatsSection = () => {
  const stats = [
  {
    icon: Home,
    color: '#2ecc71',
    number: 2500,
    suffix: '+',
    label: 'Villages connectés'
  },
  {
    icon: Truck,
    color: '#e74c3c',
    number: 150,
    suffix: '+',
    label: 'Camions en opération'
  },
  {
    icon: Route,
    color: '#f39c12',
    number: 1200,
    suffix: 'km',
    label: 'Routes référencées'
  },
  {
    icon: PackageCheck,
    color: '#3498db',
    number: 98,
    suffix: '%',
    label: 'Taux de satisfaction'
  }
];

  return (
    <section className="stats-section">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card scroll-animate" 
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div
                className="stat-icon"
                style={{
                    color: stat.color
                }}
                >
                <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div className="stat-number">
              <AnimatedCounter end={stat.number} suffix={stat.suffix} />
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
