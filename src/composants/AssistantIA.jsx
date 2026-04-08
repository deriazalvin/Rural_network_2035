import { useState } from 'react';
import { ServiceDonnees } from '../services/ServiceDonnees.js';

export function AssistantIA({ villages, routes }) {
  const [question, setQuestion] = useState('');
  const [reponse, setReponse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [modeIA, setModeIA] = useState('local');

  const serviceDonnees = new ServiceDonnees();

  const questionsExemples = [
    "Quel est le meilleur village de départ ?",
    "Comment optimiser ma tournée ?",
    "Quelle est la qualité moyenne des routes ?",
    "Combien de villages puis-je visiter avec mon camion ?"
  ];

  const gererQuestion = (e) => {
    e.preventDefault();

    if (!question.trim()) {
      return;
    }

    setChargement(true);

    if (modeIA === 'ia') {
      // Utiliser l'IA avec connexion internet
      serviceDonnees.analyserIA(question)
        .then(resultat => {
          // Backend renvoie { reponse: "..." }
          setReponse(resultat && resultat.reponse ? resultat.reponse : JSON.stringify(resultat));
          setChargement(false);
        })
        .catch(error => {
          console.error('Erreur IA:', error);
          setReponse(error.message || 'Erreur lors de la connexion à l\'IA.');
          setChargement(false);
        });
    } else {
      // Analyse locale instantanée
      setTimeout(() => {
        const resultat = analyserQuestion(question);
        setReponse(resultat);
        setChargement(false);
      }, 500);
    }
  };

  const analyserQuestion = (q) => {
    const questionMin = q.toLowerCase();

    if (questionMin.includes('meilleur') && questionMin.includes('départ')) {
      return analyserMeilleurDepart();
    }

    if (questionMin.includes('optimis') || questionMin.includes('tournée')) {
      return "Pour optimiser votre tournée, utilisez l'algorithme glouton du plus proche voisin. " +
        "Commencez par le village le plus connecté, puis visitez toujours le village non visité le plus proche " +
        "qui peut encore être chargé dans votre camion. L'algorithme de Dijkstra calcule les distances optimales.";
    }

    if (questionMin.includes('qualité') && questionMin.includes('route')) {
      return analyserQualiteRoutes();
    }

    if (questionMin.includes('combien') && questionMin.includes('village')) {
      return analyserCapaciteVisite();
    }

    if (questionMin.includes('production')) {
      return analyserProduction();
    }

    if (questionMin.includes('distance')) {
      return analyserDistances();
    }

    return "Je peux vous aider à analyser votre réseau rural. Posez-moi des questions sur " +
      "les villages, les routes, l'optimisation des tournées, ou la production agricole.";
  };

  const analyserMeilleurDepart = () => {
    if (villages.length === 0) {
      return "Aucun village enregistré pour l'analyse.";
    }

    const connexions = {};
    villages.forEach(v => connexions[v.id] = 0);

    routes.forEach(route => {
      if (!route.est_bloquee) {
        connexions[route.village_depart_id] = (connexions[route.village_depart_id] || 0) + 1;
        connexions[route.village_arrivee_id] = (connexions[route.village_arrivee_id] || 0) + 1;
      }
    });

    let meilleurVillage = villages[0];
    let maxConnexions = 0;

    villages.forEach(village => {
      if (connexions[village.id] > maxConnexions) {
        maxConnexions = connexions[village.id];
        meilleurVillage = village;
      }
    });

    return `Le meilleur village de départ est "${meilleurVillage.nom}" avec ${maxConnexions} connexions actives. ` +
      `C'est le point le plus central du réseau, offrant le plus d'options de routes.`;
  };

  const analyserQualiteRoutes = () => {
    if (routes.length === 0) {
      return "Aucune route enregistrée pour l'analyse.";
    }

    const qualites = { BONNE: 0, MOYENNE: 0, MAUVAISE: 0 };
    routes.forEach(route => {
      const qualite = route.qualite_route || route.qualiteRoute;
      qualites[qualite] = (qualites[qualite] || 0) + 1;
    });

    const total = routes.length;
    const pourcentageBonne = ((qualites.BONNE / total) * 100).toFixed(1);
    const pourcentageMoyenne = ((qualites.MOYENNE / total) * 100).toFixed(1);
    const pourcentageMauvaise = ((qualites.MAUVAISE / total) * 100).toFixed(1);

    return `Analyse de la qualité des routes:\n` +
      `- Bonnes: ${qualites.BONNE} (${pourcentageBonne}%)\n` +
      `- Moyennes: ${qualites.MOYENNE} (${pourcentageMoyenne}%)\n` +
      `- Mauvaises: ${qualites.MAUVAISE} (${pourcentageMauvaise}%)\n\n` +
      `Conseil: Priorisez les bonnes routes pour réduire l'usure du véhicule et le temps de trajet.`;
  };

  const analyserCapaciteVisite = () => {
    if (villages.length === 0) {
      return "Aucun village enregistré pour l'analyse.";
    }

    const capaciteStandard = 5000;
    const villagesTries = [...villages].sort((a, b) => a.volume_production - b.volume_production);

    let nombreVisitable = 0;
    let chargeAccumulee = 0;

    for (const village of villagesTries) {
      if (chargeAccumulee + village.volume_production <= capaciteStandard) {
        chargeAccumulee += village.volume_production;
        nombreVisitable++;
      } else {
        break;
      }
    }

    return `Avec un camion de capacité standard (5000 kg), vous pouvez visiter jusqu'à ${nombreVisitable} villages ` +
      `dans une seule tournée en collectant ${chargeAccumulee.toFixed(0)} kg de production.`;
  };

  const analyserProduction = () => {
    if (villages.length === 0) {
      return "Aucun village enregistré pour l'analyse.";
    }

    const productionTotale = villages.reduce((sum, v) => sum + parseFloat(v.volume_production || 0), 0);
    const productionMoyenne = productionTotale / villages.length;

    const villageMaxProd = villages.reduce((max, v) =>
      v.volume_production > max.volume_production ? v : max
    );

    return `Production agricole totale: ${productionTotale.toFixed(0)} kg\n` +
      `Production moyenne par village: ${productionMoyenne.toFixed(0)} kg\n` +
      `Village avec la plus grande production: ${villageMaxProd.nom} (${villageMaxProd.volume_production} kg)`;
  };

  const analyserDistances = () => {
    if (routes.length === 0) {
      return "Aucune route enregistrée pour l'analyse.";
    }

    const distances = routes.map(r => r.distance);
    const distanceTotale = distances.reduce((sum, d) => sum + d, 0);
    const distanceMoyenne = distanceTotale / distances.length;
    const distanceMin = Math.min(...distances);
    const distanceMax = Math.max(...distances);

    return `Analyse des distances:\n` +
      `- Distance moyenne: ${distanceMoyenne.toFixed(2)} km\n` +
      `- Route la plus courte: ${distanceMin.toFixed(2)} km\n` +
      `- Route la plus longue: ${distanceMax.toFixed(2)} km\n` +
      `- Distance totale du réseau: ${distanceTotale.toFixed(2)} km`;
  };

  return (
    <div className="section-carte">
      <h2>🤖 Assistant IA</h2>
      <p className="description-ia">
        Assistant intelligent pour analyser votre réseau rural
      </p>

      <div className="mode-selection">
        <label className="mode-option">
          <input
            type="radio"
            value="local"
            checked={modeIA === 'local'}
            onChange={(e) => setModeIA(e.target.value)}
          />
          <span>📱 Analyse Locale (Instantanée)</span>
        </label>
        <label className="mode-option">
          <input
            type="radio"
            value="ia"
            checked={modeIA === 'ia'}
            onChange={(e) => setModeIA(e.target.value)}
          />
          <span>🌐 IA Avancée (Connexion Internet)</span>
        </label>
      </div>

      <div className="exemples-questions">
        <p><strong>Questions suggérées:</strong></p>
        <div className="grille-exemples">
          {questionsExemples.map((q, index) => (
            <button
              key={index}
              onClick={() => setQuestion(q)}
              className="bouton-exemple"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={gererQuestion} className="formulaire-ia">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question..."
          className="textarea-question"
          rows="3"
        />
        <button type="submit" className="bouton-principal" disabled={chargement}>
          {chargement ? 'Analyse en cours...' : 'Analyser'}
        </button>
      </form>

      {reponse && (
        <div className="reponse-ia">
          <h3>Réponse:</h3>
          <p className="texte-reponse">{reponse}</p>
        </div>
      )}
    </div>
  );
}
