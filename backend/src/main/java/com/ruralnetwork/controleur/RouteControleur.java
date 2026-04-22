package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.RouteDTO;
import com.ruralnetwork.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/routes")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class RouteControleur {

    private static final Logger logger = Logger.getLogger(RouteControleur.class.getName());
    private final RouteService routeService;

    public RouteControleur(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<List<RouteDTO>> obtenirToutesLesRoutes() {
        return ResponseEntity.ok(routeService.obtenirToutesLesRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDTO> obtenirRouteParId(@PathVariable String id) {
        RouteDTO route = routeService.obtenirRouteParId(id);
        if (route == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(route);
    }

    @PostMapping
    public ResponseEntity<?> ajouterRoute(@RequestBody RouteDTO dto) {
        try {
            // Log the incoming request
            logger.info("Ajout route: depart=" + dto.getVillageDepart_id() + 
                       ", arrivee=" + dto.getVillage_arrivee_id() + 
                       ", qualite=" + dto.getQualiteRoute() + 
                       ", bloquee=" + dto.getEstBloquee());
            
            RouteDTO saved = routeService.ajouterRoute(dto);
            logger.info("Route créée avec succès: " + saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            
        } catch (IllegalArgumentException e) {
            // Erreur de validation - 400 Bad Request
            String errorMsg = "Erreur validation: " + e.getMessage();
            logger.warning(errorMsg);
            return ResponseEntity.badRequest().body(new ErrorResponse(errorMsg));
            
        } catch (Exception e) {
            // Erreur serveur - 500 Internal Server Error
            String errorMsg = "Erreur serveur: " + e.getMessage();
            logger.severe(errorMsg);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(errorMsg));
        }
    }

    // Classe interne pour les réponses d'erreur
    public static class ErrorResponse {
        public String message;
        public long timestamp;

        public ErrorResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() { return message; }
        public long getTimestamp() { return timestamp; }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modifierRoute(@PathVariable String id, @RequestBody RouteDTO dto) {
        try {
            logger.info("Modification route: id=" + id + ", qualite=" + dto.getQualiteRoute() + ", bloquee=" + dto.getEstBloquee());
            RouteDTO updated = routeService.modifierRoute(id, dto);
            logger.info("Route modifiée avec succès: " + id);
            return ResponseEntity.ok(updated);
            
        } catch (IllegalArgumentException e) {
            String errorMsg = "Erreur validation: " + e.getMessage();
            logger.warning(errorMsg);
            return ResponseEntity.badRequest().body(new ErrorResponse(errorMsg));
            
        } catch (Exception e) {
            String errorMsg = "Erreur serveur: " + e.getMessage();
            logger.severe(errorMsg);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(errorMsg));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerRoute(@PathVariable String id) {
        try {
            logger.info("Suppression route: id=" + id);
            routeService.supprimerRoute(id);
            logger.info("Route supprimée avec succès: " + id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            String errorMsg = "Erreur serveur: " + e.getMessage();
            logger.severe(errorMsg);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(errorMsg));
        }
    }
}
