package com.ruralnetwork.depot;

import com.ruralnetwork.entite.Tournee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourneeDepot extends JpaRepository<Tournee, String> {
    List<Tournee> findAllByOrderByDateCreationDesc(Pageable pageable);
    List<Tournee> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId, Pageable pageable);
    Optional<Tournee> findByIdAndUtilisateurId(String id, Long utilisateurId);
}
