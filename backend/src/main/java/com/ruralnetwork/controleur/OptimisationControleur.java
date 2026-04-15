package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.OptimisationResultatDTO;
import com.ruralnetwork.service.orchestration.OrchestrateurOptimisation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/optimisations")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class OptimisationControleur {

    private final OrchestrateurOptimisation orchestrateurOptimisation;

    public OptimisationControleur(OrchestrateurOptimisation orchestrateurOptimisation) {
        this.orchestrateurOptimisation = orchestrateurOptimisation;
    }

    /**
     * Endpoint pour l'optimisation multi-camions.
     * POST /api/optimisations/multi-camions
     * 
     * Body:
     * {
     *   "depotId": "id-du-depot",
     *   "camionIds": ["id-camion-1", "id-camion-2"]
     * }
     */
    @PostMapping("/multi-camions")
    public ResponseEntity<OptimisationResultatDTO> optimiserMultiCamions(@RequestBody Map<String, Object> request) {
        try {
            String depotId = (String) request.get("depotId");
            @SuppressWarnings("unchecked")
            List<String> camionIds = (List<String>) request.get("camionIds");

            if (depotId == null || depotId.isEmpty() || camionIds == null || camionIds.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            OptimisationResultatDTO resultat = orchestrateurOptimisation.optimiserTournees(depotId, camionIds);
            return ResponseEntity.ok(resultat);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Endpoint pour l'optimisation legacy (single truck).
     * POST /api/optimisations
     */
    @PostMapping
    public ResponseEntity<?> optimiser(@RequestBody Map<String, Object> dto) {
        try {
            // Cette méthode est conservée pour la compatibilité rétroactive
            return ResponseEntity.ok(Map.of("error", "Utilisez /api/optimisations/multi-camions pour l'optimisation"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
