import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Composant Select réutilisable - Sélecteur personnalisé
 */
export const Select = ({
  label = '',
  options = [],
  value = '',
  onChange = null,
  error = '',
  required = false,
  placeholder = 'Sélectionner...',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2.5 rounded-lg border appearance-none transition-all duration-200 pr-10
            ${error ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none'}
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400
            dark:bg-gray-900 dark:text-gray-100
            ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
};

export default Select;
