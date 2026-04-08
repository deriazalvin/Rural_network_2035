package com.ruralnetwork.depot;

import com.ruralnetwork.entite.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceDepot extends JpaRepository<Performance, String> {
    List<Performance> findAllByOrderByDateComparaisonDesc(Pageable pageable);
}
