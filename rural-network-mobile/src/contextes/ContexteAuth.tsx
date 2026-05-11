/**
 * Contexte Authentification
 * Gère l'état de connexion, l'utilisateur et les redirections
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { serviceAuth } from '../services/ServiceAuth';
import type { Utilisateur } from '../types';

interface AuthContextType {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  estAuthentifie: boolean;
  connexion: (email: string, motDePasse: string) => Promise<void>;
  inscription: (email: string, motDePasse: string, nom: string) => Promise<void>;
  deconnexion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FournisseurAuth({ children }: { children: React.ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    serviceAuth.estAuthentifie().then(async (ok) => {
      if (ok) {
        const user = await serviceAuth.obtenirUtilisateur();
        setUtilisateur(user);
      }
      setChargement(false);
    });
  }, []);

  const connexion = async (email: string, motDePasse: string) => {
    const data = await serviceAuth.connexion(email, motDePasse);
    setUtilisateur(data);
  };

  const inscription = async (email: string, motDePasse: string, nom: string) => {
    const data = await serviceAuth.inscription(email, motDePasse, nom);
    setUtilisateur(data);
  };

  const deconnexion = async () => {
    await serviceAuth.deconnexion();
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        chargement,
        estAuthentifie: !!utilisateur,
        connexion,
        inscription,
        deconnexion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un FournisseurAuth');
  return ctx;
}
