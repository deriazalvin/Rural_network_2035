package com.ruralnetwork.controleur;

import com.ruralnetwork.depot.OptimisationHistoriqueDepot;
import com.ruralnetwork.dto.OptimisationResultatDTO;
import com.ruralnetwork.dto.request.OptimisationRequestDTO;
import com.ruralnetwork.entite.OptimisationHistorique;
import com.ruralnetwork.service.orchestration.OrchestrateurOptimisation;
import com.ruralnetwork.util.TokenUtil;
import com.google.gson.Gson;
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
    private final OptimisationHistoriqueDepot optimisationHistoriqueDepot;
    private final Gson gson = new Gson();

    public OptimisationControleur(OrchestrateurOptimisation orchestrateurOptimisation,
                                    TokenUtil tokenUtil,
                                    OptimisationHistoriqueDepot optimisationHistoriqueDepot) {
        this.orchestrateurOptimisation = orchestrateurOptimisation;
        this.tokenUtil = tokenUtil;
        this.optimisationHistoriqueDepot = optimisationHistoriqueDepot;
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

            // Persister dans l'historique
            OptimisationHistorique hist = new OptimisationHistorique();
            hist.setUtilisateurId(utilisateurId);
            hist.setResultatJson(gson.toJson(resultat));
            hist.setDistanceTotalKm(resultat.getDistanceTotalKm());
            hist.setCoutTotal(resultat.getCoutTotal());
            hist.setGainPourcent(resultat.getGainPourcent());
            hist.setNombreTournees(resultat.getTournees() != null ? resultat.getTournees().size() : 0);
            optimisationHistoriqueDepot.save(hist);

            return ResponseEntity.ok(resultat);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Erreur d'optimisation interne : " + e.getMessage()));
        }
    }

    /**
     * Récupère l'historique des optimisations de l'utilisateur.
     * GET /api/optimisations/historique
     */
    @GetMapping("/historique")
    public ResponseEntity<?> obtenirHistorique(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long utilisateurId = tokenUtil.getUserIdFromAuthHeader(authHeader);
        if (utilisateurId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentification requise."));
        }
        List<OptimisationHistorique> historique = optimisationHistoriqueDepot.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
        return ResponseEntity.ok(historique);
    }

    /**
     * Supprime un enregistrement d'historique.
     * DELETE /api/optimisations/historique/{id}
     */
    @DeleteMapping("/historique/{id}")
    public ResponseEntity<?> supprimerHistorique(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                  @PathVariable String id) {
        Long utilisateurId = tokenUtil.getUserIdFromAuthHeader(authHeader);
        if (utilisateurId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentification requise."));
        }
        optimisationHistoriqueDepot.findById(id).ifPresent(h -> {
            if (h.getUtilisateurId().equals(utilisateurId)) {
                optimisationHistoriqueDepot.deleteById(id);
            }
        });
        return ResponseEntity.noContent().build();
    }

    /**
     * Vider tout l'historique de l'utilisateur.
     * DELETE /api/optimisations/historique
     */
    @DeleteMapping("/historique")
    public ResponseEntity<?> viderHistorique(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long utilisateurId = tokenUtil.getUserIdFromAuthHeader(authHeader);
        if (utilisateurId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentification requise."));
        }
        List<OptimisationHistorique> liste = optimisationHistoriqueDepot.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
        optimisationHistoriqueDepot.deleteAll(liste);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint pour l'optimisation legacy (single truck).
     * POST /api/optimisations
     */
    @PostMapping
    public ResponseEntity<?> optimiser(@RequestBody Map<String, Object> dto) {
        try {
            return ResponseEntity.ok(Map.of("error", "Utilisez /api/optimisations/multi-camions pour l'optimisation"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
