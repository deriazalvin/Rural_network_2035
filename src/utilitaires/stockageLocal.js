const USER_INFO_KEY = 'rn_user';
const KEY_VILLAGES = 'rn_villages';
const KEY_ROUTES = 'rn_routes';
const KEY_CAMIONS = 'rn_camions';
const KEY_OPTIMISATIONS = 'rn_optimisations';
const KEY_PENDING = 'rn_pending_modifs';

const getUserScope = () => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return '';
    const user = JSON.parse(raw);
    if (user?.id) return `_${user.id}`;
    if (user?.email) return `_${encodeURIComponent(user.email)}`;
  } catch (e) {
    console.warn('Impossible de parser l’utilisateur en session', e);
  }
  return '';
};

const scopedKey = (base) => `${base}${getUserScope()}`;

const migrateUnscopedData = () => {
  const scope = getUserScope();
  if (!scope) return; // No user logged in

  // Check if user already has scoped data
  const scopedVillages = localStorage.getItem(scopedKey(KEY_VILLAGES));
  const scopedRoutes = localStorage.getItem(scopedKey(KEY_ROUTES));
  const scopedCamions = localStorage.getItem(scopedKey(KEY_CAMIONS));
  const scopedOptimisations = localStorage.getItem(scopedKey(KEY_OPTIMISATIONS));

  // If user already has scoped data, no migration needed
  if (scopedVillages || scopedRoutes || scopedCamions || scopedOptimisations) return;

  // Migrate unscoped data to scoped keys
  const unscopedVillages = localStorage.getItem(KEY_VILLAGES);
  const unscopedRoutes = localStorage.getItem(KEY_ROUTES);
  const unscopedCamions = localStorage.getItem(KEY_CAMIONS);
  const unscopedOptimisations = localStorage.getItem(KEY_OPTIMISATIONS);

  if (unscopedVillages) localStorage.setItem(scopedKey(KEY_VILLAGES), unscopedVillages);
  if (unscopedRoutes) localStorage.setItem(scopedKey(KEY_ROUTES), unscopedRoutes);
  if (unscopedCamions) localStorage.setItem(scopedKey(KEY_CAMIONS), unscopedCamions);
  if (unscopedOptimisations) localStorage.setItem(scopedKey(KEY_OPTIMISATIONS), unscopedOptimisations);

  // Clean up unscoped data after migration to prevent future conflicts
  localStorage.removeItem(KEY_VILLAGES);
  localStorage.removeItem(KEY_ROUTES);
  localStorage.removeItem(KEY_CAMIONS);
  localStorage.removeItem(KEY_OPTIMISATIONS);
};

const parseJSON = (value, fallback = []) => {
  try {
    return JSON.parse(value || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

export const stockageLocal = {
  sauvegarderVillages(v) { localStorage.setItem(scopedKey(KEY_VILLAGES), JSON.stringify(v || [])); },
  sauvegarderRoutes(r) { localStorage.setItem(scopedKey(KEY_ROUTES), JSON.stringify(r || [])); },
  sauvegarderCamions(c) { localStorage.setItem(scopedKey(KEY_CAMIONS), JSON.stringify(c || [])); },
  sauvegarderOptimisations(o) { localStorage.setItem(scopedKey(KEY_OPTIMISATIONS), JSON.stringify(o || [])); },

  obtenirVillages() {
    const key = scopedKey(KEY_VILLAGES);
    return parseJSON(localStorage.getItem(key), []);
  },
  obtenirRoutes() {
    const key = scopedKey(KEY_ROUTES);
    return parseJSON(localStorage.getItem(key), []);
  },
  obtenirCamions() {
    const key = scopedKey(KEY_CAMIONS);
    return parseJSON(localStorage.getItem(key), []);
  },
  obtenirOptimisations() {
    const key = scopedKey(KEY_OPTIMISATIONS);
    return parseJSON(localStorage.getItem(key), []);
  },

  ajouterOptimisation(opt) {
    const arr = this.obtenirOptimisations();
    arr.unshift({ ...opt, dateHeure: new Date().toISOString() });
    this.sauvegarderOptimisations(arr);
  },

  ajouterModificationEnAttente(mod) {
    const arr = parseJSON(localStorage.getItem(KEY_PENDING), []);
    arr.push(mod);
    localStorage.setItem(KEY_PENDING, JSON.stringify(arr));
  },

  async synchroniser(serviceDonnees) {
    const pending = parseJSON(localStorage.getItem(KEY_PENDING), []);
    if (!pending.length) return 0;
    let count = 0;
    for (const mod of pending.slice()) {
      try {
        if (mod.type === 'ajout_village') {
          await serviceDonnees.ajouterVillage(mod.data);
        } else if (mod.type === 'ajout_route') {
          await serviceDonnees.ajouterRoute(mod.data);
        }
        const current = parseJSON(localStorage.getItem(KEY_PENDING), []);
        const index = current.findIndex(m => JSON.stringify(m) === JSON.stringify(mod));
        if (index >= 0) {
          current.splice(index, 1);
          localStorage.setItem(KEY_PENDING, JSON.stringify(current));
        }
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
  supprimerToken() { localStorage.removeItem('rn_token'); },

  sauvegarderUtilisateur(user) {
    if (!user) {
      localStorage.removeItem(USER_INFO_KEY);
      return;
    }
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    // Migrate any existing unscoped data to user-scoped keys
    migrateUnscopedData();
  },
  obtenirUtilisateur() {
    try {
      return JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
    } catch {
      return null;
    }
  },
  supprimerUtilisateur() { localStorage.removeItem(USER_INFO_KEY); },

  nettoyerDonneesLocales() {
    const scope = getUserScope();
    if (scope) {
      localStorage.removeItem(scopedKey(KEY_VILLAGES));
      localStorage.removeItem(scopedKey(KEY_ROUTES));
      localStorage.removeItem(scopedKey(KEY_CAMIONS));
      localStorage.removeItem(scopedKey(KEY_OPTIMISATIONS));
    }
    // Also clean up any remaining unscoped data
    localStorage.removeItem(KEY_VILLAGES);
    localStorage.removeItem(KEY_ROUTES);
    localStorage.removeItem(KEY_CAMIONS);
    localStorage.removeItem(KEY_OPTIMISATIONS);
    localStorage.removeItem(KEY_PENDING);
    
    // Clean up any other potential leftover keys
    this.nettoyerToutesDonneesAnciennes();
  },

  nettoyerToutesDonneesAnciennes() {
    // Nettoyer toutes les clés qui pourraient contenir des données anciennes
    const keysToRemove = [
      'rn_villages', 'rn_routes', 'rn_camions', 'rn_optimisations', 'rn_pending',
      // Clés avec préfixes utilisateur potentiels
      ...Object.keys(localStorage).filter(key => 
        key.startsWith('rn_villages_') || 
        key.startsWith('rn_routes_') || 
        key.startsWith('rn_camions_') || 
        key.startsWith('rn_optimisations_')
      )
    ];
    
    console.log('Nettoyage des clés anciennes:', keysToRemove);
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  debuggerLocalStorage() {
    const allKeys = Object.keys(localStorage);
    const relevantKeys = allKeys.filter(key => key.startsWith('rn_'));
    console.log('Clés localStorage pertinentes:', relevantKeys);
    relevantKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);
        console.log(`${key}:`, parsed?.length || 'vide', 'éléments');
      } catch (e) {
        console.log(`${key}: valeur non-JSON`);
      }
    });
    return relevantKeys;
  }
};

export default stockageLocal;
