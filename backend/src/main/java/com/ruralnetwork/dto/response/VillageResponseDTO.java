package com.ruralnetwork.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse d'un village
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VillageResponseDTO {
    private String id;
    private String nom;
    private Double latitude;
    private Double longitude;
    private Double volumeProduction;
    private Double collecteRestante;
}
