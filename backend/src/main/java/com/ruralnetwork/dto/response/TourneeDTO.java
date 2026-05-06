package com.ruralnetwork.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO pour une tournée dans le résultat d'optimisation
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TourneeDTO {
    private String camionId;
    private String camionNom;
    private Double distanceTournee;
    private Double tempsEstime;
    private List<EtapeDTO> etapes;
}
