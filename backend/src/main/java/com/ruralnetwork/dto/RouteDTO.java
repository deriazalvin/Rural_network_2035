package com.ruralnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {
    
    private String id;
    private String villageDepart_id;
    private String village_arrivee_id;
    private String villageDepart;
    private String villageArrivee;
    
    private Double distance;
    private String qualiteRoute;
    private Boolean estBloquee;
    private Double dureeMinutes;

    // Getters
    public String getId() { return id; }
    public String getVillageDepart_id() { return villageDepart_id; }
    public String getVillage_arrivee_id() { return village_arrivee_id; }
    public String getVillageDepart() { return villageDepart; }
    public String getVillageArrivee() { return villageArrivee; }
    public Double getDistance() { return distance; }
    public String getQualiteRoute() { return qualiteRoute; }
    public Boolean getEstBloquee() { return estBloquee; }
    public Double getDureeMinutes() { return dureeMinutes; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setVillageDepart_id(String villageDepart_id) { this.villageDepart_id = villageDepart_id; }
    public void setVillage_arrivee_id(String village_arrivee_id) { this.village_arrivee_id = village_arrivee_id; }
    public void setVillageDepart(String villageDepart) { this.villageDepart = villageDepart; }
    public void setVillageArrivee(String villageArrivee) { this.villageArrivee = villageArrivee; }
    public void setDistance(Double distance) { this.distance = distance; }
    public void setQualiteRoute(String qualiteRoute) { this.qualiteRoute = qualiteRoute; }
    public void setEstBloquee(Boolean estBloquee) { this.estBloquee = estBloquee; }
    public void setDureeMinutes(Double dureeMinutes) { this.dureeMinutes = dureeMinutes; }
}
