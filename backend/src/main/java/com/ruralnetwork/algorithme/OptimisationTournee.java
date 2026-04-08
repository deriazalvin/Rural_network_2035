package com.ruralnetwork.algorithme;

import com.ruralnetwork.structure.Graphe;
import java.util.*;

/**
 * OptimisationTournee
 * Algorithme d'optimisation des tournées de collecte
 * Utilise une approche gloutonne améliorée inspirée du TSP
 */
public class OptimisationTournee {

    private final Graphe graphe;
    private final Dijkstra dijkstra;

    public OptimisationTournee(Graphe graphe, Dijkstra dijkstra) {
        this.graphe = graphe;
        this.dijkstra = dijkstra;
    }

    public static class ResultatTournee {
        private List<String> itineraire;
        private Double distanceTotale;
        private Double chargeFinale;
        private String type;

        public ResultatTournee() {}

        public ResultatTournee(List<String> itineraire, Double distanceTotale, Double chargeFinale, String type) {
            this.itineraire = itineraire;
            this.distanceTotale = distanceTotale;
            this.chargeFinale = chargeFinale;
            this.type = type;
        }

        public List<String> getItineraire() { return itineraire; }
        public void setItineraire(List<String> itineraire) { this.itineraire = itineraire; }
        public Double getDistanceTotale() { return distanceTotale; }
        public void setDistanceTotale(Double distanceTotale) { this.distanceTotale = distanceTotale; }
        public Double getChargeFinale() { return chargeFinale; }
        public void setChargeFinale(Double chargeFinale) { this.chargeFinale = chargeFinale; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    public static class ComparaisonSolutions {
        private ResultatTournee naive;
        private ResultatTournee optimisee;
        private Double reductionPourcentage;
        private Double economieCarburant;
        private Double economieDistance;

        public ComparaisonSolutions() {}

        public ComparaisonSolutions(ResultatTournee naive, ResultatTournee optimisee, Double reductionPourcentage,
                                    Double economieCarburant, Double economieDistance) {
            this.naive = naive;
            this.optimisee = optimisee;
            this.reductionPourcentage = reductionPourcentage;
            this.economieCarburant = economieCarburant;
            this.economieDistance = economieDistance;
        }

        public ResultatTournee getNaive() { return naive; }
        public void setNaive(ResultatTournee naive) { this.naive = naive; }
        public ResultatTournee getOptimisee() { return optimisee; }
        public void setOptimisee(ResultatTournee optimisee) { this.optimisee = optimisee; }
        public Double getReductionPourcentage() { return reductionPourcentage; }
        public void setReductionPourcentage(Double reductionPourcentage) { this.reductionPourcentage = reductionPourcentage; }
        public Double getEconomieCarburant() { return economieCarburant; }
        public void setEconomieCarburant(Double economieCarburant) { this.economieCarburant = economieCarburant; }
        public Double getEconomieDistance() { return economieDistance; }
        public void setEconomieDistance(Double economieDistance) { this.economieDistance = economieDistance; }
    }

    public ResultatTournee calculerTourneeNaive(String villageDepart, List<String> villagesAVisiter,
                                               Double capaciteCamion) {
        List<String> itineraire = new ArrayList<>();
        itineraire.add(villageDepart);
        Double distanceTotale = 0.0;
        Double chargeActuelle = 0.0;
        String villageActuel = villageDepart;

        for (String villageId : villagesAVisiter) {
            Graphe.VillageInfo village = graphe.obtenirVillage(villageId);

            if (village != null && chargeActuelle + village.getVolumeProduction() <= capaciteCamion) {
                Dijkstra.ResultatChemin resultat = dijkstra.calculerPlusCourtChemin(villageActuel, villageId);

                if (resultat.getAccessible()) {
                    distanceTotale += resultat.getDistance();
                    chargeActuelle += village.getVolumeProduction();
                    itineraire.add(villageId);
                    villageActuel = villageId;
                }
            }
        }

        // Retour au point de départ
        Dijkstra.ResultatChemin retour = dijkstra.calculerPlusCourtChemin(villageActuel, villageDepart);
        if (retour.getAccessible()) {
            distanceTotale += retour.getDistance();
            itineraire.add(villageDepart);
        }

        return new ResultatTournee(itineraire, distanceTotale, chargeActuelle, "naive");
    }

    public ResultatTournee calculerTourneeOptimisee(String villageDepart, List<String> villagesAVisiter,
                                                   Double capaciteCamion) {
        List<String> itineraire = new ArrayList<>();
        itineraire.add(villageDepart);
        Double distanceTotale = 0.0;
        Double chargeActuelle = 0.0;
        String villageActuel = villageDepart;

        Set<String> villagesNonVisites = new HashSet<>(villagesAVisiter);

        while (!villagesNonVisites.isEmpty()) {
            String meilleurVillage = null;
            Double meilleureDistance = Double.POSITIVE_INFINITY;

            for (String villageId : villagesNonVisites) {
                Graphe.VillageInfo village = graphe.obtenirVillage(villageId);

                if (village != null && chargeActuelle + village.getVolumeProduction() <= capaciteCamion) {
                    Dijkstra.ResultatChemin resultat = dijkstra.calculerPlusCourtChemin(villageActuel, villageId);

                    if (resultat.getAccessible() && resultat.getDistance() < meilleureDistance) {
                        meilleureDistance = resultat.getDistance();
                        meilleurVillage = villageId;
                    }
                }
            }

            if (meilleurVillage == null) {
                break;
            }

            Graphe.VillageInfo village = graphe.obtenirVillage(meilleurVillage);
            distanceTotale += meilleureDistance;
            chargeActuelle += village.getVolumeProduction();
            itineraire.add(meilleurVillage);
            villageActuel = meilleurVillage;
            villagesNonVisites.remove(meilleurVillage);
        }

        // Retour au point de départ
        Dijkstra.ResultatChemin retour = dijkstra.calculerPlusCourtChemin(villageActuel, villageDepart);
        if (retour.getAccessible()) {
            distanceTotale += retour.getDistance();
            itineraire.add(villageDepart);
        }

        return new ResultatTournee(itineraire, distanceTotale, chargeActuelle, "optimisee");
    }

    public ComparaisonSolutions comparerSolutions(String villageDepart, List<String> villagesAVisiter,
                                                 Double capaciteCamion) {
        ResultatTournee naive = calculerTourneeNaive(villageDepart, villagesAVisiter, capaciteCamion);
        ResultatTournee optimisee = calculerTourneeOptimisee(villageDepart, villagesAVisiter, capaciteCamion);

        Double reduction = ((naive.getDistanceTotale() - optimisee.getDistanceTotale()) /
                           naive.getDistanceTotale()) * 100;

        Double coutCarburantParKm = 0.8;
        Double economieCarburant = (naive.getDistanceTotale() - optimisee.getDistanceTotale()) *
                                  coutCarburantParKm;

        return new ComparaisonSolutions(
            naive,
            optimisee,
            reduction,
            economieCarburant,
            naive.getDistanceTotale() - optimisee.getDistanceTotale()
        );
    }

    public Dijkstra.ResultatChemin calculerDeviation(String villageActuel, String villageDestination,
                                                     String routeBloqueeDepart, String routeBloqueeArrivee) {
        graphe.bloquerRoute(routeBloqueeDepart, routeBloqueeArrivee);
        Dijkstra.ResultatChemin nouveauChemin = dijkstra.calculerPlusCourtChemin(villageActuel, villageDestination);
        graphe.debloquerRoute(routeBloqueeDepart, routeBloqueeArrivee);

        return nouveauChemin;
    }
}
