import React from 'react';
import '../../styles/tableau-bord.css';

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  suffix = '', 
  trend,
  isDecimal = false,
  colorClass = 'brand',
  delay = 0 
}) {
  const colorMap = {
    brand: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-500',
      bar: 'bg-green-500'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-500',
      bar: 'bg-blue-500'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-500',
      bar: 'bg-red-500'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-500',
      bar: 'bg-amber-500'
    }
  };

  const cm = colorMap[colorClass] || colorMap.brand;

  return (
    <div 
      className={`tb-card tb-stat-card tb-gradient-border ${cm.bg}`}
      style={{
        animation: `tb-reveal-stat 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        animationDelay: `${delay}ms`,
        opacity: 0
      }}
    >
      <Icon className={`stat-bg-icon ${cm.icon}`} size={100} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl ${cm.bg} flex items-center justify-center transition-transform hover:scale-110`}>
            <Icon className={`${cm.icon}`} size={18} />
          </div>
          <span 
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full" 
            style={{ 
              background: 'var(--border-subtle)',
              color: 'var(--text-tertiary)'
            }}
          >
            {trend}
          </span>
        </div>
        <p className="tb-stat-value text-2xl font-bold tracking-tight mb-1" id={`stat-value-${label}`}>
          0{suffix}
        </p>
        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <div className="tb-progress-track-bar mt-3">
          <div 
            className={`tb-progress-fill-bar ${cm.bar}`} 
            id={`stat-bar-${label}`}
            style={{ width: '0%' }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes tb-reveal-stat {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
