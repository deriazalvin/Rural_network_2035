package com.ruralnetwork.entite;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournees")
public class Tournee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nom;

    @Column(name = "capacite_camion", nullable = false)
    private Double capaciteCamion;

    @Column(name = "distance_totale", nullable = false)
    private Double distanceTotale;

    @Column(name = "cout_carburant", nullable = false)
    private Double coutCarburant;

    @Column(name = "type_optimisation", nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeOptimisation typeOptimisation;

    @Column(columnDefinition = "jsonb")
    private String itineraire;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    public Tournee() {}

    public Tournee(String id, String nom, Double capaciteCamion, Double distanceTotale, Double coutCarburant,
                   TypeOptimisation typeOptimisation, String itineraire, Long utilisateurId, LocalDateTime dateCreation) {
        this.id = id;
        this.nom = nom;
        this.capaciteCamion = capaciteCamion;
        this.distanceTotale = distanceTotale;
        this.coutCarburant = coutCarburant;
        this.typeOptimisation = typeOptimisation;
        this.itineraire = itineraire;
        this.utilisateurId = utilisateurId;
        this.dateCreation = dateCreation;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getCapaciteCamion() { return capaciteCamion; }
    public void setCapaciteCamion(Double capaciteCamion) { this.capaciteCamion = capaciteCamion; }

    public Double getDistanceTotale() { return distanceTotale; }
    public void setDistanceTotale(Double distanceTotale) { this.distanceTotale = distanceTotale; }

    public Double getCoutCarburant() { return coutCarburant; }
    public void setCoutCarburant(Double coutCarburant) { this.coutCarburant = coutCarburant; }

    public TypeOptimisation getTypeOptimisation() { return typeOptimisation; }
    public void setTypeOptimisation(TypeOptimisation typeOptimisation) { this.typeOptimisation = typeOptimisation; }

    public String getItineraire() { return itineraire; }
    public void setItineraire(String itineraire) { this.itineraire = itineraire; }

    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    public enum TypeOptimisation {
        NAIVE,
        OPTIMISEE
    }
}
