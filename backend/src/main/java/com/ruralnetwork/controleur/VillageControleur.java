package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.VillageDTO;
import com.ruralnetwork.service.VillageService;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/villages")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class VillageControleur {

    private final VillageService villageService;
    private final TokenUtil tokenUtil;

    public VillageControleur(VillageService villageService, TokenUtil tokenUtil) {
        this.villageService = villageService;
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
    public ResponseEntity<List<VillageDTO>> obtenirTousLesVillages(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(villageService.obtenirTousLesVillages(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VillageDTO> obtenirVillageParId(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        VillageDTO village = villageService.obtenirVillageParId(id, userId);
        if (village == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(village);
    }

    @PostMapping
    public ResponseEntity<VillageDTO> ajouterVillage(@RequestBody VillageDTO dto, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        VillageDTO saved = villageService.ajouterVillage(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VillageDTO> modifierVillage(@PathVariable String id, @RequestBody VillageDTO dto, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        VillageDTO updated = villageService.modifierVillage(id, dto, userId);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerVillage(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        villageService.supprimerVillage(id, userId);
        return ResponseEntity.noContent().build();
    }
}
