package com.ruralnetwork.dto.request;

import java.util.List;

/**
 * DTO pour lancer une optimisation multi-camions
 */
public class OptimisationRequestDTO {
    private String depotId;
    private List<String> camionIds;

    public OptimisationRequestDTO() {
    }

    public OptimisationRequestDTO(String depotId, List<String> camionIds) {
        this.depotId = depotId;
        this.camionIds = camionIds;
    }

    public String getDepotId() {
        return depotId;
    }

    public void setDepotId(String depotId) {
        this.depotId = depotId;
    }

    public List<String> getCamionIds() {
        return camionIds;
    }

    public void setCamionIds(List<String> camionIds) {
        this.camionIds = camionIds;
    }
}
