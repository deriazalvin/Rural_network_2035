/**
 * Service pour l'optimisation des tournées
 * Communique avec l'API backend pour l'optimisation multi-camions
 */

class ServiceOptimisation {
  constructor(urlBase = '/api') {
    this.urlBase = urlBase;
  }

  /**
   * Lance l'optimisation complète des tournées
   * @param {string} depotId - ID du village dépôt
   * @param {string[]} camionIds - IDs des camions à utiliser (optionnel)
   * @returns {Promise<OptimisationResultatDTO>}
   */
  async optimiserTournees(depotId, camionIds = []) {
    try {
      const reponse = await fetch(`${this.urlBase}/optimisations/multi-camions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depotId, camionIds })
      });

      if (!reponse.ok) {
        throw new Error(`Erreur ${reponse.status}: ${reponse.statusText}`);
      }

      return await reponse.json();
    } catch (erreur) {
      console.error('Erreur lors de l\'optimisation:', erreur);
      throw erreur;
    }
  }

  /**
   * Récupère les camions disponibles
   */
  async obtenirCamions() {
    try {
      const reponse = await fetch(`${this.urlBase}/camions`);
      if (!reponse.ok) throw new Error('Erreur lors de la récupération des camions');
      return await reponse.json();
    } catch (erreur) {
      console.error('Erreur camions:', erreur);
      throw erreur;
    }
  }

  /**
   * Obtient les détails d'une tournée
   */
  async obtenirTournee(tourneeId) {
    try {
      const reponse = await fetch(`${this.urlBase}/tournees/${tourneeId}`);
      if (!reponse.ok) throw new Error('Erreur lors de la récupération de la tournée');
      return await reponse.json();
    } catch (erreur) {
      console.error('Erreur tournée:', erreur);
      throw erreur;
    }
  }

  /**
   * Enregistre une tournée comme complétée et met à jour les stocks
   */
  async validerTournee(tourneeId, stocksAjoutes) {
    try {
      const reponse = await fetch(`${this.urlBase}/tournees/${tourneeId}/valider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stocksAjoutes)
      });

      if (!reponse.ok) throw new Error('Erreur lors de la validation');
      return await reponse.json();
    } catch (erreur) {
      console.error('Erreur validation:', erreur);
      throw erreur;
    }
  }
}

export default new ServiceOptimisation();
