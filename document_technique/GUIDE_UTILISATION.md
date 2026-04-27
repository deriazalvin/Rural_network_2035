# Guide d'utilisation

Ce guide explique comment utiliser l'application depuis l'interface utilisateur.

1. Lancer le backend et le frontend (voir `DEMARRAGE_RAPIDE.md`).
2. Ouvrir le navigateur sur l'adresse fournie par Vite (par défaut `http://localhost:5173`).
3. Authentification : utiliser le formulaire d'authentification (`AuthForm.jsx`) pour se connecter.
4. Navigation :
   - **Tableau de bord** : vue synthétique des performances, statistiques et accès rapide.
   - **Gestion Villages** : créer/éditer/supprimer des villages (coordonnées, nom).
   - **Gestion Routes** : définir des liaisons entre villages, distances et coûts.
   - **Optimisation Tournées** : définir une tournée et lancer l'optimisation ; visualisation des résultats.
   - **Assistant IA** : interface d'aide (si activée) pour suggestions d'optimisation.
5. Export / import : utiliser les endpoints backend ou scripts SQL pour charger/dump des jeux de données.

Conseils :
- Pour de meilleurs résultats d'optimisation, pré-remplir correctement les coordonnées et les distances.
- Consulter la console du navigateur et les logs du backend en cas d'erreur.
