package com.ruralnetwork.algorithme.interfaces;

import java.util.Map;

/**
 * Interface pour les algorithmes travaillant sur des graphes pondérés.
 * Toute implémentation doit fournir des opérations basiques sur un graphe.
 */
public interface IAlgorithmeGraphe {
    
    /**
     * Calcule le plus court chemin entre deux nœuds.
     * 
     * @param depart ID du nœud source
     * @param destination ID du nœud cible
     * @return Distance et chemin calculés
     */
    ResultatChemin calculerShortestPath(String depart, String destination);
    
    /**
     * Représente le résultat d'un calcul de chemin.
     */
    class ResultatChemin {
        private final Double distance;
        private final java.util.List<String> chemin;
        
        public ResultatChemin(Double distance, java.util.List<String> chemin) {
            this.distance = distance;
            this.chemin = chemin;
        }
        
        public Double getDistance() { return distance; }
        public java.util.List<String> getChemin() { return chemin; }
    }
}
