/**
 * Service de Calculs Utilitaires
 * Responsabilité : effectuer des calculs communs et récurrents
 */

export const CalculatriceDonnees = {
  /**
   * Calcule la distance entre deux coordonnées (formule Haversine)
   */
  calculerDistanceEntre(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.degreEnRadian(lat2 - lat1);
    const dLon = this.degreEnRadian(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreEnRadian(lat1)) * Math.cos(this.degreEnRadian(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Convertit les degrés en radians
   */
  degreEnRadian(degre) {
    return degre * (Math.PI / 180);
  },

  /**
   * Calcule le taux d'occupation d'un camion
   */
  calculerTauxOccupation(chargeCourant, capaciteMax) {
    return (chargeCourant / capaciteMax) * 100;
  },

  /**
   * Calcule la moyenne d'un tableau de nombres
   */
  calculerMoyenne(nombres) {
    if (nombres.length === 0) return 0;
    return nombres.reduce((a, b) => a + b, 0) / nombres.length;
  },

  /**
   * Calcule le total d'un tableau de nombres
   */
  calculerTotal(nombres) {
    return nombres.reduce((a, b) => a + b, 0);
  },

  /**
   * Formate un nombre avec un nombre de décimales
   */
  formaterNombre(valeur, decimales = 2) {
    return parseFloat(valeur).toFixed(decimales);
  },

  /**
   * Génère une couleur hex aléatoire
   */
  genererCouleurAleatoire() {
    const couleurs = ['#0ea5e9', '#f97316', '#a3e635', '#e879f9', '#06b6d4', '#ec4899'];
    return couleurs[Math.floor(Math.random() * couleurs.length)];
  }
};
