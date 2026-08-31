/**
 * soul/skillMap/ConstellationCanvas.jsx — The Skill Map's star field.
 *
 * A full-bleed canvas that renders a constellation chart of everything
 * the user has learned:
 *   - Stars:  one per completed course (size = lessons, brightness = avg score)
 *   - Lines:  related concept pairs (drawn on first load, stroke-dashoffset
 *             reveal)
 *   - Clusters: soft background nebula glow per category cluster
 *
 * Live-animated via requestAnimationFrame. Each star pulses on its
 * own offset loop (4-8s). Reduced-motion: stars stay still and bright.
 *
 * Public variant (no `lastTouchedAt`, no `scores`) renders identically
 * — the shareable URL looks the same to anyone.
 */

import { useEffect, useRef, useState } from 'react';
import { useSoul } from '../../hooks/useSoul';
// V3 — haptic + sound on constellation star tap.
import { Haptic } from '../haptics';
import { SoulSound } from '../soundLibrary';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Category → color map. Aligned with the V3 Nebula palette so a course
// in the "music" category renders as a Pulsar (cyan) star.
const CATEGORY_COLOR = {
  music:        '#22d3ee',
  programming:  '#a78bfa',
  design:       '#fbbf24',
  business:     '#f43f5e',
  science:      '#fff8e1',
  writing:      '#fde68a',
  photography:  '#0d9488',
  fitness:      '#3b82f6',
  languages:    '#a78bfa',
  general:      '#7c3aed',
};
const _color = (cat) => CATEGORY_COLOR[cat] || CATEGORY_COLOR.general;

// Lay out N stars in a soft radial pattern. Avoids collisions by jittering
// each star's angle by a hash of its index.
function _layoutStars(stars = [], width, height) {
  const pad = 60;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2 - pad;
  return stars.map((s, i) => {
    const angle = (i / Math.max(1, stars.length)) * Math.PI * 2 + ((i * 7) % 11) * 0.04;
    const r = maxR * (0.35 + ((i * 13) % 7) * 0.09);
    return {
      ...s,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  });
}

const ConstellationCanvas = ({ data, width = 800, height = 560, onSelectStar }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [linesDrawn, setLinesDrawn] = useState(false);

  const stars = useMemo
    ? useMemo(() => _layoutStars(data?.stars || [], width, height), [data?.stars, width, height])
    : _layoutStars(data?.stars || [], width, height);

  // Build a slug → (x, y) map for the edges. The map is keyed by concept
  // slug, but stars are keyed by courseId. We approximate by hashing the
  // course's category concepts to a center near the star. For MVP we draw
  // edges by concept: every concept that's the "main" of a star (we
  // approximate by hashing) draws to every related concept.
  const slugPos = useMemo
    ? useMemo(() => {
        // For each course star, derive one concept position by hashing
        // its category. Distribute concept "anchors" around the star.
        const m = new Map();
        stars.forEach((s, i) => {
          const slug = s.category || `c${i}`;
          m.set(slug, { x: s.x, y: s.y, brightness: s.brightness || 0.5 });
        });
        return m;
      }, [stars])
    : (() => {
        const m = new Map();
        stars.forEach((s, i) => {
          m.set(s.category || `c${i}`, { x: s.x, y: s.y, brightness: s.brightness || 0.5 });
        });
        return m;
      })();

  // Render loop.
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = width * dpr;
    canvasRef.current.height = height * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let frame = 0;
    const start = performance.now();

    const render = () => {
      frame += 1;
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Soft cosmos gradient.
      const grad = ctx.createRadialGradient(
        width * mouse.x, height * mouse.y, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.7
      );
      grad.addColorStop(0, 'rgba(255,255,255,0.04)');
      grad.addColorStop(1, 'rgba(6,8,16,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Faint dust background.
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 300; i++) {
        const x = ((i * 73 + 11) % width);
        const y = ((i * 137 + 41) % height);
        ctx.fillRect(x, y, 1, 1);
      }

      // Edges (concept lines). Drawn first so stars layer on top.
      const edges = data?.edges || [];
      const edgeReveal = Math.min(1, t / 1.2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      for (const e of edges) {
        const a = slugPos.get(e.from);
        const b = slugPos.get(e.to);
        if (!a || !b) continue;
        // Per-line dash reveal.
        ctx.save();
        ctx.setLineDash([200, 200]);
        ctx.lineDashOffset = -200 * edgeReveal;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }

      // Stars (one per course).
      for (const s of stars) {
        // Parallax: subtle mouse-tied shift.
        const px = reduced ? 0 : (mouse.x - 0.5) * 6;
        const py = reduced ? 0 : (mouse.y - 0.5) * 6;
        const sx = s.x + px;
        const sy = s.y + py;

        // Pulse.
        const pulse = reduced ? 1.0 : 0.85 + 0.15 * Math.sin(t * 1.5 + (s.x * 0.01));

        // Halo.
        const color = _color(s.category);
        ctx.beginPath();
        ctx.fillStyle = `${color}33`;
        ctx.arc(sx, sy, s.size * 3 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Body.
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = s.brightness * pulse;
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    if (!linesDrawn) setLinesDrawn(true);
    return () => cancelAnimationFrame(raf);
  }, [data, stars, slugPos, width, height, mouse, reduced, linesDrawn]);

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  };

  const onClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = null;
    let bestD = Infinity;
    for (const s of stars) {
      const dx = mx - s.x;
      const dy = my - s.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < s.size * 2.4 && d < bestD) {
        bestD = d;
        best = s;
      }
    }
    if (best && typeof onSelectStar === 'function') {
      Haptic.light();
      SoulSound.pulseTick({ soul: 'student' });
      onSelectStar(best);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        background: '#060810',
        border: '1px solid var(--border-subtle)',
        aspectRatio: `${width} / ${height}`,
        maxHeight: 600,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
      onClick={onClick}
      role="img"
      aria-label={`Skill map: ${stars.length} courses completed`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: stars.length > 0 ? 'pointer' : 'default' }}
      />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
        <span>{stars.length} course{stars.length === 1 ? '' : 's'} · {data?.meta?.totalConceptsTouched || 0} concept{(data?.meta?.totalConceptsTouched || 0) === 1 ? '' : 's'}</span>
        <span className="hidden md:inline">Tap a star to see the course</span>
      </div>
    </div>
  );
};

export default ConstellationCanvas;
