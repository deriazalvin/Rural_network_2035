package com.ruralnetwork.dto;

import java.util.List;

/**
 * DTO représentant une étape d'une tournée (un village visité).
 */
public class EtapeTourneeDTO {
    private String villageId;
    private String villageNom;
    private Double latitude;
    private Double longitude;
    private Double distanceCumulee;
    private Double chargeCumulee;
    private Double productionCollectee;

    public EtapeTourneeDTO() {}

    public EtapeTourneeDTO(String villageId, String villageNom, Double latitude, Double longitude,
                           Double distanceCumulee, Double chargeCumulee, Double productionCollectee) {
        this.villageId = villageId;
        this.villageNom = villageNom;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceCumulee = distanceCumulee;
        this.chargeCumulee = chargeCumulee;
        this.productionCollectee = productionCollectee;
    }

    public String getVillageId() { return villageId; }
    public void setVillageId(String villageId) { this.villageId = villageId; }

    public String getVillageNom() { return villageNom; }
    public void setVillageNom(String villageNom) { this.villageNom = villageNom; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getDistanceCumulee() { return distanceCumulee; }
    public void setDistanceCumulee(Double distanceCumulee) { this.distanceCumulee = distanceCumulee; }

    public Double getChargeCumulee() { return chargeCumulee; }
    public void setChargeCumulee(Double chargeCumulee) { this.chargeCumulee = chargeCumulee; }

    public Double getProductionCollectee() { return productionCollectee; }
    public void setProductionCollectee(Double productionCollectee) { this.productionCollectee = productionCollectee; }
}
