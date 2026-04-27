# Réalisation

Ce document résume ce qui a été réalisé dans le projet à ce stade.

- Frontend :
  - Application React construite avec Vite.
  - Composants principaux : `GestionRoutes`, `GestionVillages`, `OptimisationTournees`, `TableauBord`.
  - Intégration d'un service de données (`ServiceDonnees.js`) et d'un client Supabase (`supabase.js`).
  - Implémentations JavaScript des algorithmes (Dijkstra, OptimisationTournee) pour visualisation et tests côté client.

- Backend :
  - Application Spring Boot (Maven) structurée par packages (`controleur`, `service`, `depot`, `entite`, `dto`, `algorithme`, `structure`).
  - Endpoints REST exposés par les contrôleurs (authentification, gestion des villages, routes, optimisations, assistant IA).
  - Modèles métiers (Route, Village, Tournee, Utilisateur, Performance) et dépôts pour persistance.
  - Implémentation Java des algorithmes de routage et d'optimisation (Dijkstra et routine d'optimisation de tournée).

- Données et scripts :
  - `insertion_donnees_demo.sql` : script d'initialisation avec jeux de données de démonstration.

Limites / points à compléter :
- Tests automatisés : peu ou pas de tests visibles (unitaires/intégration) dans le repo fourni.
- Documentation d'API détaillée (ex: OpenAPI/Swagger) non présente.
- Configuration de déploiement (Docker, CI/CD) non fournie.
