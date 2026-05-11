import React, { useState, useEffect } from 'react';

/**
 * Composant GlowCursor - Effet de lueur qui suit la souris
 */
const GlowCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Suivre la position de la souris
  useEffect(() => {
    const handleMove = (e) => {
      setPos({ x: e.clientX - 150, y: e.clientY - 150 });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      className="glow-effect" 
      style={{ left: pos.x, top: pos.y }}
    ></div>
  );
};

export default GlowCursor;
