import { BarChart2, MapPin, Map, Package, AlertTriangle, DollarSign } from 'lucide-react';

export function TableauBord({ villages, routes, performances }) {
  const calculerStatistiques = () => {
    const nombreVillages = villages.length;
    const nombreRoutes = routes.length;
    const productionTotale = villages.reduce((sum, v) => sum + parseFloat(v.volume_production || 0), 0);
    const routesBloquees = routes.filter(r => r.est_bloquee).length;

    const gainMoyen = performances.length > 0
      ? performances.reduce((sum, p) => sum + parseFloat(p.reduction_distance_pourcentage || 0), 0) / performances.length
      : 0;

    const economieTotale = performances.reduce((sum, p) => sum + parseFloat(p.economie_carburant || 0), 0);

    return {  
      nombreVillages,
      nombreRoutes,
      productionTotale,
      routesBloquees,
      gainMoyen,
      economieTotale
    };
  };

  const stats = calculerStatistiques();

  return (
    <div className="section-carte">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart2 size={26} />
        Tableau de Bord
      </h2>

      <div className="grille-statistiques">
        <div className="carte-stat">
          <div className="stat-icone"><MapPin size={20} /></div>
          <div className="stat-contenu">
            <h3>{stats.nombreVillages}</h3>
            <p>Villages</p>
          </div>
        </div>

        <div className="carte-stat">
          <div className="stat-icone"><Map size={20} /></div>
          <div className="stat-contenu">
            <h3>{stats.nombreRoutes}</h3>
            <p>Routes</p>
          </div>
        </div>

        <div className="carte-stat">
          <div className="stat-icone"><Package size={20} /></div>
          <div className="stat-contenu">
            <h3>{stats.productionTotale.toFixed(0)} kg</h3>
            <p>Production Totale</p>
          </div>
        </div>

        <div className="carte-stat">
          <div className="stat-icone"><AlertTriangle size={20} /></div>
          <div className="stat-contenu">
            <h3>{stats.routesBloquees}</h3>
            <p>Routes Bloquées</p>
          </div>
        </div>

        <div className="carte-stat performance">
          <div className="stat-icone"><BarChart2 size={20} /></div>
          <div className="stat-contenu">
            <h3>{stats.gainMoyen.toFixed(1)}%</h3>
            <p>Gain Moyen</p>
          </div>
        </div>

        <div className="carte-stat economie">
          <div className="stat-icone"><DollarSign size={20} /></div>
          <div className="stat-contenu">
            <h3>{stats.economieTotale.toFixed(0)} Ar</h3>
            <p>Économie Totale</p>
          </div>
        </div>
      </div>

      {performances.length > 0 && (
        <div className="historique-performances">
          <h3>Historique des Optimisations</h3>
          <div className="tableau-performances">
            {performances.map((perf, index) => (
              <div key={perf.id || index} className="ligne-performance">
                <span className="date-performance">
                  {new Date(perf.date_comparaison).toLocaleDateString('fr-FR')}
                </span>
                <span className="reduction-performance">
                  {parseFloat(perf.reduction_distance_pourcentage).toFixed(2)}% de réduction
                </span>
                <span className="economie-performance">
                  {parseFloat(perf.economie_carburant).toFixed(0)} Ar économisés
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
