# Démarrage rapide

Instructions minimales pour exécuter l'application en local.

Prérequis :
- Java (11+), Maven
- Node.js (16+), npm

Étapes :

1) Lancer le backend

```bash
cd backend
mvn clean package
mvn spring-boot:run
```

Le backend écoute par défaut sur le port configuré dans `application.yml` (vérifier `src/main/resources/application.yml`).

2) Lancer le frontend

```bash
cd ..
npm install
npm run dev
```

Ouvrir `http://localhost:5173` (ou l'URL indiquée par Vite).

3) Charger les données de démonstration (optionnel)

Importer `insertion_donnees_demo.sql` dans la base de données configurée par le backend.

Notes :
- Si vous utilisez une base distante (Supabase ou autre), vérifier les variables et `application.yml`.
- Pour exécuter les tests (si ajoutés) :

Backend : `mvn test`
Frontend : `npm test` (si configuration de tests présente)
