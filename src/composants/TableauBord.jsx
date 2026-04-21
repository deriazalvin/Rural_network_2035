import { BarChart2, MapPin, Map, Package, AlertTriangle, DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
    <div className="section-carte dashboard">
      <h2 className="dashboard-title">
        <BarChart2 size={26} />
        Tableau de Bord
      </h2>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="stat-cards">
            <div className="card-stat">
              <div className="card-icon"><MapPin size={20} /></div>
              <div>
                <div className="card-value">{stats.nombreVillages}</div>
                <div className="card-label">Villages</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><Map size={20} /></div>
              <div>
                <div className="card-value">{stats.nombreRoutes}</div>
                <div className="card-label">Routes</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><Package size={20} /></div>
              <div>
                <div className="card-value">{stats.productionTotale.toFixed(0)} kg</div>
                <div className="card-label">Production</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><AlertTriangle size={20} /></div>
              <div>
                <div className="card-value">{stats.routesBloquees}</div>
                <div className="card-label">Bloquées</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><BarChart2 size={20} /></div>
              <div>
                <div className="card-value">{stats.gainMoyen.toFixed(1)}%</div>
                <div className="card-label">Gain Moyen</div>
              </div>
            </div>

            <div className="card-stat">
              <div className="card-icon"><DollarSign size={20} /></div>
              <div>
                <div className="card-value">{stats.economieTotale.toFixed(0)} Ar</div>
                <div className="card-label">Économie</div>
              </div>
            </div>
          </div>

          <div className="chart-area">
            <h3>Historique des Optimisations</h3>
              <div className="chart-placeholder">
                {performances.length === 0 ? (
                  '(Aucune donnée)'
                ) : (
                  <Line
                    options={{
                      responsive: true,
                      interaction: { mode: 'index', intersect: false },
                      stacked: false,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: { type: 'linear', position: 'left', title: { display: true, text: 'Réduction (%)' } },
                        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Économie (Ar)' } }
                      }
                    }}
                    data={{
                      labels: performances.map(p => new Date(p.date_comparaison).toLocaleDateString('fr-FR')),
                      datasets: [
                        {
                          label: 'Réduction (%)',
                          data: performances.map(p => parseFloat(p.reduction_distance_pourcentage) || 0),
                          borderColor: 'rgba(46,125,50,0.9)',
                          backgroundColor: 'rgba(46,125,50,0.2)',
                          yAxisID: 'y',
                          fill: true,
                          tension: 0.3
                        },
                        {
                          label: 'Économie (Ar)',
                          data: performances.map(p => parseFloat(p.economie_carburant) || 0),
                          borderColor: 'rgba(37,99,235,0.9)',
                          backgroundColor: 'rgba(37,99,235,0.2)',
                          yAxisID: 'y1',
                          fill: false,
                          tension: 0.3
                        }
                      ]
                    }}
                  />
                )}
              </div>

              {performances.length > 0 && (
                <div className="tableau-performances compact">
                  {performances.slice(0,5).map((perf, index) => (
                    <div key={perf.id || index} className="ligne-performance compact">
                      <span className="date-performance">
                        {new Date(perf.date_comparaison).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="reduction-performance">{parseFloat(perf.reduction_distance_pourcentage).toFixed(2)}%</span>
                      <span className="economie-performance">{parseFloat(perf.economie_carburant).toFixed(0)} Ar</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        <aside className="dashboard-side">
          <div className="side-card big-circle">
            <div className="circle-value">{stats.economieTotale.toFixed(0)} Ar</div>
            <div className="circle-label">Économie Totale</div>
          </div>

          <div className="side-card small">
            <h4>Résumé</h4>
            <div className="side-row"><strong>{stats.nombreVillages}</strong> Villages</div>
            <div className="side-row"><strong>{stats.nombreRoutes}</strong> Routes</div>
            <div className="side-row"><strong>{stats.routesBloquees}</strong> Bloquées</div>
          </div>

          <div className="side-card">
            <h4>Dernières optimisations</h4>
            {performances.slice(0,4).map((p, i) => (
              <div key={i} className="mini-line">
                <div className="mini-date">{new Date(p.date_comparaison).toLocaleDateString('fr-FR')}</div>
                <div className="mini-detail">{parseFloat(p.reduction_distance_pourcentage).toFixed(1)}% • {parseFloat(p.economie_carburant).toFixed(0)} Ar</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
