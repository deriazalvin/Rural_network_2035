import { useState, useEffect } from 'react';
import { ServiceDonnees } from './services/ServiceDonnees.js';
import { stockageLocal, gestionSession } from './utils/stockageLocal.js';
import { GestionVillages } from './composants/pages/GestionVillages.jsx';
import { GestionRoutes } from './composants/pages/GestionRoutes.jsx';
import { OptimisationTournees } from './composants/pages/OptimisationTournees.jsx';
import { VueMeteo } from './composants/pages/VueMeteo.jsx';
import { TableauBordNew } from './composants/dashboard/TableauBordNew';
import { NotificationErreur } from './composants/common/NotificationErreur.jsx';
import GestionCamions from './composants/pages/GestionCamions.jsx';
import LandingPage from './composants/pages/LandingPage.jsx';
import PublicPages from './composants/common/PublicPages.jsx';
import LogoRN from './composants/common/LogoRN.jsx';
import './styles/styles.css';
import AuthForm from './composants/common/AuthForm.jsx';
import { Circle, Sun, Moon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { AlertCircle, XOctagon, MapPinOff, Activity } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext.jsx';

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
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

  // Charger l'utilisateur depuis le localStorage au montage
  useEffect(() => {
    const user = gestionSession.obtenirUtilisateur();
    if (user) {
      setUtilisateur(user);
    }
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
    } else {
      setChargement(false);
    }
  }, [enLigne, utilisateur]);

  // Écouteur global pour détecter les 401 et forcer la déconnexion
  useEffect(() => {
    const handler = () => {
      gestionSession.supprimerToken();
      gestionSession.supprimerUtilisateur();
      gestionSession.nettoyerDonneesLocales();
      setUtilisateur(null);
      setChargement(false);
    };
    window.addEventListener('rn-auth-expired', handler);
    return () => window.removeEventListener('rn-auth-expired', handler);
  }, []);

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

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.tab) setOngletActif(e.detail.tab);
    };
    window.addEventListener('rn-navigate', handler);
    return () => window.removeEventListener('rn-navigate', handler);
  }, []);

  const TOUR_COLORS = [
    '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
  ];

  const transformerHistorique = (hData) => {
    if (!Array.isArray(hData)) return [];
    return hData.map(h => {
      try {
        const dto = JSON.parse(h.resultatJson);
        return {
          id: h.id,
          timestamp: h.dateCreation,
          date: h.dateCreation,
          dateHeure: h.dateCreation,
          gainPercentage: dto.gainPourcent ?? 0,
          distanceTotale: dto.distanceTotalKm ?? 0,
          distanceTotalKm: dto.distanceTotalKm ?? 0,
          coutTotal: dto.coutTotal ?? 0,
          economieTotal: dto.economieTotal ?? 0,
          dureeCalculMs: dto.dureeCalculMs ?? 0,
          nombreTournees: dto.tournees?.length ?? 0,
          toursList: (dto.tournees || []).map((t, idx) => ({
            name: t.nom || `Camion ${String.fromCharCode(65 + idx)}`,
            color: t.couleurHex || TOUR_COLORS[idx % TOUR_COLORS.length],
            distance: t.distanceTotalKm ?? 0,
            load: t.chargeTotalKg ?? 0,
            capacity: t.capaciteKg ?? 0,
            steps: (t.etapes || []).map((e, sIdx) => ({
              num: sIdx + 1,
              village: e.nom || 'Village',
              production: e.production ?? 0,
              lat: e.latitude,
              lng: e.longitude
            }))
          })),
          tournees: dto.tournees || [],
          unserved: dto.villagesNonDesservis || [],
          villagesNonDesservis: dto.villagesNonDesservis || [],
          resultatDTO: dto
        };
      } catch {
        return null;
      }
    }).filter(Boolean);
  };

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      if (enLigne) {
        const [villagesData, routesData, camionsData, historiqueData] = await Promise.all([
          serviceDonnees.obtenirTousLesVillages(),
          serviceDonnees.obtenirToutesLesRoutes(),
          serviceDonnees.obtenirTousLesCamions().catch(() => []),
          serviceDonnees.obtenirHistoriqueOptimisations().catch(() => [])
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

        // Transformer et synchroniser l'historique d'optimisation
        const optimisationsTransformees = transformerHistorique(historiqueData);
        setOptimisations(optimisationsTransformees);
        stockageLocal.sauvegarderOptimisations(optimisationsTransformees);

        const nombreSynchronise = await stockageLocal.synchroniser(serviceDonnees);
        if (nombreSynchronise > 0) {
          chargerDonnees();
        }
      } else {
        const villagesLocaux = stockageLocal.obtenirVillages();
        const routesLocales = stockageLocal.obtenirRoutes();
        const camionsLocaux = stockageLocal.obtenirCamions();
        const optimisationsLocales = stockageLocal.obtenirOptimisations();
        setVillages(villagesLocaux.map(normaliserVillage));
        setRoutes(routesLocales);
        setCamions(camionsLocaux);
        setOptimisations(optimisationsLocales);
      }
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
        <div className="entete-content">
          <div className="entete-logo">
            <LogoRN size="lg" showText={true} />
          </div>
          <div className="entete-text">
            <h1>Rural Network 2035</h1>
            <p>Plateforme d'optimisation de la logistique agricole malagasy</p>
          </div>
          {utilisateur && (
            <div className="entete-user" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.12)', padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid rgba(34,197,94,0.25)', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700 }}>
              <i className="fa-solid fa-user-circle" style={{ fontSize: '1.1rem', color: '#22c55e' }}></i>
              <span>{utilisateur.nom || 'Utilisateur'}</span>
            </div>
          )}
        </div>
      </header>

      <nav className="navbar">
        <ul className="nav-list">
          {[
            { id: 'tableau-bord', label: 'Tableau', icon: 'fa-chart-line' },
            { id: 'villages', label: 'Villages', icon: 'fa-tree-city' },
            { id: 'routes', label: 'Routes', icon: 'fa-route' },
            { id: 'camions', label: 'Flotte', icon: 'fa-truck' },
            { id: 'meteo', label: 'Météo', icon: 'fa-cloud-sun' },
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
          {/* Bouton toggle dark mode */}
          <li className="nav-item" onClick={toggleDarkMode} style={{ cursor: 'pointer' }}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <div className="nav-content">
                <span className="text">{darkMode ? 'Clair' : 'Nuit'}</span>
                <span className="icon">
                  {darkMode ? (
                    <Sun size={18} color="#f39c12" />
                  ) : (
                    <Moon size={18} color="#f1c40f" />
                  )}
                </span>
              </div>
            </a>
          </li>
          
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
          <TableauBordNew
            villages={villages}
            routes={routes}
            optimisations={optimisations}
            resultatsOptimisation={resultatsOptimisation}
            onEffacerHistorique={async () => {
              await serviceDonnees.viderHistoriqueOptimisations();
              setOptimisations([]);
              stockageLocal.sauvegarderOptimisations([]);
            }}
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

        {ongletActif === 'meteo' && (
          <VueMeteo villages={villages} />
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