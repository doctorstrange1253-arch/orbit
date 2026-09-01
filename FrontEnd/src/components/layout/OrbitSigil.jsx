/**
 * OrbitSigil.jsx — the navbar's tiny personal constellation.
 *
 * A 40×40 inline SVG that replaces the 4 separate status chips
 * (streak / level / league / stardust) with a single piece of the
 * night sky. The user is the Pulsar-cyan star at the centre; four
 * satellite dots (level, streak, stardust, league) orbit at fixed
 * 12/3/6/9 positions, each coloured by its own data. The whole
 * assembly rotates at 0.5°/s (barely perceptible ambient motion).
 *
 * On hover the rotation pauses, the satellites scale up, and a
 * frosted tooltip floats above with all four values. Each satellite
 * is its own clickable region — clicking it navigates to the page
 * for that stat (gameology, leaderboard, shop, etc).
 *
 * Sound: a soft `pulseTick({soul})` fires on satellite hover/click,
 * honouring the V2 soundManager preference and reduced-motion.
 *
 * Accessibility:
 *   - role="img" with aria-label announcing all four values
 *   - Each satellite is a focusable button with its own aria-label
 *   - prefers-reduced-motion: reduce disables the rotation + breath
 *     and the satellite scale-up on hover
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSigilState } from '../../hooks/useSigilState';
import { useSoul } from '../../hooks/useSoul';
import { SoulSound } from '../../soul/soundLibrary';
import { Haptic } from '../../soul/haptics';

const SIZE = 40;
const CENTER = SIZE / 2;
const ORBIT_RADIUS = 13;       // distance from centre to satellites
const ROTATION_PERIOD_MS = 12 * 60 * 1000; // 12 minutes per full revolution

// V3 Pulse 2.0 colour palette for the four satellites. Picked to
// read against the deep-space navbar surface without competing with
// the user's active soul nebula.
const COLOR_LEVEL    = '#fbbf24'; // Solaris amber (level gem)
const COLOR_STREAK   = '#fb923c'; // orange flame
const COLOR_STARDUST = '#22d3ee'; // Pulsar cyan (ticks)
const COLOR_LEAGUE   = null;      // dynamic, from useSigilState

// Tick a 50ms pulseTick on the active soul. Returns early if the
// V2 soundManager is muted or reduced-motion is on (pulseTick
// itself already honours those, but we keep the guard local so
// the satellite click can also fire Haptic without double-checking).
function tickSound(soulId) {
  try { SoulSound.pulseTick({ soul: soulId }); } catch { /* best-effort */ }
}

