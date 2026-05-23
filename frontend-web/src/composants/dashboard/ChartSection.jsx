import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, DollarSign, MapPin, Activity } from 'lucide-react';
import '../../styles/tableau-bord.css';

const COLORS = {
  green: '#22c55e',
  greenDark: '#16a34a',
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  red: '#ef4444',
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="recharts-default-tooltip" style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: '0.75rem 1rem',
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: '0.8rem', margin: 0 }}>
          {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}{unit}</strong>
        </p>
      ))}
    </div>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function ChartSection({ chartData = [], onSelect }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Debug logging
  React.useEffect(() => {
    console.log('📊 ChartSection - Data received:', {
      length: chartData?.length,
      data: chartData,
      isEmpty: !chartData || chartData.length === 0
    });
  }, [chartData]);

  if (!chartData || chartData.length === 0) {
    return (
      <section className="chart-card tb-reveal">
        <div className="empty-state py-8">
          <Activity size={40} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: '0.75rem' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aucune donnée disponible</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Lancez votre première optimisation pour voir les analyses et tendances
          </p>
        </div>
      </section>
    );
  }

  const handleClick = (i) => {
    setSelectedIdx(i);
    onSelect?.(i);
  };

  const data = chartData.map((d, i) => ({
    name: d.date ? formatDate(d.date) : `#${i + 1}`,
    gain: typeof d.gain === 'number' ? d.gain : parseFloat(d.gain) || 0,
    distance: typeof d.distance === 'number' ? d.distance : parseFloat(d.distance) || 0,
    cout: typeof d.cout === 'number' ? d.cout : parseFloat(d.cout) || 0,
    index: i,
  }));

  console.log('📊 ChartSection - Transformed data:', data);

  const lastGain = data.length > 0 ? data[data.length - 1].gain : 0;
  const avgGain = data.reduce((s, d) => s + d.gain, 0) / data.length;
  const totalDistance = data.reduce((s, d) => s + d.distance, 0);
  const totalCost = data.reduce((s, d) => s + d.cout, 0);

  return (
    <>
      {/* KPI row */}
      <div className="charts-grid">
        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <TrendingUp size={18} style={{ color: COLORS.green }} />
            </div>
            <div>
              <p className="chart-card-subtitle">Dernier gain</p>
              <h3 className="chart-card-title" style={{ fontSize: '1.5rem', color: COLORS.green }}>
                {lastGain.toFixed(1)}%
              </h3>
            </div>
          </div>
        </div>
        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <BarChart3 size={18} style={{ color: COLORS.blue }} />
            </div>
            <div>
              <p className="chart-card-subtitle">Gain moyen</p>
              <h3 className="chart-card-title" style={{ fontSize: '1.5rem', color: COLORS.blue }}>
                {avgGain.toFixed(1)}%
              </h3>
            </div>
          </div>
        </div>
        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <MapPin size={18} style={{ color: COLORS.amber }} />
            </div>
            <div>
              <p className="chart-card-subtitle">Distance totale</p>
              <h3 className="chart-card-title" style={{ fontSize: '1.5rem', color: COLORS.amber }}>
                {totalDistance.toFixed(0)} km
              </h3>
            </div>
          </div>
        </div>
        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <DollarSign size={18} style={{ color: COLORS.purple }} />
            </div>
            <div>
              <p className="chart-card-subtitle">Coût total</p>
              <h3 className="chart-card-title" style={{ fontSize: '1.5rem', color: COLORS.purple }}>
                {totalCost.toLocaleString('fr-FR')} Ar
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 1: Gain evolution + Distance */}
      <div className="charts-grid">
        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <TrendingUp size={18} style={{ color: COLORS.green }} />
            </div>
            <div>
              <h3 className="chart-card-title">Évolution du Gain</h3>
              <p className="chart-card-subtitle">Pourcentage de gain par optimisation</p>
            </div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', alignItems: 'stretch', height: '250px', width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Line
                  type="monotone"
                  dataKey="gain"
                  name="Gain"
                  stroke={COLORS.green}
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, index, payload } = props;
                    if (cx == null || cy == null) return null;
                    const isSel = selectedIdx === index;
                    return (
                      <circle
                        key={index}
                        cx={cx} cy={cy}
                        r={isSel ? 7 : 4}
                        fill={isSel ? COLORS.greenDark : COLORS.green}
                        stroke={isSel ? '#fff' : 'none'}
                        strokeWidth={isSel ? 2.5 : 0}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => handleClick(payload.index)}
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: COLORS.greenDark }}
                  onClick={(data) => handleClick(data.index)}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <MapPin size={18} style={{ color: COLORS.blue }} />
            </div>
            <div>
              <h3 className="chart-card-title">Distance par Optimisation</h3>
              <p className="chart-card-subtitle">Kilomètres parcourus</p>
            </div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', alignItems: 'stretch', height: '250px', width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} unit=" km" />
                <Tooltip content={<CustomTooltip unit=" km" />} />
                <Bar
                  dataKey="distance"
                  name="Distance"
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => handleClick(entry.index)}
                  style={{ cursor: 'pointer' }}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={selectedIdx === idx ? COLORS.blue : COLORS.blue + '66'}
                      stroke={selectedIdx === idx ? COLORS.blue : 'none'}
                      strokeWidth={selectedIdx === idx ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2: Cost + Cumulative gain */}
      <div className="charts-grid">
        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <DollarSign size={18} style={{ color: COLORS.amber }} />
            </div>
            <div>
              <h3 className="chart-card-title">Coût par Optimisation</h3>
              <p className="chart-card-subtitle">Coût total en Ariary</p>
            </div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', alignItems: 'stretch', height: '250px', width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} unit=" Ar" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip unit=" Ar" />} />
                <Bar
                  dataKey="cout"
                  name="Coût"
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => handleClick(entry.index)}
                  style={{ cursor: 'pointer' }}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={selectedIdx === idx ? COLORS.amber : COLORS.amber + '66'}
                      stroke={selectedIdx === idx ? COLORS.amber : 'none'}
                      strokeWidth={selectedIdx === idx ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card tb-reveal">
          <div className="chart-card-header">
            <div className="chart-card-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Activity size={18} style={{ color: COLORS.purple }} />
            </div>
            <div>
              <h3 className="chart-card-title">Gain Cumulé</h3>
              <p className="chart-card-subtitle">Progression totale du gain (%)</p>
            </div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', alignItems: 'stretch', height: '250px', width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumulativeGain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area
                  type="monotone"
                  dataKey="gain"
                  name="Gain"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  fill="url(#cumulativeGain)"
                  dot={(props) => {
                    const { cx, cy, index, payload } = props;
                    if (cx == null || cy == null) return null;
                    const isSel = selectedIdx === index;
                    return (
                      <circle
                        key={index}
                        cx={cx} cy={cy}
                        r={isSel ? 7 : 4}
                        fill={isSel ? COLORS.purple : COLORS.purple}
                        stroke={isSel ? '#fff' : 'none'}
                        strokeWidth={isSel ? 2.5 : 0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClick(payload.index)}
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: COLORS.purple }}
                  onClick={(data) => handleClick(data.index)}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data table */}
      <section className="chart-card tb-reveal">
        <div className="chart-card-header">
          <div className="chart-card-icon" style={{ background: 'rgba(52,211,153,0.15)' }}>
            <BarChart3 size={20} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="chart-card-title">Détail des Optimisations</h3>
            <p className="chart-card-subtitle">Cliquez sur une ligne pour voir les détails</p>
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
              {data.map((d, i) => {
                const isSelected = selectedIdx === i;
                return (
                  <tr
                    key={i}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => handleClick(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{d.name || '—'}</td>
                    <td>
                      <span className="tb-badge-gain">{d.gain.toFixed(1)}%</span>
                    </td>
                    <td>{d.distance.toFixed(0)}</td>
                    <td>{d.cout ? d.cout.toLocaleString('fr-FR') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
