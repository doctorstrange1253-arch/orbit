/**
 * soul/signalFlare/FlareLaunch.jsx — The 1.2s rocket animation overlay.
 *
 * Plays on top of the Waiting Room when the user taps "Send a Signal
 * Flare." A small rocket morphs out of the button, streaks upward
 * with a particle trail, and the page returns to the launched state.
 *
 * This is the inverse of the PlanetMaterialization — the rocket
 * leaves the screen upward, the planet materializes from above later
 * (when a mentor responds).
 *
 * Reduced-motion: 300ms cross-fade with "✓ Flare launched" text.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Rocket, Check } from 'lucide-react';
import { SoulSound } from '../soundLibrary';
import { Haptic } from '../haptics';

const SPARKS = [
  { x: -26, y: 58 },
  { x: -17, y: 96 },
  { x: -9, y: 72 },
  { x: -3, y: 110 },
  { x: 5, y: 66 },
  { x: 12, y: 104 },
  { x: 20, y: 80 },
  { x: 27, y: 118 },
];

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const FlareLaunch = ({ sourceRect, onDone, onCancel }) => {
  const reduced = _isReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!sourceRect) return undefined;
    if (reduced) {
      setDone(true);
      const t = setTimeout(() => onDone?.(), 350);
      return () => clearTimeout(t);
    }
    SoulSound.signalFlare();
    Haptic.flare();
    const t = setTimeout(() => {
      setDone(true);
      setTimeout(() => onDone?.(), 600);
    }, 1200);
    return () => clearTimeout(t);
  }, [sourceRect, reduced, onDone]);

  // Escape key dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (!sourceRect || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {reduced ? (
          <motion.div
            key="flare-reduced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[270] flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(6,8,16,0.7)', backdropFilter: 'blur(6px)' }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/40 text-emerald-200">
              <Check size={16} /> {done ? 'Flare launched' : 'Launching…'}
            </div>
          </motion.div>
        ) : (
          <div className="fixed inset-0 z-[270] pointer-events-none">
            {/* Soft radial backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 70%, rgba(34,211,238,0.18), transparent 60%)' }}
            />
            {/* The rocket */}
            {!done ? (
              <motion.div
                initial={{
                  x: sourceRect.left + sourceRect.width / 2 - 16,
                  y: sourceRect.top + sourceRect.height / 2 - 16,
                  rotate: -30,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: window.innerWidth / 2 - 16,
                  y: -64,
                  rotate: -10,
                  scale: 1.4,
                  opacity: 0.2,
                }}
                transition={{ duration: 1.0, ease: [0.4, 0.0, 0.6, 1.0] }}
                className="absolute w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #0d9488)',
                  boxShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 60px rgba(34,211,238,0.4)',
                }}
              >
                <Rocket size={16} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="flare-done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/40 text-emerald-200">
                  <Check size={16} /> Flare launched
                </div>
              </motion.div>
            )}
            {/* Particle trail */}
            {!done && (
              <div
                className="absolute"
                style={{
                  left: sourceRect.left + sourceRect.width / 2,
                  top: sourceRect.top + sourceRect.height / 2,
                }}
              >
                {SPARKS.map((spark, i) => (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                    animate={{
                      x: spark.x,
                      y: spark.y,
                      opacity: 0,
                      scale: 0.4,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: '#22d3ee',
                      boxShadow: '0 0 6px #22d3ee',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
    </AnimatePresence>,
    document.body
  );
};

export default FlareLaunch;
