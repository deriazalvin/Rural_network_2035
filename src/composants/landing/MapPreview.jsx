import React from 'react';
import { MapPin } from 'lucide-react';
import { Map } from "lucide-react";
/**
 * Composant MapPreview - Section d'aperçu de la carte interactive
 */
const MapPreview = () => {
  return (
    <section className="map-section scroll-animate" id="map">
      <div className="map-container">
        {/* En-tête */}
        <div className="section-header" style={{ marginBottom: '50px' }}>
          <span className="section-label">
            <MapPin size={14} style={{ display: 'inline' }} />
            Carte Interactive
          </span>
          <h2 className="section-title">
            Visualisez votre réseau<br />
            sur la carte de Madagascar
          </h2>
        </div>

        {/* Carte */}
        <div className="map-preview">
          {/* Image de la carte */}
          <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1400&q=80" 
            alt="Carte Madagascar" 
          />

          {/* Points sur la carte */}
          <div className="map-pins">
            <div className="map-pin"></div>
            <div className="map-pin"></div>
            <div className="map-pin"></div>
            <div className="map-pin"></div>
            <div className="map-pin"></div>
          </div>

          {/* Overlay avec texte */}
          <div className="map-overlay">
            <div className="map-overlay-content">
              <h3>
                <Map
                    size={20}
                    style={{
                    display: 'inline',
                    verticalAlign: 'middle',
                    marginRight: '6px'
                    }}
                />
                Carte en temps réel
            </h3>
              <p>Visualisez vos villages, routes et véhicules sur une carte interactive de Madagascar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPreview;
