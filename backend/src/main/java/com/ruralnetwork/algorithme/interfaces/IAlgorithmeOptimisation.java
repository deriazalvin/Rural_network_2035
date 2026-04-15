package com.ruralnetwork.algorithme.interfaces;

import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.dto.TourneeDTO;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Interface pour les algorithmes d'optimisation de tournées.
 * Respecte les contraintes métier (capacité, villages, distances).
 */
public interface IAlgorithmeOptimisation {
    
    /**
     * Construit une tournée optimisée pour un camion donné.
     *
     * @param camion Camion à affecter
     * @param depot Village de départ/retour
     * @param villagesDisponibles Villages à considérer
     * @param villagesVisites Ensemble des villages déjà attribués
     * @param couleur Couleur hex pour l'affichage
     * @return DTO représentant la tournée complète
     */
    TourneeDTO construireTourneeOptimisee(
            Camion camion,
            Village depot,
            List<Village> villagesDisponibles,
            Set<String> villagesVisites,
            String couleur
    );
    
    /**
     * Calcule la distance d'une solution de référence (naïve).
     *
     * @param depot Lieu de départ
     * @param villages Villages à couvrir
     * @return Distance totale de la solution naïve
     */
    Double calculerDistanceReferenceNaive(Village depot, List<Village> villages);
}
