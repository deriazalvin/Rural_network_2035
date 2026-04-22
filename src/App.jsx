import { useState, useEffect } from 'react';
import { ServiceDonnees } from './services/ServiceDonnees.js';
import { stockageLocal, gestionSession } from './utilitaires/stockageLocal.js';
import { GestionVillages } from './composants/GestionVillages.jsx';
import { GestionRoutes } from './composants/GestionRoutes.jsx';
import { OptimisationTournees } from './composants/OptimisationTournees.jsx';
import { TableauBord } from './composants/TableauBord.jsx';
import { NotificationErreur } from './composants/NotificationErreur.jsx';
import LandingPage from './composants/LandingPage.tsx';
import PublicPages from './composants/PublicPages.jsx';
import './styles/styles.css';
import AuthForm from './composants/AuthForm.jsx';
import { Circle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { AlertCircle, XOctagon, MapPinOff, Activity } from 'lucide-react';

function App() {
  const [ongletActif, setOngletActif] = useState('tableau-bord');
  const [villages, setVillages] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [resultatsOptimisation, setResultatsOptimisation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [enLigne, setEnLigne] = useState(navigator.onLine);
  const [chargement, setChargement] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);

  const serviceDonnees = new ServiceDonnees();

  const normaliserVillage = (village) => ({
    ...village,
    volumeProduction: village.volumeProduction ?? village.volume_production ?? 0
  });

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

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || null;
      if (detail) {
        setUtilisateur(detail.user || detail);
      }
    };
    window.addEventListener('rn-user-logged', handler);
    return () => window.removeEventListener('rn-user-logged', handler);
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [enLigne]);

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
        const [villagesData, routesData] = await Promise.all([
          serviceDonnees.obtenirTousLesVillages(),
          serviceDonnees.obtenirToutesLesRoutes()
        ]);

        setVillages(villagesData.map(normaliserVillage));
        setRoutes(routesData);
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
        setVillages(villagesLocaux.map(normaliserVillage));
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
          volumeProduction: village.volumeProduction ?? village.volume_production ?? 0,
          id: `temp_${Date.now()}`,
          dateCreation: new Date().toISOString()
        };
        setVillages([...villages, villageTemporaire]);
        stockageLocal.ajouterModificationEnAttente({
          type: 'ajout_village',
          data: {
            ...village,
            volumeProduction: village.volumeProduction ?? village.volume_production ?? 0
          }
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
          dateCreation: new Date().toISOString()
        };
        setRoutes([...routes, routeTemporaire]);
        stockageLocal.ajouterModificationEnAttente({
          type: 'ajout_route',
          data: route
        });
      }
    } catch (error) {
      console.error('Erreur ajout route:', error);
      
      // Détecte le type d'erreur pour afficher un message approprié
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('route existe déjà') || errorMessage.includes('doublons bidirectionnels')) {
          setNotification({
            type: 'doublon',
            Icone: AlertCircle, // On passe le composant directement
            titre: 'Route déjà existante',
            message: 'Une route existe déjà entre ces deux villages .'
          });
      } else if (errorMessage.includes('Village de départ non trouvé') || 
                  errorMessage.includes('Village d\'arrivée non trouvé')) {
          setNotification({
            type: 'erreur',
            Icone: MapPinOff,
            titre: 'Village introuvable',
            message: 'Le village sélectionné n\'existe pas.'
          });
      } else if (errorMessage.includes('villages de départ et arrivée doivent être différents')) {
          setNotification({
            type: 'erreur',
            Icone: AlertCircle,
            titre: 'Villages identiques',
            message: 'Vous devez sélectionner deux villages différents.'
          });
      } else if (errorMessage.includes('Impossible de calculer la distance')) {
          setNotification({
            type: 'erreur',
            Icone: Activity,
            titre: 'Erreur calcul distance',
            message: 'Vérifiez que l\'API OSRM est accessible.'
          });
      } else {
          setNotification({
            type: 'erreur',
            Icone: XOctagon,
            titre: 'Erreur lors de l\'ajout',
            message: errorMessage
          });
      }
      
      // Ferme automatiquement après 5 secondes
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const bloquerRoute = async (id, estBloquee) => {
    try {
      if (enLigne) {
        await serviceDonnees.modifierRoute(id, { estBloquee: estBloquee });
      }
      setRoutes(routes.map(r => r.id === id ? { ...r, estBloquee: estBloquee } : r));
    } catch (error) {
      console.error('Erreur modification route:', error);
    }
  };

  const optimiserTournee = async ({ villageDepart, villagesAVisiter, capaciteCamion }) => {
    try {
      const payload = {
        villageDepart,
        villagesAVisiter,
        capaciteCamion
      };

      const comparaison = await serviceDonnees.optimiserTournee(payload);
      setResultatsOptimisation(comparaison);

      if (enLigne) {
        const tourneeNaive = await serviceDonnees.sauvegarderTournee({
          nom: 'Tournée Naïve',
          capacite_camion: capaciteCamion,
            distance_totale: comparaison.naive.distanceTotale,
            cout_carburant: comparaison.naive.distanceTotale * 0.8,
            type_optimisation: 'NAIVE',
            itineraire: JSON.stringify(comparaison.naive.itineraire)
        });

        const tourneeOptimisee = await serviceDonnees.sauvegarderTournee({
          nom: 'Tournée Optimisée',
          capacite_camion: capaciteCamion,
            distance_totale: comparaison.optimisee.distanceTotale,
            cout_carburant: comparaison.optimisee.distanceTotale * 0.8,
            type_optimisation: 'OPTIMISEE',
            itineraire: JSON.stringify(comparaison.optimisee.itineraire)
        });

        const performance = await serviceDonnees.sauvegarderPerformance({
          tournee_naive_id: tourneeNaive.id,
          tournee_optimisee_id: tourneeOptimisee.id,
          reduction_distance_pourcentage: Number(comparaison.reductionPourcentage),
          economie_carburant: Number(comparaison.economieCarburant)
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
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <header className="entete">
        <h1> Rural Network 2035</h1>
        <p>Plateforme d'optimisation de la logistique agricole malagasy</p>
      </header>

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
          <Circle
            size={12}
            fill={enLigne ? "#22c55e" : "#ef4444"}
            color={enLigne ? "#22c55e" : "#ef4444"}
          />
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
      </main>

      {notification && (
        <NotificationErreur
          type={notification.type}
          titre={notification.titre}
          message={notification.message}
          onFermer={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;