package com.ruralnetwork.dto;

import java.util.List;

/**
 * DTO représentant une étape d'une tournée (un village visité).
 */
public class EtapeTourneeDTO {
    private String villageId;
    private String nom;
    private Double latitude;
    private Double longitude;
    private Double distanceCumulee;
    private Double chargeCumulee;
    private Double production;

    public EtapeTourneeDTO() {}

    public EtapeTourneeDTO(String villageId, String nom, Double latitude, Double longitude,
                           Double distanceCumulee, Double chargeCumulee, Double production) {
        this.villageId = villageId;
        this.nom = nom;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceCumulee = distanceCumulee;
        this.chargeCumulee = chargeCumulee;
        this.production = production;
    }

    public String getVillageId() { return villageId; }
    public void setVillageId(String villageId) { this.villageId = villageId; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getDistanceCumulee() { return distanceCumulee; }
    public void setDistanceCumulee(Double distanceCumulee) { this.distanceCumulee = distanceCumulee; }

    public Double getChargeCumulee() { return chargeCumulee; }
    public void setChargeCumulee(Double chargeCumulee) { this.chargeCumulee = chargeCumulee; }

    public Double getProduction() { return production; }
    public void setProduction(Double production) { this.production = production; }
}
