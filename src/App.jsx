import { useState, useEffect } from 'react';
import { ServiceDonnees } from './services/ServiceDonnees.js';
import { stockageLocal, gestionSession } from './utilitaires/stockageLocal.js';
import { GestionVillages } from './composants/GestionVillages.jsx';
import { GestionRoutes } from './composants/GestionRoutes.jsx';
import { OptimisationTournees } from './composants/OptimisationTournees.jsx';
import { TableauBord } from './composants/TableauBord.jsx';
import LandingPage from './composants/LandingPage.tsx';
import PublicPages from './composants/PublicPages.jsx';
import './styles/styles.css';
import AuthForm from './composants/AuthForm.jsx';

function App() {
  const [ongletActif, setOngletActif] = useState('tableau-bord');
  const [villages, setVillages] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [resultatsOptimisation, setResultatsOptimisation] = useState(null);
  const [enLigne, setEnLigne] = useState(navigator.onLine);
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);

  const serviceDonnees = new ServiceDonnees();

  useEffect(() => {
    const gererConnexion = () => setEnLigne(true);
    const gererDeconnexion = () => setEnLigne(false);

    window.addEventListener('online', gererConnexion);
    window.addEventListener('offline', gererDeconnexion);

    return () => {
      window.removeEventListener('online', gererConnexion);
      window.removeEventListener('offline', gererDeconnexion);
    };
  }, []);

  // Listen for global auth event from AuthForm
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || null;
      if (detail) {
        // set utilisateur if available in payload
        setUtilisateur(detail.user || detail);
      }
    };
    window.addEventListener('rn-user-logged', handler);
    return () => window.removeEventListener('rn-user-logged', handler);
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [enLigne]);

  // After login, the landing page may store a navigation target in localStorage ('rn_nav_to').
  // Execute this on mount to restore the requested tab if the user is authenticated.
  useEffect(() => {
    try {
      const token = gestionSession.obtenirToken();
      if (token) {
        const nav = localStorage.getItem('rn_nav_to');
        if (nav) {
          setOngletActif(nav);
          localStorage.removeItem('rn_nav_to');
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const chargerDonnees = async () => {
    try {
      if (enLigne) {
        // Ne pas appeler /performances au chargement pour éviter les 404 côté frontend
        const [villagesData, routesData] = await Promise.all([
          serviceDonnees.obtenirTousLesVillages(),
          serviceDonnees.obtenirToutesLesRoutes()
        ]);

        setVillages(villagesData);
        setRoutes(routesData);
        // laisser performances vide par défaut; sera rempli lors d'opérations futures
        setPerformances([]);

        stockageLocal.sauvegarderVillages(villagesData);
        stockageLocal.sauvegarderRoutes(routesData);

        const nombreSynchronise = await stockageLocal.synchroniser(serviceDonnees);
        if (nombreSynchronise > 0) {
          chargerDonnees();
        }
      } else {
        const villagesLocaux = stockageLocal.obtenirVillages();
        const routesLocales = stockageLocal.obtenirRoutes();
        setVillages(villagesLocaux);
        setRoutes(routesLocales);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      const villagesLocaux = stockageLocal.obtenirVillages();
      const routesLocales = stockageLocal.obtenirRoutes();
      setVillages(villagesLocaux);
      setRoutes(routesLocales);
    } finally {
      setChargement(false);
    }
  };

  const ajouterVillage = async (village) => {
    try {
      if (enLigne) {
        const nouveauVillage = await serviceDonnees.ajouterVillage(village);
        setVillages([...villages, nouveauVillage]);
      } else {
        const villageTemporaire = {
          ...village,
          id: `temp_${Date.now()}`,
          date_creation: new Date().toISOString()
        };
        setVillages([...villages, villageTemporaire]);
        stockageLocal.ajouterModificationEnAttente({
          type: 'ajout_village',
          data: village
        });
      }
    } catch (error) {
      console.error('Erreur ajout village:', error);
      alert('Erreur lors de l\'ajout du village');
    }
  };

  const supprimerVillage = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce village ?')) return;

    try {
      if (enLigne) {
        await serviceDonnees.supprimerVillage(id);
      }
      setVillages(villages.filter(v => v.id !== id));
    } catch (error) {
      console.error('Erreur suppression village:', error);
    }
  };

  const ajouterRoute = async (route) => {
    try {
      if (enLigne) {
        const nouvelleRoute = await serviceDonnees.ajouterRoute(route);
        setRoutes([...routes, nouvelleRoute]);
      } else {
        const routeTemporaire = {
          ...route,
          id: `temp_${Date.now()}`,
          date_creation: new Date().toISOString()
        };
        setRoutes([...routes, routeTemporaire]);
        stockageLocal.ajouterModificationEnAttente({
          type: 'ajout_route',
          data: route
        });
      }
    } catch (error) {
      console.error('Erreur ajout route:', error);
      alert('Erreur lors de l\'ajout de la route');
    }
  };

  const bloquerRoute = async (id, estBloquee) => {
    try {
      if (enLigne) {
        await serviceDonnees.modifierRoute(id, { est_bloquee: estBloquee });
      }
      setRoutes(routes.map(r => r.id === id ? { ...r, est_bloquee: estBloquee } : r));
    } catch (error) {
      console.error('Erreur modification route:', error);
    }
  };

  const optimiserTournee = async ({ villageDepart, villagesAVisiter, capaciteCamion }) => {
    try {
      // Déléguer l'optimisation au backend (Spring Boot)
      const payload = {
        villageDepart,
        villagesAVisiter,
        capaciteCamion,
        villages,
        routes
      };

      const comparaison = await serviceDonnees.optimiserTournee(payload);
      setResultatsOptimisation(comparaison);

      if (enLigne) {
        const tourneeNaive = await serviceDonnees.sauvegarderTournee({
          nom: 'Tournée Naïve',
          capacite_camion: capaciteCamion,
          distance_totale: comparaison.naive.distanceTotale,
          cout_carburant: comparaison.naive.distanceTotale * 0.8,
          type_optimisation: 'naive',
          itineraire: comparaison.naive.itineraire
        });

        const tourneeOptimisee = await serviceDonnees.sauvegarderTournee({
          nom: 'Tournée Optimisée',
          capacite_camion: capaciteCamion,
          distance_totale: comparaison.optimisee.distanceTotale,
          cout_carburant: comparaison.optimisee.distanceTotale * 0.8,
          type_optimisation: 'optimisee',
          itineraire: comparaison.optimisee.itineraire
        });

        const performance = await serviceDonnees.sauvegarderPerformance({
          tournee_naive_id: tourneeNaive.id,
          tournee_optimisee_id: tourneeOptimisee.id,
          reduction_distance_pourcentage: comparaison.reductionPourcentage,
          economie_carburant: comparaison.economieCarburant
        });

        setPerformances([performance, ...performances]);
      }
    } catch (error) {
      console.error('Erreur optimisation:', error);
      alert('Erreur lors de l\'optimisation. Vérifiez que les villages sont bien connectés.');
    }
  };

  if (chargement) {
    return (
      <div className="app">
        <div className="entete">
          <h1>Rural Network 2035</h1>
          <p>Chargement en cours...</p>
        </div>
      </div>
    );
  }
  const token = gestionSession.obtenirToken();
  if (!token && !utilisateur) {
    return (
      <PublicPages />
    );
  }

  const logout = () => {
    gestionSession.supprimerToken();
    setUtilisateur(null);
    setOngletActif('tableau-bord');
  };

  return (
    
    <div className="app">
      {/* On ajoute les orbes décoratifs en fond comme dans index.html */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <header className="entete">
        <h1>🌾 Rural Network 2035</h1>
        <p>Plateforme d'optimisation de la logistique agricole malagasy</p>
      </header>

      {/* Structure de navigation mise à jour pour le style Glass */}
      <nav className="navbar">
        <ul className="nav-list">
          {[
            { id: 'tableau-bord', label: 'Tableau', icon: 'fa-chart-line' },
            { id: 'villages', label: 'Villages', icon: 'fa-tree-city' },
            { id: 'routes', label: 'Routes', icon: 'fa-route' },
            { id: 'optimisation', label: 'Calcul', icon: 'fa-gears' }
          ].map((item) => (
            <li 
              key={item.id} 
              className={`nav-item ${ongletActif === item.id ? 'active' : ''}`}
              onClick={() => setOngletActif(item.id)}
            >
              <a href="#">
                <div className="nav-content">
                  <span className="text">{item.label}</span>
                  <span className="icon"><i className={`fa-solid ${item.icon}`}></i></span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <ul className="nav-list" style={{ marginLeft: 8 }}>
          <li className="nav-item logout" onClick={() => { logout(); }}>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
              <div className="nav-content">
                <span className="text">Se déconnecter</span>
                <span className="icon"><i className="fa-solid fa-door-open"></i></span>
              </div>
            </a>
          </li>
        </ul>

        <div className={`statut-connexion-glass ${enLigne ? 'en-ligne' : 'hors-ligne'}`}>
          {enLigne ? '🟢' : '🔴'}
        </div>
      </nav>

      <main>
        {ongletActif === 'tableau-bord' && (
          <TableauBord
            villages={villages}
            routes={routes}
            performances={performances}
          />
        )}

        {ongletActif === 'villages' && (
          <GestionVillages
            villages={villages}
            onAjouterVillage={ajouterVillage}
            onSupprimerVillage={supprimerVillage}
          />
        )}

        {ongletActif === 'routes' && (
          <GestionRoutes
            villages={villages}
            routes={routes}
            onAjouterRoute={ajouterRoute}
            onBloquerRoute={bloquerRoute}
          />
        )}

        {ongletActif === 'optimisation' && (
          <OptimisationTournees
            villages={villages}
            onOptimiser={optimiserTournee}
            resultatsOptimisation={resultatsOptimisation}
          />
        )}

        {/* Assistant IA removed from UI */}
      </main>
    </div>
  );
}

export default App;
