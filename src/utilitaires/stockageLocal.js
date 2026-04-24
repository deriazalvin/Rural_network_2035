const KEY_VILLAGES = 'rn_villages';
const KEY_ROUTES = 'rn_routes';
const KEY_CAMIONS = 'rn_camions';
const KEY_OPTIMISATIONS = 'rn_optimisations';
const KEY_PENDING = 'rn_pending_modifs';

export const stockageLocal = {
  sauvegarderVillages(v) { localStorage.setItem(KEY_VILLAGES, JSON.stringify(v || [])); },
  sauvegarderRoutes(r) { localStorage.setItem(KEY_ROUTES, JSON.stringify(r || [])); },
  sauvegarderCamions(c) { localStorage.setItem(KEY_CAMIONS, JSON.stringify(c || [])); },
  sauvegarderOptimisations(o) { localStorage.setItem(KEY_OPTIMISATIONS, JSON.stringify(o || [])); },
  obtenirVillages() { try { return JSON.parse(localStorage.getItem(KEY_VILLAGES) || '[]'); } catch { return []; } },
  obtenirRoutes() { try { return JSON.parse(localStorage.getItem(KEY_ROUTES) || '[]'); } catch { return []; } },
  obtenirCamions() { try { return JSON.parse(localStorage.getItem(KEY_CAMIONS) || '[]'); } catch { return []; } },
  obtenirOptimisations() { try { return JSON.parse(localStorage.getItem(KEY_OPTIMISATIONS) || '[]'); } catch { return []; } },
  ajouterOptimisation(opt) {
    const arr = this.obtenirOptimisations();
    arr.unshift({ ...opt, dateHeure: new Date().toISOString() });
    this.sauvegarderOptimisations(arr);
  },
  ajouterModificationEnAttente(mod) {
    const arr = JSON.parse(localStorage.getItem(KEY_PENDING) || '[]');
    arr.push(mod);
    localStorage.setItem(KEY_PENDING, JSON.stringify(arr));
  },
  async synchroniser(serviceDonnees) {
    const pending = JSON.parse(localStorage.getItem(KEY_PENDING) || '[]');
    if (!pending.length) return 0;
    let count = 0;
    for (const mod of pending.slice()) {
      try {
        if (mod.type === 'ajout_village') {
          await serviceDonnees.ajouterVillage(mod.data);
        } else if (mod.type === 'ajout_route') {
          await serviceDonnees.ajouterRoute(mod.data);
        }
        // supprimer de la liste si ok
        const current = JSON.parse(localStorage.getItem(KEY_PENDING) || '[]');
        const index = current.findIndex(m => JSON.stringify(m) === JSON.stringify(mod));
        if (index >= 0) { current.splice(index, 1); localStorage.setItem(KEY_PENDING, JSON.stringify(current)); }
        count++;
      } catch (e) {
        console.warn('Erreur synchronisation:', e);
      }
    }
    return count;
  }
};

export const gestionSession = {
  obtenirToken() { return localStorage.getItem('rn_token'); },
  sauvegarderToken(t) { localStorage.setItem('rn_token', t); },
  supprimerToken() { localStorage.removeItem('rn_token'); }
};

export default stockageLocal;
