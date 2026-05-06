package com.ruralnetwork.algorithme.impl;

import com.ruralnetwork.algorithme.interfaces.IAlgorithmeOptimisation;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.dto.EtapeTourneeDTO;
import com.ruralnetwork.dto.TourneeDTO;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Implémentation Greedy-Nearest-Neighbor pour l'optimisation de tournées.
 * Sélectionne toujours le village non visité le plus proche.
 * Respecte les contraintes de capacité des camions.
 */
@Component
public class OptimisationTourneeGreedy implements IAlgorithmeOptimisation {

    private static final Double COUT_PAR_KM = 0.15; // Ariary par km

    public OptimisationTourneeGreedy() {
        // Pas d'injection de matriceDistances - elle est passée en paramètre
    }

    @Override
    public TourneeDTO construireTourneeOptimisee(
            Camion camion,
            Village depot,
            List<Village> villagesDisponibles,
            Set<String> villagesVisites,
            String couleur,
            Map<String, Map<String, Double>> matriceDistances) {

        List<EtapeTourneeDTO> etapes = new ArrayList<>();
        Double distanceTotalKm = 0.0;
        Double chargeTotalKg = 0.0;

        Village courant = depot;
        Set<String> visites = new HashSet<>(villagesVisites);

        while (true) {
            // Trouver le village non visité le plus proche accessible
            Village villageProche = null;
            Double distanceProche = Double.MAX_VALUE;

            for (Village v : villagesDisponibles) {
                if (!visites.contains(v.getId())) {
                    Double dist = obtenirDistance(courant.getId(), v.getId(), matriceDistances);
                    
                    if (dist != null && dist < Double.MAX_VALUE && dist < distanceProche) {
                        // Vérifier si on ne dépasse pas la capacité
                        if (chargeTotalKg + v.getProductionNonTransportee() <= camion.getCapaciteKg()) {
                            distanceProche = dist;
                            villageProche = v;
                        }
                    }
                }
            }

            if (villageProche == null) break; // Aucun village accessible

            // Ajouter le village à la tournée
            distanceTotalKm += distanceProche;
            chargeTotalKg += villageProche.getProductionNonTransportee();

            EtapeTourneeDTO etape = new EtapeTourneeDTO(
                    villageProche.getId(), villageProche.getNom(),
                    villageProche.getLatitude(), villageProche.getLongitude(),
                    distanceTotalKm, chargeTotalKg, villageProche.getProductionNonTransportee()
            );
            etapes.add(etape);

            visites.add(villageProche.getId());
            villagesVisites.add(villageProche.getId());
            courant = villageProche;
        }

        // Retour au dépôt
        Double distanceRetour = obtenirDistance(courant.getId(), depot.getId(), matriceDistances);
        if (distanceRetour == null || distanceRetour == Double.MAX_VALUE) {
            distanceRetour = 0.0;
        }
        distanceTotalKm += distanceRetour;

        Double coutTotal = distanceTotalKm * COUT_PAR_KM;

        return new TourneeDTO(
                camion.getId(), camion.getNom(), couleur,
                distanceTotalKm, chargeTotalKg, camion.getCapaciteKg(),
                coutTotal, etapes
        );
    }

    @Override
    public Double calculerDistanceReferenceNaive(Village depot, List<Village> villages, Map<String, Map<String, Double>> matriceDistances) {
        Double distance = 0.0;
        Village courant = depot;

        for (Village suivant : villages) {
            Double d = obtenirDistance(courant.getId(), suivant.getId(), matriceDistances);
            if (d == null || d == Double.MAX_VALUE) {
                d = 0.0;
            }
            distance += d;
            courant = suivant;
        }

        // Retour au dépôt
        Double d = obtenirDistance(courant.getId(), depot.getId(), matriceDistances);
        if (d == null || d == Double.MAX_VALUE) {
            d = 0.0;
        }
        distance += d;

        return distance;
    }

    private Double obtenirDistance(String id1, String id2, Map<String, Map<String, Double>> matriceDistances) {
        if (id1 == null || id2 == null || matriceDistances == null) {
            return Double.MAX_VALUE;
        }
        Map<String, Double> ligne = matriceDistances.get(id1);
        if (ligne == null) {
            return Double.MAX_VALUE;
        }
        return ligne.getOrDefault(id2, Double.MAX_VALUE);
    }
}
