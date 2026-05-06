import React from 'react';

/**
 * Composant Badge réutilisable - Étiquettes et statuts
 */
export const Badge = ({
  children,
  variant = 'default', // 'default', 'success', 'warning', 'error', 'info'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon = null,
  className = '',
  onClick = null
}) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200
        ${sizes[size]} ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-md dark:hover:shadow-lg' : ''} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </span>
  );
};

export default Badge;
