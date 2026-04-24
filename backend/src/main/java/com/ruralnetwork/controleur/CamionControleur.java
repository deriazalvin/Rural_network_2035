package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.CamionDTO;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.depot.CamionDepot;
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

    public CamionControleur(CamionDepot camionDepot) {
        this.camionDepot = camionDepot;
    }

    @GetMapping
    public ResponseEntity<List<CamionDTO>> obtenirTous() {
        List<CamionDTO> camions = camionDepot.findAll().stream()
            .map(this::convertirDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(camions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CamionDTO> obtenirParId(@PathVariable String id) {
        return camionDepot.findById(id)
            .map(this::convertirDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CamionDTO> creer(@RequestBody CamionDTO dto) {
        try {
            Camion camion = new Camion();
            camion.setNom(dto.getNom());
            camion.setCapaciteKg(dto.getCapaciteKg());
            camion.setEtat(Camion.EtatCamion.DISPONIBLE);
            camion.setCouleurHex(dto.getCouleurHex() != null ? dto.getCouleurHex() : "#0ea5e9");
            camion.setDateCreation(LocalDateTime.now());

            Camion saved = camionDepot.save(camion);
            return ResponseEntity.ok(convertirDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CamionDTO> modifier(@PathVariable String id, @RequestBody CamionDTO dto) {
        return camionDepot.findById(id)
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
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        if (camionDepot.existsById(id)) {
            camionDepot.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/etat")
    public ResponseEntity<CamionDTO> changerEtat(@PathVariable String id, @RequestBody Map<String, String> body) {
        return camionDepot.findById(id)
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
