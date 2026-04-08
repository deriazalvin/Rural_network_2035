package com.ruralnetwork.entite;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "village_depart_id", nullable = false)
    private Village villageDepart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "village_arrivee_id", nullable = false)
    private Village villageArrivee;

    @Column(nullable = false)
    private Double distance;

    @Column(name = "qualite_route", nullable = false)
    @Enumerated(EnumType.STRING)
    private QualiteRoute qualiteRoute;

    @Column(name = "est_bloquee", nullable = false)
    private Boolean estBloquee;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    public Route() {}

    public Route(String id, Village villageDepart, Village villageArrivee, Double distance,
                 QualiteRoute qualiteRoute, Boolean estBloquee, LocalDateTime dateCreation) {
        this.id = id;
        this.villageDepart = villageDepart;
        this.villageArrivee = villageArrivee;
        this.distance = distance;
        this.qualiteRoute = qualiteRoute;
        this.estBloquee = estBloquee;
        this.dateCreation = dateCreation;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Village getVillageDepart() { return villageDepart; }
    public void setVillageDepart(Village villageDepart) { this.villageDepart = villageDepart; }

    public Village getVillageArrivee() { return villageArrivee; }
    public void setVillageArrivee(Village villageArrivee) { this.villageArrivee = villageArrivee; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public QualiteRoute getQualiteRoute() { return qualiteRoute; }
    public void setQualiteRoute(QualiteRoute qualiteRoute) { this.qualiteRoute = qualiteRoute; }

    public Boolean getEstBloquee() { return estBloquee; }
    public void setEstBloquee(Boolean estBloquee) { this.estBloquee = estBloquee; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public enum QualiteRoute {
        BONNE(1.0),
        MOYENNE(1.3),
        MAUVAISE(1.6);

        public final double facteur;

        QualiteRoute(double facteur) {
            this.facteur = facteur;
        }
    }
}
