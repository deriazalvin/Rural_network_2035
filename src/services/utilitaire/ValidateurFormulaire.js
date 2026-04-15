/**
 * Service de Validation des Données et Formulaires
 * Responsabilité : s'assurer que toutes les données sont valides
 */

export const ValidateurFormulaire = {
  /**
   * Valide les données du formulaire d'optimisation
   */
  validerFormulairesOptimisation(depotId, camionIds) {
    const erreurs = [];

    if (!depotId || depotId.trim() === '') {
      erreurs.push('Le dépôt doit être sélectionné');
    }

    if (!camionIds || camionIds.length === 0) {
      erreurs.push('Veuillez sélectionner au moins un camion');
    }

    return {
      estValide: erreurs.length === 0,
      erreurs
    };
  },

  /**
   * Valide une adresse email
   */
  validerEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Valide une longueur de texte
   */
  validerLongueur(texte, min, max) {
    const longueur = texte.trim().length;
    return longueur >= min && longueur <= max;
  },

  /**
   * Valide un nombre positif
   */
  validerNombrePositif(valeur) {
    return !isNaN(valeur) && Number(valeur) > 0;
  },

  /**
   * Valide les coordonnées (lat, lng)
   */
  validerCoordonnees(latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
};
