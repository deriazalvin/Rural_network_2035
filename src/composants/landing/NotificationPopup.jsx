import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Home, Truck, BarChart3 } from "lucide-react";
/**
 * Composant NotificationPopup - Popup de notifications flottante
 */
const NotificationPopup = () => {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);

  // Notifications à afficher
  const notifications = [
    {
        icon: Home,
        color: '#2ecc71',
        title: 'Nouveau village ajouté!',
        text: "Ambanja vient d'être connecté au réseau."
    },
    {
        icon: Truck,
        color: '#e74c3c',
        title: 'Tournée optimisée!',
        text: 'Économie de 2h sur la collecte de cette semaine.'
    },
    {
        icon: BarChart3,
        color: '#3498db',
        title: 'Rapport disponible',
        text: 'Le rapport mensuel de performance est prêt.'
    },
    ];

  // Afficher les notifications en rotation
  useEffect(() => {
    const showTimer = setTimeout(() => setShow(true), 5000);
    const cycleTimer = setInterval(() => {
      setShow(true);
      setCurrent(prev => (prev + 1) % notifications.length);
      setTimeout(() => setShow(false), 5000);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(cycleTimer);
    };
  }, []);

  const notif = notifications[current];

  return (
    <div className={`notification-popup ${show ? 'show' : ''}`}>
      <button 
        className="notification-close" 
        onClick={() => setShow(false)}
        aria-label="Fermer la notification"
      >
        <X size={16} />
      </button>

      <div
        className="notification-icon"
        style={{
            color: notif.color,
            background: `${notif.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px'
        }}
        >
        <notif.icon size={20} strokeWidth={2.5} />
    </div>

      <div className="notification-content">
        <h5>{notif.title}</h5>
        <p>{notif.text}</p>
      </div>
    </div>
  );
};

export default NotificationPopup;
