import React, { useState } from 'react';

const GestionRoutes = () => {
    const [quality, setQuality] = useState(50);
    const [routeBlocked, setRouteBlocked] = useState(false);

    const handleQualityChange = (e) => {
        setQuality(e.target.value);
    };

    const handleBlockedChange = () => {
        setRouteBlocked(!routeBlocked);
    };

    const getQualityText = (value) => {
        if (value >= 80) return 'BONNE';
        if (value >= 50) return 'MOYENNE';
        return 'MAUVAISE';
    };

    return (
        <div>
            <h1>Gestion des Routes</h1>
            <div>
                <label>Qualité : </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={quality}
                    onChange={handleQualityChange}
                />
                <span>{getQualityText(quality)}</span>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={routeBlocked}
                        onChange={handleBlockedChange}
                    />
                    Route Bloquée
                </label>
            </div>
            <button type="button">
                Calculer la distance (auto-calculé par le backend)
            </button>
        </div>
    );
};

export default GestionRoutes;
