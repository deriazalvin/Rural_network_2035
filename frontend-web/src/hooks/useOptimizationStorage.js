import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'optimization_history';
const MAX_HISTORY = 50;

/**
 * Hook pour persister et gérer l'historique des optimisations
 * Sauvegarde automatiquement au localStorage et persiste au reload
 */
export function useOptimizationStorage() {
  const [optimizations, setOptimizations] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOptimizations(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Ajouter une optimisation
  const addOptimization = useCallback((optData) => {
    setOptimizations(prev => {
      const newOpt = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...optData
      };
      
      // Garder seulement les X derniers
      const updated = [newOpt, ...prev].slice(0, MAX_HISTORY);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur sauvegarde localStorage:', error);
      }
      
      return updated;
    });
  }, []);

  // Effacer toute l'historique
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setOptimizations([]);
    } catch (error) {
      console.error('Erreur effacement localStorage:', error);
    }
  }, []);

  // Supprimer une optimisation spécifique
  const removeOptimization = useCallback((id) => {
    setOptimizations(prev => {
      const updated = prev.filter(opt => opt.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur suppression localStorage:', error);
      }
      return updated;
    });
  }, []);

  return {
    optimizations,
    isLoaded,
    addOptimization,
    clearHistory,
    removeOptimization,
    count: optimizations.length
  };
}
