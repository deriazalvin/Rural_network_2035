import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import '../../styles/tableau-bord.css';

export function ChartSection({ chartData = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const drawChart = () => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const isDark = document.documentElement.classList?.contains('dark');
    const dpr = window.devicePixelRatio || 1;

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    if (w === 0 || h === 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const pad = { top: 30, right: 60, bottom: 50, left: 60 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const maxGain = Math.max(...chartData.map(d => d.gain || 0)) * 1.15 || 35;
    const maxDist = Math.max(...chartData.map(d => d.distance || 0)) * 1.15 || 300;

    // Background
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (ch / 5) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    // Y-axis labels (left - Gain)
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '11px "Space Mono", monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = maxGain - (maxGain / 5) * i;
      const y = pad.top + (ch / 5) * i;
      ctx.fillText(val.toFixed(0) + '%', pad.left - 10, y + 3);
    }

    // Y-axis labels (right - Distance)
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 5; i++) {
      const val = maxDist - (maxDist / 5) * i;
      const y = pad.top + (ch / 5) * i;
      ctx.fillText(val.toFixed(0) + ' km', w - pad.right + 10, y + 3);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    chartData.forEach((d, i) => {
      const x = pad.left + (cw / Math.max(chartData.length - 1, 1)) * i;
      const date = new Date(d.date);
      const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      ctx.fillText(label, x, h - pad.bottom + 20);
    });

    // Draw smooth line
    const drawSmoothLine = (points, color, fillGradient) => {
      if (points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i].x + (points[i + 1].x - points[i].x) * 0.4;
        const cp1y = points[i].y;
        const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * 0.4;
        const cp2y = points[i + 1].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      if (fillGradient) {
        ctx.lineTo(points[points.length - 1].x, h - pad.bottom);
        ctx.lineTo(points[0].x, h - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = fillGradient;
        ctx.fill();
      }
    };

    // Points
    const gainPoints = chartData.map((d, i) => ({
      x: pad.left + (cw / Math.max(chartData.length - 1, 1)) * i,
      y: pad.top + ch - ((d.gain || 0) / maxGain) * ch,
      gain: d.gain || 0,
      distance: d.distance || 0,
      date: d.date
    }));

    const distPoints = chartData.map((d, i) => ({
      x: pad.left + (cw / Math.max(chartData.length - 1, 1)) * i,
      y: pad.top + ch - ((d.distance || 0) / maxDist) * ch
    }));

    // Draw areas
    const gainColor = isDark ? '#4ade80' : '#16a34a';
    const distColor = isDark ? '#fbbf24' : '#d97706';
    drawSmoothLine(
      gainPoints,
      gainColor,
      isDark ? 'rgba(74,222,128,0.18)' : 'rgba(22,163,74,0.12)'
    );
    drawSmoothLine(
      distPoints,
      distColor,
      isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.1)'
    );

    // Draw points
    gainPoints.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = gainColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(distPoints[i].x, distPoints[i].y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = distColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Hover interaction
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let closest = null;
      let minDist = Infinity;

      gainPoints.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 30 && d < minDist) {
          minDist = d;
          closest = p;
        }
      });

      if (closest && tooltipRef.current) {
        const date = new Date(closest.date);
        tooltipRef.current.innerHTML = `
          <div class="font-semibold text-xs mb-1.5" style="color: var(--text-primary);">${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div class="flex items-center gap-2 mb-1">
            <span class="tb-legend-dot" style="background: ${gainColor};"></span>
            <span style="color: var(--text-secondary);">Gain:</span>
            <span class="font-mono font-bold" style="color: ${gainColor};">${closest.gain.toFixed(1)}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="tb-legend-dot" style="background: ${distColor};"></span>
            <span style="color: var(--text-secondary);">Distance:</span>
            <span class="font-mono font-bold" style="color: ${distColor};">${closest.distance.toFixed(0)} km</span>
          </div>
        `;
        tooltipRef.current.style.left = closest.x + 10 + 'px';
        tooltipRef.current.style.top = closest.y - 10 + 'px';
        tooltipRef.current.classList.add('visible');
      } else if (tooltipRef.current) {
        tooltipRef.current.classList.remove('visible');
      }
    };

    canvas.onmouseleave = () => {
      if (tooltipRef.current) {
        tooltipRef.current.classList.remove('visible');
      }
    };
  };

  useLayoutEffect(() => {
    if (!chartData || chartData.length === 0 || !canvasRef.current) return;
    drawChart();

    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartData]);

  return (
    <section className="tb-card p-6 tb-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.15)' }}
          >
            <TrendingUp size={20} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Historique des Optimisations
            </h3>
            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Évolution des gains et distances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="tb-legend-dot" style={{ background: '#34d399' }}></span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Gain (%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="tb-legend-dot" style={{ background: '#fbbf24' }}></span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Distance (km)
            </span>
          </div>
        </div>
      </div>

      <div 
        className="tb-chart-container"
        ref={containerRef}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
        <div 
          className="tb-chart-tooltip"
          ref={tooltipRef}
        ></div>
      </div>
    </section>
  );
}
