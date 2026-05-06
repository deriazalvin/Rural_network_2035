package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.OptimisationResultatDTO;
import com.ruralnetwork.dto.request.OptimisationRequestDTO;
import com.ruralnetwork.service.orchestration.OrchestrateurOptimisation;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/optimisations")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class OptimisationControleur {

    private final OrchestrateurOptimisation orchestrateurOptimisation;
    private final TokenUtil tokenUtil;

    public OptimisationControleur(OrchestrateurOptimisation orchestrateurOptimisation, TokenUtil tokenUtil) {
        this.orchestrateurOptimisation = orchestrateurOptimisation;
        this.tokenUtil = tokenUtil;
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
    public ResponseEntity<?> optimiserMultiCamions(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody OptimisationRequestDTO request) {
        try {
            Long utilisateurId = tokenUtil.getUserIdFromAuthHeader(authHeader);
            if (utilisateurId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authentification requise pour lancer l'optimisation."));
            }

            String depotId = request.getDepotId();
            List<String> camionIds = request.getCamionIds();

            if (depotId == null || depotId.isEmpty() || camionIds == null || camionIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Le dépôt et au moins un camion doivent être fournis."));
            }

            OptimisationResultatDTO resultat = orchestrateurOptimisation.optimiserTournees(utilisateurId, depotId, camionIds);
            return ResponseEntity.ok(resultat);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Erreur d'optimisation interne : " + e.getMessage()));
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
