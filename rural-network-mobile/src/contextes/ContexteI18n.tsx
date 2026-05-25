import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Langue = 'fr' | 'en' | 'mg';

const STORAGE_KEY = 'rn_mobile_langue';

type TraductionMap = Record<string, string>;
type Traductions = Record<Langue, TraductionMap>;

const TRADUCTIONS: Traductions = {
  fr: {
    'app.titre': 'Rural Network 2035',
    'nav.tableau': 'Tableau',
    'nav.villages': 'Villages',
    'nav.routes': 'Routes',
    'nav.flotte': 'Flotte',
    'nav.meteo': 'Météo',
    'nav.calcul': 'Calcul',
    'nav.demo': 'Démo',
    'chat.titre': 'Assistant RN',
    'chat.placeholder': 'Posez votre question...',
    'chat.chargement': 'Réflexion...',
    'chat.bienvenue': 'Bonjour! Posez-moi une question sur vos données.',
    'chat.erreur': 'Erreur: impossible de contacter l\'assistant.',
    'chat.fermer': 'Fermer',
    'chat.envoyer': 'Envoyer',
    'demo.titre': 'Mode Démo',
    'demo.sousTitre': 'Simulation du réseau rural',
    'demo.retour': 'Retour au Live',
    'demo.rejouer': 'Rejouer',
    'demo.resultats': 'Résultats',
    'commun.charger': 'Chargement...',
    'commun.succes': 'Succès',
    'commun.info': 'Info',
    'commun.valider': 'Valider',
    'commun.annuler': 'Annuler',
    'commun.supprimer': 'Supprimer',
    'commun.modifier': 'Modifier',
    'langues.fr': 'Français',
    'langues.en': 'English',
    'langues.mg': 'Malagasy',
  },
  en: {
    'app.titre': 'Rural Network 2035',
    'nav.tableau': 'Dashboard',
    'nav.villages': 'Villages',
    'nav.routes': 'Routes',
    'nav.flotte': 'Fleet',
    'nav.meteo': 'Weather',
    'nav.calcul': 'Compute',
    'nav.demo': 'Demo',
    'chat.titre': 'RN Assistant',
    'chat.placeholder': 'Ask your question...',
    'chat.chargement': 'Thinking...',
    'chat.bienvenue': 'Hello! Ask me about your data.',
    'chat.erreur': 'Error: unable to reach the assistant.',
    'chat.fermer': 'Close',
    'chat.envoyer': 'Send',
    'demo.titre': 'Demo Mode',
    'demo.sousTitre': 'Rural network simulation',
    'demo.retour': 'Back to Live',
    'demo.rejouer': 'Replay',
    'demo.resultats': 'Results',
    'commun.charger': 'Loading...',
    'commun.succes': 'Success',
    'commun.info': 'Info',
    'commun.valider': 'Validate',
    'commun.annuler': 'Cancel',
    'commun.supprimer': 'Delete',
    'commun.modifier': 'Edit',
    'langues.fr': 'Français',
    'langues.en': 'English',
    'langues.mg': 'Malagasy',
  },
  mg: {
    'app.titre': 'Rural Network 2035',
    'nav.tableau': 'Tabilao',
    'nav.villages': 'Tanàna',
    'nav.routes': 'Làlana',
    'nav.flotte': 'Fiara',
    'nav.meteo': 'Toetr\'andro',
    'nav.calcul': 'Kajy',
    'nav.demo': 'Demo',
    'chat.titre': 'Mpanampy RN',
    'chat.placeholder': 'Hametraka fanontaniana...',
    'chat.chargement': 'Mieritreritra...',
    'chat.bienvenue': 'Salama! Manontania momba ny angonao.',
    'chat.erreur': 'Hadisoana: tsy afaka mifandray amin\'ny mpanampy.',
    'chat.fermer': 'Hidina',
    'chat.envoyer': 'Handefa',
    'demo.titre': 'Fomba Demo',
    'demo.sousTitre': 'Simulation ny tambajotra ambanivohitra',
    'demo.retour': 'Miverina any amin\'ny Live',
    'demo.rejouer': 'Hamerina',
    'demo.resultats': 'Valiny',
    'commun.charger': 'Mandefasana...',
    'commun.succes': 'Vita soa aman-tsara',
    'commun.info': 'Vaovao',
    'commun.valider': 'Hamarina',
    'commun.annuler': 'Ajanona',
    'commun.supprimer': 'Hamafa',
    'commun.modifier': 'Hanova',
    'langues.fr': 'Français',
    'langues.en': 'English',
    'langues.mg': 'Malagasy',
  },
};

interface I18nContextType {
  langue: Langue;
  definirLangue: (l: Langue) => void;
  t: (cle: string) => string;
  LANGUES: Record<Langue, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function FournisseurI18n({ children }: { children: React.ReactNode }) {
  const [langue, setLangue] = useState<Langue>('fr');
  const [pret, setPret] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'mg') setLangue(saved);
      setPret(true);
    });
  }, []);

  const definirLangue = (l: Langue) => {
    setLangue(l);
    AsyncStorage.setItem(STORAGE_KEY, l);
  };

  const t = (cle: string): string => {
    return TRADUCTIONS[langue]?.[cle] ?? TRADUCTIONS['fr']?.[cle] ?? cle;
  };

  if (!pret) return null;

  return (
    <I18nContext.Provider value={{ langue, definirLangue, t, LANGUES: { fr: 'Français', en: 'English', mg: 'Malagasy' } }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within FournisseurI18n');
  return ctx;
}

export default I18nContext;