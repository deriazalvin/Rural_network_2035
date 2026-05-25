import React, { createContext, useState, useEffect, useContext } from 'react';

const LANGUES = {
  fr: 'Français',
  en: 'English',
  mg: 'Malagasy',
};

const TRADUCTIONS = {
  fr: {
    app: { titre: 'Rural Network 2035', sousTitre: 'Plateforme d\'optimisation de la logistique agricole malagasy' },
    nav: { tableau: 'Tableau', villages: 'Villages', routes: 'Routes', flotte: 'Flotte', meteo: 'Météo', calcul: 'Calcul', nuit: 'Nuit', clair: 'Clair', nettoyer: 'Nettoyer', deconnexion: 'Se déconnecter' },
    chat: { titre: 'Assistant RN', placeholder: 'Posez votre question...', chargement: 'Réflexion en cours...', messageBienvenue: 'Bonjour! Posez-moi une question sur vos données, la météo, les routes, etc.', erreur: 'Erreur: impossible de contacter l\'assistant.' },
    demo: { titre: 'Mode Démo — Simulation', retour: 'Retour au Live', rejouer: 'Rejouer', dashboard: 'Tableau de bord', villages: 'Villages', routes: 'Routes', optimisation: 'Optimisation', resultats: 'Résultats' },
    commun: { charger: 'Chargement en cours...', enLigne: 'En ligne', horsLigne: 'Hors ligne', validation: 'Valider', annuler: 'Annuler', supprimer: 'Supprimer', modifier: 'Modifier', ajouter: 'Ajouter', rechercher: 'Rechercher', aucunResultat: 'Aucun résultat' },
    auth: { connexion: 'Connexion', inscription: 'Inscription', email: 'Email', motDePasse: 'Mot de passe', nom: 'Nom' },
    langues: { fr: 'Français', en: 'English', mg: 'Malagasy' },
  },
  en: {
    app: { titre: 'Rural Network 2035', sousTitre: 'Malagasy agricultural logistics optimization platform' },
    nav: { tableau: 'Dashboard', villages: 'Villages', routes: 'Routes', flotte: 'Fleet', meteo: 'Weather', calcul: 'Compute', nuit: 'Night', clair: 'Light', nettoyer: 'Clear', deconnexion: 'Log out' },
    chat: { titre: 'RN Assistant', placeholder: 'Ask your question...', chargement: 'Thinking...', messageBienvenue: 'Hello! Ask me about your data, weather, roads, etc.', erreur: 'Error: unable to reach the assistant.' },
    demo: { titre: 'Demo Mode — Simulation', retour: 'Back to Live', rejouer: 'Replay', dashboard: 'Dashboard', villages: 'Villages', routes: 'Routes', optimisation: 'Optimization', resultats: 'Results' },
    commun: { charger: 'Loading...', enLigne: 'Online', horsLigne: 'Offline', validation: 'Validate', annuler: 'Cancel', supprimer: 'Delete', modifier: 'Edit', ajouter: 'Add', rechercher: 'Search', aucunResultat: 'No results' },
    auth: { connexion: 'Login', inscription: 'Register', email: 'Email', motDePasse: 'Password', nom: 'Name' },
    langues: { fr: 'Français', en: 'English', mg: 'Malagasy' },
  },
  mg: {
    app: { titre: 'Rural Network 2035', sousTitre: 'Plateforme fanatsarana ny lozisitika ara-pambolena eto Madagasikara' },
    nav: { tableau: 'Tabilao', villages: 'Tanàna', routes: 'Làlana', flotte: 'Fiara', meteo: 'Toetr\'andro', calcul: 'Kajy', nuit: 'Alina', clair: 'Andro', nettoyer: 'Hanadio', deconnexion: 'Hivoaka' },
    chat: { titre: 'Mpanampy RN', placeholder: 'Hametraka fanontaniana...', chargement: 'Mieritreritra...', messageBienvenue: 'Salama! Manontania momba ny angonao, ny toetr\'andro, ny làlana, sns.', erreur: 'Hadisoana: tsy afaka mifandray amin\'ny mpanampy.' },
    demo: { titre: 'Fomba Demo — Simulation', retour: 'Miverina any amin\'ny Live', rejouer: 'Hamerina', dashboard: 'Tabilao', villages: 'Tanàna', routes: 'Làlana', optimisation: 'Fanatsarana', resultats: 'Valiny' },
    commun: { charger: 'Mandefasana...', enLigne: 'Mifandray', horsLigne: 'Tsy mifandray', validation: 'Hamarina', annuler: 'Ajanona', supprimer: 'Hamafa', modifier: 'Hanova', ajouter: 'Hanampy', rechercher: 'Hikaroka', aucunResultat: 'Tsy misy valiny' },
    auth: { connexion: 'Hiditra', inscription: 'Hisoratra anarana', email: 'Email', motDePasse: 'Tenimiafina', nom: 'Anarana' },
    langues: { fr: 'Français', en: 'English', mg: 'Malagasy' },
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [langue, setLangue] = useState(() => {
    return localStorage.getItem('rn-langue') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('rn-langue', langue);
    document.documentElement.lang = langue;
  }, [langue]);

  const t = (chemin) => {
    const cles = chemin.split('.');
    let val = TRADUCTIONS[langue];
    for (const cle of cles) {
      if (val == null) return chemin;
      val = val[cle];
    }
    return val ?? chemin;
  };

  return (
    <I18nContext.Provider value={{ langue, setLangue, t, LANGUES, TRADUCTIONS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export default I18nContext;