package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.RouteDTO;
import com.ruralnetwork.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/routes")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class RouteControleur {

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
    public ResponseEntity<RouteDTO> ajouterRoute(@RequestBody RouteDTO dto) {
        try {
            RouteDTO saved = routeService.ajouterRoute(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteDTO> modifierRoute(@PathVariable String id, @RequestBody RouteDTO dto) {
        RouteDTO updated = routeService.modifierRoute(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerRoute(@PathVariable String id) {
        routeService.supprimerRoute(id);
        return ResponseEntity.noContent().build();
    }
}
