import React, { useEffect, useRef } from 'react';
import { Network, AlertCircle } from 'lucide-react';

/**
 * Visualisation du réseau de tournées avec canvas
 * Affiche les connexions entre villages pour les tournées
 */
export function NetworkVisualization({ tours = [] }) {
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !tours || tours.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Fond
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, width, height);

    // Grid subtil
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
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
      ctx.strokeStyle = node.color + '40'; // Avec transparence
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
          ctx.fillStyle = node.color + '60';
          ctx.beginPath();
          ctx.arc(stepX, stepY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Dessiner les nœuds (tournées)
    nodes.forEach(node => {
      // Ombre
      ctx.shadowColor = node.color + '40';
      ctx.shadowBlur = 20;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Cercle intérieur blanc
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Icône de trajet
      ctx.fillStyle = node.color;
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${node.idx + 1}`, node.x, node.y);
    });

    // Dépôt (centre)
    ctx.fillStyle = 'rgba(45, 80, 22, 0.1)';
    ctx.beginPath();
    ctx.arc(depotX, depotY, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2d5016';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', depotX, depotY);

    // Labels
    nodes.forEach(node => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = node.tour.name ? node.tour.name.substring(0, 8) : `T${node.idx + 1}`;
      ctx.fillText(label, node.x, node.y + 20);

      // Distance sous le label
      if (node.tour.distance) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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
          height: 'auto',
          minHeight: '200px',
          background: 'rgba(0,0,0,0.01)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          display: 'block'
        }}
      />
    </div>
  );
}
