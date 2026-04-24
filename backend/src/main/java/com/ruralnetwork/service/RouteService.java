package com.ruralnetwork.service;

import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.RouteDTO;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteDepot routeDepot;
    private final VillageDepot villageDepot;
    private final OsrmRoutingService osrmService;

    public RouteService(RouteDepot routeDepot, VillageDepot villageDepot, OsrmRoutingService osrmService) {
        this.routeDepot = routeDepot;
        this.villageDepot = villageDepot;
        this.osrmService = osrmService;
    }

    /**
     * Ajoute une nouvelle route entre deux villages.
     * La distance est AUTO-CALCULÉE via l'API OSRM (calcul de distance réelle par routes).
     * 
     * ⚠️ RÈGLE: Empêche les doublons bidirectionnels
     * Si une route existe entre Village A et Village B (peu importe le sens), elle ne peut pas être créée
     * 
     * @param dto DTO contenant: villageDepart_id, village_arrivee_id, qualiteRoute, estBloquee (optionnel)
     * @return RouteDTO sauvegardée avec distance calculée via OSRM
     */
    public RouteDTO ajouterRoute(RouteDTO dto) {
        // 1️⃣ VALIDATION: IDs de village obligatoires
        if (dto.getVillageDepart_id() == null || dto.getVillageDepart_id().trim().isEmpty()) {
            throw new IllegalArgumentException("Village de départ requis");
        }
        if (dto.getVillage_arrivee_id() == null || dto.getVillage_arrivee_id().trim().isEmpty()) {
            throw new IllegalArgumentException("Village d'arrivée requis");
        }

        // 2️⃣ VALIDATION: Les villages doivent être différents
        if (dto.getVillageDepart_id().equals(dto.getVillage_arrivee_id())) {
            throw new IllegalArgumentException("Les villages de départ et arrivée doivent être différents");
        }

        // 3️⃣ FETCH: Récupérer les villages
        Village depart = villageDepot.findById(dto.getVillageDepart_id())
                .orElseThrow(() -> new IllegalArgumentException("Village de départ non trouvé: " + dto.getVillageDepart_id()));
        
        Village arrivee = villageDepot.findById(dto.getVillage_arrivee_id())
                .orElseThrow(() -> new IllegalArgumentException("Village d'arrivée non trouvé: " + dto.getVillage_arrivee_id()));

        // 4️⃣ VALIDATION: Vérifier les doublons bidirectionnels
        // Si une route existe entre A↔B (peu importe le sens), on la refuse
        boolean routeExiste = routeDepot.findBidirectionalRoute(
                dto.getVillageDepart_id(), 
                dto.getVillage_arrivee_id()
        ).isPresent();
        
        if (routeExiste) {
            throw new IllegalArgumentException(
                "Une route existe déjà entre " + depart.getNom() + " et " + arrivee.getNom() + 
                " (peu importe le sens). Les doublons bidirectionnels ne sont pas autorisés"
            );
        }

        // 5️⃣ VALIDATION: Qualité de route obligatoire
        if (dto.getQualiteRoute() == null || dto.getQualiteRoute().trim().isEmpty()) {
            throw new IllegalArgumentException("Qualité de route requise");
        }

        // 6️⃣ CONVERT: Valider et convertir l'enum
        Route.QualiteRoute qualite;
        try {
            qualite = Route.QualiteRoute.valueOf(dto.getQualiteRoute().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Qualité invalide. Valeurs acceptées: BONNE, MOYENNE, MAUVAISE");
        }

        // 7️⃣ CALCULATE: Auto-calculer la distance via API OSRM
        double distanceCalculee;
        try {
            distanceCalculee = osrmService.obtenirDistanceRoutiere(
                    depart.getLatitude(), 
                    depart.getLongitude(),
                    arrivee.getLatitude(), 
                    arrivee.getLongitude()
            );
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Impossible de calculer la distance: " + e.getMessage());
        }

        // 8️⃣ CREATE: Créer la route avec tous les paramètres
        Route route = new Route();
        route.setVillageDepart(depart);
        route.setVillageArrivee(arrivee);
        route.setDistance(distanceCalculee);  // ⭐ AUTO-CALCULÉE VIA OSRM
        route.setQualiteRoute(qualite);
        route.setEstBloquee(dto.getEstBloquee() != null ? dto.getEstBloquee() : false);
        route.setDateCreation(LocalDateTime.now());

        // 9️⃣ SAVE: Sauvegarder et retourner
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

    /**
     * Modifie une route existante (qualité et mise à jour du statut bloquée).
     * La distance reste AUTO-CALCULÉE et ne peut pas être modifiée.
     */
    public RouteDTO modifierRoute(String id, RouteDTO dto) {
        Route route = routeDepot.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route non trouvée: " + id));

        // Mettre à jour la qualité si fournie
        if (dto.getQualiteRoute() != null && !dto.getQualiteRoute().trim().isEmpty()) {
            try {
                route.setQualiteRoute(Route.QualiteRoute.valueOf(dto.getQualiteRoute().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Qualité invalide. Valeurs acceptées: BONNE, MOYENNE, MAUVAISE");
            }
        }

        // Mettre à jour le statut bloquée si fourni
        if (dto.getEstBloquee() != null) {
            route.setEstBloquee(dto.getEstBloquee());
        }

        // NOTE: La distance n'est PAS modifiée - elle est TOUJOURS auto-calculée
        Route updated = routeDepot.save(route);
        return convertToDTO(updated);
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
        
        // Calcul de la durée basée sur la distance et la qualité
        double dureeDeBaseSecondes = (route.getDistance() / 40.0) * 3600;
        double facteur = route.getQualiteRoute().facteur;
        double dureePondereeMinutes = (dureeDeBaseSecondes / 60.0) * facteur;
        dto.setDureeMinutes(dureePondereeMinutes);
        
        // Récupérer la géométrie OSRM à la volée
        try {
            OsrmRoutingService.OsrmRouteInfo routeInfo = osrmService.obtenirInfosRoute(
                route.getVillageDepart().getLatitude(),
                route.getVillageDepart().getLongitude(),
                route.getVillageArrivee().getLatitude(),
                route.getVillageArrivee().getLongitude()
            );
            dto.setGeometry(routeInfo.getGeometry());
        } catch (Exception e) {
            // Si erreur OSRM, on laisse la géométrie vide (log l'erreur)
            System.err.println("Erreur récupération géométrie OSRM pour route " + route.getId() + ": " + e.getMessage());
        }
        
        return dto;
    }
}