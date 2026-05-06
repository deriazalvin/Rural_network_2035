package com.ruralnetwork.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse d'une optimisation complète
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OptimisationResultatDTO {
    private int nbTournees;
    private int nbCamions;
    private Double distanceTotale;
    private Double gainEstime;
    private Double economiesRealises;
    private Double tempsEstime;
    private java.util.List<TourneeDTO> tournees;
    private java.util.List<String> villagesNonDesservis;
}
