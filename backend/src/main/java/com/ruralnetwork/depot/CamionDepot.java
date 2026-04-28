package com.ruralnetwork.depot;

import com.ruralnetwork.entite.Camion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Dépôt (Repository) pour l'entité Camion.
 */
@Repository
public interface CamionDepot extends JpaRepository<Camion, String> {
    List<Camion> findByEtat(Camion.EtatCamion etat);
    List<Camion> findByUtilisateurId(Long utilisateurId);
    Optional<Camion> findByIdAndUtilisateurId(String id, Long utilisateurId);
}
