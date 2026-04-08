package com.ruralnetwork.depot;

import com.ruralnetwork.entite.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteDepot extends JpaRepository<Route, String> {
    List<Route> findAll();
    List<Route> findByVillageDepart_Id(String villageId);
    List<Route> findByEstBloqueeTrue();
}
