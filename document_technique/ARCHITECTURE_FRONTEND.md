# Structure Modulaire Professionnel - Frontend (React)

## Architecture Organisée

```
src/
├── composants/
│   ├── commun/                      # Composants réutilisables
│   │   ├── EnTete.jsx
│   │   ├── PiedPage.jsx
│   │   └── BarreNavigation.jsx
│   ├── optimisation/                # Module d'optimisation
│   │   ├── AccueilOptimisation.jsx     # Orchestre le module
│   │   ├── FormulaireSaisieOptimisation.jsx # Collecte données
│   │   ├── PanneauResultatsOptimisation.jsx # Affiche résultats
│   │   ├── CarteVisualisationTournees.jsx   # Affiche tournée individuelle
│   │   └── TableauStatistiquesOptimisation.jsx # Affiche statistiques
│   ├── gestion-villages/            # Module gestion villages
│   │   ├── AccueilVillages.jsx
│   │   ├── ListeVillages.jsx
│   │   └── FormulaireVillage.jsx
│   ├── gestion-camions/             # Module gestion camions
│   ├── gestion-routes/              # Module gestion routes
│   └── ...
├── services/
│   ├── api/
│   │   ├── ServiceApiOptimisation.js    # Appels API optimisation
│   │   ├── ServiceApiVillages.js
│   │   ├── ServiceApiCamions.js
│   │   └── ServiceApiRoutes.js
│   ├── traitement/
│   │   ├── TraiteurDonneesOptimisation.js  # Transform données
│   │   └── Transformateur.js
│   └── utilitaire/
│       ├── ValidateurFormulaire.js    # Valide entrées
│       └── CalculatriceDonnees.js     # Calculs communs
└── styles/
    ├── optimisation.css
    ├── villages.css
    └── global.css
```

## Principes d'Architecture

### 1. **Responsabilité Unique**
- Chaque composant a UNE responsabilité
- Les services sont spécialisés (API, traitement, validation)

### 2. **Modularité**
- Les composants sont petits et réutilisables
- Facile à tester isolément

### 3. **Séparation des Préoccupations**
- **Composants** : Affichage et interaction
- **Services API** : Communication backend
- **Services de Traitement** : Transformation données
- **Services d'Utilitaire** : Calculs et validation

### 4. **Nommage en Français**
- Fichiers : `NomFichier.jsx` (PascalCase)
- Fonctions : `gererEvenement()` (camelCase)
- Classes : `ServiceDonnees` (PascalCase)

## Flux de Données - Optimisation

```
Utilisateur
    ↓
[AccueilOptimisation] (orchestrateur)
    ├→ [FormulaireSaisieOptimisation] (collecte)
    │   └→ onSoumission(données)
    │
    ├→ [ServiceApiOptimisation.lancerOptimisation()] (appel API)
    │   └→ Backend
    │
    ├→ [TraiteurDonneesOptimisation] (traitement)
    │
    └→ [PanneauResultatsOptimisation] (affichage)
        ├→ [TableauStatistiquesOptimisation]
        └→ [CarteVisualisationTournees]
```

## Avantages de Cette Architecture

✅ **Clair** : Chaque fichier a un rôle défini
✅ **Modularisé** : Facile d'ajouter/modifier/supprimer
✅ **Testable** : Chaque partie peut être testée isolément
✅ **Maintenable** : Facile à comprendre et maintenir
✅ **Évolutif** : Prêt pour la croissance
✅ **Français** : Noms compréhensibles pour l'équipe

## Exemple d'Utilisation d'un Service

```javascript
// Dans un composant
import { ServiceApiOptimisation } from '../services/api/ServiceApiOptimisation';
import { TraiteurDonneesOptimisation } from '../services/traitement/TraiteurDonneesOptimisation';

const resultats = await ServiceApiOptimisation.lancerOptimisation(depotId, camionIds);
const statistiques = TraiteurDonneesOptimisation.calculerStatistiquesGlobales(resultats);
```

---

*Cette structure garantit un code de qualité professionnelle et une maintenance facile.*
