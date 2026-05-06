package com.ruralnetwork.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer/modifier un village
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VillageRequestDTO {
    private String nom;
    private Double latitude;
    private Double longitude;
    private Double volumeProduction;
}
