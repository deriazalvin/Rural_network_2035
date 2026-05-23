import React, { useEffect, useRef, useState } from 'react';
import { Network, AlertCircle, Truck, MapPin, Clock, Package } from 'lucide-react';

const TOUR_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'
];

/**
 * Visualisation avancée du réseau de tournées avec canvas
 * Affiche les connexions entre villages pour les tournées avec détails
 */
export function NetworkVisualization({ tours = [] }) {
  const canvasRef = useRef(null);
  const [hoveredTour, setHoveredTour] = useState(null);
  const [canvasNodes, setCanvasNodes] = useState([]);

  useEffect(() => {
    if (!canvasRef.current || !tours || tours.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.classList?.contains('dark');
    const dpr = window.devicePixelRatio || 1;

    // Dimensions - augmentées pour plus de visibilité
    const cssWidth = canvas.offsetWidth;
    const cssHeight = 450;
    canvas.style.height = cssHeight + 'px';
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;
    const padding = 50;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    // Fond dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isDark) {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
    } else {
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#f1f5f9');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grille améliorée
    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const x = padding + (i / 8) * graphWidth;
      const y = padding + (i / 8) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Créer les nœuds pour chaque tournée
    const nodes = [];
    const numTours = Math.max(tours.length, 1);
    const radius = Math.min(graphWidth, graphHeight) / 2.8;

    tours.forEach((tour, idx) => {
      const angle = (idx / numTours) * Math.PI * 2 - Math.PI / 2;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      
      const color = tour.color || TOUR_COLORS[idx % TOUR_COLORS.length];
      const numStops = tour.tournees?.length || tour.steps?.length || 0;
      const distance = tour.distance || tour.distanceTotale || 0;

      nodes.push({
        x,
        y,
        idx,
        tour,
        label: tour.name || `Tournée ${idx + 1}`,
        color,
        numStops,
        distance,
        isHovered: hoveredTour === idx,
        radius: hoveredTour === idx ? 18 : 14
      });
    });

    // Centre (Dépôt)
    const depotX = width / 2;
    const depotY = height / 2;

    // Dessiner les connexions du dépôt
    nodes.forEach(node => {
      const alpha = node.isHovered ? 0.4 : 0.2;
      ctx.strokeStyle = isDark 
        ? node.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        : node.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = node.isHovered ? 4 : 2.5;
      ctx.setLineDash(node.isHovered ? [] : [5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(depotX, depotY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
      
      ctx.setLineDash([]);

      // Dessiner les arrêts sur la ligne
      if (node.numStops > 0) {
        const stopCount = Math.min(Math.max(2, Math.floor(node.numStops / 3)), 5);
        for (let i = 1; i <= stopCount; i++) {
          const progress = i / (stopCount + 1);
          const stopX = depotX + (node.x - depotX) * progress;
          const stopY = depotY + (node.y - depotY) * progress;
          
          ctx.fillStyle = node.color + '80';
          ctx.beginPath();
          ctx.arc(stopX, stopY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Dessiner les nœuds de tournée
    nodes.forEach(node => {
      // Cercle externe avec ombre
      ctx.shadowColor = node.isHovered 
        ? node.color + 'cc'
        : (isDark ? node.color + '40' : node.color + '30');
      ctx.shadowBlur = node.isHovered ? 30 : 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Cercle intérieur blanc
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius - 4, 0, Math.PI * 2);
      ctx.fill();

      // Numéro de tournée
      ctx.fillStyle = node.color;
      ctx.font = node.isHovered ? 'bold 14px Arial' : 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${node.idx + 1}`, node.x, node.y);

      // Animation pulse si survolé
      if (node.isHovered) {
        ctx.strokeStyle = node.color + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Dépôt central amélioré
    const depotSize = hoveredTour !== null ? 28 : 24;
    
    ctx.shadowColor = isDark ? '#34d39960' : '#22c55e40';
    ctx.shadowBlur = 25;
    ctx.fillStyle = isDark ? 'rgba(52,211,153,0.2)' : 'rgba(34,197,94,0.15)';
    ctx.beginPath();
    ctx.arc(depotX, depotY, depotSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isDark ? '#34d399' : '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(depotX, depotY, depotSize, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#34d399' : '#22c55e';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏢', depotX, depotY + 1);

    // Labels et infos des tournées
    const labelColor = isDark ? 'rgba(226,232,240,0.9)' : 'rgba(15,23,42,0.8)';
    const infoColor = isDark ? 'rgba(226,232,240,0.6)' : 'rgba(15,23,42,0.6)';
    
    nodes.forEach(node => {
      const yOffset = node.isHovered ? 28 : 22;
      
      // Nom de la tournée
      ctx.fillStyle = labelColor;
      ctx.font = node.isHovered ? 'bold 11px Arial' : '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = node.label.length > 12 ? node.label.substring(0, 10) + '..' : node.label;
      ctx.fillText(label, node.x, node.y + yOffset);

      // Distance
      if (node.distance > 0) {
        ctx.fillStyle = infoColor;
        ctx.font = '9px Arial';
        ctx.fillText(`${node.distance.toFixed(1)} km`, node.x, node.y + yOffset + 12);
      }

      // Nombre d'arrêts
      if (node.numStops > 0) {
        ctx.fillStyle = infoColor;
        ctx.font = '9px Arial';
        ctx.fillText(`${node.numStops} arrêts`, node.x, node.y + yOffset + 22);
      }
    });

    setCanvasNodes(nodes);
  }, [tours, hoveredTour]);

  if (!tours || tours.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        color: 'var(--text-secondary)',
        gap: '8px',
        flexDirection: 'column'
      }}>
        <AlertCircle size={20} />
        <span>Aucune donnée de réseau à afficher</span>
      </div>
    );
  }

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || canvasNodes.length === 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hovered = null;
    canvasNodes.forEach(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist <= node.radius + 10) {
        hovered = node.idx;
      }
    });

    if (hovered !== hoveredTour) {
      setHoveredTour(hovered);
      canvasRef.current.style.cursor = hovered !== null ? 'pointer' : 'default';
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredTour(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  // Statistiques réseau
  const totalDistance = tours.reduce((s, t) => s + (t.distance || t.distanceTotale || 0), 0);
  const totalStops = tours.reduce((s, t) => s + (t.tournees?.length || t.steps?.length || 0), 0);
  const avgDistance = tours.length > 0 ? totalDistance / tours.length : 0;

  return (
    <div style={{ marginTop: '16px', marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: 0
        }}>
          <Network size={18} style={{ color: '#22c55e' }} />
          Réseau des Tournées
        </h4>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Truck size={14} style={{ color: '#3b82f6' }} />
            <strong>{tours.length}</strong> tournées
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <MapPin size={14} style={{ color: '#f59e0b' }} />
            <strong>{totalStops}</strong> arrêts
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Clock size={14} style={{ color: '#8b5cf6' }} />
            <strong>{totalDistance.toFixed(1)}</strong> km total
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        padding: '2px',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          style={{
            width: '100%',
            height: '450px',
            display: 'block',
            background: 'transparent'
          }}
        />
      </div>

      {/* Info tournées */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginTop: '16px'
      }}>
        {tours.map((tour, idx) => {
          const color = tour.color || TOUR_COLORS[idx % TOUR_COLORS.length];
          const distance = tour.distance || tour.distanceTotale || 0;
          const stops = tour.tournees?.length || tour.steps?.length || 0;
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.4)',
                border: `2px solid ${color}`,
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: hoveredTour === null || hoveredTour === idx ? 1 : 0.6,
                transform: hoveredTour === idx ? 'scale(1.05)' : 'scale(1)',
                onMouseEnter: () => setHoveredTour(idx),
                onMouseLeave: () => setHoveredTour(null)
              }}
              onMouseEnter={() => setHoveredTour(idx)}
              onMouseLeave={() => setHoveredTour(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div 
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0
                  }}
                />
                <strong style={{ color: 'var(--text-primary)' }}>
                  {tour.name || `Tournée ${idx + 1}`}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>📍 {stops} arrêts</span>
                <span>📏 {distance.toFixed(1)} km</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
