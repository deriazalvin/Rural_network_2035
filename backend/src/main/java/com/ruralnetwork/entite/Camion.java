package com.ruralnetwork.entite;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un véhicule (camion) de la flotte.
 * Un camion possède une capacité de charge et un état (disponible, occupé, en panne).
 */
@Entity
@Table(name = "camions")
public class Camion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private Double capaciteKg;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EtatCamion etat;

    @Column(name = "couleur_hex", length = 7)
    private String couleurHex;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    public Camion() {}

    public Camion(String id, String nom, Double capaciteKg, EtatCamion etat, String couleurHex, LocalDateTime dateCreation) {
        this.id = id;
        this.nom = nom;
        this.capaciteKg = capaciteKg;
        this.etat = etat;
        this.couleurHex = couleurHex;
        this.dateCreation = dateCreation;
    }

    // Getters / Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getCapaciteKg() { return capaciteKg; }
    public void setCapaciteKg(Double capaciteKg) { this.capaciteKg = capaciteKg; }

    public EtatCamion getEtat() { return etat; }
    public void setEtat(EtatCamion etat) { this.etat = etat; }

    public String getCouleurHex() { return couleurHex; }
    public void setCouleurHex(String couleurHex) { this.couleurHex = couleurHex; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    /**
     * États possibles d'un camion
     */
    public enum EtatCamion {
        DISPONIBLE,
        OCCUPE,
        EN_PANNE
    }
}
