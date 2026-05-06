import React from 'react';

/**
 * Composant Stats réutilisable - Affichage de statistiques
 */
export const StatCard = ({
  title = '',
  value = '',
  icon: Icon = null,
  trend = null, // { value: number, direction: 'up' | 'down' }
  color = 'cyan', // 'cyan', 'purple', 'green', 'orange', 'red'
  className = ''
}) => {
  const colorMap = {
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700'
  };

  return (
    <div className={`rounded-lg border p-6 ${colorMap[color]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        {Icon && <Icon size={32} className="opacity-40" />}
      </div>
    </div>
  );
};

export default StatCard;
