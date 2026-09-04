/**
 * soul/observatory/LuminosityStar.jsx — The mentor's signature.
 *
 * A single, large point of light centered above the star map. Its
 * appearance maps to mentor metrics:
 *
 *   - size       = total students taught (log scale, capped at 200)
 *   - brightness = weekly Pact Score (higher = brighter)
 *   - color      = Pact division (Aurora violet for Initiate →
 *                  Supernova white-gold for Oracle)
 *   - stability  = average rating this week (steady = no flicker; volatile
 *                  = subtle 0.5Hz flicker)
 *   - corona     = 4+ consecutive Pact weeks held (Steady Shield) — faint
 *                  orbiting ring
 *
 * The component is the *visual identity* of the mentor at the Observatory.
 * It doesn't render the metrics themselves — those are surfaced via the
 * PactBadge + Pact Pulse widgets already in /mentor/hub.
 */

import { motion } from 'framer-motion';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Map a Pact division to a hue. The 6-tier Pact color is a violet→gold
// ramp. (V3-F's Pulse Ceremony will re-tune this for the 8-tier system;
// the math here stays the same.)
const DIVISION_COLOR = {
  initiate: '#a78bfa',  // violet
  adept:    '#8b5cf6',  // deeper violet
  mentor:   '#7c3aed',  // purple
  sage:     '#6366f1',  // indigo
  luminary: '#d8b4fe',  // soft gold
  oracle:   '#fff8e1',  // white-gold
};

const DEFAULT_COLOR = '#a78bfa';

const LuminosityStar = ({
  studentsCount = 0,
  weeklyScore = 0,
  division = 'initiate',
  avgRating = 0,
  steadyWeeks = 0,
}) => {
  const reduced = _isReducedMotion();
  const baseColor = DIVISION_COLOR[division] || DEFAULT_COLOR;
  const color = baseColor;

  // Size: log scale, capped at 200 students (a saturated mentor is at cap).
  const size = 80 + Math.min(80, Math.log2(Math.max(1, studentsCount)) * 12);

  // Brightness: weekly score normalized to [0.55, 1.0]. 0 score = dim
  // (still visible, never invisible — the star is always "you").
  const brightness = 0.55 + Math.min(0.45, weeklyScore / 1500);

  // Stability: rating < 3.5 = volatile. 4.5+ = steady. 5.0 = perfect.
  const stability = Math.max(0, Math.min(1, (avgRating - 3) / 2));

  // Flicker intensity — high when stability is low.
  const flickerHz = (1 - stability) * 0.5;

  // Steady Shield: visible after 4+ consecutive weeks held.
  const showShield = steadyWeeks >= 4;

  return (
    <div className="relative flex items-center justify-center" style={{ minHeight: size + 40 }}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer corona (soft glow halo) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}55, transparent 70%)`,
            filter: 'blur(20px)',
            transform: 'scale(1.6)',
            opacity: brightness,
          }}
        />

        {/* The star itself */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), ${color} 50%, ${color}66 100%)`,
            boxShadow: `0 0 ${size * 0.4}px ${color}88, inset 0 0 ${size * 0.2}px rgba(255,255,255,0.4)`,
          }}
          animate={
            reduced ? undefined : flickerHz > 0
              ? { opacity: [brightness, brightness * 0.78, brightness], scale: [1, 0.98, 1] }
              : { opacity: [brightness * 0.95, brightness, brightness * 0.95], scale: [1, 1.02, 1] }
          }
          transition={
            reduced ? undefined : flickerHz > 0
              ? { duration: 2 / Math.max(0.1, flickerHz), repeat: Infinity, ease: 'easeInOut' }
              : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        {/* Steady Shield orbiting ring (after 4+ weeks held) */}
        {showShield && (
          <div
            className="absolute -inset-4 rounded-full pointer-events-none"
            style={{
              border: `1px solid ${color}80`,
              transform: 'rotate(0deg)',
              animation: reduced ? undefined : 'orbit-ring 8s linear infinite',
              opacity: 0.6,
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes orbit-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LuminosityStar;
