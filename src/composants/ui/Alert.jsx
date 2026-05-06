import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Composant Alert réutilisable - Messages informatifs
 */
export const Alert = ({
  children,
  type = 'info', // 'info', 'success', 'warning', 'error'
  className = '',
  onClose = null,
  title = '',
  showIcon = true
}) => {
  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  };

  const colorMap = {
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
  };

  const Icon = iconMap[type];

  return (
    <div className={`rounded-lg border p-4 flex gap-3 ${colorMap[type]} ${className}`}>
      {showIcon && <Icon size={20} className="flex-shrink-0 mt-0.5" />}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p>{children}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-60 dark:hover:opacity-70 transition">
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default Alert;
