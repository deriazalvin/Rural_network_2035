package com.ruralnetwork.entite;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "optimisations_historique")
public class OptimisationHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "resultat_json", nullable = false, columnDefinition = "TEXT")
    private String resultatJson;

    @Column(name = "distance_total_km")
    private Double distanceTotalKm;

    @Column(name = "cout_total")
    private Double coutTotal;

    @Column(name = "gain_pourcent")
    private Double gainPourcent;

    @Column(name = "nombre_tournees")
    private Integer nombreTournees;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    public OptimisationHistorique() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }

    public String getResultatJson() { return resultatJson; }
    public void setResultatJson(String resultatJson) { this.resultatJson = resultatJson; }

    public Double getDistanceTotalKm() { return distanceTotalKm; }
    public void setDistanceTotalKm(Double distanceTotalKm) { this.distanceTotalKm = distanceTotalKm; }

    public Double getCoutTotal() { return coutTotal; }
    public void setCoutTotal(Double coutTotal) { this.coutTotal = coutTotal; }

    public Double getGainPourcent() { return gainPourcent; }
    public void setGainPourcent(Double gainPourcent) { this.gainPourcent = gainPourcent; }

    public Integer getNombreTournees() { return nombreTournees; }
    public void setNombreTournees(Integer nombreTournees) { this.nombreTournees = nombreTournees; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
