package com.ruralnetwork.util;

import com.ruralnetwork.entite.Utilisateur;
import com.ruralnetwork.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Optional;

/**
 * Utility class for extracting user information from authorization tokens
 */
@Component
public class TokenUtil {

    private final UtilisateurService utilisateurService;

    @Autowired
    public TokenUtil(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    /**
     * Extract user ID from authorization header
     * @param authHeader Authorization header (e.g., "Bearer token123")
     * @return User ID if found and valid, null otherwise
     */
    public Long getUserIdFromAuthHeader(String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            return null;
        }

        String token = extractToken(authHeader);
        if (token == null) {
            return null;
        }

        Optional<Utilisateur> user = utilisateurService.findByToken(token);
        return user.map(Utilisateur::getId).orElse(null);
    }

    /**
     * Extract token from "Bearer token123" format
     */
    private String extractToken(String authHeader) {
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}
