package com.ruralnetwork.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer/modifier une route
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RouteRequestDTO {
    private String departId;
    private String arriveeId;
    private Integer qualite;
    private Boolean estBloquee;
}
