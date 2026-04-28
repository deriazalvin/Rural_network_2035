package com.ruralnetwork.depot;

import com.ruralnetwork.entite.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VillageDepot extends JpaRepository<Village, String> {
    Optional<Village> findByNom(String nom);
    List<Village> findAllByOrderByNomAsc();
    List<Village> findByUtilisateurIdOrderByNomAsc(Long utilisateurId);
    Optional<Village> findByIdAndUtilisateurId(String id, Long utilisateurId);
}
