/**
 * Contexte Données
 * Centralise villages, routes, camions, optimisations
 * Gère le chargement initial, le cache local et la synchronisation
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serviceDonnees } from '../services/ServiceDonnees';
import { CLES_STOCKAGE } from '../../constants/api';
import type { Village, RouteItem, Camion, ResultatOptimisation } from '../types';

interface DonneesContextType {
  villages: Village[];
  routes: RouteItem[];
  camions: Camion[];
  optimisations: ResultatOptimisation[];
  chargement: boolean;
  enLigne: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
  ajouterVillage: (v: Partial<Village>) => Promise<void>;
  supprimerVillage: (id: string) => Promise<void>;
  ajouterRoute: (r: Partial<RouteItem>) => Promise<void>;
  modifierRoute: (id: string, data: Partial<RouteItem>) => Promise<void>;
  ajouterCamion: (c: Partial<Camion>) => Promise<void>;
  supprimerCamion: (id: string) => Promise<void>;
  modifierEtatCamion: (id: string, etat: Camion['etat']) => Promise<void>;
  sauvegarderOptimisation: (opt: ResultatOptimisation) => Promise<void>;
  supprimerOptimisations: () => Promise<void>;
}

const DonneesContext = createContext<DonneesContextType | undefined>(undefined);

export function FournisseurDonnees({ children }: { children: React.ReactNode }) {
  const [villages, setVillages] = useState<Village[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [camions, setCamions] = useState<Camion[]>([]);
  const [optimisations, setOptimisations] = useState<ResultatOptimisation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enLigne, setEnLigne] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerCache = useCallback(async () => {
    const [v, r, c, o] = await Promise.all([
      serviceDonnees.obtenirCache<Village[]>(CLES_STOCKAGE.villages, []),
      serviceDonnees.obtenirCache<RouteItem[]>(CLES_STOCKAGE.routes, []),
      serviceDonnees.obtenirCache<Camion[]>(CLES_STOCKAGE.camions, []),
      serviceDonnees.obtenirCache<ResultatOptimisation[]>(CLES_STOCKAGE.optimisations, []),
    ]);
    setVillages(v);
    setRoutes(r);
    setCamions(c);
    setOptimisations(o);
  }, []);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [vData, rData, cData, hData] = await Promise.all([
        serviceDonnees.obtenirTousLesVillages(),
        serviceDonnees.obtenirToutesLesRoutes(),
        serviceDonnees.obtenirTousLesCamions().catch(() => [] as Camion[]),
        serviceDonnees.obtenirHistoriqueOptimisations().catch(() => []),
      ]);
      setVillages(vData);
      setRoutes(rData);
      setCamions(cData);
      // Parser l'historique JSON stocké dans resultatJson
      const parsedOptimisations = hData.map((h: any) => {
        try {
          return JSON.parse(h.resultatJson);
        } catch {
          return null;
        }
      }).filter(Boolean);
      setOptimisations(parsedOptimisations);
      setEnLigne(true);
      await Promise.all([
        serviceDonnees.sauvegarderCache(CLES_STOCKAGE.villages, vData),
        serviceDonnees.sauvegarderCache(CLES_STOCKAGE.routes, rData),
        serviceDonnees.sauvegarderCache(CLES_STOCKAGE.camions, cData),
        serviceDonnees.sauvegarderCache(CLES_STOCKAGE.optimisations, parsedOptimisations),
      ]);
    } catch {
      setEnLigne(false);
      setErreur('Mode hors-ligne — données du cache affichées');
      await chargerCache();
    } finally {
      setChargement(false);
    }
  }, [chargerCache]);

  useEffect(() => {
    recharger();
  }, [recharger]);

  // === Actions CRUD ===
  const ajouterVillage = async (v: Partial<Village>) => {
    const nouveau = await serviceDonnees.ajouterVillage(v);
    const updated = [...villages, nouveau];
    setVillages(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.villages, updated);
  };

  const supprimerVillage = async (id: string) => {
    await serviceDonnees.supprimerVillage(id);
    const updated = villages.filter((v) => v.id !== id);
    setVillages(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.villages, updated);
  };

  const ajouterRoute = async (r: Partial<RouteItem>) => {
    const nouvelle = await serviceDonnees.ajouterRoute(r);
    const updated = [...routes, nouvelle];
    setRoutes(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.routes, updated);
  };

  const modifierRoute = async (id: string, data: Partial<RouteItem>) => {
    const maj = await serviceDonnees.modifierRoute(id, data);
    const updated = routes.map((r) => (r.id === id ? maj : r));
    setRoutes(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.routes, updated);
  };

  const ajouterCamion = async (c: Partial<Camion>) => {
    const nouveau = await serviceDonnees.ajouterCamion(c);
    const updated = [...camions, nouveau];
    setCamions(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.camions, updated);
  };

  const supprimerCamion = async (id: string) => {
    await serviceDonnees.supprimerCamion(id);
    const updated = camions.filter((c) => c.id !== id);
    setCamions(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.camions, updated);
  };

  const modifierEtatCamion = async (id: string, etat: Camion['etat']) => {
    const maj = await serviceDonnees.modifierEtatCamion(id, etat);
    const updated = camions.map((c) => (c.id === id ? maj : c));
    setCamions(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.camions, updated);
  };

  const sauvegarderOptimisation = async (opt: ResultatOptimisation) => {
    const updated = [opt, ...optimisations];
    setOptimisations(updated);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.optimisations, updated);
  };

  const supprimerOptimisations = async () => {
    await serviceDonnees.viderHistoriqueOptimisations();
    setOptimisations([]);
    await serviceDonnees.sauvegarderCache(CLES_STOCKAGE.optimisations, []);
  };

  return (
    <DonneesContext.Provider
      value={{
        villages,
        routes,
        camions,
        optimisations,
        chargement,
        enLigne,
        erreur,
        recharger,
        ajouterVillage,
        supprimerVillage,
        ajouterRoute,
        modifierRoute,
        ajouterCamion,
        supprimerCamion,
        modifierEtatCamion,
        sauvegarderOptimisation,
        supprimerOptimisations,
      }}
    >
      {children}
    </DonneesContext.Provider>
  );
}

export function useDonnees() {
  const ctx = useContext(DonneesContext);
  if (!ctx) throw new Error('useDonnees doit être utilisé dans un FournisseurDonnees');
  return ctx;
}
