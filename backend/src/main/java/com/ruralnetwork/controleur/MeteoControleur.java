package com.ruralnetwork.controleur;

import com.ruralnetwork.dto.MeteoDTO;
import com.ruralnetwork.service.meteo.ServiceMeteo;
import com.ruralnetwork.util.TokenUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/meteo")
@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5173"})
public class MeteoControleur {

    private final ServiceMeteo serviceMeteo;
    private final TokenUtil tokenUtil;

    public MeteoControleur(ServiceMeteo serviceMeteo, TokenUtil tokenUtil) {
        this.serviceMeteo = serviceMeteo;
        this.tokenUtil = tokenUtil;
    }

    @GetMapping
    public ResponseEntity<?> obtenirMeteo(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = tokenUtil.getUserIdFromAuthHeader(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentification requise."));
        }
        try {
            MeteoDTO meteo = serviceMeteo.obtenirMeteoParCoords(lat, lon);
            return ResponseEntity.ok(meteo);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("message", e.getMessage()));
        }
    }
}
