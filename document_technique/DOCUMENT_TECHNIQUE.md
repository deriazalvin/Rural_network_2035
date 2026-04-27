# Document technique

Ce document donne des détails techniques utiles pour développeurs et évaluateurs.

1) Architecture
- Frontend : React + Vite (ESM). Interagit avec le backend via API REST.
- Backend : Spring Boot (Maven). Contrôleurs REST exposent les services métier.

2) Modèles de données (extrait)
- `Village` : identifiant, nom, coordonnées (lat, lon), métadonnées.
- `Route` : origine, destination, distance, coût, statut.
- `Tournee` : liste d'étapes, distance totale, métriques de performance.

3) Algorithmes
- Dijkstra : implémentation présente en Java (`backend/src/.../algorithme/Dijkstra.java`) et en JavaScript (`src/algorithmes/Dijkstra.js`) pour calculs côté serveur et démonstration côté client.
- Optimisation de tournée : algorithme heuristique (implémentation en Java et JS). Utilise la représentation `Graphe` et un `TasBinaire` pour certaines opérations.

4) Points d'intégration
- API REST : contrôleurs dans `backend/src/main/java/com/ruralnetwork/controleur/`.
- Persistance : dépôts dans `depot/` (vérifier configuration de la datasource dans `application.yml`).

5) Exigences et configuration
- Java 11+ (ou version requise par `pom.xml`).
- Maven pour builder et lancer le backend.
- Node.js 16+ / npm pour le frontend (Vite).

6) Tests et qualité
- Recommande d'ajouter :
  - Tests unitaires Java (JUnit) pour services et algorithmes.
  - Tests unitaires JS (Vitest / Jest) pour composants critiques et algorithmes.

7) Améliorations futures
- Ajouter Swagger/OpenAPI pour documenter l'API.
- Conteneuriser avec Docker + docker-compose pour faciliter déploiement local.
- Ajouter CI (GitHub Actions) pour build & tests automatiques.
