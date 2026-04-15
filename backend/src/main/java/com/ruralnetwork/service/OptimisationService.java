package com.ruralnetwork.service;

import com.ruralnetwork.algorithme.GreedyTourneeOptimization;
import com.ruralnetwork.depot.CamionDepot;
import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.OptimisationResultatDTO;
import com.ruralnetwork.dto.TourneeDTO;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service d'optimisation des tournées multi-camions.
 * Utilise l'algorithme greedy nearest-neighbor pour construire les tournées.
 */
@Service
public class OptimisationService {

    private static final Double COST_PER_KM = 0.15; // Ariary par km
    private static final String[] COLORS = {
        "#0ea5e9", "#f97316", "#a3e635", "#e879f9",
        "#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b"
    };

    private final VillageDepot villageDepot;
    private final RouteDepot routeDepot;
    private final CamionDepot camionDepot;

    public OptimisationService(VillageDepot villageDepot, RouteDepot routeDepot, CamionDepot camionDepot) {
        this.villageDepot = villageDepot;
        this.routeDepot = routeDepot;
        this.camionDepot = camionDepot;
    }

    /**
     * Optimise les tournées pour les camions disponibles.
     * Utilise l'algorithme GreedyTourneeOptimization du dossier algorithme/
     */
    public OptimisationResultatDTO optimiserTournees(String depotId, List<String> camionIds) {
        long startTime = System.currentTimeMillis();

        // Récupérer les villages et le dépôt
        List<Village> tousLesVillages = villageDepot.findAll();
        Village depot = villageDepot.findById(depotId).orElse(null);

        if (depot == null || tousLesVillages.isEmpty()) {
            return new OptimisationResultatDTO(new ArrayList<>(), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, new ArrayList<>(), 0L);
        }

        // Construire la matrice de distances
        Map<String, Map<String, Double>> matriceDistances = construireMatriceDistances(tousLesVillages);

        // Récupérer les camions
        List<Camion> camions = new ArrayList<>();
        for (String camionId : camionIds) {
            Camion c = camionDepot.findById(camionId).orElse(null);
            if (c != null && c.getEtat() == Camion.EtatCamion.DISPONIBLE) {
                camions.add(c);
            }
        }

        if (camions.isEmpty()) {
            return new OptimisationResultatDTO(new ArrayList<>(), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, new ArrayList<>(), 0L);
        }

        // Calculer la baseline (solution naïve: tous les villages en ordre)
        List<Village> villagesAVisiter = new ArrayList<>(tousLesVillages);
        villagesAVisiter.remove(depot);
        
        // Utiliser l'algorithme greedy pour calculer la baseline
        GreedyTourneeOptimization optimisationAlgorithme = new GreedyTourneeOptimization(matriceDistances);
        Double distanceBaseline = optimisationAlgorithme.calculerDistanceBaseline(depot, villagesAVisiter);
        Double coutBaseline = distanceBaseline * COST_PER_KM;

        // Appliquer l'algorithme greedy pour chaque camion
        Set<String> villagesVisites = new HashSet<>();
        villagesVisites.add(depot.getId());
        
        List<TourneeDTO> tournees = new ArrayList<>();
        Double distanceTotalKm = 0.0;
        Double coutTotal = 0.0;

        int colorIndex = 0;
        for (Camion camion : camions) {
            String couleur = colorIndex < COLORS.length ? COLORS[colorIndex] : COLORS[0];
            TourneeDTO tournee = optimisationAlgorithme.construireTournee(
                    camion, depot, villagesAVisiter, villagesVisites, couleur
            );
            tournees.add(tournee);
            distanceTotalKm += tournee.getDistanceTotalKm();
            coutTotal += tournee.getCoutTotal();
            colorIndex = (colorIndex + 1) % COLORS.length;
        }

        // Calculer les villages non desservis
        List<String> villagesNonDesservis = new ArrayList<>();
        for (Village v : villagesAVisiter) {
            if (!villagesVisites.contains(v.getId())) {
                villagesNonDesservis.add(v.getNom());
            }
        }

        // Calculer le gain
        Double gainPourcent = distanceBaseline > 0 ? ((distanceBaseline - distanceTotalKm) / distanceBaseline) * 100 : 0;
        Double economieTotal = coutBaseline - coutTotal;

        long dureeCalculMs = System.currentTimeMillis() - startTime;

        return new OptimisationResultatDTO(
            tournees, distanceTotalKm, coutTotal, distanceBaseline, coutBaseline,
            gainPourcent, economieTotal, villagesNonDesservis, dureeCalculMs
        );
    }

    /**
     * Construit une matrice de distances entre tous les villages.
     */
    private Map<String, Map<String, Double>> construireMatriceDistances(List<Village> villages) {
        Map<String, Map<String, Double>> matrice = new HashMap<>();

        for (Village v1 : villages) {
            Map<String, Double> lignes = new HashMap<>();
            for (Village v2 : villages) {
                if (v1.getId().equals(v2.getId())) {
                    lignes.put(v2.getId(), 0.0);
                } else {
                    // Chercher la route entre v1 et v2
                    Optional<Route> route = routeDepot.findBidirectionalRoute(v1.getId(), v2.getId());
                    Double distance = route.map(r -> r.getDistance() * r.getQualiteRoute().facteur).orElse(Double.MAX_VALUE);
                    lignes.put(v2.getId(), distance);
                }
            }
            matrice.put(v1.getId(), lignes);
        }

        return matrice;
    }
}
