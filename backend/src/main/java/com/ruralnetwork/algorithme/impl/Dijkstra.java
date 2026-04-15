package com.ruralnetwork.algorithme.impl;

import com.ruralnetwork.algorithme.interfaces.IAlgorithmeGraphe;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Implémentation de l'algorithme Dijkstra pour trouver le plus court chemin.
 * Respecte l'interface IAlgorithmeGraphe.
 */
@Component
public class Dijkstra implements IAlgorithmeGraphe {

    private final Map<String, Map<String, Double>> matriceDistances;

    public Dijkstra(Map<String, Map<String, Double>> matriceDistances) {
        this.matriceDistances = matriceDistances;
    }

    @Override
    public ResultatChemin calculerShortestPath(String depart, String destination) {
        if (depart.equals(destination)) {
            return new ResultatChemin(0.0, Arrays.asList(depart));
        }

        Map<String, Double> distances = new HashMap<>();
        Map<String, String> precedents = new HashMap<>();
        PriorityQueue<NoeudDistant> queue = new PriorityQueue<>(Comparator.comparingDouble(n -> n.distance));

        // Initialiser les distances
        for (String noeud : matriceDistances.keySet()) {
            distances.put(noeud, Double.MAX_VALUE);
        }
        distances.put(depart, 0.0);
        queue.add(new NoeudDistant(depart, 0.0));

        Set<String> traites = new HashSet<>();

        while (!queue.isEmpty()) {
            NoeudDistant actuel = queue.poll();

            if (traites.contains(actuel.noeud)) continue;
            traites.add(actuel.noeud);

            if (actuel.noeud.equals(destination)) break;

            Map<String, Double> voisins = matriceDistances.get(actuel.noeud);
            if (voisins == null) continue;

            for (Map.Entry<String, Double> entree : voisins.entrySet()) {
                String voisin = entree.getKey();
                Double poids = entree.getValue();

                if (traites.contains(voisin) || poids == null || poids.equals(Double.MAX_VALUE)) {
                    continue;
                }

                Double nouvelleDistance = distances.get(actuel.noeud) + poids;

                if (nouvelleDistance < distances.get(voisin)) {
                    distances.put(voisin, nouvelleDistance);
                    precedents.put(voisin, actuel.noeud);
                    queue.add(new NoeudDistant(voisin, nouvelleDistance));
                }
            }
        }

        Double distanceFinal = distances.get(destination);
        if (distanceFinal.equals(Double.MAX_VALUE)) {
            return new ResultatChemin(Double.MAX_VALUE, new ArrayList<>());
        }

        // Reconstruire le chemin
        List<String> chemin = new ArrayList<>();
        String courant = destination;
        while (courant != null) {
            chemin.add(0, courant);
            courant = precedents.get(courant);
        }

        return new ResultatChemin(distanceFinal, chemin);
    }

    /**
     * Classe interne pour représenter un nœud avec sa distance du point de départ.
     */
    private static class NoeudDistant {
        String noeud;
        Double distance;

        NoeudDistant(String noeud, Double distance) {
            this.noeud = noeud;
            this.distance = distance;
        }
    }
}
