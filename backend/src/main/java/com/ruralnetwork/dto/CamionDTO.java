package com.ruralnetwork.dto;

/**
 * DTO représentant un camion de la flotte.
 */
public class CamionDTO {
    private String id;
    private String nom;
    private Double capaciteKg;
    private String etat;
    private String couleurHex;

    public CamionDTO() {}

    public CamionDTO(String id, String nom, Double capaciteKg, String etat, String couleurHex) {
        this.id = id;
        this.nom = nom;
        this.capaciteKg = capaciteKg;
        this.etat = etat;
        this.couleurHex = couleurHex;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getCapaciteKg() { return capaciteKg; }
    public void setCapaciteKg(Double capaciteKg) { this.capaciteKg = capaciteKg; }

    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }

    public String getCouleurHex() { return couleurHex; }
    public void setCouleurHex(String couleurHex) { this.couleurHex = couleurHex; }
}
