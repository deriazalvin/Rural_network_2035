/**
 * Types centralisés de l'application Rural Network Mobile
 * Correspondent aux entités du backend Spring Boot
 */

export interface Village {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  volumeProduction: number;
  collecteRestante?: number;
  productionTotaleHistorique?: number;
}

export interface RouteItem {
  id: string;
  villageDepart_id: string;
  village_arrivee_id: string;
  nom?: string;
  distance?: number;
  dureeMinutes?: number;
  qualiteRoute: 'BONNE' | 'MOYENNE' | 'MAUVAISE';
  estBloquee: boolean;
  geometry?: string;
}

export interface Camion {
  id: string;
  nom: string;
  capaciteKg: number;
  couleurHex: string;
  etat: 'DISPONIBLE' | 'OCCUPE' | 'EN_PANNE';
}

export interface EtapeTournee {
  nom: string;
  production: number;
  latitude: number;
  longitude: number;
  distanceCumulee?: number;
}

export interface Tournee {
  nom?: string;
  camionNom?: string;
  couleurHex?: string;
  distanceTotalKm: number;
  chargeTotalKg: number;
  coutTotal: number;
  capaciteKg: number;
  etapes: EtapeTournee[];
}

export interface ResultatOptimisation {
  distanceTotalKm: number;
  distanceBaseline?: number;
  gainPourcent: number;
  coutTotal: number;
  coutBaseline?: number;
  economieTotal?: number;
  dureeCalculMs?: number;
  tournees: Tournee[];
  villagesNonDesservis: string[];
  resultatDTO?: unknown;
}

export interface Utilisateur {
  id?: string;
  email: string;
  nom?: string;
  token?: string;
}

export interface Notification {
  type: 'succes' | 'erreur' | 'info' | 'avertissement';
  titre: string;
  message: string;
}

export type ThemeMode = 'clair' | 'sombre';
