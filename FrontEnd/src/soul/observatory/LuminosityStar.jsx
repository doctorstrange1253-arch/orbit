import { motion } from 'framer-motion';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

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

  const size = 80 + Math.min(80, Math.log2(Math.max(1, studentsCount)) * 12);

  const brightness = 0.55 + Math.min(0.45, weeklyScore / 1500);

  const stability = Math.max(0, Math.min(1, (avgRating - 3) / 2));

  const flickerHz = (1 - stability) * 0.5;

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
