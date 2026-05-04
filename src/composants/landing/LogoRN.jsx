import React from 'react';

// Composant logo RN réutilisable avec animations
const LogoRN = ({ size = 'md', showText = true }) => {
  // Tailles disponibles
  const sizeClasses = {
    sm: {
      container: 'logo-container-sm',
      letter: 'logo-letter-sm',
      dot: 'logo-dot-sm',
      ring: 'logo-ring-sm',
      text: 'text-xs'
    },
    md: {
      container: 'logo-container-md',
      letter: 'logo-letter-md',
      dot: 'logo-dot-md',
      ring: 'logo-ring-md',
      text: 'text-sm'
    },
    lg: {
      container: 'logo-container-lg',
      letter: 'logo-letter-lg',
      dot: 'logo-dot-lg',
      ring: 'logo-ring-lg',
      text: 'text-base'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`logo-container ${sizes.container}`}>
      {/* Anneau rotatif autour du logo */}
      <div className={`logo-ring ${sizes.ring}`}></div>
      
      {/* Lettres RN avec gradient animé */}
      <div className="logo-rn">
        <span className={`logo-letter ${sizes.letter}`}>R</span>
        <span className={`logo-letter ${sizes.letter}`}>N</span>
      </div>
      
      {/* Point pulsant */}
      <div className={`logo-dot ${sizes.dot}`}></div>
      
      {/* Texte année */}
      {showText && (
        <span className={`logo-year ${sizes.text}`}>2035</span>
      )}
    </div>
  );
};

export default LogoRN;
