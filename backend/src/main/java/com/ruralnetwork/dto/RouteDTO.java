package com.ruralnetwork.dto;

public class RouteDTO {
    private String id;
    private String villageDepart;
    private String villageArrivee;
    private String villageDepart_id;
    private String village_arrivee_id;
    private Double distance;
    private String qualiteRoute;
    private Boolean estBloquee;

    public RouteDTO() {}

    public RouteDTO(String id, String villageDepart, String villageArrivee, String villageDepart_id,
                    String village_arrivee_id, Double distance, String qualiteRoute, Boolean estBloquee) {
        this.id = id;
        this.villageDepart = villageDepart;
        this.villageArrivee = villageArrivee;
        this.villageDepart_id = villageDepart_id;
        this.village_arrivee_id = village_arrivee_id;
        this.distance = distance;
        this.qualiteRoute = qualiteRoute;
        this.estBloquee = estBloquee;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVillageDepart() { return villageDepart; }
    public void setVillageDepart(String villageDepart) { this.villageDepart = villageDepart; }

    public String getVillageArrivee() { return villageArrivee; }
    public void setVillageArrivee(String villageArrivee) { this.villageArrivee = villageArrivee; }

    public String getVillageDepart_id() { return villageDepart_id; }
    public void setVillageDepart_id(String villageDepart_id) { this.villageDepart_id = villageDepart_id; }

    public String getVillage_arrivee_id() { return village_arrivee_id; }
    public void setVillage_arrivee_id(String village_arrivee_id) { this.village_arrivee_id = village_arrivee_id; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getQualiteRoute() { return qualiteRoute; }
    public void setQualiteRoute(String qualiteRoute) { this.qualiteRoute = qualiteRoute; }

    public Boolean getEstBloquee() { return estBloquee; }
    public void setEstBloquee(Boolean estBloquee) { this.estBloquee = estBloquee; }
}
