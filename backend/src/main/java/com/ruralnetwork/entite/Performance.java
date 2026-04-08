package com.ruralnetwork.entite;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "performances")
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tournee_naive_id")
    private Tournee tourneeNaive;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tournee_optimisee_id")
    private Tournee tourneeOptimisee;

    @Column(name = "reduction_distance_pourcentage", nullable = false)
    private Double reductionDistancePourcentage;

    @Column(name = "economie_carburant", nullable = false)
    private Double economieCarburant;

    @Column(name = "date_comparaison", nullable = false, updatable = false)
    private LocalDateTime dateComparaison;

    public Performance() {}

    public Performance(String id, Tournee tourneeNaive, Tournee tourneeOptimisee,
                       Double reductionDistancePourcentage, Double economieCarburant, LocalDateTime dateComparaison) {
        this.id = id;
        this.tourneeNaive = tourneeNaive;
        this.tourneeOptimisee = tourneeOptimisee;
        this.reductionDistancePourcentage = reductionDistancePourcentage;
        this.economieCarburant = economieCarburant;
        this.dateComparaison = dateComparaison;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Tournee getTourneeNaive() { return tourneeNaive; }
    public void setTourneeNaive(Tournee tourneeNaive) { this.tourneeNaive = tourneeNaive; }

    public Tournee getTourneeOptimisee() { return tourneeOptimisee; }
    public void setTourneeOptimisee(Tournee tourneeOptimisee) { this.tourneeOptimisee = tourneeOptimisee; }

    public Double getReductionDistancePourcentage() { return reductionDistancePourcentage; }
    public void setReductionDistancePourcentage(Double reductionDistancePourcentage) { this.reductionDistancePourcentage = reductionDistancePourcentage; }

    public Double getEconomieCarburant() { return economieCarburant; }
    public void setEconomieCarburant(Double economieCarburant) { this.economieCarburant = economieCarburant; }

    public LocalDateTime getDateComparaison() { return dateComparaison; }
    public void setDateComparaison(LocalDateTime dateComparaison) { this.dateComparaison = dateComparaison; }

    @PrePersist
    protected void onCreate() {
        dateComparaison = LocalDateTime.now();
    }
}
