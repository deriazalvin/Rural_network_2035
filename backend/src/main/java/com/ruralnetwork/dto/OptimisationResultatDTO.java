package com.ruralnetwork.dto;

import java.util.List;

/**
 * DTO représentant le résultat complet d'une optimisation de tournées.
 * Contient les tournées, les statistiques de gain, et les villages non desservis.
 */
public class OptimisationResultatDTO {
    private List<TourneeDTO> tournees;
    private Double distanceTotalKm;
    private Double coutTotal;
    private Double distanceBaselinKm;
    private Double coutBaseline;
    private Double gainPourcent;
    private Double economieTotal;
    private List<String> villagesNonDesservis;
    private Long dureeCalculMs;

    public OptimisationResultatDTO() {}

    public OptimisationResultatDTO(List<TourneeDTO> tournees, Double distanceTotalKm, Double coutTotal,
                                   Double distanceBaselinKm, Double coutBaseline, Double gainPourcent,
                                   Double economieTotal, List<String> villagesNonDesservis, Long dureeCalculMs) {
        this.tournees = tournees;
        this.distanceTotalKm = distanceTotalKm;
        this.coutTotal = coutTotal;
        this.distanceBaselinKm = distanceBaselinKm;
        this.coutBaseline = coutBaseline;
        this.gainPourcent = gainPourcent;
        this.economieTotal = economieTotal;
        this.villagesNonDesservis = villagesNonDesservis;
        this.dureeCalculMs = dureeCalculMs;
    }

    public List<TourneeDTO> getTournees() { return tournees; }
    public void setTournees(List<TourneeDTO> tournees) { this.tournees = tournees; }

    public Double getDistanceTotalKm() { return distanceTotalKm; }
    public void setDistanceTotalKm(Double distanceTotalKm) { this.distanceTotalKm = distanceTotalKm; }

    public Double getCoutTotal() { return coutTotal; }
    public void setCoutTotal(Double coutTotal) { this.coutTotal = coutTotal; }

    public Double getDistanceBaselinKm() { return distanceBaselinKm; }
    public void setDistanceBaselinKm(Double distanceBaselinKm) { this.distanceBaselinKm = distanceBaselinKm; }

    public Double getCoutBaseline() { return coutBaseline; }
    public void setCoutBaseline(Double coutBaseline) { this.coutBaseline = coutBaseline; }

    public Double getGainPourcent() { return gainPourcent; }
    public void setGainPourcent(Double gainPourcent) { this.gainPourcent = gainPourcent; }

    public Double getEconomieTotal() { return economieTotal; }
    public void setEconomieTotal(Double economieTotal) { this.economieTotal = economieTotal; }

    public List<String> getVillagesNonDesservis() { return villagesNonDesservis; }
    public void setVillagesNonDesservis(List<String> villagesNonDesservis) { this.villagesNonDesservis = villagesNonDesservis; }

    public Long getDureeCalculMs() { return dureeCalculMs; }
    public void setDureeCalculMs(Long dureeCalculMs) { this.dureeCalculMs = dureeCalculMs; }
}
