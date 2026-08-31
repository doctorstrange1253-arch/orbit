/**
 * soul/TransitSequence.jsx — The 2.5s soul-switching ceremony.
 *
 * Replaces the V2 `WindowSwitchOverlay` (which is kept as the reduced-
 * motion fallback). The ceremony has 5 visual beats:
 *
 *   0.0s  — current screen freezes
 *   0.2s  — current soul's nebula color floods the viewport from the center
 *   0.8s  — current soul's celestial body collapses into the center
 *   1.0s  — new soul's celestial body blooms from the center
 *   1.6s  — new soul's nebula floods out to edges
 *   2.0s  — new screen content fades in
 *   2.5s  — done. New soul's home is live.
 *
 * The 5th beat (1.0s bloom of the destination) is where the thoughts
 * library sentence appears for 1.2s.
 *
 * The whole thing is a portal — it renders to `document.body` so it covers
 * EVERYTHING, no matter the z-index of the page beneath. Sound + haptic
 * fire in parallel with the visual.
 *
 * Reduced-motion: a simple cross-fade with no bloom, no sound, no haptic.
 * The store (`useIdentityTransit`) still runs its timer; we just render
 * a different visual.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useIdentityTransit } from './identityStore';
import { SOULS } from './registry';
import { NEBULAS, gradientCss } from './palette';
import { SoulSound } from './soundLibrary';
import { Haptic } from './haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const TransitSequence = () => {
  const active = useIdentityTransit((s) => s.active);
  const from = useIdentityTransit((s) => s.from);
  const to = useIdentityTransit((s) => s.to);
  const thought = useIdentityTransit((s) => s.thought);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Fire sound + haptic once per transit (not on re-renders).
  useEffect(() => {
    if (!active || !to) return;
    SoulSound.transit({ soul: to, fromSoul: from });
    Haptic.transit();
  }, [active, to, from]);

  if (!mounted || typeof document === 'undefined') return null;

  const reduced = _isReducedMotion();
  const fromSoul = from ? SOULS[from] : null;
  const toSoul = to ? SOULS[to] : null;
  const toNebula = toSoul ? NEBULAS[toSoul.nebula] : null;

  return createPortal(
    <AnimatePresence>
      {active && (
        reduced ? (
          // Reduced-motion: a simple cross-fade, no bloom/sound/haptic.
          <motion.div
            key="transit-reduced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(6, 8, 16, 0.85)', backdropFilter: 'blur(8px)' }}
          />
        ) : (
          <motion.div
            key="transit-full"
            aria-live="polite"
            role="status"
            className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden pointer-events-none"
            style={{ background: 'rgba(6, 8, 16, 0.6)' }}
          >
            {/* Beat 2-3: from-soul nebula flood + collapse (0.2s - 0.8s) */}
            {fromSoul && (
              <motion.div
                key={`from-${from}`}
                className="absolute rounded-full"
                style={{
                  background: gradientCss(from),
                  boxShadow: `0 0 200px 80px ${NEBULAS[fromSoul.nebula].from}40`,
                }}
                initial={{ width: 0, height: 0, opacity: 0.9 }}
                animate={{ width: 80, height: 80, opacity: 0, scale: [1, 4] }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}

            {/* Beat 4: to-soul bloom (1.0s - 1.6s) */}
            {toSoul && (
              <motion.div
                key={`to-${to}`}
                className="relative rounded-full flex items-center justify-center"
                style={{
                  background: gradientCss(to),
                  boxShadow: `0 0 120px -10px ${NEBULAS[toSoul.nebula].from}`,
                }}
                initial={{ width: 0, height: 0, opacity: 0, scale: 0.2 }}
                animate={{ width: 220, height: 220, opacity: 1, scale: [0.2, 1.4, 1] }}
                transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="absolute inset-4 rounded-full opacity-50"
                  style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 0.4, delay: 1.4 }}
                />
              </motion.div>
            )}

            {/* Beat 5: to-soul nebula flood out (1.6s - 2.0s) */}
            {toNebula && (
              <motion.div
                key={`flood-${to}`}
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${toNebula.from}55, ${toNebula.to}33 60%, transparent 100%)`,
                }}
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 4 }}
                transition={{ duration: 0.4, delay: 1.6, ease: 'easeOut' }}
              />
            )}

            {/* Thought (1.0s - 2.2s) */}
            {thought && (
              <motion.p
                key={`thought-${to}`}
                className="absolute max-w-md text-center px-6 text-lg md:text-xl font-display font-medium italic text-text-primary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, delay: 1.05 }}
              >
                &ldquo;{thought.replace(/^"|"$/g, '')}&rdquo;
              </motion.p>
            )}
          </motion.div>
        )
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TransitSequence;
