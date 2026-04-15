package com.ruralnetwork.service.utilitaire;

import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Utilitaire pour calculer la matrice de distances entre tous les villages.
 * Responsabilité unique : construction de la matrice basée sur les routes et leur qualité.
 */
@Component
public class CalculatriceMatriceDistances {

    private final RouteDepot routeDepot;

    public CalculatriceMatriceDistances(RouteDepot routeDepot) {
        this.routeDepot = routeDepot;
    }

    /**
     * Construit une matrice de distances symétriques entre tous les villages.
     * 
     * @param villages Liste des villages
     * @return Matrice (villageId1 → (villageId2 → distance))
     */
    public Map<String, Map<String, Double>> construireMatrice(List<Village> villages) {
        Map<String, Map<String, Double>> matrice = new HashMap<>();

        for (Village v1 : villages) {
            Map<String, Double> lignes = new HashMap<>();
            for (Village v2 : villages) {
                if (v1.getId().equals(v2.getId())) {
                    lignes.put(v2.getId(), 0.0);
                } else {
                    Double distance = extraireDistanceEntreVillages(v1.getId(), v2.getId());
                    lignes.put(v2.getId(), distance);
                }
            }
            matrice.put(v1.getId(), lignes);
        }

        return matrice;
    }

    /**
     * Extrait la distance effective entre deux villages.
     * Applique le facteur de qualité de route si disponible.
     */
    private Double extraireDistanceEntreVillages(String villageId1, String villageId2) {
        Optional<Route> route = routeDepot.findBidirectionalRoute(villageId1, villageId2);
        
        if (route.isEmpty()) {
            return Double.MAX_VALUE;
        }
        
        Route r = route.get();
        Double distanceBase = r.getDistance();
        Double facteurQualite = r.getQualiteRoute().facteur;
        
        return distanceBase * facteurQualite;
    }
}
