/**
 * Service de Traitement des Données d'Optimisation
 * Responsabilité : transformer et préparer les données pour l'affichage
 */

export const TraiteurDonneesOptimisation = {
  /**
   * Calcule les statistiques globales
   */
  calculerStatistiquesGlobales(resultats) {
    const {
      distanceTotalKm = 0,
      distanceBaseline = 0,
      coutTotal = 0,
      coutBaseline = 0
    } = resultats;

    return {
      gainDistance: (distanceBaseline - distanceTotalKm).toFixed(2),
      gainCout: (coutBaseline - coutTotal).toFixed(2),
      gainPourcentDistance: ((distanceBaseline - distanceTotalKm) / distanceBaseline * 100).toFixed(2),
      gainPourcentCout: ((coutBaseline - coutTotal) / coutBaseline * 100).toFixed(2)
    };
  },

  /**
   * Trie les tournées par charge percentuelle
   */
  trierTourneeParCharge(tournees) {
    return [...tournees].sort((a, b) => {
      const chargeA = (a.chargeTotalKg / a.capaciteKg) * 100;
      const chargeB = (b.chargeTotalKg / b.capaciteKg) * 100;
      return chargeB - chargeA;
    });
  },

  /**
   * Trie les tournées par distance
   */
  trierTourneeParDistance(tournees) {
    return [...tournees].sort((a, b) => a.distanceTotalKm - b.distanceTotalKm);
  },

  /**
   * Formate une distance
   */
  formaterDistance(km) {
    return `${parseFloat(km).toFixed(2)} km`;
  },

  /**
   * Formate un coût
   */
  formaterCout(ariary) {
    return `${parseFloat(ariary).toFixed(2)} Ar`;
  },

  /**
   * Formate un pourcentage
   */
  formaterPourcentage(valeur) {
    return `${parseFloat(valeur).toFixed(2)}%`;
  }
};
