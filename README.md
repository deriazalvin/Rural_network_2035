# Rural Network 2035

Application de **gestion logistique agricole** destinée aux gestionnaires de réseaux de collecte à Madagascar. Elle permet de gérer villages, routes, camions, d'optimiser les tournées de collecte et de suivre les performances.

## 📋 Table des matières
- [Architecture générale](#architecture-générale)
- [Installation](#installation-)
- [Configuration](#configuration-)
- [Déploiement local](#déploiement-local-)
- [API REST](#api-rest)
- [Diagrammes UML](#diagrammes-uml-disponibles)
- [Troubleshooting](#troubleshooting-)
- [Documentation complète](./DOCUMENTATION_AUDIT.md)

---

## Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                   frontend-web (React / Vite)               │
│  Landing page │ Dashboard │ Gestion │ Optimisation │ Météo  │
└──────────────────────┬──────────────────────────────────────┘
                       │ appels API (REST/JSON)
┌──────────────────────v──────────────────────────────────────┐
│              backend (Spring Boot / Java 21)                 │
│  Contrôleurs → Services → Algorithmes → Dépôts (JPA)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          v            v            v
      ┌────────┐ ┌──────────┐ ┌────────┐
      │ MySQL  │ │ OSRM API │ │ Open  │
      │  (BDD) │ │(routes)  │ │Weather│
      └────────┘ └──────────┘ └────────┘

┌─────────────────────────────────────────────────────────────┐
│              rural-network-mobile (Expo / React Native)      │
│  Tabs : Dashboard │ Villages │ Optimisation │ Météo │ Chat  │
└─────────────────────────────────────────────────────────────┘
```

### Modules

| Module | Technologie | Description |
|--------|------------|-------------|
| **backend** | Java 21, Spring Boot 3.4, Maven | API REST, algorithmes d'optimisation, météo, assistant IA |
| **frontend-web** | React 18, Vite, Tailwind CSS | Application web桌面 (SPA à onglets) |
| **rural-network-mobile** | Expo, React Native, TypeScript | Application mobile iOS/Android |

---

## Backend (`backend/`)

### Structure des packages

```
com.ruralnetwork
├── algorithme/
│   ├── impl/
│   │   └── OptimisationTourneeGreedy.java    # Algorithme glouton Nearest-Neighbor
│   └── interfaces/
│       └── IAlgorithmeOptimisation.java      # Interface d'optimisation
├── config/
│   ├── ApplicationBeans.java                 # Beans Spring (RestTemplate)
│   ├── CorsConfig.java                       # Configuration CORS
│   └── SecurityConfig.java                   # Sécurité JWT
├── controleur/
│   ├── AssistantControleur.java              # Chatbot IA
│   ├── AuthControleur.java                   # Inscription / Connexion
│   ├── CamionControleur.java                 # CRUD camions
│   ├── OptimisationControleur.java           # Lancement optimisation
│   ├── RouteControleur.java                  # CRUD routes
│   └── VillageControleur.java                # CRUD villages
├── depot/                                    # Repositories JPA
│   ├── CamionDepot.java
│   ├── OptimisationHistoriqueDepot.java
│   ├── RouteDepot.java
│   └── VillageDepot.java
├── dto/                                      # Data Transfer Objects
│   ├── mapper/
│   ├── request/
│   └── response/
├── entite/                                   # Entités JPA
│   ├── Camion.java
│   ├── OptimisationHistorique.java
│   ├── Route.java
│   ├── Tournee.java
│   ├── Utilisateur.java
│   └── Village.java
├── exception/
├── service/
│   ├── assistant/ServiceAssistant.java       # Connexion Gemini AI
│   ├── meteo/ServiceMeteo.java               # Appel API OpenWeather
│   ├── orchestration/OrchestrateurOptimisation.java
│   └── utilitaire/
├── structure/
│   └── Graphe.java                           # Graphe (noeuds + arêtes)
└── util/
```

### Entités principales

| Entité | Rôle |
|--------|------|
| **Utilisateur** | Compte gestionnaire (email, mot de passe, token JWT) |
| **Village** | Point de collecte (nom, coordonnées GPS, production kg) |
| **Route** | Liaison entre 2 villages (distance, qualité, état bloqué) |
| **Camion** | Véhicule de collecte (capacité kg, état, couleur) |
| **Tournee** | Résultat d'optimisation pour un camion (itinéraire JSON) |
| **Performance** | Comparaison naïf vs optimisé (gain %, économie) |
| **OptimisationHistorique** | Sauvegarde des résultats passés |

### API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET/POST/PUT/DELETE | `/api/villages` | CRUD villages |
| GET/POST/PUT/DELETE | `/api/routes` | CRUD routes |
| GET/POST/PUT/DELETE | `/api/camions` | CRUD camions |
| POST | `/api/optimisations/multi-camions` | Lancer optimisation |
| GET | `/api/optimisations/historique` | Historique |
| DELETE | `/api/optimisations/historique/{id}` | Supprimer historique |
| GET | `/api/meteo?lat=&lon=` | Météo d'un village |
| POST | `/assistant/poser` | Assistant IA |

---

## Frontend Web (`frontend-web/`)

### Stack technique
- **React 18** avec hooks
- **Vite** pour le build
- **Tailwind CSS** + CSS personnalisé
- **Lucide React** pour les icônes
- **Chart.js / Recharts** pour les graphiques
- **Leaflet** pour les cartes

### Structure des composants

```
src/
├── composants/
│   ├── pages/              # Vues principales
│   │   ├── LandingPage.jsx       # Page d'accueil marketing
│   │   ├── GestionVillages.jsx   # CRUD villages
│   │   ├── GestionRoutes.jsx     # CRUD routes
│   │   ├── GestionCamions.jsx    # CRUD camions
│   │   ├── OptimisationTournees.jsx  # Optimisation
│   │   └── VueMeteo.jsx          # Météo
│   ├── dashboard/          # Tableau de bord
│   ├── common/             # Composants réutilisables
│   ├── landing/            # Section landing page (~18 composants)
│   └── assistant/          # Chatbot IA
├── contexts/
│   └── ThemeContext.jsx     # Thème clair/sombre
├── hooks/
│   ├── useOptimizationIntegration.js
│   ├── useOptimizationStorage.js
│   └── useCounterAnimation.js
├── services/
│   ├── ServiceDonnees.js           # API principale
│   └── api/ServiceApiOptimisation.js # API optimisation
├── styles/                 # CSS (globals, pages, darkmode)
└── utils/
    └── stockageLocal.js    # localStorage avec clés par utilisateur
```

### Routage
Navigation par onglets gérée manuellement (pas de React Router) via `ongletActif` dans `App.jsx`. Événements DOM personnalisés (`rn-navigate`, `rn-open-auth`).

---

## Application Mobile (`rural-network-mobile/`)

### Stack technique
- **Expo** (managed workflow)
- **React Native** avec TypeScript
- **Expo Router** pour la navigation (tabs)
- **react-native-reanimated** pour les animations
- **lucide-react-native** pour les icônes

### Structure

```
app/                          # Expo Router (file-based routing)
├── (tabs)/
│   ├── _layout.tsx           # Configuration des tabs
│   ├── index.tsx             # Dashboard
│   ├── villages.tsx          # Gestion villages
│   ├── optimisation.tsx      # Optimisation
│   └── meteo.tsx             # Météo
├── _layout.tsx               # Root layout
├── accueil.tsx               # Écran d'accueil auth
└── auth.tsx                  # Connexion / Inscription

src/
├── composants/               # Composants réutilisables
│   ├── AssistantChat.tsx     # Chatbot IA
│   ├── Carte.tsx             # Composant carte
│   └── ...                   # Autres composants
├── contextes/
│   ├── ContexteAuth.tsx      # Authentification
│   ├── ContexteTheme.tsx     # Thème clair/sombre
│   └── ContexteDonnees.tsx   # Données centralisées
├── services/
│   └── ServiceDonnees.ts     # API service (TypeScript)
└── styles/
    └── couleurs.ts           # Constantes de style
```

---

## Services externes

| Service | Rôle | Clé requise |
|---------|------|-------------|
| **Google Gemini AI** | Assistant chatbot | Oui (`gemini.api.key`) |
| **OpenWeatherMap** | Météo des villages | Oui (`meteo.api.key`) |
| **OSRM** | Calcul distances routières | Non (serveur dédié) |
| **Supabase** | Authentification web | Oui (frontend-web/.env) |

---

## Fonctionnalités principales

### 1. Gestion des données
- Création, modification, suppression de **villages** (avec carte interactive)
- Création, modification, suppression de **routes** (entre villages)
- Gestion des **camions** (capacité, état, couleur)

### 2. Optimisation des tournées
- Sélection d'un dépôt et de plusieurs camions
- Algorithme **glouton Nearest-Neighbor** optimisé avec **Dijkstra** (tas binaire)
- Matrice de distances via OSRM
- Comparaison naïf vs optimisé avec gain en pourcentage
- Sauvegarde dans l'historique (les 50 dernières)

### 3. Assistant IA (Gemini)
- Chatbot intégré aux deux frontends
- Contexte enrichi avec les données de l'utilisateur (villages, routes, camions, météo)
- Réponses en français, sans formatage markdown

### 4. Météo
- Affichage des conditions météo par village
- Température, description, vitesse du vent

### 5. Tableau de bord
- Graphiques d'évolution des gains
- Visualisation réseau des villages et routes
- Statistiques globales

---

## Diagrammes UML disponibles

Les diagrammes sont dans le dossier `UML/` au format `.drawio` (à ouvrir avec [draw.io](https://app.diagrams.net/)).

| Fichier | Type | Description |
|---------|------|-------------|
| `classe.drawio` | Diagramme de classes | Entités, interfaces, algorithmes, relations |
| `Use_case.drawio` | Diagramme de cas d'utilisation | Acteur Gestionnaire + 9 cas d'utilisation + OSRM |
| `sequance.drawio` | Diagramme de séquence | Flux d'optimisation étape par étape |

### Diagrammes recommandés à créer

| Diagramme | Utilité |
|-----------|---------|
| **Paquetage** | Architecture des modules (frontend-web, backend, mobile, services externes) |
| **Activité** | Flux logique complet de l'optimisation (de la sélection à l'affichage) |
| **Déploiement** | Infrastructure physique (serveur, BDD, clients web/mobile, API externes) |
| **Composants** | Interfaces entre les couches backend (contrôleur → service → dépôt) |
| **Communication** | Interactions entre objets lors de l'optimisation (variante du séquence) |

---

## Configuration

### Backend (`backend/src/main/resources/application.yml`)
```yaml
spring.datasource.url: jdbc:mysql://localhost:3306/rural_network
gemini.api.key: votre-clé-gemini
meteo.api.key: votre-clé-meteo
osrm.api.url: http://votre-serveur-osrm:5000
```

### Frontend Web (`frontend-web/.env`)
```
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-clé-supabase
```

### Mobile (`rural-network-mobile/.env.local`)
```
API_HOST=http://192.168.x.x
API_PORT=8080
```

---

## Déploiement local

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend web
cd frontend-web
npm install
npm run dev

# Mobile
cd rural-network-mobile
npm install
npx expo start
```

---

## Installation 🔧

### Prérequis
- **Node.js** 18+ (`node --version`)
- **Java 21+** (`java --version`)
- **Maven 3.9+** (`mvn --version`)
- **MySQL 8.0+** (`mysql --version`)
- **Git** (`git --version`)

### 1️⃣ Backend Setup

```bash
# Clone et préparation
cd backend

# Configuration MySQL
mysql -u root -p
CREATE DATABASE rural_network;
CREATE USER 'rural'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON rural_network.* TO 'rural'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Compilation Maven
mvn clean install

# Lancement
./start-backend.sh
# ou
mvn spring-boot:run
```

**Port:** http://localhost:8080/api

### 2️⃣ Frontend Web Setup

```bash
cd frontend-web

# Installation dépendances
npm install

# Lancement dev server
npm run dev

# Build production
npm run build
```

**Port:** http://localhost:5174

### 3️⃣ Mobile App Setup

```bash
cd rural-network-mobile

# Installation dépendances
npm install
npx expo install

# Lancement
npx expo start

# Scan QR code avec Expo Go app
```

---

## Configuration 🔐

### Backend Environment (`backend/src/main/resources/application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rural_network
    username: rural
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

# Services externes
gemini:
  api:
    key: ${GEMINI_API_KEY:sk-xxx}
    model: gemini-pro

meteo:
  api:
    key: ${WEATHER_API_KEY:xxx}
    url: https://api.openweathermap.org

osrm:
  api:
    url: http://router.project-osrm.org
    timeout: 30000

# JWT
jwt:
  secret: ${JWT_SECRET:your-secret-key-here}
  expiration: 86400000  # 24h
```

### Frontend Web (`frontend-web/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Rural Network 2035
VITE_APP_VERSION=1.0.0
```

### Mobile App (`rural-network-mobile/.env`)

```env
API_HOST=http://192.168.1.100
API_PORT=8080
API_PROTOCOL=http
```

---

## API REST Endpoints

### Authentification
```
POST   /api/auth/register          # Inscription
POST   /api/auth/login             # Connexion
POST   /api/auth/logout            # Déconnexion
GET    /api/auth/me                # Profil utilisateur
```

### Villages
```
GET    /api/villages               # Liste tous les villages
POST   /api/villages               # Créer un village
GET    /api/villages/{id}          # Détails village
PUT    /api/villages/{id}          # Modifier village
DELETE /api/villages/{id}          # Supprimer village
```

### Routes
```
GET    /api/routes                 # Liste toutes les routes
POST   /api/routes                 # Créer une route
PUT    /api/routes/{id}            # Modifier route
DELETE /api/routes/{id}            # Supprimer route
```

### Camions
```
GET    /api/camions                # Liste tous les camions
POST   /api/camions                # Créer un camion
PUT    /api/camions/{id}           # Modifier camion
DELETE /api/camions/{id}           # Supprimer camion
```

### Optimisation
```
POST   /api/optimisations/multi-camions  # Lancer optimisation
GET    /api/optimisations/historique     # Historique optimisations
DELETE /api/optimisations/historique/{id} # Supprimer historique
```

### Services externes
```
GET    /api/meteo?lat=&lon=        # Météo d'une localisation
POST   /api/assistant/poser        # Question au chatbot IA
```

---

## Troubleshooting 🐛

### ❌ Erreur: `Connection refused localhost:8080`
**Cause:** Backend n'est pas lancé  
**Solution:**
```bash
cd backend
./start-backend.sh
# Attendre "Tomcat started on port 8080"
```

### ❌ Erreur: `MySQL connection failed`
**Cause:** MySQL n'est pas accessible  
**Solution:**
```bash
# Vérifier MySQL est lancé
sudo service mysql status
# Démarrer si nécessaire
sudo service mysql start
# Vérifier credentials dans application.yml
```

### ❌ Erreur: `CORS policy: Access to XMLHttpRequest blocked`
**Cause:** CORS mal configuré  
**Solution:** Vérifier `CorsConfig.java` - les origins doivent inclure votre frontend URL

### ❌ Erreur: `npm ERR! 404 Not Found`
**Cause:** Version node incompatible  
**Solution:**
```bash
# Vérifier version
node --version  # Doit être 18+
# Nettoyer cache npm
npm cache clean --force
npm install
```

### ❌ Erreur: `Algo optimisation très lent`
**Cause:** Trop de villages ou routes  
**Solution:** 
- Limiter à max 50 villages
- Vérifier OSRM API répond rapidement
- Augmenter timeout dans `application.yml` (osrm.api.timeout)

### ❌ Feature de dark mode ne fonctionne pas
**Cause:** ThemeContext non intégré  
**Solution:** Vérifier que `main.jsx` a `<ThemeProvider>`

---

## Performance Tips 🚀

| Optimization | Détail |
|--------------|--------|
| **Frontend Caching** | localStorage persiste les thèmes, authentification |
| **API Response Caching** | Redis pour optimisations calculées (recommandé en prod) |
| **Lazy Loading** | Charger images/composants à la demande |
| **Algorithm Tuning** | Greedy suffit pour < 100 villages |
| **Database Indexes** | Créer index sur village.utilisateurId, route.villageDepart |

---

## Sécurité 🔒

### JWT Authentication
- Tokens sauvegardés en localStorage (exposé aux XSS)
- **Recommandation:** Utiliser httpOnly cookies en production
- Expiration: 24h (configurable)

### API Security
- CORS restrictif (origine blanchelist)
- Input validation sur tous les endpoints
- SQL injection protection (JPA parameterized queries)
- Rate limiting recommandé

### Environment Variables
- **JAMAIS** commiter `.env` ou `application-prod.yml`
- Utiliser `.env.example` comme template
- Variables requises listées dans `.env.example`

---

## Nouvelles Features 🎉

### v1.0.0 (Mai 2026)
✅ Mode sombre (Dark Mode)  
✅ Logo RN animé  
✅ UI Components modulaires (9 composants)  
✅ Assistant IA Gemini intégré  
✅ Optimisation multi-algorithmes  
✅ Dashboard analytique  

### v1.1.0 (À venir)
🔲 Géolocalisation GPS temps réel  
🔲 Notifications push  
🔲 Export PDF/Excel rapports  
🔲 Intégration Paiement (Orange Money, Airtel Money)  
🔲 Offline mode mobile  

---

## Documentation Additionnelle

- 📘 [Audit Documentation Complet](./DOCUMENTATION_AUDIT.md)
- 📊 [Diagrammes UML](./UML/)
- 🔌 [API Documentation](./docs/API_DOCUMENTATION.md) (À créer)
- 🗄️ [Database Schema](./docs/DATABASE_SCHEMA.md) (À créer)
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md) (À créer)

---

## Support & Contact

- **Issues:** Créer une issue sur GitHub
- **Discussions:** Utiliser onglet Discussions
- **Email:** contact@ruralnetwork.mg

---

## License

MIT License - Voir `LICENSE` pour détails

**Auteurs:** Équipe L2 SIO - ESMIA Madagascar  
**Dernière mise à jour:** 23 Mai 2026

