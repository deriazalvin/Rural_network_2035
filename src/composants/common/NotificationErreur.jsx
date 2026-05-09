import { AlertTriangle, XCircle, CheckCircle, X } from 'lucide-react';

export function NotificationErreur({ type, titre, message, onFermer }) {
  const configs = {
    doublon: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      textColor: '#92400e'
    },
    erreur: {
      icon: XCircle,
      color: '#ef4444',
      bgColor: '#fee2e2',
      borderColor: '#fca5a5',
      textColor: '#7f1d1d'
    },
    succes: {
      icon: CheckCircle,
      color: '#10b981',
      bgColor: '#dcfce7',
      borderColor: '#86efac',
      textColor: '#065f46'
    }
  };

  const config = configs[type] || configs.erreur;
  const IconComponent = config.icon;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: config.bgColor,
      border: `2px solid ${config.borderColor}`,
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <IconComponent size={24} color={config.color} style={{ flexShrink: 0, marginTop: '2px' }} />
        
        <div style={{ flex: 1, color: config.textColor }}>
          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
            {titre}
          </div>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
            {message}
          </div>
        </div>

        <button
          onClick={onFermer}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: config.textColor,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
