# Structure du projet

Résumé de l'arborescence et des responsabilités des principaux dossiers et fichiers.

- `backend/` : application Java (Spring Boot) gérée avec Maven.
  - `pom.xml` : configuration Maven.
  - `src/main/java/com/ruralnetwork/` : code source Java.
    - `algorithme/` : classes d'algorithmes (Dijkstra, OptimisationTournee).
    - `controleur/` : contrôleurs REST (RouteControleur, ...).
    - `depot/` : dépôts d'accès aux données (similaires à DAO).
    - `dto/` : objets de transfert (DTO).
    - `entite/` : modèles métier (Route, Village, Tournee, Utilisateur, Performance).
    - `service/` : logique métier et orchestration.
    - `structure/` : structures de données (Graphe, TasBinaire).
  - `src/main/resources/application.yml` : configuration de l'application (ports, datasource, etc.).

- `src/` : frontend React (Vite)
  - `App.jsx`, `main.jsx` : points d'entrée React.
  - `composants/` : composants UI (GestionRoutes.jsx, ...).
  - `algorithmes/`, `structures/` : implémentations JS des algorithmes et structures.
  - `services/` : interactions API / persistance (ServiceDonnees.js, supabase.js).
  - `Styles/` : snippets et templates CSS utilisés par l'application.

- Fichiers racine :
  - `index.html` : page d'accueil (frontend).
  - `insertion_donnees_demo.sql` : script d'initialisation de données.
  - `package.json`, `vite.config.js` : configuration frontend.

Notes :
- Le backend et frontend sont séparés — le backend expose une API REST utilisée par le frontend.
- Les algorithmes critiques (Dijkstra, optimisation de tournée) sont présents en Java et en JavaScript, permettant tests/visualisations côté client et calculs côté serveur.
