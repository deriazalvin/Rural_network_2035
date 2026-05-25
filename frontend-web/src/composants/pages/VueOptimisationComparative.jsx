import React, { useState, useRef, useEffect } from 'react';
import { Zap, Truck, Cloud, Sun, Wind, Snowflake, TrendingUp, TrendingDown, Check, X, BarChart3, AlertTriangle, Info } from 'lucide-react';

const CONDITION_ICONS = {
  PLUIE: <Cloud size={16} color="#3b82f6" />,
  VENT_FORT: <Wind size={16} color="#f59e0b" />,
  NEIGE: <Snowflake size={16} color="#93c5fd" />,
  BONNES: <Sun size={16} color="#22c55e" />
};

const CONDITION_LABELS = {
  PLUIE: 'Pluie',
  VENT_FORT: 'Vent fort',
  NEIGE: 'Neige/Grêle',
  BONNES: 'Bonnes'
};

export function VueOptimisationComparative({
  resultatStandard,
  resultatAvecMeteo,
  differenceDistance,
  differenceCout,
  villagesTouchesParMeteo,
  onValider,
  onAnnuler
}) {
  const [valide, setValide] = useState(null);
  const [animSortie, setAnimSortie] = useState(null);
  const [animEntree, setAnimEntree] = useState(false);
  const standardRef = useRef(null);
  const meteoRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setAnimEntree(true));
  }, []);

  const handleValider = (type) => {
    setAnimSortie(type === 'standard' ? 'meteo' : 'standard');
    setTimeout(() => {
      setValide(type);
      onValider(type);
    }, 400);
  };

  const renderKpi = (label, value, unite, couleur, icone) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.75rem', borderRadius: '10px',
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border, #e5e7eb)'
    }}>
      {icone && <span style={{ color: couleur || 'var(--text-tertiary)' }}>{icone}</span>}
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary, #9ca3af)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: couleur || 'var(--text-primary)' }}>
          {value}<span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: '2px' }}>{unite}</span>
        </div>
      </div>
    </div>
  );

  const renderResultatCard = (resultat, type, label, icone, accentCouleur) => {
    if (!resultat) return null;
    const estCache = (type === 'standard' && animSortie === 'standard') ||
                     (type === 'meteo' && animSortie === 'meteo');
    const estMasque = valide !== null && valide !== type;

    if (estMasque) return null;

    const cardStyle = {
      flex: 1,
      minWidth: '300px',
      background: 'var(--bg-card, #ffffff)',
      borderRadius: '16px',
      border: `2px solid ${valide === type ? accentCouleur : 'var(--border, #e5e7eb)'}`,
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: estCache ? 0 : 1,
      transform: estCache ? 'scale(0.9) translateY(20px)' : (animEntree ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(30px)'),
      position: 'relative'
    };

    return (
      <div ref={type === 'standard' ? standardRef : meteoRef} style={cardStyle}>
        {valide === type && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            background: accentCouleur, color: '#fff',
            fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <Check size={14} />
            Validé ({label})
          </div>
        )}

        <div style={{
          padding: '1.25rem',
          background: `linear-gradient(135deg, ${accentCouleur}15, ${accentCouleur}05)`,
          borderBottom: '1px solid var(--border, #e5e7eb)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: accentCouleur + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {icone}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Tournée {label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary, #9ca3af)' }}>
                {type === 'standard' ? 'Algorithme Greedy classique' : 'Avec pénalités météo appliquées'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {renderKpi('Distance', resultat.distanceTotalKm?.toFixed(1), 'km', '#3b82f6', <BarChart3 size={16} />)}
            {renderKpi('Coût', resultat.coutTotal?.toFixed(0), 'Ar', '#f59e0b', <Zap size={16} />)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {renderKpi('Gain', `${resultat.gainPourcent?.toFixed(1)}`, '%', '#22c55e', <TrendingUp size={16} />)}
            {renderKpi('Camions', resultat.tournees?.length || 0, '', 'var(--text-secondary)', <Truck size={16} />)}
          </div>

          {resultat.tournees?.map((t, idx) => (
            <div key={idx} style={{
              padding: '0.75rem', borderRadius: '10px',
              background: 'var(--bg, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.couleurHex || accentCouleur }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.nom || `Camion ${idx + 1}`}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {t.etapes?.length || 0} arrêts
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>{(t.distanceTotalKm || 0).toFixed(1)} km</span>
                <span>{(t.chargeTotalKg || 0).toFixed(0)} kg</span>
                <span>{(t.coutTotal || 0).toFixed(0)} Ar</span>
              </div>
            </div>
          ))}

          {resultat.villagesNonDesservis?.length > 0 && (
            <div style={{
              padding: '0.6rem 0.75rem', borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '0.75rem', color: '#ef4444'
            }}>
              <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {resultat.villagesNonDesservis.length} village(s) non desservi(s)
            </div>
          )}
        </div>

        {valide === null && (
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <button
              onClick={() => handleValider(type)}
              style={{
                width: '100%', padding: '0.75rem', border: 'none', borderRadius: '10px',
                background: valide === type ? accentCouleur : `linear-gradient(135deg, ${accentCouleur}, ${accentCouleur}dd)`,
                color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <Check size={16} />
              VALIDER ({label})
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '14px',
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <BarChart3 size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Optimisation Comparative
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary, #9ca3af)' }}>
            Choisissez la tournée qui correspond le mieux à vos besoins
          </p>
        </div>
      </div>

      {valide === null && villagesTouchesParMeteo?.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
          padding: '0.75rem 1rem', borderRadius: '12px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.25)',
          marginBottom: '1.5rem'
        }}>
          <Info size={18} color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
            Météo défavorable détectée sur : {villagesTouchesParMeteo.join(', ')}
          </span>
        </div>
      )}

      {valide === null && differenceDistance !== undefined && (
        <div style={{
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
          padding: '1rem 1.25rem', borderRadius: '12px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border, #e5e7eb)',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Écart distance</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: differenceDistance > 0 ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              {differenceDistance > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {differenceDistance.toFixed(1)} km
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Écart coût</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: differenceCout > 0 ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              {differenceCout > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {differenceCout.toFixed(0)} Ar
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {renderResultatCard(
          resultatStandard, 'standard', 'Standard',
          <Zap size={22} color="#3b82f6" />, '#3b82f6'
        )}
        {renderResultatCard(
          resultatAvecMeteo, 'meteo', 'Avec ajustement météo',
          <Cloud size={22} color="#8b5cf6" />, '#8b5cf6'
        )}
      </div>

      {valide === null && (
        <div style={{
          textAlign: 'center', marginTop: '1.5rem', padding: '0.75rem',
          fontSize: '0.8rem', color: 'var(--text-tertiary, #9ca3af)'
        }}>
          <Info size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Les deux tournées sont calculées avec les mêmes villages et camions.
          La version météo applique des pénalités de distance selon les conditions.
        </div>
      )}

      {valide !== null && (
        <button
          onClick={onAnnuler}
          style={{
            display: 'block', margin: '1.5rem auto 0', padding: '0.6rem 1.5rem',
            border: '2px solid var(--border, #e5e7eb)', borderRadius: '10px',
            background: 'transparent', color: 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6b7280'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border, #e5e7eb)'}
        >
          <X size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Nouvelle Optimisation Comparative
        </button>
      )}
    </div>
  );
}
