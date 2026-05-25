package com.ruralnetwork.service.orchestration;

import com.ruralnetwork.algorithme.interfaces.IAlgorithmeOptimisation;
import com.ruralnetwork.depot.CamionDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.MeteoDTO;
import com.ruralnetwork.dto.OptimisationComparativeDTO;
import com.ruralnetwork.dto.OptimisationResultatDTO;
import com.ruralnetwork.dto.TourneeDTO;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.service.meteo.ServiceMeteo;
import com.ruralnetwork.service.utilitaire.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Orchestrateur principal pour l'optimisation des tournées.
 * Coordonne tous les éléments (algorithmes, utilitaires, données) pour une optimisation complète.
 */
@Service
public class OrchestrateurOptimisation {

    private static final Double COUT_PAR_KM_DEFAUT = 0.15; // Ariary par km

    private final VillageDepot villageDepot;
    private final CamionDepot camionDepot;
    private final CalculatriceMatriceDistances calculatriceMatrice;
    private final ValidateurOptimisation validateurOptimisation;
    private final ConvertisseurData convertisseurData;
    private final IAlgorithmeOptimisation algorithmOptimisation;
    private final ServiceMeteo serviceMeteo;

    public OrchestrateurOptimisation(
            VillageDepot villageDepot,
            CamionDepot camionDepot,
            CalculatriceMatriceDistances calculatriceMatrice,
            ValidateurOptimisation validateurOptimisation,
            ConvertisseurData convertisseurData,
            IAlgorithmeOptimisation algorithmOptimisation,
            ServiceMeteo serviceMeteo) {
        this.villageDepot = villageDepot;
        this.camionDepot = camionDepot;
        this.calculatriceMatrice = calculatriceMatrice;
        this.validateurOptimisation = validateurOptimisation;
        this.convertisseurData = convertisseurData;
        this.algorithmOptimisation = algorithmOptimisation;
        this.serviceMeteo = serviceMeteo;
    }

    /**
     * Orchestre l'optimisation complète des tournées.
     */
    public OptimisationResultatDTO optimiserTournees(Long utilisateurId, String depotId, List<String> camionIds, Double prixCarburantKm) {
        long tempsDebut = System.currentTimeMillis();
        Double prixKm = prixCarburantKm != null && prixCarburantKm > 0 ? prixCarburantKm : COUT_PAR_KM_DEFAUT;

        // Étape 1 : Récupération des données utilisateur
        List<Village> tousLesVillages = villageDepot.findByUtilisateurIdOrderByNomAsc(utilisateurId);
        Village depot = villageDepot.findByIdAndUtilisateurId(depotId, utilisateurId).orElse(null);

        if (depot == null || tousLesVillages.isEmpty()) {
            return creerResultatVide(0L);
        }

        // Étape 2 : Validation
        List<Camion> camionsDisponibles = extraireEtValiderCamions(utilisateurId, camionIds);
        if (camionsDisponibles.isEmpty()) {
            return creerResultatVide(0L);
        }

        // Étape 3 : Préparation des données
        List<Village> villagesAVisiter = convertisseurData.extraireVillagesAVisiter(tousLesVillages, depot);
        Map<String, Map<String, Double>> matriceDistances = calculatriceMatrice.construireMatrice(tousLesVillages);

        // Étape 4 : Calcul baseline
        Double distanceBaseline = algorithmOptimisation.calculerDistanceReferenceNaive(depot, villagesAVisiter, matriceDistances);
        Double coutBaseline = distanceBaseline * prixKm;

        // Étape 5 : Construction des tournées
        Set<String> villagesVisites = new HashSet<>();
        villagesVisites.add(depot.getId());

        List<TourneeDTO> tournees = new ArrayList<>();
        Double distanceTotalKm = 0.0;
        Double coutTotal = 0.0;

        for (int i = 0; i < camionsDisponibles.size(); i++) {
            Camion camion = camionsDisponibles.get(i);
            String couleur = convertisseurData.obtenirCouleur(i);

            TourneeDTO tournee = algorithmOptimisation.construireTourneeOptimisee(
                    camion, depot, villagesAVisiter, villagesVisites, couleur, matriceDistances
            );
            tournee.setCoutTotal(tournee.getDistanceTotalKm() * prixKm);

            tournees.add(tournee);
            distanceTotalKm += tournee.getDistanceTotalKm();
            coutTotal += tournee.getCoutTotal();
        }

        // Étape 6 : Calcul des statistiques
        List<String> villagesNonDesservis = extraireVillagesNonDesservis(villagesAVisiter, villagesVisites);
        Double gainPourcent = calculerGainPourcent(distanceBaseline, distanceTotalKm);
        Double economieTotal = coutBaseline - coutTotal;

        long dureeCalculMs = System.currentTimeMillis() - tempsDebut;

        return new OptimisationResultatDTO(
                tournees, distanceTotalKm, coutTotal, distanceBaseline, coutBaseline,
                gainPourcent, economieTotal, villagesNonDesservis, dureeCalculMs
        );
    }

