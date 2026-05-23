/**
 * Service de données centralisé
 * Tous les appels API vers le backend Spring Boot
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, CLES_STOCKAGE } from '../../constants/api';
import type { Village, RouteItem, Camion, ResultatOptimisation } from '../types';

class ServiceDonnees {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem(CLES_STOCKAGE.token);
    return {
      ...API_CONFIG.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request(path: string, options?: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
        ...options,
        headers: await this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        let msg = `Erreur ${res.status}`;
        try {
          const json = await res.json();
          msg = json.message || json.error || msg;
        } catch {
          const text = await res.text().catch(() => '');
          if (text) msg = text;
        }
        throw new Error(msg);
      }
      return res.status === 204 ? null : res.json();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Le serveur met trop de temps à répondre. Vérifiez votre connexion réseau.');
      }
      if (err.message?.includes('Network request failed') || err.message?.includes('Network')) {
        throw new Error('Impossible de contacter le serveur. Vérifiez que le backend est démarré et accessible.');
      }
      throw err;
    }
  }

  // === VILLAGES ===
  obtenirTousLesVillages(): Promise<Village[]> {
    return this.request('/villages');
  }

  obtenirVillageParId(id: string): Promise<Village> {
    return this.request(`/villages/${id}`);
  }

  ajouterVillage(v: Partial<Village>): Promise<Village> {
    return this.request('/villages', { method: 'POST', body: JSON.stringify(v) });
  }

  modifierVillage(id: string, data: Partial<Village>): Promise<Village> {
    return this.request(`/villages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  supprimerVillage(id: string): Promise<void> {
    return this.request(`/villages/${id}`, { method: 'DELETE' });
  }

  // === ROUTES ===
  obtenirToutesLesRoutes(): Promise<RouteItem[]> {
    return this.request('/routes');
  }

  ajouterRoute(r: Partial<RouteItem>): Promise<RouteItem> {
    return this.request('/routes', { method: 'POST', body: JSON.stringify(r) });
  }

  modifierRoute(id: string, data: Partial<RouteItem>): Promise<RouteItem> {
    return this.request(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  supprimerRoute(id: string): Promise<void> {
    return this.request(`/routes/${id}`, { method: 'DELETE' });
  }

  // === CAMIONS ===
  obtenirTousLesCamions(): Promise<Camion[]> {
    return this.request('/camions');
  }

  ajouterCamion(c: Partial<Camion>): Promise<Camion> {
    return this.request('/camions', { method: 'POST', body: JSON.stringify(c) });
  }

  modifierCamion(id: string, data: Partial<Camion>): Promise<Camion> {
    return this.request(`/camions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  modifierEtatCamion(id: string, etat: Camion['etat']): Promise<Camion> {
    return this.request(`/camions/${id}/etat`, { method: 'PUT', body: JSON.stringify({ etat }) });
  }

  supprimerCamion(id: string): Promise<void> {
    return this.request(`/camions/${id}`, { method: 'DELETE' });
  }

  // === OPTIMISATION ===
  optimiserTournees(depotId: string, camionIds: string[]): Promise<ResultatOptimisation> {
    return this.request('/optimisations/multi-camions', {
      method: 'POST',
      body: JSON.stringify({ depotId, camionIds }),
    });
  }

  obtenirHistoriqueOptimisations(): Promise<any[]> {
    return this.request('/optimisations/historique');
  }

  viderHistoriqueOptimisations(): Promise<void> {
    return this.request('/optimisations/historique', { method: 'DELETE' });
  }

  // === MÉTÉO ===
  obtenirMeteo(lat: number, lon: number): Promise<any> {
    return this.request(`/meteo?lat=${lat}&lon=${lon}`);
  }

  // === STOCKAGE LOCAL ===
  async sauvegarderCache<T>(cle: string, data: T) {
    await AsyncStorage.setItem(cle, JSON.stringify(data));
  }

  async obtenirCache<T>(cle: string, fallback: T): Promise<T> {
    const raw = await AsyncStorage.getItem(cle);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
}

export const serviceDonnees = new ServiceDonnees();
