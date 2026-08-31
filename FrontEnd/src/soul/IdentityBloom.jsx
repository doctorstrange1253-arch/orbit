/**
 * soul/IdentityBloom.jsx — The Identity Selection bloom screen.
 *
 * Three celestial bodies float in a dark void. Pulsar spins on a 4s loop,
 * Aurora shimmers (low-frequency hue-rotate), Solaris radiates (slow pulse,
 * opacity). Tap a body → 600ms bloom animation (scale 1.0 → 1.4 → 1.0,
 * nebula color spreads to the full background, particles emit from center).
 *
 * One short sentence appears under the bloomed body, then a "Begin" button
 * fades in after 1.2s. The whole screen is the entry point for V3 — it
 * replaces the V2 3-radio role picker.
 *
 * The component is fully self-contained: it manages its own state
 * (selected body, particles, button visibility). The parent just passes
 * `onChoose(soulId)` to receive the pick.
 *
 * Reduced-motion: all animations collapse to a fade. Particles don't emit.
 * The button appears immediately on tap.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOULS } from './registry';
import { NEBULAS, gradientCss } from './palette';
import { SoulSound } from './soundLibrary';
import { Haptic } from './haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Tiny seedable RNG so the particles land in a consistent place per render.
// (We use Math.random for the *set* of particles, then derive positions.)
function _particlesForSoul(soulId, count = 24) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 80 + Math.random() * 240;
    arr.push({
      id: `${soulId}-${i}`,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      delay: Math.random() * 0.2,
      size: 2 + Math.random() * 4,
    });
  }
  return arr;
}

// One celestial body. Each soul has its own gentle continuous motion so the
// user can tell them apart at a glance.
function CelestialBody({ soul, isSelected, onTap }) {
  const reduced = _isReducedMotion();
  const motion$ = useMemo(() => {
    if (reduced) return {};
    if (soul.id === 'peer') return { animate: { rotate: 360 }, transition: { duration: 4, repeat: Infinity, ease: 'linear' } };
    if (soul.id === 'mentor') return { animate: { filter: ['hue-rotate(0deg)', 'hue-rotate(20deg)', 'hue-rotate(-10deg)', 'hue-rotate(0deg)'] }, transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } };
    if (soul.id === 'student') return { animate: { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }, transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } };
    return {};
  }, [reduced, soul.id]);

  return (
    <button
      type="button"
      onClick={() => onTap(soul.id)}
      className="group relative flex flex-col items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-2xl px-2 py-3"
      aria-label={`Choose ${soul.label}: ${soul.description}`}
    >
      <motion.div
        className="relative w-28 h-28 md:w-36 md:h-36 rounded-full"
        style={{
          background: gradientCss(soul.id),
          boxShadow: `0 0 60px -10px ${NEBULAS[soul.nebula].from}80, inset 0 0 30px rgba(255,255,255,0.18)`,
        }}
        whileHover={reduced ? {} : { scale: 1.06 }}
        whileTap={reduced ? {} : { scale: 0.96 }}
        {...motion$}
        animate={isSelected ? { scale: [1, 1.4, 1] } : motion$.animate}
        transition={isSelected ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : motion$.transition}
      >
        <span
          className="absolute inset-2 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 55%)`,
          }}
        />
        <span
          className="absolute -inset-1 rounded-full opacity-30 blur-xl"
          style={{ background: gradientCss(soul.id) }}
        />
      </motion.div>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">
          {soul.celestial}
        </div>
        <div className="text-base font-semibold text-text-primary">
          {soul.label}
        </div>
      </div>
    </button>
  );
}

const IdentityBloom = ({ onChoose }) => {
  const [selected, setSelected] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const reduced = _isReducedMotion();

  useEffect(() => {
    if (!selected) {
      setShowButton(false);
      return;
    }
    if (reduced) {
      setShowButton(true);
      return;
    }
    const t = setTimeout(() => setShowButton(true), 1200);
    return () => clearTimeout(t);
  }, [selected, reduced]);

  const onTap = (soulId) => {
    if (selected) return; // already picked; ignore re-taps
    setSelected(soulId);
    Haptic.medium();
    SoulSound.bloom();
  };

  const onBegin = () => {
    if (!selected) return;
    Haptic.heavy();
    onChoose?.(selected);
  };

  const selectedSoul = selected ? SOULS[selected] : null;
  const particles = selected ? _particlesForSoul(selected) : [];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#060810] text-text-primary">
      {/* Soft void background with a subtle radial nebula */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: selected ? 0.9 : 0.4,
          background: selected
            ? `radial-gradient(circle at 50% 50%, ${NEBULAS[SOULS[selected].nebula].from}33, transparent 60%)`
            : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), transparent 60%)',
        }}
      />

      {/* Eyebrow */}
      <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.4em] text-text-muted mb-8">
        Choose your soul
      </div>

      {/* Three celestial bodies */}
      <div className="relative z-10 flex flex-wrap items-end justify-center gap-8 md:gap-14 px-6">
        {Object.values(SOULS).map((soul) => (
          <CelestialBody
            key={soul.id}
            soul={soul}
            isSelected={selected === soul.id}
            onTap={onTap}
          />
        ))}
      </div>

      {/* Particles emit from the selected body */}
      {selected && !reduced && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: NEBULAS[SOULS[selected].nebula].from,
                boxShadow: `0 0 ${p.size * 2}px ${NEBULAS[SOULS[selected].nebula].from}`,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0, 1, 0.4] }}
              transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      {/* Description + Begin button */}
      <div className="relative z-10 mt-12 max-w-md text-center px-6 min-h-[120px]">
        <AnimatePresence mode="wait">
          {selectedSoul ? (
            <motion.div
              key={selectedSoul.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xl md:text-2xl font-display font-medium text-text-primary leading-snug">
                {selectedSoul.description}
              </p>
              {showButton && (
                <motion.button
                  type="button"
                  onClick={onBegin}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-widest text-text-on-accent"
                  style={{
                    background: gradientCss(selectedSoul.id),
                    boxShadow: `0 0 24px -4px ${NEBULAS[selectedSoul.nebula].from}80`,
                  }}
                >
                  Begin
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-text-muted"
            >
              Tap a body to choose.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IdentityBloom;
