package com.ruralnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * DTO pour la gestion des routes dans le Smart Rural Network 2035.
 * Utilise Lombok pour réduire le code boilerplate.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {

    private String id;

    @NotBlank(message = "Le village de départ est obligatoire")
    private String villageDepartId;

    @NotBlank(message = "Le village d'arrivée est obligatoire")
    private String villageArriveeId;

    /**
     * Distance calculée automatiquement par l'algorithme (Dijkstra/A*).
     * Ne doit pas être saisie manuellement par l'utilisateur.
     */
    private Double distance;

    @NotNull(message = "La qualité de la route est obligatoire")
    private String qualiteRoute;

    @Builder.Default
    private Boolean estBloquee = false;

    private String dateCreation;

    // Champs informatifs pour l'affichage côté Front-end
    private String nomVillageDepart;
    private String nomVillageArrivee;
}