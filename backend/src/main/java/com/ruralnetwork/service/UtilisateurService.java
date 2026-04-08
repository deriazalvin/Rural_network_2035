package com.ruralnetwork.service;

import com.ruralnetwork.depot.UtilisateurDepot;
import com.ruralnetwork.entite.Utilisateur;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UtilisateurService {

    private final UtilisateurDepot depot;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Autowired
    public UtilisateurService(UtilisateurDepot depot) {
        this.depot = depot;
    }

    public Utilisateur register(String email, String motDePasse, String nom) throws Exception {
        Optional<Utilisateur> existing = depot.findByEmail(email);
        if (existing.isPresent()) {
            throw new Exception("Email déjà utilisé");
        }
        Utilisateur u = new Utilisateur();
        u.setEmail(email);
        u.setMotDePasse(encoder.encode(motDePasse));
        u.setNom(nom);
        u.setToken(UUID.randomUUID().toString());
        return depot.save(u);
    }

    public Utilisateur login(String email, String motDePasse) throws Exception {
        Optional<Utilisateur> opt = depot.findByEmail(email);
        if (opt.isEmpty()) {
            throw new Exception("Utilisateur introuvable");
        }
        Utilisateur u = opt.get();
        if (!encoder.matches(motDePasse, u.getMotDePasse())) {
            throw new Exception("Mot de passe incorrect");
        }
        String token = UUID.randomUUID().toString();
        u.setToken(token);
        return depot.save(u);
    }

    public Optional<Utilisateur> findByToken(String token) {
        return depot.findByToken(token);
    }
}
