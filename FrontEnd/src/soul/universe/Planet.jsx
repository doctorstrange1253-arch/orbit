/**
 * soul/universe/Planet.jsx — A planet per course.
 *
 * Each enrolled course renders as a small planet in the student's
 * "universe". The planet's appearance is derived from the enrollment's
 * `progressPct` (0-100):
 *
 *   - 0%       → hazy, barely visible (cloud-covered)
 *   - 1-49%    → atmosphere clearing, one continent appears
 *   - 50%      → landmass fully visible, oceans defined
 *   - 50-99%   → orbital ring begins to glow
 *   - 100%     → full ring + a small "completed" star
 *
 * The planet rotates slowly (CSS animation) and floats gently. On
 * reduced-motion, the rotation pauses and the planet stays still.
 *
 * On click, the parent fires a "zoom" event — the parent renders
 * <CameraZoom> which animates the planet expanding to fill the
 * viewport, then navigates to the course detail page.
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Derive visual state from progress.
function _planetState(progressPct) {
  if (progressPct >= 100) return { hazy: false, landmass: true, ring: 'full', completed: true };
  if (progressPct >= 50)  return { hazy: false, landmass: true, ring: 'glow',  completed: false };
  if (progressPct >= 1)   return { hazy: true,  landmass: true, ring: 'none',  completed: false };
  return { hazy: true, landmass: false, ring: 'none', completed: false };
}

const Planet = ({ enrollment, onZoom, size = 110, index = 0 }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const course = enrollment?.course || {};
  const progress = enrollment?.progressPct || 0;
  const state = _planetState(progress);
  const accent = nebula?.from || '#fbbf24';
  const accent2 = nebula?.to || '#f43f5e';

  // Per-planet tilt + rotation duration, seeded by the course id.
  const tilt = (index % 4) * 4 - 6;
  const dur = 24 + (index % 5) * 4;

  return (
    <motion.button
      type="button"
      onClick={() => typeof onZoom === 'function' && onZoom(enrollment, course)}
      className="group relative flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-full"
      style={{ width: size, height: size + 50 }}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      aria-label={`Open ${course.title || 'course'} (${progress}% complete)`}
    >
      {/* The planet + its orbital ring */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Orbital ring */}
        <div
          className="absolute -inset-2 rounded-full pointer-events-none"
          style={{
            border: state.ring === 'full' ? `2px solid ${accent}` :
                    state.ring === 'glow' ? `1px solid ${accent}80` : 'none',
            transform: `rotate(${tilt}deg)`,
            opacity: state.ring === 'full' ? 0.9 : state.ring === 'glow' ? 0.5 : 0,
            boxShadow: state.ring === 'full' ? `0 0 24px ${accent}aa` : 'none',
            animation: reduced ? undefined : `planet-orbit ${dur}s linear infinite`,
          }}
        />

        {/* The planet body */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: state.hazy
              ? `radial-gradient(circle at 30% 30%, ${accent}55, ${accent2}44 60%, rgba(0,0,0,0.4))`
              : `radial-gradient(circle at 30% 30%, ${accent}, ${accent2} 60%, rgba(0,0,0,0.5))`,
            boxShadow: `0 0 30px -4px ${accent}66, inset 0 -10px 20px rgba(0,0,0,0.5)`,
            opacity: state.hazy ? 0.55 : 1,
            filter: state.hazy ? 'blur(1.5px)' : 'none',
          }}
          animate={reduced ? undefined : { rotate: 360 }}
          transition={reduced ? undefined : { duration: dur * 1.5, repeat: Infinity, ease: 'linear' }}
        >
          {/* Landmass (one continent, visible from progress > 0) */}
          {state.landmass && (
            <div
              className="absolute"
              style={{
                top: '20%',
                left: '15%',
                width: '40%',
                height: '35%',
                background: `radial-gradient(ellipse, ${accent}cc 30%, transparent 70%)`,
                borderRadius: '60% 40% 50% 50%',
                opacity: 0.7,
                mixBlendMode: 'overlay',
              }}
            />
          )}
          {/* Cloud layer (hazy only) */}
          {state.hazy && (
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), transparent 60%)',
                mixBlendMode: 'soft-light',
              }}
            />
          )}
          {/* Specular highlight */}
          <div
            className="absolute"
            style={{
              top: '12%',
              left: '18%',
              width: '20%',
              height: '20%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)',
              borderRadius: '50%',
            }}
          />
        </motion.div>

        {/* Completed star (100%) */}
        {state.completed && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent2})`,
              boxShadow: `0 0 12px ${accent}aa`,
            }}
          >
            <Check size={12} className="text-text-on-accent" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center max-w-[120px]">
        <div className="text-[10px] font-semibold text-text-primary line-clamp-1">
          {course.title || 'Course'}
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted">
          {progress}%
        </div>
      </div>

      <style>{`
        @keyframes planet-orbit {
          from { transform: rotate(${tilt}deg); }
          to   { transform: rotate(${tilt + 360}deg); }
        }
      `}</style>
    </motion.button>
  );
};

export default Planet;
