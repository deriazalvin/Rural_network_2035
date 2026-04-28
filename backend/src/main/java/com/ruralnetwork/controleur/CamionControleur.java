package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.CamionDTO;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.depot.CamionDepot;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur pour la gestion des camions (flotte).
 */
@RestController
@RequestMapping("/camions")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class CamionControleur {

    private final CamionDepot camionDepot;
    private final TokenUtil tokenUtil;

    public CamionControleur(CamionDepot camionDepot, TokenUtil tokenUtil) {
        this.camionDepot = camionDepot;
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
    public ResponseEntity<List<CamionDTO>> obtenirTous(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        List<CamionDTO> camions = camionDepot.findByUtilisateurId(userId).stream()
            .map(this::convertirDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(camions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CamionDTO> obtenirParId(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return camionDepot.findByIdAndUtilisateurId(id, userId)
            .map(this::convertirDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CamionDTO> creer(@RequestBody CamionDTO dto, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = extractUserId(authHeader);
            Camion camion = new Camion();
            camion.setNom(dto.getNom());
            camion.setCapaciteKg(dto.getCapaciteKg());
            camion.setEtat(Camion.EtatCamion.DISPONIBLE);
            camion.setCouleurHex(dto.getCouleurHex() != null ? dto.getCouleurHex() : "#0ea5e9");
            camion.setUtilisateurId(userId);
            camion.setDateCreation(LocalDateTime.now());

            Camion saved = camionDepot.save(camion);
            return ResponseEntity.ok(convertirDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CamionDTO> modifier(@PathVariable String id, @RequestBody CamionDTO dto, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return camionDepot.findByIdAndUtilisateurId(id, userId)
            .map(camion -> {
                camion.setNom(dto.getNom());
                camion.setCapaciteKg(dto.getCapaciteKg());
                camion.setEtat(Camion.EtatCamion.valueOf(dto.getEtat()));
                if (dto.getCouleurHex() != null) {
                    camion.setCouleurHex(dto.getCouleurHex());
                }
                Camion updated = camionDepot.save(camion);
                return ResponseEntity.ok(convertirDTO(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return camionDepot.findByIdAndUtilisateurId(id, userId).map(camion -> {
            camionDepot.deleteById(id);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/etat")
    public ResponseEntity<CamionDTO> changerEtat(@PathVariable String id, @RequestBody Map<String, String> body, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return camionDepot.findByIdAndUtilisateurId(id, userId)
            .map(camion -> {
                String nouvelEtat = body.get("etat");
                camion.setEtat(Camion.EtatCamion.valueOf(nouvelEtat));
                Camion updated = camionDepot.save(camion);
                return ResponseEntity.ok(convertirDTO(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private CamionDTO convertirDTO(Camion camion) {
        return new CamionDTO(
            camion.getId(),
            camion.getNom(),
            camion.getCapaciteKg(),
            camion.getEtat().toString(),
            camion.getCouleurHex()
        );
    }
}