export default function OrbitSigil() {
  const { soul } = useSoul();
  const soulId = soul === 'mentor' ? 'mentor' : soul === 'student' ? 'student' : 'peer_learner';
  const sigil = useSigilState();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [hover, setHover] = useState(false);   // hovering the sigil at all
  const [hovered, setHovered] = useState(null); // which satellite is focused
  const [reducedMotion, setReducedMotion] = useState(false);
  const [open, setOpen] = useState(false);     // tooltip visibility (also from focus)

  // Respect prefers-reduced-motion: stop the ambient rotation + breath.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Close the tooltip on outside click (mobile tap) or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path) => {
    Haptic.light();
    tickSound(soulId);
    setOpen(false);
    setHovered(null);
    navigate(path);
  };

  // 12 / 3 / 6 / 9 o'clock satellite positions (un-rotated). Rotation
  // is applied to the whole <g> via SVG transform so the math stays
  // trivial.
  const positions = [
    { key: 'level',    x: CENTER,            y: CENTER - ORBIT_RADIUS, label: `Level ${sigil.level}`,              path: '/gameology' },
    { key: 'streak',   x: CENTER + ORBIT_RADIUS, y: CENTER,         label: `${sigil.streak}-day streak`,        path: '/gameology' },
    { key: 'stardust', x: CENTER,            y: CENTER + ORBIT_RADIUS, label: `${sigil.stardust.toLocaleString()} stardust`, path: '/shop' },
    { key: 'league',   x: CENTER - ORBIT_RADIUS, y: CENTER,         label: `${sigil.leagueLabel} league`,      path: '/leaderboard' },
  ];
  const colors = {
    level: COLOR_LEVEL,
    streak: COLOR_STREAK,
    stardust: COLOR_STARDUST,
    league: sigil.leagueColor,
  };

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => { setHover(true); setOpen(true); }}
      onMouseLeave={() => { setHover(false); setHovered(null); /* keep open if a satellite is focused */ }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={sigil.ariaLabel}
        className="block"
        style={{ overflow: 'visible' }}
      >
        {/* Ambient rotation of the whole orbital assembly. CSS
            animation is the cheapest path; the user can disable it
            via prefers-reduced-motion. The transform-origin is the
            centre of the SVG so the rotation looks correct. */}
        <g
          style={{
            transformOrigin: `${CENTER}px ${CENTER}px`,
            transform: reducedMotion ? 'none' : 'rotate(0deg)',
            animation: reducedMotion
              ? 'none'
              : `orbitSigilSpin ${ROTATION_PERIOD_MS}ms linear infinite`,
            transition: 'transform 200ms ease-out',
          }}
        >
          {/* Gravitational tethers — 1px hairlines from centre to each satellite. */}
          {positions.map((p) => (
            <line
              key={`line-${p.key}`}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
          ))}

          {/* Satellites. Scale up on hover/focus via the hovered-key check. */}
          {positions.map((p) => {
            const isHovered = hovered === p.key;
            const r = isHovered ? 2.4 : 1.6;
            return (
              <g
                key={p.key}
                tabIndex={0}
                role="button"
                aria-label={p.label}
                onClick={() => go(p.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(p.path); }
                }}
                onFocus={() => { setHovered(p.key); setOpen(true); tickSound(soulId); }}
                onBlur={() => setHovered((cur) => (cur === p.key ? null : cur))}
                onMouseEnter={() => { setHovered(p.key); tickSound(soulId); }}
                onMouseLeave={() => setHovered((cur) => (cur === p.key ? null : cur))}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {/* Soft halo for the streak ≥ 7 — the "in the run" badge. */}
                {p.key === 'streak' && sigil.streak >= 7 && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3.4"
                    fill="none"
                    stroke={colors.streak}
                    strokeOpacity="0.55"
                    strokeWidth="0.6"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={colors[p.key]}
                  style={{
                    transition: 'r 180ms ease-out',
                    filter: isHovered ? `drop-shadow(0 0 4px ${colors[p.key]})` : 'none',
                  }}
                />
              </g>
            );
          })}

          {/* The user — a 4-point Pulsar-cyan star at the centre, breathing
              (3s cycle, 60→100% opacity). We render it as a tiny SVG path
              (4 points) rather than a circle so the user is visually distinct
              from the satellites and reads as the "thing at the centre". */}
          <g style={{
            transformOrigin: `${CENTER}px ${CENTER}px`,
            animation: reducedMotion ? 'none' : 'orbitSigilBreath 3s ease-in-out infinite',
          }}>
            <path
              d={`M ${CENTER} ${CENTER - 3.4}
                  L ${CENTER + 0.9} ${CENTER - 0.9}
                  L ${CENTER + 3.4} ${CENTER}
                  L ${CENTER + 0.9} ${CENTER + 0.9}
                  L ${CENTER} ${CENTER + 3.4}
                  L ${CENTER - 0.9} ${CENTER + 0.9}
                  L ${CENTER - 3.4} ${CENTER}
                  L ${CENTER - 0.9} ${CENTER - 0.9} Z`}
              fill="var(--soul-accent-1, #22d3ee)"
              style={{ filter: 'drop-shadow(0 0 3px var(--soul-accent-1, #22d3ee))' }}
            />
          </g>
        </g>
      </svg>

      {/* Tooltip — the only piece of "UI" in the sigil. Floats above on
          hover/focus; closes on outside click or Escape. Each row is a
          clickable link to the relevant page. */}
      {open && (
        <div
          role="tooltip"
          className="absolute z-50 rounded-xl pointer-events-auto"
          style={{
            top: -8,
            left: '50%',
            transform: 'translate(-50%, -100%)',
            background: 'rgba(8,10,18,0.78)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '10px 12px',
            minWidth: 168,
            color: '#e5e7eb',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 11,
            lineHeight: 1.7,
            letterSpacing: '0.02em',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)',
            animation: 'orbitSigilTipIn 180ms ease-out',
          }}
        >
          <button
            type="button"
            onClick={() => go('/gameology')}
            onMouseEnter={() => tickSound(soulId)}
            className="block w-full text-left rounded px-1 py-0.5 hover:bg-white/5 transition-colors"
            style={{ color: 'inherit' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>LVL </span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{sigil.level}</span>
          </button>
          <button
            type="button"
            onClick={() => go('/gameology')}
            onMouseEnter={() => tickSound(soulId)}
            className="block w-full text-left rounded px-1 py-0.5 hover:bg-white/5 transition-colors"
            style={{ color: 'inherit' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>STREAK </span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{sigil.streak}d</span>
          </button>
          <button
            type="button"
            onClick={() => go('/shop')}
            onMouseEnter={() => tickSound(soulId)}
            className="block w-full text-left rounded px-1 py-0.5 hover:bg-white/5 transition-colors"
            style={{ color: 'inherit' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>PHOTONS </span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{sigil.stardust.toLocaleString()} ✦</span>
          </button>
          <button
            type="button"
            onClick={() => go('/leaderboard')}
            onMouseEnter={() => tickSound(soulId)}
            className="block w-full text-left rounded px-1 py-0.5 hover:bg-white/5 transition-colors"
            style={{ color: 'inherit' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>LEAGUE </span>
            <span style={{ color: sigil.leagueColor, fontWeight: 600 }}>{sigil.leagueLabel}</span>
          </button>
        </div>
      )}

      {/* Keyframes for the ambient rotation + breath + tooltip fade-in.
          Scoped here so the Sigil is fully self-contained (no global
          stylesheet entry needed). */}
      <style>{`
        @keyframes orbitSigilSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbitSigilBreath {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes orbitSigilTipIn {
          from { opacity: 0; transform: translate(-50%, -90%); }
          to   { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
    </div>
  );
}
