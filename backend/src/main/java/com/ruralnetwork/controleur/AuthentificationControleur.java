package com.ruralnetwork.controleur;

import com.ruralnetwork.entite.Utilisateur;
import com.ruralnetwork.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthentificationControleur {

    private final UtilisateurService service;

    @Autowired
    public AuthentificationControleur(UtilisateurService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String motDePasse = body.get("motDePasse");
            String nom = body.getOrDefault("nom", "");
            Utilisateur u = service.register(email, motDePasse, nom);
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", u.getId());
            resp.put("email", u.getEmail());
            resp.put("nom", u.getNom());
            resp.put("token", u.getToken());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String motDePasse = body.get("motDePasse");
            Utilisateur u = service.login(email, motDePasse);
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", u.getId());
            resp.put("email", u.getEmail());
            resp.put("nom", u.getNom());
            resp.put("token", u.getToken());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}
