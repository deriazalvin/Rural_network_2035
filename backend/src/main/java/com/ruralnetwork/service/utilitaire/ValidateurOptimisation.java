package com.ruralnetwork.service.utilitaire;

import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Validateur pour s'assurer que les entrées de l'optimisation sont valides.
 * Responsabilité unique : vérifier la cohérence et validité des données.
 */
@Component
public class ValidateurOptimisation {

    /**
     * Valide si les données minimales existent pour lancer l'optimisation.
     */
    public boolean sontDonneesValides(Village depot, List<Village> villages, List<Camion> camions) {
        return depot != null 
            && !villages.isEmpty() 
            && !camions.isEmpty();
    }

    /**
     * Valide si un camion peut transporter au moins un village.
     */
    public boolean camionPeutTransporterVillages(Camion camion, List<Village> villages) {
        return camion.getCapaciteKg() > 0 
            && villages.stream().anyMatch(v -> v.getProductionNonTransportee() <= camion.getCapaciteKg());
    }

    /**
     * Vérifie si le dépôt fait partie des villages.
     */
    public boolean depotValide(Village depot, List<Village> villages) {
        return depot != null 
            && villages.stream().anyMatch(v -> v.getId().equals(depot.getId()));
    }
}
