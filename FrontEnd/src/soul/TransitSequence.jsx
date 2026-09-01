/**
 * soul/TransitSequence.jsx — The soul-switching overlay.
 *
 * A complete, ceremonial transition. When the user switches souls
 * (peer ↔ mentor ↔ student) the screen HARD-CUTS to a fully opaque
 * deep-cosmic-ink background, holds at full opacity for the entire
 * active window, then fades out cleanly to reveal the new soul's home
 * page. A single Orbit-voiced thought appears centered partway in and
 * stays visible for the bulk of the ceremony.
 *
 * The hard-cut in (no fade-in) is the key design choice — during the
 * active period the new content is *completely hidden* behind the ink,
 * so the user never sees the new page snap in before the ceremony.
 * The fade-out is intentional: as the ink recedes, the new content
 * "wakes up" — that's the page-turn reveal.
 *
 * Design constraints from the user:
 *   - The transition must be OPAQUE — content beneath must not be
 *     visible during the animation
 *   - No 3D bloom, no glowing sphere, no animated circles
 *   - Clean, quiet, editorial — like turning a magazine page
 *   - Must feel COMPLETE — no abrupt cut, no "stuck" feeling
 *
 * Reduced-motion: a 200ms cross-fade, no thought, no sound, no haptic.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useIdentityTransit } from './identityStore';
import { SoulSound } from './soundLibrary';
import { Haptic } from './haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const OVERLAY_BG = '#06050f'; // deep cosmic ink, fully opaque

const TransitSequence = () => {
  const active = useIdentityTransit((s) => s.active);
  const to = useIdentityTransit((s) => s.to);
  const thought = useIdentityTransit((s) => s.thought);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Fire sound + haptic once per transit (not on re-renders).
  useEffect(() => {
    if (!active || !to) return;
    SoulSound.transit({ soul: to });
    Haptic.transit();
  }, [active, to]);

  if (!mounted || typeof document === 'undefined') return null;

  const reduced = _isReducedMotion();

  return createPortal(
    <AnimatePresence>
      {active && (
        reduced ? (
          // Reduced-motion: simple cross-fade.
          <motion.div
            key="transit-reduced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            className="fixed inset-0 z-[300] pointer-events-none"
            style={{ background: OVERLAY_BG }}
          />
        ) : (
          // Full transit: hard-cut to fully opaque ink, hold for the
          // entire active window, then fade out. The thought appears
          // ~400ms in and stays visible until the overlay exits.
          <motion.div
            key="transit-full"
            aria-live="polite"
            role="status"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeIn' }}
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
            style={{ background: OVERLAY_BG }}
          >
            {thought && (
              <motion.p
                key={`thought-${to}`}
                className="max-w-md text-center px-6 font-display font-medium italic"
                style={{
                  fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
                  color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.4,
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
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
