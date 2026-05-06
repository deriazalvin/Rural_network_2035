package com.ruralnetwork.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer/modifier un camion
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CamionRequestDTO {
    private String nom;
    private Double capaciteKg;
    private String couleurHex;
}
