package com.ruralnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {
    
    private String id;
    private String villageDepart_id;
    private String village_arrivee_id;
    private String villageDepart;
    private String villageArrivee;
    
    private Double distance;  // ⭐ AUTO-CALCULATED by backend - NOT required from frontend ⭐
    
    private String qualiteRoute;  // BONNE, MOYENNE, MAUVAISE
    
    private Boolean estBloquee;
}