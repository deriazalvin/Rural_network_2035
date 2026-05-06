import React, { useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import '../../styles/tableau-bord.css';

export function ChartSection({ chartData = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!chartData || chartData.length === 0 || !canvasRef.current) return;
    drawChart();

    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartData]);

  const drawChart = () => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const isDark = document.documentElement.classList?.contains('dark');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = container.offsetWidth * dpr;
    canvas.height = container.offsetHeight * dpr;
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const w = container.offsetWidth;
    const h = container.offsetHeight;
    const pad = { top: 30, right: 60, bottom: 50, left: 60 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const maxGain = Math.max(...chartData.map(d => d.gain || 0)) * 1.15 || 35;
    const maxDist = Math.max(...chartData.map(d => d.distance || 0)) * 1.15 || 300;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (ch / 5) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    // Y-axis labels (left - Gain)
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '10px "Space Mono", monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = maxGain - (maxGain / 5) * i;
      const y = pad.top + (ch / 5) * i;
      ctx.fillText(val.toFixed(0) + '%', pad.left - 10, y + 3);
    }

    // Y-axis labels (right - Distance)
    ctx.textAlign = 'left';
    for (let i = 0; i <= 5; i++) {
      const val = maxDist - (maxDist / 5) * i;
      const y = pad.top + (ch / 5) * i;
      ctx.fillText(val.toFixed(0) + ' km', w - pad.right + 10, y + 3);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
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
      ctx.lineWidth = 2.5;
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
    drawSmoothLine(
      gainPoints,
      '#22c55e',
      isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)'
    );
    drawSmoothLine(
      distPoints,
      '#f59e0b',
      isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)'
    );

    // Draw points
    gainPoints.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0b0f19' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(distPoints[i].x, distPoints[i].y, 5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0b0f19' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
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
            <span class="tb-legend-dot" style="background: #22c55e;"></span>
            <span style="color: var(--text-secondary);">Gain:</span>
            <span class="font-mono font-bold" style="color: #22c55e;">${closest.gain.toFixed(1)}%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="tb-legend-dot" style="background: #f59e0b;"></span>
            <span style="color: var(--text-secondary);">Distance:</span>
            <span class="font-mono font-bold" style="color: #f59e0b;">${closest.distance.toFixed(0)} km</span>
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

  return (
    <section className="tb-card p-6 tb-reveal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.1)' }}
          >
            <TrendingUp size={20} style={{ color: '#22c55e' }} />
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
            <span className="tb-legend-dot" style={{ background: '#22c55e' }}></span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Gain (%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="tb-legend-dot" style={{ background: '#f59e0b' }}></span>
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
        <canvas ref={canvasRef}></canvas>
        <div 
          className="tb-chart-tooltip"
          ref={tooltipRef}
        ></div>
      </div>
    </section>
  );
}
