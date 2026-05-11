import React, { createContext, useState, useEffect } from 'react';

/**
 * Context pour gérer le thème global (dark mode / light mode)
 * Permet de partager l'état du thème entre tous les composants
 */
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer le thème sauvegardé dans localStorage, sinon utiliser le thème clair par défaut
    const savedTheme = localStorage.getItem('rn-theme');
    return savedTheme === 'dark' ? true : false;
  });

  // Appliquer le thème au document
  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
    
    localStorage.setItem('rn-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Fonction pour basculer le thème
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};