    /**
     * Optimisation comparative : retourne 2 résultats (standard + avec ajustement météo).
     */
    public OptimisationComparativeDTO optimiserTourneesAvecMeteo(Long utilisateurId, String depotId, List<String> camionIds, Double prixCarburantKm) {
        long tempsDebut = System.currentTimeMillis();

        // Résultat A : optimisation standard
        OptimisationResultatDTO resultatStandard = optimiserTournees(utilisateurId, depotId, camionIds, prixCarburantKm);

        // Récupération des données
        List<Village> tousLesVillages = villageDepot.findByUtilisateurIdOrderByNomAsc(utilisateurId);
        Village depot = villageDepot.findByIdAndUtilisateurId(depotId, utilisateurId).orElse(null);
        if (depot == null || tousLesVillages.isEmpty()) {
            return new OptimisationComparativeDTO(resultatStandard, creerResultatVide(0L), 0.0, 0.0, new ArrayList<>());
        }

        // Récupération météo et application des pénalités
        Map<String, Double> penalitesVillages = new HashMap<>();
        List<String> villagesTouchesParMeteo = new ArrayList<>();

        for (Village v : tousLesVillages) {
            try {
                MeteoDTO meteo = serviceMeteo.obtenirMeteoParCoords(v.getLatitude(), v.getLongitude());
                String condition = determinerConditionMeteo(meteo);
                double penalite = getPenaliteCondition(condition);
                penalitesVillages.put(v.getId(), penalite);
                if (penalite > 0) {
                    villagesTouchesParMeteo.add(v.getNom());
                }
            } catch (Exception e) {
                penalitesVillages.put(v.getId(), 0.0);
            }
        }

        // Construction de la matrice avec pénalités météo
        Map<String, Map<String, Double>> matriceOriginale = calculatriceMatrice.construireMatrice(tousLesVillages);
        Map<String, Map<String, Double>> matriceAvecMeteo = new HashMap<>();

        for (Map.Entry<String, Map<String, Double>> ligne : matriceOriginale.entrySet()) {
            Map<String, Double> nouvelleLigne = new HashMap<>();
            for (Map.Entry<String, Double> colonne : ligne.getValue().entrySet()) {
                double penaliteSrc = penalitesVillages.getOrDefault(ligne.getKey(), 0.0);
                double penaliteDst = penalitesVillages.getOrDefault(colonne.getKey(), 0.0);
                double penaliteMax = Math.max(penaliteSrc, penaliteDst);
                double distanceAjustee = colonne.getValue() * (1.0 + penaliteMax);
                nouvelleLigne.put(colonne.getKey(), distanceAjustee);
            }
            matriceAvecMeteo.put(ligne.getKey(), nouvelleLigne);
        }

        // Résultat B : optimisation avec météo
        OptimisationResultatDTO resultatAvecMeteo = executerOptimisationAvecMatrice(
                utilisateurId, depotId, camionIds, prixCarburantKm, depot, tousLesVillages, matriceAvecMeteo
        );

        double diffDistance = Math.abs(resultatAvecMeteo.getDistanceTotalKm() - resultatStandard.getDistanceTotalKm());
        double diffCout = Math.abs(resultatAvecMeteo.getCoutTotal() - resultatStandard.getCoutTotal());

        long dureeCalculMs = System.currentTimeMillis() - tempsDebut;
        if (resultatStandard.getDureeCalculMs() != null) {
            dureeCalculMs += resultatStandard.getDureeCalculMs();
        }

        return new OptimisationComparativeDTO(
                resultatStandard, resultatAvecMeteo,
                Math.round(diffDistance * 100.0) / 100.0,
                Math.round(diffCout * 100.0) / 100.0,
                villagesTouchesParMeteo
        );
    }

