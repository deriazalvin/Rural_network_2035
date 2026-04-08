package com.ruralnetwork.algorithme;

import com.ruralnetwork.structure.Graphe;
import com.ruralnetwork.structure.TasBinaire;
import java.util.*;

/**
 * Algorithme de Dijkstra
 * Calcul du plus court chemin entre deux villages
 * Complexité: O(E log V) avec tas binaire
 */
public class Dijkstra {

    private final Graphe graphe;

    public Dijkstra(Graphe graphe) {
        this.graphe = graphe;
    }

    public static class ResultatChemin {
        private List<String> chemin;
        private Double distance;
        private Boolean accessible;

        public ResultatChemin() {
        }

        public ResultatChemin(List<String> chemin, Double distance, Boolean accessible) {
            this.chemin = chemin;
            this.distance = distance;
            this.accessible = accessible;
        }

        public List<String> getChemin() { return chemin; }
        public void setChemin(List<String> chemin) { this.chemin = chemin; }

        public Double getDistance() { return distance; }
        public void setDistance(Double distance) { this.distance = distance; }

        public Boolean getAccessible() { return accessible; }
        public void setAccessible(Boolean accessible) { this.accessible = accessible; }
    }

    public ResultatChemin calculerPlusCourtChemin(String villageDepart, String villageArrivee) {
        Map<String, Double> distances = new HashMap<>();
        Map<String, String> precedents = new HashMap<>();
        Set<String> visites = new HashSet<>();
        TasBinaire<String> tas = new TasBinaire<>();

        // Initialisation
        for (Graphe.VillageInfo village : graphe.obtenirTousLesVillages()) {
            distances.put(village.getId(), Double.MAX_VALUE);
            precedents.put(village.getId(), null);
        }

        distances.put(villageDepart, 0.0);
        tas.inserer(villageDepart, 0.0);

        while (!tas.estVide()) {
            String villageActuel = tas.extraireMin();

            if (visites.contains(villageActuel)) continue;
            visites.add(villageActuel);

            if (villageActuel.equals(villageArrivee)) break;

            List<Graphe.AretePonderee> voisins = graphe.obtenirVoisins(villageActuel);

            for (Graphe.AretePonderee voisin : voisins) {
                if (visites.contains(voisin.getDestination())) continue;

                Double nouvelleDistance = distances.get(villageActuel) + voisin.getPoids();

                if (nouvelleDistance < distances.get(voisin.getDestination())) {
                    distances.put(voisin.getDestination(), nouvelleDistance);
                    precedents.put(voisin.getDestination(), villageActuel);
                    tas.inserer(voisin.getDestination(), nouvelleDistance);
                }
            }
        }

        return reconstruireChemin(precedents, villageDepart, villageArrivee, distances);
    }

    private ResultatChemin reconstruireChemin(Map<String, String> precedents,
                                            String depart, String arrivee,
                                            Map<String, Double> distances) {
        List<String> chemin = new ArrayList<>();
        String actuel = arrivee;

        if (precedents.get(arrivee) == null && !depart.equals(arrivee)) {
            return new ResultatChemin(new ArrayList<>(), Double.POSITIVE_INFINITY, false);
        }

        while (actuel != null) {
            chemin.add(0, actuel);
            actuel = precedents.get(actuel);
        }

        return new ResultatChemin(chemin, distances.get(arrivee), true);
    }

    public Map<String, Object> calculerTousLesPlusCourtsChemins(String villageDepart) {
        Map<String, Double> distances = new HashMap<>();
        Map<String, String> precedents = new HashMap<>();
        Set<String> visites = new HashSet<>();
        TasBinaire<String> tas = new TasBinaire<>();

        for (Graphe.VillageInfo village : graphe.obtenirTousLesVillages()) {
            distances.put(village.getId(), Double.MAX_VALUE);
            precedents.put(village.getId(), null);
        }

        distances.put(villageDepart, 0.0);
        tas.inserer(villageDepart, 0.0);

        while (!tas.estVide()) {
            String villageActuel = tas.extraireMin();

            if (visites.contains(villageActuel)) continue;
            visites.add(villageActuel);

            List<Graphe.AretePonderee> voisins = graphe.obtenirVoisins(villageActuel);

            for (Graphe.AretePonderee voisin : voisins) {
                if (visites.contains(voisin.getDestination())) continue;

                Double nouvelleDistance = distances.get(villageActuel) + voisin.getPoids();

                if (nouvelleDistance < distances.get(voisin.getDestination())) {
                    distances.put(voisin.getDestination(), nouvelleDistance);
                    precedents.put(voisin.getDestination(), villageActuel);
                    tas.inserer(voisin.getDestination(), nouvelleDistance);
                }
            }
        }

        Map<String, Object> resultat = new HashMap<>();
        resultat.put("distances", distances);
        resultat.put("precedents", precedents);
        return resultat;
    }
}
