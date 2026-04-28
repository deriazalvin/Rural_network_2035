package com.ruralnetwork.controleur;

import com.ruralnetwork.entite.Performance;
import com.ruralnetwork.entite.Tournee;
import com.ruralnetwork.depot.PerformanceDepot;
import com.ruralnetwork.depot.TourneeDepot;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/performances")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class PerformanceControleur {

    private final PerformanceDepot performanceDepot;
    private final TourneeDepot tourneeDepot;
    private final TokenUtil tokenUtil;

    public PerformanceControleur(PerformanceDepot performanceDepot, TourneeDepot tourneeDepot, TokenUtil tokenUtil) {
        this.performanceDepot = performanceDepot;
        this.tourneeDepot = tourneeDepot;
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
    public ResponseEntity<List<Performance>> obtenirToutesLesPerformances(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        Pageable pageable = PageRequest.of(0, 50);
        List<Performance> performances = performanceDepot.findByUtilisateurIdOrderByDateComparaisonDesc(userId, pageable);
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Performance> obtenirPerformanceParId(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return performanceDepot.findByIdAndUtilisateurId(id, userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> sauvegarderPerformance(@RequestBody Map<String, Object> body, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = extractUserId(authHeader);
            String tourneeNaiveId = (String) body.get("tournee_naive_id");
            String tourneeOptimiseeId = (String) body.get("tournee_optimisee_id");
            Double reductionPourcentage = ((Number) body.get("reduction_distance_pourcentage")).doubleValue();
            Double economieCarburant = ((Number) body.get("economie_carburant")).doubleValue();

            Tournee tourneeNaive = tourneeDepot.findByIdAndUtilisateurId(tourneeNaiveId, userId).orElse(null);
            Tournee tourneeOptimisee = tourneeDepot.findByIdAndUtilisateurId(tourneeOptimiseeId, userId).orElse(null);

            if (tourneeNaive == null || tourneeOptimisee == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Tournées non trouvées ou accès refusé"));
            }

            Performance performance = new Performance();
            performance.setTourneeNaive(tourneeNaive);
            performance.setTourneeOptimisee(tourneeOptimisee);
            performance.setReductionDistancePourcentage(reductionPourcentage);
            performance.setEconomieCarburant(economieCarburant);
            performance.setUtilisateurId(userId);
            performance.setDateComparaison(LocalDateTime.now());

            Performance saved = performanceDepot.save(performance);

            Map<String, Object> resultat = new HashMap<>();
            resultat.put("id", saved.getId());
            resultat.put("tournee_naive_id", saved.getTourneeNaive().getId());
            resultat.put("tournee_optimisee_id", saved.getTourneeOptimisee().getId());
            resultat.put("reduction_distance_pourcentage", saved.getReductionDistancePourcentage());
            resultat.put("economie_carburant", saved.getEconomieCarburant());
            resultat.put("date_comparaison", saved.getDateComparaison());

            return ResponseEntity.status(HttpStatus.CREATED).body(resultat);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerPerformance(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        performanceDepot.findByIdAndUtilisateurId(id, userId)
                .ifPresent(performance -> performanceDepot.deleteById(id));
        return ResponseEntity.noContent().build();
    }
}