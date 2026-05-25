package com.ruralnetwork.depot;

import com.ruralnetwork.entite.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteDepot extends JpaRepository<Route, String> {
    List<Route> findAll();
    List<Route> findByVillageDepart_Id(String villageId);
    List<Route> findByEstBloqueeTrue();

    @Query("SELECT r FROM Route r WHERE " +
           "r.villageDepart.utilisateurId = :userId OR r.villageArrivee.utilisateurId = :userId")
    List<Route> findByUtilisateurId(@Param("userId") Long userId);

    /**
     * Vérifie si une route existe entre deux villages, peu importe le sens.
     * Retourne true si une route existe A→B ou B→A
     * 
     * @param villageId1 ID du premier village
     * @param villageId2 ID du deuxième village
     * @return Optional<Route> contenant la route trouvée, ou vide
     */
    @Query("SELECT r FROM Route r WHERE " +
           "(r.villageDepart.id = :villageId1 AND r.villageArrivee.id = :villageId2) OR " +
           "(r.villageDepart.id = :villageId2 AND r.villageArrivee.id = :villageId1)")
    Optional<Route> findBidirectionalRoute(@Param("villageId1") String villageId1, 
                                           @Param("villageId2") String villageId2);
}
