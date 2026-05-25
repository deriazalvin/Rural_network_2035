package com.ruralnetwork.dto;

import java.util.List;

public class OptimisationComparativeDTO {
    private OptimisationResultatDTO resultatStandard;
    private OptimisationResultatDTO resultatAvecMeteo;
    private Double differenceDistance;
    private Double differenceCout;
    private List<String> villagesTouchesParMeteo;

    public OptimisationComparativeDTO() {}

    public OptimisationComparativeDTO(OptimisationResultatDTO resultatStandard, OptimisationResultatDTO resultatAvecMeteo,
                                      Double differenceDistance, Double differenceCout, List<String> villagesTouchesParMeteo) {
        this.resultatStandard = resultatStandard;
        this.resultatAvecMeteo = resultatAvecMeteo;
        this.differenceDistance = differenceDistance;
        this.differenceCout = differenceCout;
        this.villagesTouchesParMeteo = villagesTouchesParMeteo;
    }

    public OptimisationResultatDTO getResultatStandard() { return resultatStandard; }
    public void setResultatStandard(OptimisationResultatDTO resultatStandard) { this.resultatStandard = resultatStandard; }

    public OptimisationResultatDTO getResultatAvecMeteo() { return resultatAvecMeteo; }
    public void setResultatAvecMeteo(OptimisationResultatDTO resultatAvecMeteo) { this.resultatAvecMeteo = resultatAvecMeteo; }

    public Double getDifferenceDistance() { return differenceDistance; }
    public void setDifferenceDistance(Double differenceDistance) { this.differenceDistance = differenceDistance; }

    public Double getDifferenceCout() { return differenceCout; }
    public void setDifferenceCout(Double differenceCout) { this.differenceCout = differenceCout; }

    public List<String> getVillagesTouchesParMeteo() { return villagesTouchesParMeteo; }
    public void setVillagesTouchesParMeteo(List<String> villagesTouchesParMeteo) { this.villagesTouchesParMeteo = villagesTouchesParMeteo; }
}
