import React, { useEffect, useRef } from 'react';
import { Network, AlertCircle } from 'lucide-react';

/**
 * Visualisation du réseau de tournées avec canvas
 * Affiche les connexions entre villages pour les tournées
 */
export function NetworkVisualization({ tours = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !tours || tours.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.classList?.contains('dark');
    const dpr = window.devicePixelRatio || 1;

    // Dimensions fixes du canvas en CSS
    const cssWidth = canvas.offsetWidth;
    const cssHeight = 300;
    canvas.style.height = cssHeight + 'px';
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Fond explicite
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Grid subtil adapté au thème
    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * graphWidth;
      const y = padding + (i / 10) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Créer des points pour chaque tournée
    const nodes = [];
    tours.forEach((tour, idx) => {
      const angle = (idx / Math.max(tours.length, 1)) * Math.PI * 2;
      const distance = Math.min(graphWidth, graphHeight) / 2.5;
      const x = width / 2 + Math.cos(angle) * distance;
      const y = height / 2 + Math.sin(angle) * distance;
      nodes.push({
        x,
        y,
        tour,
        idx,
        label: tour.name || `Tour ${idx + 1}`,
        color: tour.color || '#22c55e'
      });
    });

    // Centre (Dépôt)
    const depotX = width / 2;
    const depotY = height / 2;

    // Dessiner les lignes vers le centre
    nodes.forEach(node => {
      ctx.strokeStyle = isDark ? node.color + '50' : node.color + '30';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(depotX, depotY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();

      // Dessiner les points sur la ligne (représentant les étapes)
      if (node.tour.steps && node.tour.steps.length > 0) {
        const step = Math.min(3, node.tour.steps.length);
        for (let i = 1; i <= step; i++) {
          const progress = i / (step + 1);
          const stepX = depotX + (node.x - depotX) * progress;
          const stepY = depotY + (node.y - depotY) * progress;
          ctx.fillStyle = isDark ? node.color + '70' : node.color + '50';
          ctx.beginPath();
          ctx.arc(stepX, stepY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Dessiner les nœuds (tournées)
    nodes.forEach(node => {
      // Ombre
      ctx.shadowColor = isDark ? node.color + '60' : node.color + '30';
      ctx.shadowBlur = 20;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Cercle intérieur
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Numéro de trajet
      ctx.fillStyle = node.color;
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${node.idx + 1}`, node.x, node.y);
    });

    // Dépôt (centre) - remplace l'emoji par un cercle stylisé
    const depotBg = isDark ? 'rgba(52,211,153,0.15)' : 'rgba(34,197,94,0.1)';
    ctx.fillStyle = depotBg;
    ctx.beginPath();
    ctx.arc(depotX, depotY, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isDark ? '#34d399' : '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(depotX, depotY, 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#34d399' : '#22c55e';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', depotX, depotY);

    // Labels adaptés au thème
    const labelColor = isDark ? 'rgba(226,232,240,0.8)' : 'rgba(15,23,42,0.7)';
    const distLabelColor = isDark ? 'rgba(226,232,240,0.6)' : 'rgba(15,23,42,0.5)';
    nodes.forEach(node => {
      ctx.fillStyle = labelColor;
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = node.tour.name ? node.tour.name.substring(0, 8) : `T${node.idx + 1}`;
      ctx.fillText(label, node.x, node.y + 20);

      // Distance sous le label
      if (node.tour.distance) {
        ctx.fillStyle = distLabelColor;
        ctx.font = '9px Arial';
        ctx.fillText(`${node.tour.distance.toFixed(1)}km`, node.x, node.y + 32);
      }
    });
  }, [tours]);

  if (!tours || tours.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        color: 'var(--text-secondary)',
        gap: '8px'
      }}>
        <AlertCircle size={16} />
        <span>Aucune données de réseau à afficher</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      <h4 style={{
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Network size={16} style={{ color: '#22c55e' }} />
        Réseau des Tournées
      </h4>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '300px',
          background: 'transparent',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          display: 'block'
        }}
      />
    </div>
  );
}
