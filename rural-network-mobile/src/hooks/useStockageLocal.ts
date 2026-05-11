/**
 * Hook utilitaire pour AsyncStorage
 * Remplace le localStorage web
 */
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStockageLocal() {
  const sauvegarder = useCallback(async (cle: string, valeur: unknown) => {
    await AsyncStorage.setItem(cle, JSON.stringify(valeur));
  }, []);

  const obtenir = useCallback(async <T>(cle: string, fallback: T): Promise<T> => {
    const raw = await AsyncStorage.getItem(cle);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }, []);

  const supprimer = useCallback(async (cle: string) => {
    await AsyncStorage.removeItem(cle);
  }, []);

  const nettoyer = useCallback(async () => {
    await AsyncStorage.clear();
  }, []);

  return { sauvegarder, obtenir, supprimer, nettoyer };
}
