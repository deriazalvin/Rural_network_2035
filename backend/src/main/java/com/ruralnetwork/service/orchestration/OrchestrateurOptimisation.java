package com.ruralnetwork.service.orchestration;

import com.ruralnetwork.algorithme.interfaces.IAlgorithmeOptimisation;
import com.ruralnetwork.depot.CamionDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.dto.OptimisationResultatDTO;
import com.ruralnetwork.dto.TourneeDTO;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.service.utilitaire.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Orchestrateur principal pour l'optimisation des tournées.
 * Coordonne tous les éléments (algorithmes, utilitaires, données) pour une optimisation complète.
 */
@Service
public class OrchestrateurOptimisation {

    private static final Double COUT_PAR_KM = 0.15; // Ariary par km

    private final VillageDepot villageDepot;
    private final CamionDepot camionDepot;
    private final CalculatriceMatriceDistances calculatriceMatrice;
    private final ValidateurOptimisation validateurOptimisation;
    private final ConvertisseurData convertisseurData;
    private final IAlgorithmeOptimisation algorithmOptimisation;

    public OrchestrateurOptimisation(
            VillageDepot villageDepot,
            CamionDepot camionDepot,
            CalculatriceMatriceDistances calculatriceMatrice,
            ValidateurOptimisation validateurOptimisation,
            ConvertisseurData convertisseurData,
            IAlgorithmeOptimisation algorithmOptimisation) {
        this.villageDepot = villageDepot;
        this.camionDepot = camionDepot;
        this.calculatriceMatrice = calculatriceMatrice;
        this.validateurOptimisation = validateurOptimisation;
        this.convertisseurData = convertisseurData;
        this.algorithmOptimisation = algorithmOptimisation;
    }

    /**
     * Orchestre l'optimisation complète des tournées.
     */
    public OptimisationResultatDTO optimiserTournees(String depotId, List<String> camionIds) {
        long tempsDebut = System.currentTimeMillis();

        // Étape 1 : Récupération des données
        List<Village> tousLesVillages = villageDepot.findAll();
        Village depot = villageDepot.findById(depotId).orElse(null);

        if (depot == null || tousLesVillages.isEmpty()) {
            return creerResultatVide(0L);
        }

        // Étape 2 : Validation
        List<Camion> camionsDisponibles = extraireEtValiderCamions(camionIds);
        if (camionsDisponibles.isEmpty()) {
            return creerResultatVide(0L);
        }

        // Étape 3 : Préparation des données
        List<Village> villagesAVisiter = convertisseurData.extraireVillagesAVisiter(tousLesVillages, depot);
        Map<String, Map<String, Double>> matriceDistances = calculatriceMatrice.construireMatrice(tousLesVillages);

        // Étape 4 : Calcul baselineépôt
        Double distanceBaseline = algorithmOptimisation.calculerDistanceReferenceNaive(depot, villagesAVisiter);
        Double coutBaseline = distanceBaseline * COUT_PAR_KM;

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
                    camion, depot, villagesAVisiter, villagesVisites, couleur
            );

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

    // ====== Méthodes privées d'aide ======

    private List<Camion> extraireEtValiderCamions(List<String> camionIds) {
        List<Camion> camions = new ArrayList<>();
        for (String id : camionIds) {
            camionDepot.findById(id).ifPresent(camions::add);
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