    private OptimisationResultatDTO executerOptimisationAvecMatrice(
            Long utilisateurId, String depotId, List<String> camionIds, Double prixCarburantKm,
            Village depot, List<Village> tousLesVillages, Map<String, Map<String, Double>> matriceDistances) {

        Double prixKm = prixCarburantKm != null && prixCarburantKm > 0 ? prixCarburantKm : COUT_PAR_KM_DEFAUT;

        List<Camion> camionsDisponibles = extraireEtValiderCamions(utilisateurId, camionIds);
        if (camionsDisponibles.isEmpty()) {
            return creerResultatVide(0L);
        }

        List<Village> villagesAVisiter = convertisseurData.extraireVillagesAVisiter(tousLesVillages, depot);

        Double distanceBaseline = algorithmOptimisation.calculerDistanceReferenceNaive(depot, villagesAVisiter, matriceDistances);
        Double coutBaseline = distanceBaseline * prixKm;

        Set<String> villagesVisites = new HashSet<>();
        villagesVisites.add(depot.getId());

        List<TourneeDTO> tournees = new ArrayList<>();
        Double distanceTotalKm = 0.0;
        Double coutTotal = 0.0;

        for (int i = 0; i < camionsDisponibles.size(); i++) {
            Camion camion = camionsDisponibles.get(i);
            String couleur = convertisseurData.obtenirCouleur(i);

            TourneeDTO tournee = algorithmOptimisation.construireTourneeOptimisee(
                    camion, depot, villagesAVisiter, villagesVisites, couleur, matriceDistances
            );
            tournee.setCoutTotal(tournee.getDistanceTotalKm() * prixKm);

            tournees.add(tournee);
            distanceTotalKm += tournee.getDistanceTotalKm();
            coutTotal += tournee.getCoutTotal();
        }

        List<String> villagesNonDesservis = extraireVillagesNonDesservis(villagesAVisiter, villagesVisites);
        Double gainPourcent = calculerGainPourcent(distanceBaseline, distanceTotalKm);
        Double economieTotal = coutBaseline - coutTotal;

        return new OptimisationResultatDTO(
                tournees, distanceTotalKm, coutTotal, distanceBaseline, coutBaseline,
                gainPourcent, economieTotal, villagesNonDesservis, 0L
        );
    }

    private String determinerConditionMeteo(MeteoDTO meteo) {
        String desc = meteo.getDescription().toLowerCase();
        if (desc.contains("neige") || desc.contains("grêle") || desc.contains("grèle") || desc.contains("verglas")) {
            return "NEIGE";
        }
        if (desc.contains("pluie") || desc.contains("orage") || desc.contains("averse") || desc.contains("bruine")) {
            return "PLUIE";
        }
        if (meteo.getVentVitesse() > 50) {
            return "VENT_FORT";
        }
        return "BONNES";
    }

    private double getPenaliteCondition(String condition) {
        return switch (condition) {
            case "PLUIE" -> 0.20;
            case "VENT_FORT" -> 0.15;
            case "NEIGE" -> 0.30;
            default -> 0.0;
        };
    }

    // ====== Méthodes privées d'aide ======

    private List<Camion> extraireEtValiderCamions(Long utilisateurId, List<String> camionIds) {
        List<Camion> camions = new ArrayList<>();
        for (String id : camionIds) {
            camionDepot.findByIdAndUtilisateurId(id, utilisateurId).ifPresent(camions::add);
        }
        return convertisseurData.filtrerCamionsDisponibles(camions);
    }

    private List<String> extraireVillagesNonDesservis(List<Village> villagesAVisiter, Set<String> villagesVisites) {
        List<String> nonDesservis = new ArrayList<>();
        for (Village v : villagesAVisiter) {
            if (!villagesVisites.contains(v.getId())) {
                nonDesservis.add(v.getNom());
            }
        }
        return nonDesservis;
    }

    private Double calculerGainPourcent(Double distanceBaseline, Double distanceTotalKm) {
        return distanceBaseline > 0 
            ? ((distanceBaseline - distanceTotalKm) / distanceBaseline) * 100 
            : 0;
    }

    private OptimisationResultatDTO creerResultatVide(Long duree) {
        return new OptimisationResultatDTO(
                new ArrayList<>(), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, new ArrayList<>(), duree
        );
    }
}
