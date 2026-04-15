package com.ruralnetwork.service.utilitaire;

import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Convertisseur pour transformer les données brutes en données utilisables.
 * Responsabilité unique : transformation de données attendues par les algorithmes.
 */
@Component
public class ConvertisseurData {

    /**
     * Extrait les villages à visiter (excluant le dépôt).
     */
    public List<Village> extraireVillagesAVisiter(List<Village> tousLesVillages, Village depot) {
        List<Village> villagesAVisiter = new ArrayList<>(tousLesVillages);
        villagesAVisiter.remove(depot);
        return villagesAVisiter;
    }

    /**
     * Filtre les camions disponibles.
     */
    public List<Camion> filtrerCamionsDisponibles(List<Camion> camions) {
        return camions.stream()
                .filter(c -> c.getEtat() == Camion.EtatCamion.DISPONIBLE)
                .toList();
    }

    /**
     * Retourne la couleur hex associée à un index.
     */
    public String obtenirCouleur(int index) {
        String[] COULEURS = {
            "#0ea5e9", "#f97316", "#a3e635", "#e879f9",
            "#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b"
        };
        return COULEURS[index % COULEURS.length];
    }
}
