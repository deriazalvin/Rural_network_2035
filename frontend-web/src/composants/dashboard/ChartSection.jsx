import React, { useState } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import '../../styles/tableau-bord.css';

export function ChartSection({ chartData = [], onSelect }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  if (!chartData || chartData.length === 0) {
    return (
      <section className="tb-card p-6 tb-reveal">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
            <TrendingUp size={20} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Historique des Optimisations</h3>
            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Évolution des gains</p>
          </div>
        </div>
        <div className="empty-state py-8">
          <p style={{ color: 'var(--text-secondary)' }}>Aucune donnée disponible</p>
        </div>
      </section>
    );
  }

  const handleClick = (i) => {
    setSelectedIdx(i);
    onSelect?.(i);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <section className="tb-card p-6 tb-reveal">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
          <BarChart3 size={20} style={{ color: '#34d399' }} />
        </div>
        <div>
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Historique des Optimisations</h3>
          <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Cliquez sur une ligne pour voir les détails</p>
        </div>
      </div>

      <div className="tb-table-container" style={{ overflowX: 'auto' }}>
        <table className="tb-data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Gain (%)</th>
              <th>Distance (km)</th>
              <th>Coût (Ar)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((d, i) => {
              const isSelected = selectedIdx === i;
              return (
                <tr
                  key={i}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => handleClick(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{formatDate(d.date)}</td>
                  <td>
                    <span className="tb-badge-gain">{d.gain ?? 0}%</span>
                  </td>
                  <td>{d.distance ?? 0}</td>
                  <td>{d.cout ? d.cout.toLocaleString('fr-FR') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
