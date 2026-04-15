package com.ruralnetwork.algorithme;

import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.dto.EtapeTourneeDTO;
import com.ruralnetwork.dto.TourneeDTO;

import java.util.*;

/**
 * Optimisation des tournées multi-camions utilisant un algorithme greedy nearest-neighbor.
 * Cet algorithme construit les tournées en sélectionnant toujours le village non visité
 * le plus proche, en respectant les contraintes de capacité.
 */
public class GreedyTourneeOptimization {

    private static final Double COST_PER_KM = 0.15; // Ariary par km
    private final Map<String, Map<String, Double>> matriceDistances;

    public GreedyTourneeOptimization(Map<String, Map<String, Double>> matriceDistances) {
        this.matriceDistances = matriceDistances;
    }

    /**
     * Construit une tournée greedy pour un camion donné.
     *
     * @param camion Camion pour lequel construire la tournée
     * @param depot Village de départ/retour
     * @param villagesAVisiter Liste des villages à visiter
     * @param villagesVisites Ensemble des villages déjà visités par d'autres camions
     * @param couleur Couleur pour l'affichage de la tournée
     * @return TourneeDTO représentant la tournée construite
     */
    public TourneeDTO construireTournee(
            Camion camion,
            Village depot,
            List<Village> villagesAVisiter,
            Set<String> villagesVisites,
            String couleur) {

        List<EtapeTourneeDTO> etapes = new ArrayList<>();
        Double distanceTotalKm = 0.0;
        Double chargeTotalKg = 0.0;

        Village current = depot;
        Set<String> visited = new HashSet<>(villagesVisites);

        while (true) {
            // Trouver le village non visité le plus proche
            Village nextVillage = null;
            Double minDistance = Double.MAX_VALUE;

            for (Village v : villagesAVisiter) {
                if (!visited.contains(v.getId())) {
                    Double dist = matriceDistances.get(current.getId()).get(v.getId());
                    if (dist != null && dist < Double.MAX_VALUE && dist < minDistance) {
                        // Vérifier la capacité du camion
                        if (chargeTotalKg + v.getProductionNonTransportee() <= camion.getCapaciteKg()) {
                            minDistance = dist;
                            nextVillage = v;
                        }
                    }
                }
            }

            if (nextVillage == null) break; // Aucun village accessible

            // Ajouter le village à la tournée
            distanceTotalKm += minDistance;
            chargeTotalKg += nextVillage.getProductionNonTransportee();

            EtapeTourneeDTO etape = new EtapeTourneeDTO(
                    nextVillage.getId(), nextVillage.getNom(),
                    nextVillage.getLatitude(), nextVillage.getLongitude(),
                    distanceTotalKm, chargeTotalKg, nextVillage.getProductionNonTransportee()
            );
            etapes.add(etape);

            visited.add(nextVillage.getId());
            villagesVisites.add(nextVillage.getId());
            current = nextVillage;
        }

        // Retour au dépôt
        Double distanceRetour = matriceDistances.get(current.getId()).get(depot.getId());
        if (distanceRetour == null || distanceRetour == Double.MAX_VALUE) distanceRetour = 0.0;
        distanceTotalKm += distanceRetour;

        Double coutTotal = distanceTotalKm * COST_PER_KM;

        return new TourneeDTO(
                camion.getId(), camion.getNom(), couleur,
                distanceTotalKm, chargeTotalKg, camion.getCapaciteKg(),
                coutTotal, etapes
        );
    }

    /**
     * Calcule la distance de la solution naïve (visite des villages dans l'ordre).
     *
     * @param depot Village de départ
     * @param villages Liste des villages à visiter
     * @return Distance totale de la tournée naïve
     */
    public Double calculerDistanceBaseline(Village depot, List<Village> villages) {
        Double distance = 0.0;
        Village current = depot;

        for (Village next : villages) {
            Double d = matriceDistances.get(current.getId()).get(next.getId());
            if (d == null || d == Double.MAX_VALUE) d = 0.0;
            distance += d;
            current = next;
        }

        // Retour au dépôt
        Double d = matriceDistances.get(current.getId()).get(depot.getId());
        if (d == null || d == Double.MAX_VALUE) d = 0.0;
        distance += d;

        return distance;
    }
}
