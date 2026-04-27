# Algorithmes utilisés

Ce document résume et explique, en termes simples et techniques, les principaux algorithmes et structures de données utilisés dans le projet.

## 1 — Dijkstra (plus court chemin)

- Objectif : calculer le chemin le plus court pondéré entre un nœud source et les autres nœuds d'un graphe orienté ou non orienté.
- Principe : exploration gloutonne des nœuds à distance croissante depuis la source ; on maintient une distance estimée minimale pour chaque nœud et on la met à jour en relaxant les arêtes.
- Complexité : O((V + E) log V) avec un tas (TasBinaire) pour extraire le nœud de distance minimale ; O(V^2) si on n'utilise pas de tas.
- Usage dans le projet :
  - Java : `backend/src/main/java/com/ruralnetwork/algorithme/Dijkstra.java`
  - JavaScript : `src/algorithmes/Dijkstra.js`
- Remarques pratiques :
  - Le graphe doit représenter les routes avec poids (distance/coût).
  - Utiliser un `TasBinaire` (heap) pour performances en grand graphe.
  - Pour chemins multiples (toutes-paires), considérer Floyd-Warshall ou exécuter Dijkstra depuis chaque source si graphe creux.

## 2 — Optimisation de tournée (heuristique)

- Objectif : construire ou améliorer une tournée (route passant par plusieurs villages) minimisant la distance totale ou un coût combiné.
- Approche générale (implémentation heuristique) :
  - Construction initiale : heuristique du plus proche voisin (nearest neighbor) ou insertion gloutonne.
  - Améliorations locales : opérations d'échange comme 2-opt / 3-opt pour réduire la longueur de la tournée en inversant segments.
- Complexité : dépend des heuristiques ; une passe 2-opt coûte O(n^2) pour n étapes, souvent itéré jusqu'à stabilisation.
- Usage dans le projet :
  - Java : `backend/src/main/java/com/ruralnetwork/algorithme/OptimisationTournee.java`
  - JavaScript : `src/algorithmes/OptimisationTournee.js`
- Remarques pratiques :
  - Méthodes exactes (TSP par programmation dynamique / branch-and-bound) deviennent impraticables rapidement ; les heuristiques donnent de bons résultats pratiques.
  - Évaluer la tournée avec métriques (distance totale, temps, coût) et contraintes (capacité, fenêtres horaires) selon besoin.

## 3 — Représentation du graphe

- Structure : généralement liste d'adjacence (pour chaque `Village`, une liste de `Route` sortantes avec poids).
- Avantage : économe en mémoire pour graphes creux et efficace pour parcours et relaxations d'arêtes.
- Fichiers :
  - Java : `backend/src/main/java/com/ruralnetwork/structure/Graphe.java`
  - JavaScript : `src/structures/Graphe.js`

## 4 — Tas binaire (TasBinaire)

- Rôle : fournir un extract-min efficace pour Dijkstra et autres opérations prioritaires.
- Propriétés : insertion O(log n), extraction min O(log n), mise à jour de clé O(log n) si supportée.
- Fichiers :
  - Java : `backend/src/main/java/com/ruralnetwork/structure/TasBinaire.java`
  - JavaScript : `src/structures/TasBinaire.js`

## 5 — Conseils d'implémentation et tests

- Valider les algorithmes sur petits graphes connus (graphes en anneau, grille, cas extrêmes) avant usage en production.
- Mesurer : distance totale, temps d'exécution, nombre d'itérations d'amélioration.
- Pour la production : ajouter des tests unitaires (JUnit pour Java, Vitest/Jest pour JS) et tests d'intégration couvrant flux API → calcul → persistance.

## 6 — Extensions possibles

- Ajouter contraintes de capacité (CVRP), fenêtres horaires (VRPTW), ou coûts multi-critères.
- Utiliser bibliothèques spécialisées (ex : jsprit, OR-Tools) pour versions optimisées/complexes.

## Références rapides
- Dijkstra, E. W. — algorithme classique des plus courts chemins.
- Heuristiques TSP : nearest neighbor, 2-opt, 3-opt.
- OR-Tools (Google) pour résolutions avancées de VRP/TSP.
