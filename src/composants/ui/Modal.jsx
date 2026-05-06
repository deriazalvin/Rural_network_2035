import React from 'react';
import { X } from 'lucide-react';

/**
 * Composant Modal réutilisable - Dialogues modernes
 */
export const Modal = ({
  isOpen = false,
  onClose = null,
  title = '',
  children,
  footer = null,
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl dark:shadow-2xl dark:border dark:border-gray-700 ${sizes[size]} w-full animate-in fade-in zoom-in-95 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="border-t border-gray-200 dark:border-gray-700 p-6">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
