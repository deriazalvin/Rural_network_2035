package com.ruralnetwork.entite;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "villages")
public class Village {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double volumeProduction;

    @Column(name = "production_totale", nullable = false)
    private Double productionTotale;

    @Column(name = "production_non_transportee", nullable = false)
    private Double productionNonTransportee;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    public Village() {}

    public Village(String id, String nom, Double latitude, Double longitude, Double volumeProduction, LocalDateTime dateCreation) {
        this.id = id;
        this.nom = nom;
        this.latitude = latitude;
        this.longitude = longitude;
        this.volumeProduction = volumeProduction;
        this.productionTotale = volumeProduction != null ? volumeProduction : 0.0;
        this.productionNonTransportee = volumeProduction != null ? volumeProduction : 0.0;
        this.dateCreation = dateCreation;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getVolumeProduction() { return volumeProduction; }
    public void setVolumeProduction(Double volumeProduction) { this.volumeProduction = volumeProduction; }

    public Double getProductionTotale() { return productionTotale; }
    public void setProductionTotale(Double productionTotale) { this.productionTotale = productionTotale; }

    public Double getProductionNonTransportee() { return productionNonTransportee; }
    public void setProductionNonTransportee(Double productionNonTransportee) { this.productionNonTransportee = productionNonTransportee; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (volumeProduction == null) {
            volumeProduction = 0.0;
        }
        if (productionTotale == null) {
            productionTotale = volumeProduction;
        }
        if (productionNonTransportee == null) {
            productionNonTransportee = volumeProduction;
        }
    }
}
