package com.ruralnetwork.depot;

import com.ruralnetwork.entite.OptimisationHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OptimisationHistoriqueDepot extends JpaRepository<OptimisationHistorique, String> {
    List<OptimisationHistorique> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);
}
