package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.OptimisationDTO;
import com.ruralnetwork.service.OptimisationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/optimisations")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class OptimisationControleur {

    private final OptimisationService optimisationService;

    public OptimisationControleur(OptimisationService optimisationService) {
        this.optimisationService = optimisationService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> optimiser(@RequestBody OptimisationDTO dto) {
        try {
            Map<String, Object> resultat = optimisationService.optimiser(dto);
            return ResponseEntity.ok(resultat);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
