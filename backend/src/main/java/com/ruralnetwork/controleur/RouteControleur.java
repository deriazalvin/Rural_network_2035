package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.RouteDTO;
import com.ruralnetwork.service.RouteService;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/routes")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class RouteControleur {

    private final RouteService routeService;
    private final TokenUtil tokenUtil;

    public RouteControleur(RouteService routeService, TokenUtil tokenUtil) {
        this.routeService = routeService;
        this.tokenUtil = tokenUtil;
    }

    private Long extractUserId(String authHeader) {
        Long userId = tokenUtil.getUserIdFromAuthHeader(authHeader);
        if (userId == null) {
            throw new IllegalArgumentException("Invalid or missing authorization token");
        }
        return userId;
    }

    @GetMapping
    public ResponseEntity<List<RouteDTO>> obtenirToutesLesRoutes(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(routeService.obtenirToutesLesRoutes(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDTO> obtenirRouteParId(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        RouteDTO route = routeService.obtenirRouteParId(id, userId);
        if (route == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(route);
    }

    @PostMapping
    public ResponseEntity<?> ajouterRoute(@RequestBody RouteDTO dto, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = extractUserId(authHeader);
            RouteDTO saved = routeService.ajouterRoute(dto, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

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
    public ResponseEntity<?> modifierRoute(@PathVariable String id, @RequestBody RouteDTO dto, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = extractUserId(authHeader);
            RouteDTO updated = routeService.modifierRoute(id, dto, userId);
            return ResponseEntity.ok(updated);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerRoute(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = extractUserId(authHeader);
            routeService.supprimerRoute(id, userId);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }
}
