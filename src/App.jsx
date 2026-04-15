import { useState, useEffect } from 'react';
import { ServiceDonnees } from './services/ServiceDonnees.js';
import { stockageLocal, gestionSession } from './utilitaires/stockageLocal.js';
import { GestionVillages } from './composants/GestionVillages.jsx';
import { GestionRoutes } from './composants/GestionRoutes.jsx';
import { OptimisationTournees } from './composants/OptimisationTournees.jsx';
import { TableauBord } from './composants/TableauBord.jsx';
import { NotificationErreur } from './composants/NotificationErreur.jsx';
import GestionCamions from './composants/GestionCamions.jsx';
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
  const [camions, setCamions] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [optimisations, setOptimisations] = useState([]);
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
        const user = detail.user || detail;
        setUtilisateur(user);
        gestionSession.sauvegarderUtilisateur(user);
        // Nettoyer complètement les données locales à chaque connexion pour garantir l'isolation
        gestionSession.nettoyerDonneesLocales();
        // Recharger les données après le nettoyage
        setTimeout(() => chargerDonnees(), 100);
      }
    };
    window.addEventListener('rn-user-logged', handler);
    return () => window.removeEventListener('rn-user-logged', handler);
  }, []);

  useEffect(() => {
    const token = gestionSession.obtenirToken();
    if (token) {
      chargerDonnees();
    }
  }, [enLigne, utilisateur]);

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
        const [villagesData, routesData, camionsData] = await Promise.all([
          serviceDonnees.obtenirTousLesVillages(),
          serviceDonnees.obtenirToutesLesRoutes(),
          serviceDonnees.obtenirTousLesCamions().catch(() => [])
        ]);

        // Nettoyer toujours les données locales au démarrage pour éviter la persistance
        // entre comptes - seules les données de la base de données comptent
        stockageLocal.sauvegarderVillages([]);
        stockageLocal.sauvegarderRoutes([]);
        stockageLocal.sauvegarderCamions([]);
        stockageLocal.sauvegarderOptimisations([]);

        setVillages(villagesData.map(normaliserVillage));
        setRoutes(routesData);
        setCamions(camionsData || []);
        setPerformances([]);

        stockageLocal.sauvegarderVillages(villagesData);
        stockageLocal.sauvegarderRoutes(routesData);
        stockageLocal.sauvegarderCamions(camionsData || []);

        const nombreSynchronise = await stockageLocal.synchroniser(serviceDonnees);
        if (nombreSynchronise > 0) {
          chargerDonnees();
        }
      } else {
        const villagesLocaux = stockageLocal.obtenirVillages();
        const routesLocales = stockageLocal.obtenirRoutes();
        const camionsLocaux = stockageLocal.obtenirCamions();
        setVillages(villagesLocaux.map(normaliserVillage));
        setRoutes(routesLocales);
        setCamions(camionsLocaux);
      }

      // Charger les optimisations (toujours depuis le cache local)
      const optimisationsLocales = stockageLocal.obtenirOptimisations();
      setOptimisations(optimisationsLocales);
    } catch (error) {
      console.error('Erreur chargement:', error);
      const villagesLocaux = stockageLocal.obtenirVillages();
      const routesLocales = stockageLocal.obtenirRoutes();
      const camionsLocaux = stockageLocal.obtenirCamions();
      const optimisationsLocales = stockageLocal.obtenirOptimisations();
      setVillages(villagesLocaux);
      setRoutes(routesLocales);
      setCamions(camionsLocaux);
      setOptimisations(optimisationsLocales);
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

  const modifierVillage = async (id, village) => {
    try {
      if (enLigne) {
        await serviceDonnees.modifierVillage(id, village);
      }
      setVillages(villages.map(v => v.id === id ? { ...v, ...village } : v));
    } catch (error) {
      console.error('Erreur modification village:', error);
      alert('Erreur lors de la modification du village');
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

  // Wrapper pour mettre à jour les camions ET les sauvegarder en cache local
  const mettreAJourCamions = (nouveauxCamions) => {
    setCamions(nouveauxCamions);
    stockageLocal.sauvegarderCamions(nouveauxCamions);
  };

  // Valider une optimisation et sauvegarder les résultats
  const validerOptimisation = (resultat) => {
    try {
      // Calculer les statistiques de l'optimisation
      const distanceTotale = resultat.tournees?.reduce((sum, t) => sum + (t.distanceTotale || 0), 0) || 0;
      const coutTotal = resultat.coutTotal || 0;
      const gainMoyen = resultat.gainPercentage || 0;
      
      // Sauvegarder l'optimisation dans le localStorage
      stockageLocal.ajouterOptimisation({
        id: `opt_${Date.now()}`,
        distanceTotale,
        coutTotal,
        gainPercentage: gainMoyen,
        nbTournees: (resultat.tournees || []).length,
        nbCamions: (resultat.tournees || []).length,
        tournees: resultat.tournees,
        villagesNonDesservis: resultat.villagesNonDesservis || []
      });
      
      // Mettre à jour l'état des optimisations
      setOptimisations(stockageLocal.obtenirOptimisations());
      
      // Mettre à jour les villages pour ajouter la "collecte restante"
      const villageMisAJour = villages.map(v => {
        const collecteRestante = resultat.tournees?.reduce((sum, t) => {
          const etape = t.etapes?.find(e => e.villageId === v.id);
          return sum + (etape?.productionCollectee || 0);
        }, 0) || 0;
        
        return {
          ...v,
          collecteRestante: (parseFloat(v.volumeProduction || 0) - collecteRestante),
          productionTotaleHistorique: (parseFloat(v.productionTotaleHistorique || 0) + parseFloat(v.volumeProduction || 0))
        };
      });
      
      setVillages(villageMisAJour);
      stockageLocal.sauvegarderVillages(villageMisAJour);
      
      // Réinitialiser le résultat d'optimisation
      setResultatsOptimisation(null);
      
      // Afficher une notification de succès
      setNotification({
        type: 'succes',
        titre: 'Optimisation validée',
        message: `${(resultat.tournees || []).length} tournée(s) enregistrée(s) avec succès!`
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Erreur validation optimisation:', error);
      setNotification({
        type: 'erreur',
        titre: 'Erreur lors de la validation',
        message: error.message
      });
    }
  };

  const modifierRoute = async (id, route) => {
    try {
      if (enLigne) {
        await serviceDonnees.modifierRoute(id, route);
      }
      setRoutes(routes.map(r => r.id === id ? { ...r, ...route } : r));
    } catch (error) {
      console.error('Erreur modification route:', error);
      
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('route existe déjà') || errorMessage.includes('doublons bidirectionnels')) {
        setNotification({
          type: 'doublon',
          Icone: AlertCircle,
          titre: 'Route déjà existante',
          message: 'Une route existe déjà entre ces deux villages.'
        });
      } else {
        setNotification({
          type: 'erreur',
          Icone: XOctagon,
          titre: 'Erreur lors de la modification',
          message: errorMessage
        });
      }
      
      setTimeout(() => setNotification(null), 5000);
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
    gestionSession.supprimerUtilisateur();
    // Nettoyer toutes les données locales au logout pour éviter la persistance
    gestionSession.nettoyerDonneesLocales();
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
            { id: 'camions', label: 'Flotte', icon: 'fa-truck' },
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
          <li className="nav-item" onClick={() => { 
            if (window.confirm('Voulez-vous vraiment nettoyer toutes les données locales ? Cette action supprimera toutes vos données sauvegardées localement et rechargera les données depuis la base de données.')) {
              gestionSession.nettoyerDonneesLocales();
              chargerDonnees();
              alert('Données locales nettoyées. Les données de la base de données ont été rechargées.');
            }
          }}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <div className="nav-content">
                <span className="text">Nettoyer</span>
                <span className="icon"><i className="fa-solid fa-trash"></i></span>
              </div>
            </a>
          </li>
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
            optimisations={optimisations}
          />
        )}

        {ongletActif === 'villages' && (
          <GestionVillages
            villages={villages}
            onAjouterVillage={ajouterVillage}
            onModifierVillage={modifierVillage}
            onSupprimerVillage={supprimerVillage}
          />
        )}

        {ongletActif === 'routes' && (
          <GestionRoutes
            villages={villages}
            routes={routes}
            onAjouterRoute={ajouterRoute}
            onModifierRoute={modifierRoute}
            onBloquerRoute={bloquerRoute}
          />
        )}

        {ongletActif === 'camions' && (
          <GestionCamions
            camions={camions}
            onModifierCamions={mettreAJourCamions}
          />
        )}

        {ongletActif === 'optimisation' && (
          <OptimisationTournees
            villages={villages}
            camions={camions}
            depot={villages.length > 0 ? villages[0] : null}
            resultatOptimisation={resultatsOptimisation}
            onOptimiser={setResultatsOptimisation}
            onValidation={validerOptimisation}
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