package com.ruralnetwork.dto;

import java.util.List;

public class OptimisationDTO {
    private String villageDepart;
    private List<String> villagesAVisiter;
    private Double capaciteCamion;

    public OptimisationDTO() {}

    public OptimisationDTO(String villageDepart, List<String> villagesAVisiter, Double capaciteCamion) {
        this.villageDepart = villageDepart;
        this.villagesAVisiter = villagesAVisiter;
        this.capaciteCamion = capaciteCamion;
    }

    public String getVillageDepart() { return villageDepart; }
    public void setVillageDepart(String villageDepart) { this.villageDepart = villageDepart; }

    public List<String> getVillagesAVisiter() { return villagesAVisiter; }
    public void setVillagesAVisiter(List<String> villagesAVisiter) { this.villagesAVisiter = villagesAVisiter; }

    public Double getCapaciteCamion() { return capaciteCamion; }
    public void setCapaciteCamion(Double capaciteCamion) { this.capaciteCamion = capaciteCamion; }
}
