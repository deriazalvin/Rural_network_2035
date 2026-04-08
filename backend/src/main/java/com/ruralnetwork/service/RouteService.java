package com.ruralnetwork.service;

import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.RouteDTO;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteDepot routeDepot;
    private final VillageDepot villageDepot;

    public RouteService(RouteDepot routeDepot, VillageDepot villageDepot) {
        this.routeDepot = routeDepot;
        this.villageDepot = villageDepot;
    }

    public RouteDTO ajouterRoute(RouteDTO dto) {
        Village depart = villageDepot.findById(dto.getVillageDepart_id()).orElse(null);
        Village arrivee = villageDepot.findById(dto.getVillage_arrivee_id()).orElse(null);

        if (depart == null || arrivee == null) {
            throw new IllegalArgumentException("Villages non trouvés");
        }

        Route.QualiteRoute qualite = Route.QualiteRoute.valueOf(dto.getQualiteRoute());

        Route route = new Route();
        route.setVillageDepart(depart);
        route.setVillageArrivee(arrivee);
        route.setDistance(dto.getDistance());
        route.setQualiteRoute(qualite);
        route.setEstBloquee(false);

        Route saved = routeDepot.save(route);
        return convertToDTO(saved);
    }

    public List<RouteDTO> obtenirToutesLesRoutes() {
        return routeDepot.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RouteDTO obtenirRouteParId(String id) {
        return routeDepot.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public void supprimerRoute(String id) {
        routeDepot.deleteById(id);
    }

    public RouteDTO modifierRoute(String id, RouteDTO dto) {
        return routeDepot.findById(id)
                .map(route -> {
                    route.setDistance(dto.getDistance());
                    if (dto.getQualiteRoute() != null) {
                        route.setQualiteRoute(Route.QualiteRoute.valueOf(dto.getQualiteRoute()));
                    }
                    if (dto.getEstBloquee() != null) {
                        route.setEstBloquee(dto.getEstBloquee());
                    }
                    return convertToDTO(routeDepot.save(route));
                })
                .orElse(null);
    }

    private RouteDTO convertToDTO(Route route) {
        RouteDTO dto = new RouteDTO();
        dto.setId(route.getId());
        dto.setVillageDepart(route.getVillageDepart().getNom());
        dto.setVillageArrivee(route.getVillageArrivee().getNom());
        dto.setVillageDepart_id(route.getVillageDepart().getId());
        dto.setVillage_arrivee_id(route.getVillageArrivee().getId());
        dto.setDistance(route.getDistance());
        dto.setQualiteRoute(route.getQualiteRoute().name());
        dto.setEstBloquee(route.getEstBloquee());
        return dto;
    }
}
