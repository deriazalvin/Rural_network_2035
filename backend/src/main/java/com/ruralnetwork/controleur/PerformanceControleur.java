package com.ruralnetwork.controleur;

import com.ruralnetwork.entite.Performance;
import com.ruralnetwork.entite.Tournee;
import com.ruralnetwork.depot.PerformanceDepot;
import com.ruralnetwork.depot.TourneeDepot;
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

    public PerformanceControleur(PerformanceDepot performanceDepot, TourneeDepot tourneeDepot) {
        this.performanceDepot = performanceDepot;
        this.tourneeDepot = tourneeDepot;
    }

    @GetMapping
    public ResponseEntity<List<Performance>> obtenirToutesLesPerformances() {
        Pageable pageable = PageRequest.of(0, 50);
        List<Performance> performances = performanceDepot.findAllByOrderByDateComparaisonDesc(pageable);
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Performance> obtenirPerformanceParId(@PathVariable String id) {
        return performanceDepot.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> sauvegarderPerformance(@RequestBody Map<String, Object> body) {
        try {
            String tourneeNaiveId = (String) body.get("tournee_naive_id");
            String tourneeOptimiseeId = (String) body.get("tournee_optimisee_id");
            Double reductionPourcentage = ((Number) body.get("reduction_distance_pourcentage")).doubleValue();
            Double economieCarburant = ((Number) body.get("economie_carburant")).doubleValue();

            Tournee tourneeNaive = tourneeDepot.findById(tourneeNaiveId).orElse(null);
            Tournee tourneeOptimisee = tourneeDepot.findById(tourneeOptimiseeId).orElse(null);

            if (tourneeNaive == null || tourneeOptimisee == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Tournées non trouvées"));
            }

            Performance performance = new Performance();
            performance.setTourneeNaive(tourneeNaive);
            performance.setTourneeOptimisee(tourneeOptimisee);
            performance.setReductionDistancePourcentage(reductionPourcentage);
            performance.setEconomieCarburant(economieCarburant);
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
    public ResponseEntity<Void> supprimerPerformance(@PathVariable String id) {
        performanceDepot.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}