/**
 * Service API - Optimisation de Tournées
 * Responsabilité : gérer tous les appels API relatifs à l'optimisation
 */

const URL_BASE_API = '/api'; // Utiliser le proxy Vite en dev

/**
 * Helper pour ajouter les headers d'authentification
 */
function obtenirHeadersAuthentifies(headersSupplementaires = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...headersSupplementaires
  };

  const token = localStorage.getItem('rn_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const ServiceApiOptimisation = {
  /**
   * Lance l'optimisation des tournées
   * @param {string} depotId - ID du dépôt
   * @param {string[]} camionIds - IDs des camions
   * @returns {Promise<Object>} Résultats d'optimisation
   */
  async lancerOptimisation(depotId, camionIds) {
    try {
      const reponse = await fetch(`${URL_BASE_API}/optimisations/multi-camions`, {
        method: 'POST',
        headers: obtenirHeadersAuthentifies(),
        body: JSON.stringify({
          depotId,
          camionIds
        })
      });

      if (!reponse.ok) {
        throw new Error(`Erreur HTTP ${reponse.status}`);
      }

      return await reponse.json();
    } catch (erreur) {
      console.error('Erreur lors de l\'optimisation :', erreur);
      throw erreur;
    }
  },

  /**
   * Récupère l'historique des optimisations
   * @returns {Promise<Object[]>} Liste des optimisations
   */
  async obtenirHistoriqueOptimisations() {
    try {
      const reponse = await fetch(`${URL_BASE_API}/optimisations/historique`, {
        headers: obtenirHeadersAuthentifies()
      });
      
      if (!reponse.ok) {
        throw new Error(`Erreur HTTP ${reponse.status}`);
      }

      return await reponse.json();
    } catch (erreur) {
      console.error('Erreur lors de la récupération de l\'historique :', erreur);
      return [];
    }
  },

  /**
   * Exporte une optimisation en PDF
   * @param {string} optimisationId - ID de l'optimisation
   */
  async exporterOptimisationPdf(optimisationId) {
    try {
      const reponse = await fetch(
        `${URL_BASE_API}/optimisations/${optimisationId}/export/pdf`,
        {
          headers: obtenirHeadersAuthentifies()
        }
      );

      if (!reponse.ok) {
        throw new Error(`Erreur HTTP ${reponse.status}`);
      }

      const blob = await reponse.blob();
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `optimisation-${optimisationId}.pdf`;
      lien.click();
      window.URL.revokeObjectURL(url);
    } catch (erreur) {
      console.error('Erreur lors de l\'export :', erreur);
      throw erreur;
    }
  }
};
