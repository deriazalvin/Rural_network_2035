# Structure Professionnelle des Algorithmes

## Architecture

Le projet suit une architecture professionnelle en séparant les **algorithmes** de la **logique métier** :

```
backend/src/main/java/com/ruralnetwork/
├── algorithme/           # Dossier dédié aux algorithmes
│   ├── Dijkstra.java                    # Algorithme de plus court chemin
│   └── GreedyTourneeOptimization.java  # Algorithme d'optimisation de tournées
├── service/              # Services utilisant les algorithmes
│   ├── OptimisationService.java        # Orchestre l'optimisation des tournées
│   └── [autres services...]
├── controleur/           # Contrôleurs exposant les APIs
│   ├── OptimisationControleur.java     # API d'optimisation
│   └── [autres contrôleurs...]
└── [autres packages...]
```

## Descriptions

### Algorithmes (`algorithme/`)

#### 1. **Dijkstra.java**
- **Responsabilité** : Calculer le plus court chemin entre deux nœuds dans un graphe pondéré
- **Utilisation** : Trouver des chemins optimaux entre villages
- **Interface publique** : `calculerPlusCourtChemin(String depart, String destination)`
- **Retour** : `ResultatChemin` contenant distance et chemin complet

#### 2. **GreedyTourneeOptimization.java**
- **Responsabilité** : Optimiser les tournées multi-camions en utilisant un algorithme greedy nearest-neighbor
- **Utilisation** : Construire les itinéraires optimaux pour chaque camion
- **Méthodes publiques** :
  - `construireTournee()` : crée une tournée pour un camion
  - `calculerDistanceBaseline()` : calcule la solution naïve pour comparaison
- **Respect des contraintes** : capacité du camion, villages accessibles

### Service (`service/`)

#### **OptimisationService.java**
- **Responsabilité** : Orchestrer l'optimisation complète
- **Actions** :
  1. Récupère données (villages, camions, routes)
  2. Construit matrice de distances
  3. Délègue aux algorithmes du dossier `algorithme/`
  4. Compile les résultats (gain %, économies, etc.)
- **Interface** : `optimiserTournees(String depotId, List<String> camionIds)`

### Fluxd'exécution

```
OptimisationControleur
  ↓
OptimisationService.optimiserTournees()
  ├→ construireMatriceDistances()
  ├→ GreedyTourneeOptimization.calculerDistanceBaseline() [algorithme/]
  ├→ GreedyTourneeOptimization.construireTournee() [algorithme/]  (pour chaque camion)
  └→ Compile résultats et retour
```

## Avantages de cette Architecture

✅ **Séparation des responsabilités** : Les algorithmes sont isolés et testables  
✅ **Réutilisabilité** : Les algorithmes peuvent être utilisés par d'autres services  
✅ **Maintenabilité** : Facile de remplacer ou améliorer un algorithme  
✅ **Testabilité** : Chaque algorithme peut être testé indépendamment  
✅ **Professionalisme** : Structure claire et conforme aux bonnes pratiques  

## Alimentation des Données

1. **Input** : dépotId et camionIds via l'API `/api/optimisations/multi-camions`
2. **Traitement** : Les algorithmes du dossier `algorithme/` calculent les tournées
3. **Output** : ResultatDTO avec tournées optimisées, gains, et statistiques

---

*Cette structure garantit une qualité de code professionnelle et une évolution facile du système.*
