import React from 'react';

/**
 * Composant Card réutilisable - Conteneur avec styles modernes
 */
export const Card = ({
  children,
  className = '',
  header = null,
  footer = null,
  onClick = null,
  variant = 'default' // 'default', 'elevated', 'glass'
}) => {
  const baseStyles = `
    rounded-lg border transition-all duration-300
    ${variant === 'glass' ? 'bg-white/10 dark:bg-white/5 backdrop-blur-md border-white/20 dark:border-white/10' : 
      variant === 'elevated' ? 'bg-white dark:bg-gray-900 shadow-lg dark:shadow-2xl border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-2xl' :
      'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg'}
    ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
  `;

  return (
    <div className={`${baseStyles} ${className}`} onClick={onClick}>
      {header && <div className="border-b border-gray-200 dark:border-gray-700 p-4">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t border-gray-200 dark:border-gray-700 p-4">{footer}</div>}
    </div>
  );
};

export default Card;
