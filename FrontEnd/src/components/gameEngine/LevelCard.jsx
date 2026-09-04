/**
 * components/gameEngine/LevelCard.jsx — The 4-line pre-lesson card.
 *
 * V3 design: every lesson opens with a card for 2-3 seconds. The card
 * tells the student what they're about to learn, why it matters, and
 * the one thing to remember. After 2s a "Begin" button fades in.
 *
 * The card reads from the V3 fields on the lesson (set in CourseBuilder,
 * possibly auto-populated by the AI suggest button):
 *   - promiseCopy: "In the next 4 minutes, you'll be able to read a chord progression by ear."
 *   - whyCopy: "This unlocks Module 3's harmony section."
 *   - rememberCopy: "The root note is the one that feels like home."
 *
 * If the lesson has no V3 copy yet, the card falls back to the lesson
 * description so V2 lessons (no AI-suggested copy) still work.
 *
 * Reduced-motion: no slide-in, no fade. The card just shows for 2s,
 * then auto-dismisses; the "Begin" button is immediately visible.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const LevelCard = ({ lesson, onBegin }) => {
  const { nebula } = useSoul();
  const reduced = _isReducedMotion();
  const [showButton, setShowButton] = useState(reduced);

  const promise = lesson?.promiseCopy || lesson?.description || 'A short lesson awaits.';
  const why = lesson?.whyCopy || '';
  const remember = lesson?.rememberCopy || '';
  const accent = nebula?.from || '#22d3ee';
  const isBoss = !!lesson?.isBoss;

  useEffect(() => {
    if (reduced) return undefined;
    const t = setTimeout(() => setShowButton(true), 1200);
    return () => clearTimeout(t);
  }, [reduced, lesson?._id]);

  return (
    <AnimatePresence>
      <motion.div
        key={lesson?._id || 'card'}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-2xl p-6 md:p-8 border"
        style={{
          background: isBoss
            ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(244,63,94,0.08))'
            : `linear-gradient(135deg, ${accent}10, rgba(6,8,16,0.4))`,
          border: isBoss ? '1px solid rgba(251,191,36,0.35)' : `1px solid ${accent}30`,
        }}
      >
        {isBoss && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200 bg-amber-500/15 border border-amber-500/30 mb-3">
            <Sparkles size={10} /> Boss
          </div>
        )}
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mb-2">
          {isBoss ? 'The test. Everything before was the runway.' : 'In the next few minutes'}
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-black text-text-primary leading-snug mb-4">
          {promise}
        </h2>
        {why && (
          <p className="text-sm text-text-secondary mb-3">
            <span className="text-text-muted">Why it matters · </span>
            {why}
          </p>
        )}
        {remember && (
          <p className="text-sm text-text-primary italic">
            <span className="text-text-muted not-italic">Remember · </span>
            {remember}
          </p>
        )}
        {showButton && (
          <motion.button
            type="button"
            onClick={() => onBegin?.()}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest text-text-on-accent"
            style={{
              background: isBoss
                ? 'linear-gradient(135deg, #fbbf24, #f43f5e)'
                : `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})`,
            }}
          >
            Begin <ArrowRight size={14} />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelCard;
