    const DEFAULT_BASE = '/api';

    // Déterminer l'URL de base selon l'environnement
    async function getBaseUrl() {
      // En développement: utiliser le proxy Vite (/api)
      if (import.meta.env.DEV) {
        return DEFAULT_BASE;
      }
      
      // En production: essayer de charger config.json
      try {
        const response = await fetch('/config.json');
        if (response.ok) {
          const config = await response.json();
          return config.apiBaseUrl ? `${config.apiBaseUrl}/api` : DEFAULT_BASE;
        }
      } catch (e) {
        console.warn('Config.json not found, using default API base');
      }
      return DEFAULT_BASE;
    }

    let cachedBase = null;

    export class ServiceDonnees {
      constructor(baseUrl = DEFAULT_BASE) {
        this.base = baseUrl.replace(/\/$/, '');
      }

      async initBase() {
        if (!cachedBase) {
          cachedBase = await getBaseUrl();
          this.base = cachedBase;
        }
        return this.base;
      }

      async request(path, options = {}) {
        // Initialiser la base URL une seule fois
        if (!cachedBase && !import.meta.env.DEV) {
          await this.initBase();
        }

        const url = `${this.base}${path}`;
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          ...options
        });
        if (!res.ok) {
          // Essaie de parser le JSON de la réponse d'erreur
          let errorMessage = `HTTP ${res.status} ${res.statusText}`;
          try {
            const jsonError = await res.json();
            if (jsonError.message) {
              errorMessage = jsonError.message;
            }
          } catch (e) {
            // Si ce n'est pas du JSON, utilise le text
            const text = await res.text().catch(() => '');
            if (text) {
              errorMessage = text;
            }
          }
          throw new Error(errorMessage);
        }
        if (res.status === 204) return null;
        return res.json();
      }

      // Villages
      obtenirTousLesVillages() { return this.request('/villages'); }
      obtenirVillageParId(id) { return this.request(`/villages/${id}`); }
      ajouterVillage(v) { return this.request('/villages', { method: 'POST', body: JSON.stringify(v) }); }
      modifierVillage(id, data) { return this.request(`/villages/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      supprimerVillage(id) { return this.request(`/villages/${id}`, { method: 'DELETE' }); }

      // Routes
      obtenirToutesLesRoutes() { return this.request('/routes'); }
      obtenirRouteParId(id) { return this.request(`/routes/${id}`); }
      ajouterRoute(r) { return this.request('/routes', { method: 'POST', body: JSON.stringify(r) }); }
      modifierRoute(id, data) { return this.request(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
      supprimerRoute(id) { return this.request(`/routes/${id}`, { method: 'DELETE' }); }

      // Performances / Tournees
      async obtenirPerformances() {
        try {
          return await this.request('/performances');
        } catch (e) {
          // endpoint peut ne pas exister côté backend — retourner liste vide
          console.warn('obtenirPerformances failed:', e.message);
          return [];
        }
      }

      async sauvegarderTournee(t) {
        try {
          return await this.request('/tournees', { method: 'POST', body: JSON.stringify(t) });
        } catch (e) {
          console.warn('sauvegarderTournee failed:', e.message);
          return { id: `tmp_tournee_${Date.now()}`, ...t };
        }
      }

      async sauvegarderPerformance(p) {
        try {
          return await this.request('/performances', { method: 'POST', body: JSON.stringify(p) });
        } catch (e) {
          console.warn('sauvegarderPerformance failed:', e.message);
          return { id: `tmp_perf_${Date.now()}`, ...p };
        }
      }

      // Optimisation (délégation au backend)
      optimiserTournee(payload) { return this.request('/optimisations', { method: 'POST', body: JSON.stringify(payload) }); }

    // Camions
    obtenirTousLesCamions() { return this.request('/camions'); }
    obtenirCamionParId(id) { return this.request(`/camions/${id}`); }
    ajouterCamion(c) { return this.request('/camions', { method: 'POST', body: JSON.stringify(c) }); }
    modifierCamion(id, data) { return this.request(`/camions/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    modifierEtatCamion(id, etat) { return this.request(`/camions/${id}/etat`, { method: 'PUT', body: JSON.stringify({ etat }) }); }
    supprimerCamion(id) { return this.request(`/camions/${id}`, { method: 'DELETE' }); }
      async login({ email, motDePasse }) {
        return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, motDePasse }) });
      }

      async register({ email, motDePasse, nom }) {
        return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ email, motDePasse, nom }) });
      }
    }

    export default ServiceDonnees;
