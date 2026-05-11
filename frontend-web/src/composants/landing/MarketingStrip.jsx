import React from 'react';

import {
  Rocket,
  Map,
  Truck,
  Wheat,
  MapPin,
  Zap,
  Leaf,
  BarChart3
} from 'lucide-react';

/**
 * Composant MarketingStrip - Bande déroulante marketing avec icônes
 */
const MarketingStrip = () => {
  const items = [
    { icon: Map, text: 'Cartographie temps réel' },
    { icon: Truck, text: 'Gestion de flotte intelligente' },
    { icon: Wheat, text: 'Collecte agricole optimisée' },
    { icon: MapPin, text: '2,500+ villages connectés' },
    { icon: Zap, text: 'Performance maximale' },
    { icon: Leaf, text: 'Développement durable' },
    { icon: BarChart3, text: 'Analytics avancés' },

    // Répétition pour effet infini
    { icon: Map, text: 'Cartographie temps réel' },
    { icon: Truck, text: 'Gestion de flotte intelligente' },
    { icon: Wheat, text: 'Collecte agricole optimisée' },
    { icon: MapPin, text: '2,500+ villages connectés' },
    { icon: Zap, text: 'Performance maximale' },
    { icon: Leaf, text: 'Développement durable' },
    { icon: BarChart3, text: 'Analytics avancés' },
  ];

  return (
    <div className="marketing-strip">
      <div className="marketing-strip-content">
        {items.map((item, i) => (
          <span key={i} className="marketing-strip-item">
            <item.icon
              size={18}
              style={{
                display: 'inline',
                verticalAlign: 'middle',
                marginRight: '6px'
              }}
            />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarketingStrip;