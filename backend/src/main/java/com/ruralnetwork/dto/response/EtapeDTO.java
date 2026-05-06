package com.ruralnetwork.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour une étape d'une tournée
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EtapeDTO {
    private int ordre;
    private String villageId;
    private String villageName;
    private Double latitude;
    private Double longitude;
    private Double productionCollectee;
    private Double distanceDepuis;
    private Double tempsDepuis;
}
