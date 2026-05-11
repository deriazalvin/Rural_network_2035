package com.ruralnetwork.dto;

import java.util.List;

/**
 * DTO représentant une tournée optimisée (trace d'un camion).
 */
public class TourneeDTO {
    private String camionId;
    private String nom;
    private String couleurHex;
    private Double distanceTotalKm;
    private Double chargeTotalKg;
    private Double capaciteKg;
    private Double coutTotal;
    private List<EtapeTourneeDTO> etapes;

    public TourneeDTO() {}

    public TourneeDTO(String camionId, String nom, String couleurHex, Double distanceTotalKm,
                     Double chargeTotalKg, Double capaciteKg, Double coutTotal, List<EtapeTourneeDTO> etapes) {
        this.camionId = camionId;
        this.nom = nom;
        this.couleurHex = couleurHex;
        this.distanceTotalKm = distanceTotalKm;
        this.chargeTotalKg = chargeTotalKg;
        this.capaciteKg = capaciteKg;
        this.coutTotal = coutTotal;
        this.etapes = etapes;
    }

    public String getCamionId() { return camionId; }
    public void setCamionId(String camionId) { this.camionId = camionId; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getCouleurHex() { return couleurHex; }
    public void setCouleurHex(String couleurHex) { this.couleurHex = couleurHex; }

    public Double getDistanceTotalKm() { return distanceTotalKm; }
    public void setDistanceTotalKm(Double distanceTotalKm) { this.distanceTotalKm = distanceTotalKm; }

    public Double getChargeTotalKg() { return chargeTotalKg; }
    public void setChargeTotalKg(Double chargeTotalKg) { this.chargeTotalKg = chargeTotalKg; }

    public Double getCapaciteKg() { return capaciteKg; }
    public void setCapaciteKg(Double capaciteKg) { this.capaciteKg = capaciteKg; }

    public Double getCoutTotal() { return coutTotal; }
    public void setCoutTotal(Double coutTotal) { this.coutTotal = coutTotal; }

    public List<EtapeTourneeDTO> getEtapes() { return etapes; }
    public void setEtapes(List<EtapeTourneeDTO> etapes) { this.etapes = etapes; }
}
