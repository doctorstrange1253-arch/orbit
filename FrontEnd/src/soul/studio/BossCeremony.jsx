/**
 * soul/studio/BossCeremony.jsx — The 1.2s Boss Level opening ceremony.
 *
 * Plays when a student taps a boss node. Three beats:
 *
 *   0.0s  - 0.4s : Golden ring expands from center (scale 0.2 → 5.0,
 *                   opacity 0.9 → 0.2). Plays a low-frequency bass
 *                   swell (SoulSound.bossLevel).
 *   0.4s  - 0.8s : "BOSS" eyebrow + lesson title fade in centered.
 *   0.8s  - 1.2s : Vignette darkens; "Begin" hint appears.
 *
 * At 1.2s, fires onDone. The parent navigates to the boss lesson.
 * Escape cancels.
 *
 * Reduced-motion: a 200ms cross-fade, no ring, no sound.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';
import { SoulSound } from '../soundLibrary';
import { Haptic } from '../haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const BossCeremony = ({ lesson, onDone, onCancel }) => {
  const reduced = _isReducedMotion();
  const [visible, setVisible] = useState(true);

  // Fire sound + haptic once on mount.
  useEffect(() => {
    if (reduced) return;
    SoulSound.bossLevel();
    Haptic.heavy();
  }, [reduced]);

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => onDone?.(), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => onDone?.(), 1200);
    return () => clearTimeout(t);
  }, [reduced, onDone]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (reduced) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            key="boss-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[260] bg-[#060810]"
            aria-hidden
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed inset-0 z-[260] pointer-events-none flex items-center justify-center">
      {/* Beat 1: golden ring expanding from center */}
      <motion.div
        initial={{ width: 0, height: 0, opacity: 0.9 }}
        animate={{ width: '200vmax', height: '200vmax', opacity: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(244,63,94,0.3) 35%, transparent 70%)',
          boxShadow: 'inset 0 0 80px rgba(251,191,36,0.4)',
        }}
      />

      {/* Beat 1b: ring border expanding */}
      <motion.div
        initial={{ width: 0, height: 0, opacity: 1, borderWidth: 6 }}
        animate={{ width: '120vmax', height: '120vmax', opacity: 0, borderWidth: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute rounded-full"
        style={{
          border: '2px solid #fbbf24',
          boxShadow: '0 0 60px rgba(251,191,36,0.6)',
        }}
      />

      {/* Beat 2: BOSS eyebrow + title */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        className="absolute flex flex-col items-center"
      >
        <div className="flex items-center gap-2 mb-3">
          <Crown size={20} style={{ color: '#fbbf24' }} />
          <div className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-200">
            Boss Level
          </div>
          <Crown size={20} style={{ color: '#fbbf24' }} />
        </div>
        <div className="text-2xl md:text-3xl font-display font-black text-text-primary text-center max-w-md">
          {lesson?.title || 'The Test'}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="mt-4 text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted"
        >
          Begin when ready
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BossCeremony;
