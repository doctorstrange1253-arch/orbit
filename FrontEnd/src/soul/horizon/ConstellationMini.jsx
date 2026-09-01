/**
 * ConstellationMini.jsx — the quiet network view for the peer window.
 *
 * A 180px canvas that renders the user's connections as small dots
 * arranged around a slightly larger Pulsar-cyan "you" dot. Lines
 * connect you to each connection at 30% alpha. Hover a dot to
 * surface a tooltip with the peer's name + 1 line of detail.
 *
 * The positions are seeded from the connection IDs so the layout
 * is stable across renders (no jitter when the user re-enters the
 * page). No animation, no rotation, no shimmer — the small
 * OrbitSigil in the navbar already provides the ambient motion;
 * here we just sit.
 */

import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useSoul } from '../../hooks/useSoul';

const SIZE = 180;
const CENTER = SIZE / 2;

// Deterministic hash → [0, 1). Used to place each connection dot
// at a stable angle + radius.
function hash01(id) {
  const s = String(id || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export default function ConstellationMini() {
  const { soul, nebula } = useSoul();
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const accent = nebula?.from || 'var(--soul-accent-1, #22d3ee)';

  // Fetch a slice of the user's connections for the network view.
  // We cap at 12 to keep the canvas quiet — anything more would feel
  // busy at this size. Falls back to an empty list on any failure so
  // the rest of the page is unaffected.
  const { data: conns = [] } = useQuery({
    queryKey: ['connections', 'mini', 'peer'],
    queryFn: () => api.get('/connections?status=accepted&limit=12')
      .then((r) => r.data?.connections || r.data || [])
      .catch(() => []),
    staleTime: 60_000,
  });

  const dots = useMemo(() => {
    const list = Array.isArray(conns) ? conns.slice(0, 12) : [];
    return list.map((c, i) => {
      const peer = c.peer || c.user || c.otherUser || {};
      const seed = hash01(peer._id || c._id || i);
      const angle = seed * Math.PI * 2;
      // Radius is mostly fixed but varies a little so dots don't
      // sit on a perfect ring (which would feel mechanical).
      const r = 50 + hash01(`${c._id}-r`) * 22;
      return {
        id: peer._id || c._id || i,
        name: peer.name || 'Connection',
        x: CENTER + Math.cos(angle) * r,
        y: CENTER + Math.sin(angle) * r,
      };
    });
  }, [conns]);

  return (
    <div ref={wrapRef} className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
        {/* Lines from centre to each connection */}
        {dots.map((d) => (
          <line
            key={`line-${d.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={d.x}
            y2={d.y}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.6"
          />
        ))}

        {/* Connection dots */}
        {dots.map((d) => {
          const isHovered = hovered === d.id;
          return (
            <g key={d.id}>
              <circle
                cx={d.x}
                cy={d.y}
                r={isHovered ? 3.6 : 2.6}
                fill="rgba(255,255,255,0.75)"
                onMouseEnter={() => setHovered(d.id)}
                onMouseLeave={() => setHovered((cur) => (cur === d.id ? null : cur))}
                onClick={() => navigate(`/peer/profile/${d.id}`)}
                style={{ cursor: 'pointer', transition: 'r 160ms ease-out' }}
              />
            </g>
          );
        })}

        {/* The user — a Pulsar-cyan dot at the centre, slightly larger. */}
        <circle cx={CENTER} cy={CENTER} r="4.2" fill={accent} style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
      </svg>

      {/* Single tooltip for the hovered peer */}
      {hovered && (
        <div
          className="absolute z-10 pointer-events-none rounded-lg"
          style={{
            top: 4,
            left: 8,
            background: 'rgba(8,10,18,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '4px 8px',
            color: 'var(--text-secondary)',
            fontSize: 11,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            letterSpacing: '0.02em',
          }}
        >
          {dots.find((d) => d.id === hovered)?.name}
        </div>
      )}
    </div>
  );
}
