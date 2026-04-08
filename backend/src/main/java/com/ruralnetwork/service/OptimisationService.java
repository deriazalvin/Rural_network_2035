package com.ruralnetwork.service;

import com.ruralnetwork.algorithme.Dijkstra;
import com.ruralnetwork.algorithme.OptimisationTournee;
import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.OptimisationDTO;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.structure.Graphe;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OptimisationService {

    private final VillageDepot villageDepot;
    private final RouteDepot routeDepot;

    public OptimisationService(VillageDepot villageDepot, RouteDepot routeDepot) {
        this.villageDepot = villageDepot;
        this.routeDepot = routeDepot;
    }

    public Map<String, Object> optimiser(OptimisationDTO dto) {
        // Construire le graphe
        Graphe graphe = new Graphe();

        List<Village> villages = villageDepot.findAll();
        for (Village village : villages) {
            Graphe.VillageInfo info = new Graphe.VillageInfo(
                village.getId(),
                village.getNom(),
                village.getLatitude(),
                village.getLongitude(),
                village.getVolumeProduction()
            );
            graphe.ajouterVillage(village.getId(), info);
        }

        List<Route> routes = routeDepot.findAll();
        for (Route route : routes) {
            graphe.ajouterRoute(
                route.getVillageDepart().getId(),
                route.getVillageArrivee().getId(),
                route.getDistance(),
                route.getQualiteRoute().name(),
                route.getEstBloquee()
            );
        }

        // Calculer les optimisations
        Dijkstra dijkstra = new Dijkstra(graphe);
        OptimisationTournee optimiseur = new OptimisationTournee(graphe, dijkstra);

        OptimisationTournee.ComparaisonSolutions comparaison = optimiseur.comparerSolutions(
            dto.getVillageDepart(),
            dto.getVillagesAVisiter(),
            dto.getCapaciteCamion()
        );

        Map<String, Object> resultat = new HashMap<>();
        resultat.put("naive", convertTourneeToMap(comparaison.getNaive()));
        resultat.put("optimisee", convertTourneeToMap(comparaison.getOptimisee()));
        resultat.put("reductionPourcentage", comparaison.getReductionPourcentage());
        resultat.put("economieCarburant", comparaison.getEconomieCarburant());
        resultat.put("economieDistance", comparaison.getEconomieDistance());

        return resultat;
    }

    private Map<String, Object> convertTourneeToMap(OptimisationTournee.ResultatTournee tournee) {
        Map<String, Object> map = new HashMap<>();
        map.put("itineraire", tournee.getItineraire());
        map.put("distanceTotale", tournee.getDistanceTotale());
        map.put("chargeFinale", tournee.getChargeFinale());
        map.put("type", tournee.getType());
        return map;
    }
}
