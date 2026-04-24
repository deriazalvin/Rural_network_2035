package com.ruralnetwork.dto;

public class VillageDTO {
    private String id;
    private String nom;
    private Double latitude;
    private Double longitude;
    private Double volumeProduction;
    private Double productionTotale;
    private Double productionNonTransportee;

    public VillageDTO() {}

    public VillageDTO(String id, String nom, Double latitude, Double longitude, Double volumeProduction,
                     Double productionTotale, Double productionNonTransportee) {
        this.id = id;
        this.nom = nom;
        this.latitude = latitude;
        this.longitude = longitude;
        this.volumeProduction = volumeProduction;
        this.productionTotale = productionTotale;
        this.productionNonTransportee = productionNonTransportee;
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
}
