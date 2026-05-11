/**
 * Contexte Thème (Clair / Sombre)
 * Persistance via AsyncStorage
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLES_STOCKAGE } from '../../constants/api';
import { THEME_CLAIR, THEME_SOMBRE, COULEURS } from '../styles/couleurs';
import type { ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  theme: typeof THEME_CLAIR;
  basculerTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function FournisseurTheme({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('clair');
  const [pret, setPret] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLES_STOCKAGE.theme).then((saved) => {
      if (saved === 'sombre') setMode('sombre');
      setPret(true);
    });
  }, []);

  const basculerTheme = () => {
    const nouveau = mode === 'clair' ? 'sombre' : 'clair';
    setMode(nouveau);
    AsyncStorage.setItem(CLES_STOCKAGE.theme, nouveau);
  };

  const theme = mode === 'sombre' ? THEME_SOMBRE : THEME_CLAIR;

  if (!pret) return null;

  return (
    <ThemeContext.Provider value={{ mode, theme, basculerTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans un FournisseurTheme');
  return ctx;
}
