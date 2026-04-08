package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.VillageDTO;
import com.ruralnetwork.service.VillageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/villages")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class VillageControleur {

    private final VillageService villageService;

    public VillageControleur(VillageService villageService) {
        this.villageService = villageService;
    }

    @GetMapping
    public ResponseEntity<List<VillageDTO>> obtenirTousLesVillages() {
        return ResponseEntity.ok(villageService.obtenirTousLesVillages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VillageDTO> obtenirVillageParId(@PathVariable String id) {
        VillageDTO village = villageService.obtenirVillageParId(id);
        if (village == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(village);
    }

    @PostMapping
    public ResponseEntity<VillageDTO> ajouterVillage(@RequestBody VillageDTO dto) {
        VillageDTO saved = villageService.ajouterVillage(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VillageDTO> modifierVillage(@PathVariable String id, @RequestBody VillageDTO dto) {
        VillageDTO updated = villageService.modifierVillage(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerVillage(@PathVariable String id) {
        villageService.supprimerVillage(id);
        return ResponseEntity.noContent().build();
    }
}
