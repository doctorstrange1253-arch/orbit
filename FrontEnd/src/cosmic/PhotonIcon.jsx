/**
 * PhotonIcon — the Photons currency mark. A luminous "photon": a glowing energy
 * core wrapped by a tilted orbital ring with a bright quantum satellite. It is
 * deliberately NOT a star/sparkle, so Photons never read as XP anywhere.
 * Crisp at 15px (nav chip) and premium at 40px (dashboard/shop).
 *
 * `animated` (default true) keeps the signature "catches-the-light" reflection:
 * a periodic halo pulse + a diagonal gloss sweep across the core every ~5.5s.
 * Fully reduced-motion safe (honors `prefers-reduced-motion` and the app-wide
 * `[data-anim-off="true"]` switch) — it simply renders static.
 *
 * Gradient ids are per-instance (useId) so multiple icons never collide.
 */
import { useId } from 'react';
import './PhotonIcon.css';

export default function PhotonIcon({ size = 20, animated = true, className = '', title = 'Photons' }) {
  const raw = useId().replace(/[:]/g, '');
  const core = `pi-core-${raw}`, ring = `pi-ring-${raw}`, gl = `pi-g-${raw}`, clip = `pi-c-${raw}`;

  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100"
      role="img" aria-label={title}
      className={`photon-icon${animated ? ' photon-icon--anim' : ''}${className ? ' ' + className : ''}`}
    >
      <defs>
        <radialGradient id={core} cx="40%" cy="36%" r="72%">
          <stop offset="0" stopColor="#eafdff" />
          <stop offset="34%" stopColor="#7dd3fc" />
          <stop offset="70%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={gl} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="23" />
        </clipPath>
      </defs>

      {/* Orbital ring (behind the core) */}
      <g transform="rotate(-24 50 50)">
        <ellipse cx="50" cy="50" rx="44" ry="15" fill="none" stroke={`url(#${ring})`} strokeWidth="4" opacity="0.9" />
      </g>

      {/* Glowing photon core */}
      <circle cx="50" cy="50" r="23" fill={`url(#${core})`} stroke="#eaf6ff" strokeWidth="2" />
      {/* Static inner highlight so it always reads as a rounded, lit orb */}
      <ellipse cx="42" cy="40" rx="8" ry="5" fill="#ffffff" opacity="0.45" />

      {/* Bright quantum satellite riding the ring (in front) */}
      <circle cx="88" cy="32" r="5" fill="#f5d0fe" stroke="#ffffff" strokeWidth="1.5" />

      {/* Periodic diagonal gloss sweep (clipped to the core) — the "reflection" */}
      {animated && (
        <g clipPath={`url(#${clip})`}>
          <rect className="photon-icon__sweep" x="38" y="-5" width="24" height="110" fill={`url(#${gl})`} />
        </g>
      )}
    </svg>
  );
}
