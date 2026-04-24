package com.ruralnetwork.service;

import com.ruralnetwork.depot.CamionDepot;
import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.EtapeTourneeDTO;
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
        
        Double distanceBaseline = calculerDistanceBaseline(depot, villagesAVisiter, matriceDistances);
        Double coutBaseline = distanceBaseline * COST_PER_KM;

        // Appliquer l'algorithme greedy pour chaque camion
        Set<String> villagesVisites = new HashSet<>();
        villagesVisites.add(depot.getId());
        
        List<TourneeDTO> tournees = new ArrayList<>();
        Double distanceTotalKm = 0.0;
        Double coutTotal = 0.0;

        int colorIndex = 0;
        for (Camion camion : camions) {
            TourneeDTO tournee = construireTourneeGreedy(
                camion, depot, villagesAVisiter, villagesVisites, matriceDistances, colorIndex
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

    /**
     * Calcule la distance de la solution naïve (visite des villages dans l'ordre).
     */
    private Double calculerDistanceBaseline(Village depot, List<Village> villages,
                                           Map<String, Map<String, Double>> matrice) {
        Double distance = 0.0;
        Village current = depot;

        for (Village next : villages) {
            Double d = matrice.get(current.getId()).get(next.getId());
            if (d == null || d == Double.MAX_VALUE) d = 0.0;
            distance += d;
            current = next;
        }

        // Retour au dépôt
        Double d = matrice.get(current.getId()).get(depot.getId());
        if (d == null || d == Double.MAX_VALUE) d = 0.0;
        distance += d;

        return distance;
    }

    /**
     * Construit une tournée greedy pour un camion donné.
     */
    private TourneeDTO construireTourneeGreedy(
            Camion camion, Village depot, List<Village> villagesAVisiter,
            Set<String> villagesVisites, Map<String, Map<String, Double>> matrice, int colorIndex) {

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
                    Double dist = matrice.get(current.getId()).get(v.getId());
                    if (dist != null && dist < Double.MAX_VALUE && dist < minDistance) {
                        // Vérifier la capacité
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
        Double distanceRetour = matrice.get(current.getId()).get(depot.getId());
        if (distanceRetour == null || distanceRetour == Double.MAX_VALUE) distanceRetour = 0.0;
        distanceTotalKm += distanceRetour;

        Double coutTotal = distanceTotalKm * COST_PER_KM;

        String couleur = colorIndex < COLORS.length ? COLORS[colorIndex] : COLORS[0];

        return new TourneeDTO(
            camion.getId(), camion.getNom(), couleur,
            distanceTotalKm, chargeTotalKg, camion.getCapaciteKg(),
            coutTotal, etapes
        );
    }
}
