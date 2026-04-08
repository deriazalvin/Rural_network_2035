const DEFAULT_BASE = '/api';

export class ServiceDonnees {
  constructor(baseUrl = DEFAULT_BASE) {
    this.base = baseUrl.replace(/\/$/, '');
  }

  async request(path, options = {}) {
    const url = `${this.base}${path}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
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

  // Assistant IA
  // ServiceDonnees.js
    analyserIA(question) { 
      return this.request('/ia/analyser', { 
        method: 'POST', 
        body: JSON.stringify({ "question": question }) 
      }); 
    }

  // Auth
  async login({ email, motDePasse }) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, motDePasse }) });
  }

  async register({ email, motDePasse, nom }) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ email, motDePasse, nom }) });
  }
}

export default ServiceDonnees;
