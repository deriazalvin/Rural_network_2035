import React, { useState } from 'react';
import { TrendingUp, BarChart3, DollarSign, MapPin, Activity } from 'lucide-react';

const COULEURS = {
  vert: '#22c55e',
  vertFonce: '#16a34a',
  bleu: '#3b82f6',
  ambre: '#f59e0b',
  violet: '#8b5cf6',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function GraphiqueSimple({ donnees = [], onSelect }) {
  const [idxSel, setIdxSel] = useState(null);

  if (!donnees || donnees.length === 0) {
    return (
      <div className="chart-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <Activity size={40} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: '0.75rem' }} />
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aucune donnée disponible</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Lancez votre première optimisation pour voir les analyses et tendances
        </p>
      </div>
    );
  }

  const data = donnees.map((d, i) => ({
    label: d.date ? formatDate(d.date) : `#${i + 1}`,
    gain: d.gain ?? 0,
    distance: d.distance ?? 0,
    cout: d.cout ?? 0,
    idx: i,
  }));

  const maxGain = Math.max(...data.map(d => d.gain), 1);
  const largeurBarre = Math.max(40, Math.min(80, 600 / data.length));

  const dernGain = data[data.length - 1]?.gain ?? 0;
  const moyGain = data.reduce((s, d) => s + d.gain, 0) / data.length;
  const totDistance = data.reduce((s, d) => s + d.distance, 0);
  const totCout = data.reduce((s, d) => s + d.cout, 0);

  const clic = (i) => {
    setIdxSel(i);
    onSelect?.(i);
  };

  return (
    <div>
      {/* KPIs */}
      <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Dernier gain', val: `${dernGain.toFixed(1)}%`, color: COULEURS.vert, icone: TrendingUp },
          { label: 'Gain moyen', val: `${moyGain.toFixed(1)}%`, color: COULEURS.bleu, icone: BarChart3 },
          { label: 'Distance totale', val: `${totDistance.toFixed(0)} km`, color: COULEURS.ambre, icone: MapPin },
          { label: 'Coût total', val: `${totCout.toLocaleString('fr-FR')} Ar`, color: COULEURS.violet, icone: DollarSign },
        ].map((kpi, ki) => {
          const Icone = kpi.icone;
          return (
            <div key={ki} className="chart-card">
              <div className="chart-card-header">
                <div className="chart-card-icon" style={{ background: `${kpi.color}15` }}>
                  <Icone size={18} style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="chart-card-subtitle">{kpi.label}</p>
                  <h3 className="chart-card-title" style={{ fontSize: '1.5rem', color: kpi.color }}>{kpi.val}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphique à barres SVG */}
      <div className="chart-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} style={{ color: COULEURS.vert }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Gains par Optimisation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Cliquez sur une barre pour voir les détails</p>
          </div>
        </div>

        <svg width="100%" height="220" viewBox={`0 0 ${Math.max(300, data.length * (largeurBarre + 20))} 220`} preserveAspectRatio="xMidYMid meet">
          {/* Axe Y */}
          <line x1="40" y1="10" x2="40" y2="180" stroke="var(--border)" strokeWidth="1" />
          <line x1="40" y1="180" x2={Math.max(300, data.length * (largeurBarre + 20))} y2="180" stroke="var(--border)" strokeWidth="1" />

          {/* Graduations Y */}
          {[0, 25, 50, 75, 100].map(pct => {
            const y = 180 - (pct / 100) * 160;
            return (
              <g key={pct}>
                <line x1="35" y1={y} x2="40" y2={y} stroke="var(--border)" strokeWidth="1" />
                <text x="32" y={y + 3} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">{pct}%</text>
              </g>
            );
          })}

          {/* Barres */}
          {data.map((d, i) => {
            const x = 55 + i * (largeurBarre + 20);
            const hauteur = (d.gain / maxGain) * 160;
            const y = 180 - hauteur;
            const estSel = idxSel === i;

            return (
              <g key={i}>
                {/* Barre cliquable */}
                <rect
                  x={x}
                  y={y}
                  width={largeurBarre}
                  height={Math.max(hauteur, 2)}
                  rx={6}
                  ry={6}
                  fill={estSel ? COULEURS.vert : `${COULEURS.vert}66`}
                  stroke={estSel ? COULEURS.vertFonce : 'none'}
                  strokeWidth={estSel ? 2.5 : 0}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => clic(i)}
                />
                {/* Zone cliquable étendue */}
                <rect
                  x={x - 5}
                  y={10}
                  width={largeurBarre + 10}
                  height={175}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => clic(i)}
                />
                {/* Label */}
                <text
                  x={x + largeurBarre / 2}
                  y={195}
                  textAnchor="middle"
                  fontSize="9"
                  fill={estSel ? 'var(--text-primary)' : 'var(--text-tertiary)'}
                  fontWeight={estSel ? 700 : 500}
                >
                  {d.label}
                </text>
                {/* Valeur */}
                <text
                  x={x + largeurBarre / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill={estSel ? COULEURS.vertFonce : COULEURS.vert}
                  fontWeight={700}
                  fontFamily="monospace"
                >
                  {d.gain.toFixed(1)}%
                </text>
                {/* Indicateur sélection */}
                {estSel && (
                  <polygon
                    points={`${x + largeurBarre / 2 - 5},${y - 14} ${x + largeurBarre / 2 + 5},${y - 14} ${x + largeurBarre / 2},${y - 9}`}
                    fill={COULEURS.vertFonce}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tableau détaillé */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-card-icon" style={{ background: 'rgba(52,211,153,0.15)' }}>
            <BarChart3 size={20} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="chart-card-title">Détail des Optimisations</h3>
            <p className="chart-card-subtitle">Cliquez sur une ligne pour voir les détails</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tb-data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Gain (%)</th>
                <th>Distance (km)</th>
                <th>Coût (Ar)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr
                  key={i}
                  onClick={() => clic(i)}
                  style={{ cursor: 'pointer', background: idxSel === i ? 'var(--bg-hover)' : 'transparent', fontWeight: idxSel === i ? 700 : 400 }}
                >
                  <td>{d.label || '—'}</td>
                  <td><span className="tb-badge-gain">{d.gain.toFixed(1)}%</span></td>
                  <td>{d.distance.toFixed(0)}</td>
                  <td>{d.cout ? d.cout.toLocaleString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
