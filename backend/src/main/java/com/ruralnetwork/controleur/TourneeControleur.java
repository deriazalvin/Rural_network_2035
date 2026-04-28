package com.ruralnetwork.controleur;

import com.ruralnetwork.entite.Tournee;
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
@RequestMapping("/api/tournees")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class TourneeControleur {

    private final TourneeDepot tourneeDepot;
    private final TokenUtil tokenUtil;

    public TourneeControleur(TourneeDepot tourneeDepot, TokenUtil tokenUtil) {
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
    public ResponseEntity<List<Tournee>> obtenirToutesLesTournees(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        Pageable pageable = PageRequest.of(0, 50);
        List<Tournee> tournees = tourneeDepot.findByUtilisateurIdOrderByDateCreationDesc(userId, pageable);
        return ResponseEntity.ok(tournees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournee> obtenirTourneeParId(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return tourneeDepot.findByIdAndUtilisateurId(id, userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> creerTournee(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            Long userId = extractUserId(authHeader);

            String nom = (String) body.get("nom");
            Double capaciteCamion = ((Number) body.get("capacite_camion")).doubleValue();
            Double distanceTotale = ((Number) body.get("distance_totale")).doubleValue();
            Double coutCarburant = ((Number) body.get("cout_carburant")).doubleValue();
            String typeOptimisation = (String) body.get("type_optimisation");
            String itineraire = (String) body.get("itineraire");

            Tournee.TypeOptimisation type =
                    Tournee.TypeOptimisation.valueOf(typeOptimisation);

            Tournee tournee = new Tournee();
            tournee.setNom(nom);
            tournee.setCapaciteCamion(capaciteCamion);
            tournee.setDistanceTotale(distanceTotale);
            tournee.setCoutCarburant(coutCarburant);
            tournee.setTypeOptimisation(type);
            tournee.setItineraire(itineraire);
            tournee.setUtilisateurId(userId);
            tournee.setDateCreation(LocalDateTime.now());

            Tournee saved = tourneeDepot.save(tournee);

            Map<String, Object> resultat = new HashMap<>();
            resultat.put("id", saved.getId());
            resultat.put("nom", saved.getNom());
            resultat.put("capacite_camion", saved.getCapaciteCamion());
            resultat.put("distance_totale", saved.getDistanceTotale());
            resultat.put("cout_carburant", saved.getCoutCarburant());
            resultat.put("type_optimisation", saved.getTypeOptimisation().name());
            resultat.put("itineraire", saved.getItineraire());
            resultat.put("date_creation", saved.getDateCreation());

            return ResponseEntity.status(HttpStatus.CREATED).body(resultat);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "Type d'optimisation invalide: " + e.getMessage()));

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerTournee(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long userId = extractUserId(authHeader);

        tourneeDepot.findByIdAndUtilisateurId(id, userId)
                .ifPresent(tournee -> tourneeDepot.deleteById(id));

        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/tournees/{id}
     * Modifie une tournée existante
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> modifierTournee(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        try {
            return tourneeDepot.findById(id)
                    .map(tournee -> {
                        // Mettre à jour les champs fournis
                        if (body.containsKey("nom")) {
                            tournee.setNom((String) body.get("nom"));
                        }
                        if (body.containsKey("capacite_camion")) {
                            tournee.setCapaciteCamion(((Number) body.get("capacite_camion")).doubleValue());
                        }
                        if (body.containsKey("distance_totale")) {
                            tournee.setDistanceTotale(((Number) body.get("distance_totale")).doubleValue());
                        }
                        if (body.containsKey("cout_carburant")) {
                            tournee.setCoutCarburant(((Number) body.get("cout_carburant")).doubleValue());
                        }
                        if (body.containsKey("itineraire")) {
                            tournee.setItineraire((String) body.get("itineraire"));
                        }

                        Tournee updated = tourneeDepot.save(tournee);

                        Map<String, Object> resultat = new HashMap<>();
                        resultat.put("id", updated.getId());
                        resultat.put("nom", updated.getNom());
                        resultat.put("capacite_camion", updated.getCapaciteCamion());
                        resultat.put("distance_totale", updated.getDistanceTotale());
                        resultat.put("cout_carburant", updated.getCoutCarburant());
                        resultat.put("type_optimisation", updated.getTypeOptimisation().name());
                        resultat.put("itineraire", updated.getItineraire());
                        resultat.put("date_creation", updated.getDateCreation());

                        return ResponseEntity.ok(resultat);
                    })
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/tournees/type/{type}
     * Récupère toutes les tournées d'un type spécifique (NAIVE ou OPTIMISEE)
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Tournee>> obtenirTourneeParType(@PathVariable String type) {
        try {
            Pageable pageable = PageRequest.of(0, 50);
            Tournee.TypeOptimisation typeOptimisation = Tournee.TypeOptimisation.valueOf(type.toUpperCase());
            
            // Note: Vous devrez ajouter cette méthode au TourneeDepot
            // List<Tournee> tournees = tourneeDepot.findByTypeOptimisationOrderByDateCreationDesc(typeOptimisation, pageable);
            
            return ResponseEntity.ok(new java.util.ArrayList<>());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/tournees/batch
     * Crée plusieurs tournées à la fois
     */
    @PostMapping("/batch")
    public ResponseEntity<List<Map<String, Object>>> creerMultiplesTournees(@RequestBody List<Map<String, Object>> tournees) {
        try {
            List<Map<String, Object>> resultats = new java.util.ArrayList<>();

            for (Map<String, Object> tourneeData : tournees) {
                String nom = (String) tourneeData.get("nom");
                Double capaciteCamion = ((Number) tourneeData.get("capacite_camion")).doubleValue();
                Double distanceTotale = ((Number) tourneeData.get("distance_totale")).doubleValue();
                Double coutCarburant = ((Number) tourneeData.get("cout_carburant")).doubleValue();
                String typeOptimisation = (String) tourneeData.get("type_optimisation");
                String itineraire = (String) tourneeData.get("itineraire");

                Tournee.TypeOptimisation type = Tournee.TypeOptimisation.valueOf(typeOptimisation);

                Tournee tournee = new Tournee();
                tournee.setNom(nom);
                tournee.setCapaciteCamion(capaciteCamion);
                tournee.setDistanceTotale(distanceTotale);
                tournee.setCoutCarburant(coutCarburant);
                tournee.setTypeOptimisation(type);
                tournee.setItineraire(itineraire);
                tournee.setDateCreation(LocalDateTime.now());

                Tournee saved = tourneeDepot.save(tournee);

                Map<String, Object> resultat = new HashMap<>();
                resultat.put("id", saved.getId());
                resultat.put("nom", saved.getNom());
                resultat.put("capacite_camion", saved.getCapaciteCamion());
                resultat.put("distance_totale", saved.getDistanceTotale());
                resultat.put("cout_carburant", saved.getCoutCarburant());
                resultat.put("type_optimisation", saved.getTypeOptimisation().name());
                resultat.put("date_creation", saved.getDateCreation());

                resultats.add(resultat);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(resultats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}