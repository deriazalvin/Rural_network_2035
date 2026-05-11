import React, { useState } from 'react';
import { ChevronDown, Truck, AlertTriangle, Star, Calendar } from 'lucide-react';
import '../../styles/tableau-bord.css';

export function TourItem({ tour, tourIdx, optId }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Support both old and new tour data structures
  const tourName = tour.name || `Tournée ${tourIdx + 1}`;
  const tourColor = tour.color || '#22c55e';
  const tourDistance = tour.distance || tour.distanceTotale || 0;
  const tourLoad = tour.load || tour.chargeTotale || 0;
  const tourSteps = tour.steps || tour.etapes || [];

  return (
    <div
      className={`tb-tour-item ${isExpanded ? 'expanded' : ''}`}
      id={`tour-${optId}-${tourIdx}`}
    >
      <div
        className="tb-tour-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            background: tourColor,
            boxShadow: `0 0 8px ${tourColor}40`
          }}
        ></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {tourName}
          </p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {tourDistance.toFixed(1)} km - {tourLoad.toLocaleString('fr-FR')} kg
          </p>
        </div>
        <ChevronDown size={14} className="tb-tour-chevron" style={{ color: 'var(--text-tertiary)' }} />
      </div>

      <div className="tb-tour-steps">
        {tourSteps.map((step, stepIdx) => (
          <div key={stepIdx} className="tb-step-item">
            <div
              className="tb-step-num"
              style={{ background: tourColor }}
            >
              {stepIdx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {step.village || step.nomVillage || `Étape ${stepIdx + 1}`}
              </p>
            </div>
            <span
              className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{
                background: 'var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              {(step.production || step.productionCollectee || 0).toLocaleString('fr-FR')} kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OptimizationItem({ opt, optIdx, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(opt.id, newState);
  };

  const date = new Date(opt.timestamp || opt.dateHeure || opt.date);
  const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const tours = opt.toursList || opt.tournees || [];
  const unserved = opt.unserved || opt.villagesNonDesservis || [];

  const unservedWarning = unserved.length > 0 ? (
    <div 
      className="tb-warning-box"
    >
      <AlertTriangle size={18} />
      <div>
        <p className="tb-warning-title">Villages non desservis</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {unserved.join(', ')}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div 
      className={`tb-opt-item ${isExpanded ? 'expanded' : ''}`}
      id={`opt-${opt.id}`}
    >
      <div className="tb-opt-header" onClick={handleToggle}>
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ 
            background: opt.isLatest ? 'rgba(34,197,94,0.1)' : 'var(--border-subtle)'
          }}
        >
          {opt.isLatest ? (
            <Star size={18} style={{ color: '#22c55e' }} />
          ) : (
            <Calendar size={18} style={{ color: 'var(--text-tertiary)' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {dateStr}
            </p>
            {opt.isLatest && (
              <span className="tb-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} /> Plus récent
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {timeStr}
          </p>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-right">
            <p className="font-mono font-bold text-sm" style={{ color: '#22c55e' }}>
              +{(opt.gainPercentage || 0).toFixed(1)}%
            </p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Gain
            </p>
          </div>

          <div className="text-right">
            <p className="font-mono font-bold text-sm" style={{ color: '#f59e0b' }}>
              {(opt.distanceTotale || 0).toFixed(0)} km
            </p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Distance
            </p>
          </div>

          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--border-subtle)' }}
          >
            <ChevronDown size={14} className="tb-opt-chevron" style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>
      </div>

      <div className="tb-opt-details">
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div 
              className="p-3.5 rounded-xl text-center"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-mono font-bold text-lg" style={{ color: '#22c55e' }}>
                +{(opt.gainPercentage || 0).toFixed(1)}%
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Gain
              </p>
            </div>

            <div 
              className="p-3.5 rounded-xl text-center"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-mono font-bold text-lg" style={{ color: '#f59e0b' }}>
                {(opt.distanceTotale || 0).toFixed(0)} km
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Distance
              </p>
            </div>

            <div 
              className="p-3.5 rounded-xl text-center"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-mono font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {(opt.coutTotal || 0).toLocaleString('fr-FR')} Ar
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Coût Total
              </p>
            </div>

            <div 
              className="p-3.5 rounded-xl text-center"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="font-mono font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {tours.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Tournées
              </p>
            </div>
          </div>

          {unservedWarning}

          <div>
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Truck size={14} style={{ color: 'var(--text-tertiary)' }} />
              Liste des Tournées
            </p>

            {opt.toursList && opt.toursList.map((tour, tourIdx) => (
              <TourItem 
                key={tourIdx}
                tour={tour} 
                tourIdx={tourIdx} 
                optId={opt.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
