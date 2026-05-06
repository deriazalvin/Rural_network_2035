import React from 'react';

/**
 * Composant Input réutilisable - Champs de saisie modernes
 */
export const Input = ({
  label = '',
  placeholder = '',
  type = 'text',
  value = '',
  onChange = null,
  error = '',
  required = false,
  icon: Icon = null,
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
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} rounded-lg border transition-all duration-200
            ${error ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-cyan-400 dark:focus:border-cyan-500 focus:outline-none'}
            placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400
            ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
};

export default Input;
