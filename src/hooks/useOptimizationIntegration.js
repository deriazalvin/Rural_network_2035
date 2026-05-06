import { useOptimizationStorage } from '../hooks/useOptimizationStorage';

/**
 * Hook personnalisé pour intégrer les résultats d'optimisation
 * Crée automatiquement les tournées avec couleurs et structure attendue
 */
export function useOptimizationIntegration() {
  const { addOptimization } = useOptimizationStorage();

  const TOUR_COLORS = [
    '#22c55e', // Vert
    '#3b82f6', // Bleu
    '#f59e0b', // Ambre
    '#ef4444', // Rouge
    '#8b5cf6', // Violet
    '#06b6d4'  // Cyan
  ];

  /**
   * Convertir la réponse API en format attendu par le dashboard
   * @param {Object} apiResponse - Réponse de /api/optimisations/multi-camions (peut être le DTO directement ou enveloppé)
   * @param {Number} distanceBaseline - Distance de base pour comparaison
   */
  const processOptimizationResult = (apiResponse, distanceBaseline = 0) => {
    if (!apiResponse) {
      console.error('Réponse d\'optimisation invalide');
      return null;
    }

    // Gérer deux formats possibles:
    // 1. apiResponse = {resultatDTO: {...}}
    // 2. apiResponse = {...} (le DTO directement)
    const resultatDTO = apiResponse.resultatDTO || apiResponse;

    if (!resultatDTO || !resultatDTO.tournees) {
      console.error('Format de réponse API invalide - pas de tournées trouvées');
      return null;
    }

    // Construire la liste des tournées avec couleurs et détails
    const toursList = resultatDTO.tournees.map((tournee, idx) => {
      const color = TOUR_COLORS[idx % TOUR_COLORS.length];

      // Transformer les étapes en format attendu
      const steps = tournee.etapes.map((etape, stepIdx) => ({
        num: stepIdx + 1,
        village: etape.nom,
        production: etape.production || 0,
        lat: etape.latitude,
        lng: etape.longitude
      }));

      return {
        name: tournee.nom || `Camion ${String.fromCharCode(65 + idx)}`,
        color,
        distance: tournee.distanceTotalKm,
        load: tournee.chargeTotalKg,
        cost: tournee.coutTotal,
        capacity: tournee.capaciteKg,
        steps
      };
    });

    // Villages non desservis
    const unservedVillages = resultatDTO.villagesNonDesservis || [];

    // Calculer les gains
    const gainPercentage = resultatDTO.gainPourcent || 0;

    // Créer l'objet d'optimisation à sauvegarder
    const optimizationRecord = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString(),
      gainPercentage,
      distanceTotale: resultatDTO.distanceTotalKm,
      distanceBaseline: resultatDTO.distanceBaseline,
      coutTotal: resultatDTO.coutTotal,
      coutBaseline: resultatDTO.coutBaseline,
      economieTotal: resultatDTO.economieTotal,
      dureeCalculMs: resultatDTO.dureeCalculMs,
      nombreTournees: toursList.length,
      toursList,
      unserved: unservedVillages,
      resultatDTO: resultatDTO // Garder les données brutes aussi
    };

    // Ajouter à l'historique
    addOptimization(optimizationRecord);

    return optimizationRecord;
  };

  return { processOptimizationResult, TOUR_COLORS };
}
