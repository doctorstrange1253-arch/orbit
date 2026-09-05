import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSoul } from '../../hooks/useSoul';
import { Haptic } from '../haptics';
import { SoulSound } from '../soundLibrary';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

function _seedForId(id) {
  let h = 2166136261;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 0xffffffff;
  const v = ((h * 2654435761) >>> 0) / 0xffffffff;
  return [u, v];
}

function _brightness(lastActiveMs) {
  if (!lastActiveMs) return { opacity: 0.4, size: 3, pulse: false };
  const days = (Date.now() - lastActiveMs) / (1000 * 60 * 60 * 24);
  if (days <= 7)  return { opacity: 1.0, size: 5, pulse: true };
  if (days <= 14) return { opacity: 0.75, size: 4, pulse: false };
  if (days <= 30) return { opacity: 0.55, size: 3.5, pulse: false };
  return { opacity: 0.4, size: 3, pulse: false };
}

const StarMap = ({ students = [], width = 800, height = 480, onSelect }) => {
  const { nebula } = useSoul();
  const navigate = useNavigate();
  const reduced = _isReducedMotion();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [justCompletedIds, setJustCompletedIds] = useState(new Set());

  useEffect(() => {
    const now = Date.now();
    const ids = new Set();
    for (const s of students) {
      const t = s?.recentEventAt ? new Date(s.recentEventAt).getTime() : 0;
      if (t && now - t < 10_000) ids.add(String(s.userId || s._id));
    }
    setJustCompletedIds(ids);
    if (ids.size > 0) {
      const t = setTimeout(() => setJustCompletedIds(new Set()), 10_000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [students]);

  const stars = useMemo(() => {
    const pad = 40; // keep stars away from the edges
    return students.map((s) => {
      const id = s.userId || s._id;
      const [u, v] = _seedForId(id);
      const x = pad + u * (width - pad * 2);
      const y = pad + v * (height - pad * 2);
      const b = _brightness(s.lastActiveMs);
      return { id, x, y, ...b, recent: justCompletedIds.has(String(id)), name: s.name || 'Student' };
    });
  }, [students, width, height, justCompletedIds]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = width * dpr;
    canvasRef.current.height = height * dpr;
    ctx.scale(dpr, dpr);

    const accent = nebula?.from || '#a78bfa';

    let frame = 0;
    const render = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createRadialGradient(
        width * mouse.x, height * mouse.y, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.6
      );
      grad.addColorStop(0, `${accent}10`);
      grad.addColorStop(1, 'rgba(6, 8, 16, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let i = 0; i < 200; i++) {
        const x = ((i * 73 + 11) % width);
        const y = ((i * 137 + 41) % height);
        ctx.fillRect(x, y, 1, 1);
      }

      for (const s of stars) {
        const px = reduced ? 0 : (mouse.x - 0.5) * 8;
        const py = reduced ? 0 : (mouse.y - 0.5) * 8;
        const sx = s.x + px;
        const sy = s.y + py;

        const pulse = s.pulse && !reduced
          ? 0.7 + 0.3 * Math.sin((frame * 0.04) + (s.x * 0.01))
          : 1.0;

        if (s.pulse || s.recent) {
          ctx.beginPath();
          ctx.fillStyle = `${accent}${s.recent ? '80' : '40'}`;
          ctx.arc(sx, sy, s.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = accent;
        ctx.globalAlpha = s.opacity * pulse;
        ctx.arc(sx, sy, s.size * (s.recent ? 1.6 : 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (s.recent && !reduced) {
          ctx.strokeStyle = `${accent}cc`;
          ctx.lineWidth = 1.2;
          const r = s.size * 4;
          ctx.beginPath();
          ctx.moveTo(sx - r, sy); ctx.lineTo(sx + r, sy);
          ctx.moveTo(sx, sy - r); ctx.lineTo(sx, sy + r);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [stars, width, height, mouse, nebula, reduced]);

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  };

  const onClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let nearest = null;
    let bestDist = Infinity;
    for (const s of stars) {
      const dx = mx - s.x;
      const dy = my - s.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 20 && d < bestDist) {
        bestDist = d;
        nearest = s;
      }
    }
    if (nearest) {
      Haptic.light();
      SoulSound.pulseTick({ soul: 'mentor' });
      if (typeof onSelect === 'function') onSelect(nearest);
      else navigate(`/profile/${nearest.id}`);
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
        maxHeight: 520,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
      onClick={onClick}
      role="img"
      aria-label={`Star map: ${students.length} students`}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: stars.length > 0 ? 'pointer' : 'default',
        }}
      />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
        <span>{stars.filter((s) => s.pulse).length} active · {stars.length} total</span>
        <span className="hidden md:inline">Tap a star to open their profile</span>
      </div>
    </div>
  );
};

export default StarMap;
