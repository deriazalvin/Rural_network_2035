// Test Data - À exécuter dans la console du navigateur (F12)
// Copie-colle le code ci-dessous et exécute pour simuler une optimisation

const testOptimizationData = {
  timestamp: new Date().toISOString(),
  date: new Date().toISOString(),
  gainPercentage: 23.5,
  distanceTotale: 245.8,
  distanceBaseline: 320.0,
  coutTotal: 125750,
  coutBaseline: 165000,
  economieTotal: 39250,
  dureeCalculMs: 2340,
  nombreTournees: 3,
  toursList: [
    {
      name: "Camion A",
      color: "#22c55e",
      distance: 85.2,
      load: 1250,
      cost: 42500,
      capacity: 1500,
      steps: [
        { num: 1, village: "Village 1", production: 500, lat: -18.8, lng: 46.8 },
        { num: 2, village: "Village 2", production: 750, lat: -18.9, lng: 46.9 }
      ]
    },
    {
      name: "Camion B",
      color: "#3b82f6",
      distance: 95.3,
      load: 1480,
      cost: 47750,
      capacity: 1500,
      steps: [
        { num: 1, village: "Village 3", production: 600, lat: -18.85, lng: 46.75 },
        { num: 2, village: "Village 4", production: 880, lat: -18.95, lng: 46.95 }
      ]
    },
    {
      name: "Camion C",
      color: "#f59e0b",
      distance: 65.3,
      load: 920,
      cost: 35500,
      capacity: 1500,
      steps: [
        { num: 1, village: "Village 5", production: 920, lat: -18.87, lng: 46.85 }
      ]
    }
  ],
  unserved: [],
  resultatDTO: {}
};

// Exécute ceci pour ajouter des données de test:
console.log("🧪 Ajout de données test au localStorage...");
const existingData = localStorage.getItem('optimization_history');
const history = existingData ? JSON.parse(existingData) : [];

// Ajoute le test data
history.unshift({
  id: Date.now(),
  ...testOptimizationData
});

localStorage.setItem('optimization_history', JSON.stringify(history));
console.log("✅ Données test ajoutées! Recharge la page (F5) pour voir");
console.log("Données:", history);
