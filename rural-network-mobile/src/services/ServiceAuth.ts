/**
 * Service d'authentification
 * Gère connexion, inscription, token et session
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, CLES_STOCKAGE } from '../../constants/api';
import type { Utilisateur } from '../types';

class ServiceAuth {
  private async request(path: string, options?: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
        ...options,
        headers: {
          ...API_CONFIG.headers,
          ...options?.headers,
        },
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

  async connexion(email: string, motDePasse: string): Promise<Utilisateur & { token: string }> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    });
    await AsyncStorage.setItem(CLES_STOCKAGE.token, data.token);
    await AsyncStorage.setItem(CLES_STOCKAGE.utilisateur, JSON.stringify(data));
    return data;
  }

  async inscription(email: string, motDePasse: string, nom: string): Promise<Utilisateur & { token: string }> {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse, nom }),
    });
    await AsyncStorage.setItem(CLES_STOCKAGE.token, data.token);
    await AsyncStorage.setItem(CLES_STOCKAGE.utilisateur, JSON.stringify(data));
    return data;
  }

  async deconnexion() {
    await AsyncStorage.multiRemove([
      CLES_STOCKAGE.token,
      CLES_STOCKAGE.utilisateur,
      CLES_STOCKAGE.villages,
      CLES_STOCKAGE.routes,
      CLES_STOCKAGE.camions,
      CLES_STOCKAGE.optimisations,
      CLES_STOCKAGE.enAttente,
    ]);
  }

  async obtenirToken(): Promise<string | null> {
    return AsyncStorage.getItem(CLES_STOCKAGE.token);
  }

  async obtenirUtilisateur(): Promise<Utilisateur | null> {
    const raw = await AsyncStorage.getItem(CLES_STOCKAGE.utilisateur);
    return raw ? JSON.parse(raw) : null;
  }

  async estAuthentifie(): Promise<boolean> {
    const token = await this.obtenirToken();
    return !!token;
  }
}

export const serviceAuth = new ServiceAuth();
