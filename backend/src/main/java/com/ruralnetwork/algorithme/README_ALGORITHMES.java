/**
 * GUIDE D'UTILISATION DE LA STRUCTURE PROFESSIONN algorithme/
 * 
 * ==============================================================================
 * 1. CRÉER UN NOUVEL ALGORITHME
 * ==============================================================================
 * 
 * Étapes :
 * 1. Créer une nouvelle classe dans backend/src/main/java/com/ruralnetwork/algorithme/
 * 2. Implémenter la logique de l'algorithme
 * 3. Apporter les interfaces publiques nécessaires
 * 4. Documenter les paramètres d'entrée et sortie
 * 
 * Exemple :
 * --------
 * public class MonAlgorithme {
 *     public MonAlgorithme(Map<String, Map<String, Double>> matriceDistances) {
 *         // initialisation
 *     }
 *     
 *     public MonResultat resoudre(String entree1, String entree2) {
 *         // implémentation
 *     }
 * }
 * 
 * ==============================================================================
 * 2. UTILISER UN ALGORITHME DANS UN SERVICE
 * ==============================================================================
 * 
 * Étapes :
 * 1. Importer l'algorithme : import com.ruralnetwork.algorithme.MonAlgorithme;
 * 2. Instancier dans la méthode du service
 * 3. Appeler les méthodes publiques
 * 4. Traiter les résultats
 * 
 * Exemple :
 * --------
 * public OptimisationResultatDTO optimiserTournees(...) {
 *     // Construire la matrice
 *     Map<String, Map<String, Double>> matrice = construireMatriceDistances(...);
 *     
 *     // Instancier l'algorithme
 *     GreedyTourneeOptimization algo = new GreedyTourneeOptimization(matrice);
 *     
 *     // Utiliser l'algorithme
 *     TourneeDTO tournee = algo.construireTournee(...);
 *     
 *     // Retourner le résultat
 *     return new OptimisationResultatDTO(...);
 * }
 * 
 * ==============================================================================
 * 3. STRUCTURE ATTENDUE POUR UN NOUVEL ALGORITHME
 * ==============================================================================
 * 
 * ✅ DO:
 * - Avoir une seule responsabilité (Single Responsibility Principle)
 * - Avoir des constructeurs qui initialisent les données nécessaires
 * - Avoir des méthodes publiques bien documentées
 * - Retourner des objets facilement exploitables
 * - Inclure des commentaires expliquant la logique
 * 
 * ❌ DON'T:
 * - Ne pas faire d'accès à la base de données directement
 * - Ne pas créer des SpringBeans pour les algorithmes
 * - Ne pas mélanger la logique métier avec l'algorithme
 * - Ne pas avoir des dépendances externes non nécessaires
 * 
 * ==============================================================================
 * 4. TESTS
 * ==============================================================================
 * 
 * Créer des tests unitaires pour chaque algorithme :
 * 
 * Lieu : backend/src/test/java/com/ruralnetwork/algorithme/
 * 
 * Exemple de test :
 * ----------------
 * @Test
 * public void testDijkstra() {
 *     Map<String, Map<String, Double>> matriceDistances = ...;
 *     Dijkstra dijkstra = new Dijkstra(matriceDistances);
 *     
 *     Dijkstra.ResultatChemin resultat = dijkstra.calculerPlusCourtChemin("A", "B");
 *     
 *     assertEquals(5.0, resultat.getDistance());
 *     assertTrue(resultat.getChemin().contains("A"));
 *     assertTrue(resultat.getChemin().contains("B"));
 * }
 * 
 * ==============================================================================
 * 5. AJOUT D'UN NOUVEL ALGORITHME - CHECKLIST
 * ==============================================================================
 * 
 * [ ] Algorithme créé dans /algorithme/
 * [ ] Logique implémentée et testée
 * [ ] Commentaires JavaDoc ajoutés
 * [ ] Utilisé dans le service côté
 * [ ] Teste unitaires créé
 * [ ] Build réussi : mvn clean compile
 * [ ] Code généré sans erreurs
 * [ ] Documentation mise à jour
 * 
 * ==============================================================================
 */
