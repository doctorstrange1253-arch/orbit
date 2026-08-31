/**
 * components/gameEngine/BossCeremony.jsx — The 6-second post-pass celebration.
 *
 * V3 design: a Boss Level pass is a moment. The student just cleared
 * the hardest checkpoint in the module. The page freezes for 200ms,
 * a 6-second cinematic plays, then the user returns to the course.
 *
 * Beats (over 6s):
 *   0.0-0.4s : Page freeze (200ms), then the lesson card zooms to fill
 *              50% of the viewport.
 *   0.4-1.2s : A golden ring expands from the center (200vmax), the
 *              SoulSound.courseComplete chord plays.
 *   1.2-2.5s : "BOSS CONQUERED" eyebrow + lesson title + the mentor's
 *              name fade in. Haptic.success() fires.
 *   2.5-4.5s : The Knowledge Graph note — a small constellation of
 *              concepts the user just touched (read from the
 *              enrollment) animates in.
 *   4.5-6.0s : "Continue" + "Share" buttons fade in.
 *
 * On dismiss → call onDone. The parent routes to the next lesson.
 * Reduced-motion: 1.5s cross-fade, no ring.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Share2, ArrowRight, Sparkles } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { SoulSound } from '../../soul/soundLibrary';
import { Haptic } from '../../soul/haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const BossCeremony = ({ lesson, course, concepts = [], onDone }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const [visible, setVisible] = useState(true);
  const [showContinue, setShowContinue] = useState(false);

  // Fire sound + haptic once on mount.
  useEffect(() => {
    if (reduced) return;
    SoulSound.courseComplete();
    Haptic.success();
  }, [reduced]);

  // After 1.2s, fire the heavy haptic for "boss conquered".
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => Haptic.heavy(), 1200);
    return () => clearTimeout(t);
  }, [reduced]);

  // Show the "Continue" buttons at 4.5s.
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => setShowContinue(true), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowContinue(true), 4500);
    return () => clearTimeout(t);
  }, [reduced]);

  if (reduced) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[300] flex items-center justify-center"
            style={{ background: 'rgba(6,8,16,0.92)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-center text-text-primary px-6 max-w-md">
              <Crown size={36} className="text-amber-300 mx-auto mb-3" />
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-200 mb-1">Boss conquered</div>
              <div className="text-2xl font-display font-black mb-2">{lesson?.title || 'Boss'}</div>
              {course?.mentorName && (
                <div className="text-xs text-text-muted mb-4">by {course.mentorName}</div>
              )}
              {showContinue && (
                <button
                  type="button"
                  onClick={onDone}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f43f5e)' }}
                >
                  Continue <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(6,8,16,0.85)', backdropFilter: 'blur(8px)' }}
        >
          {/* Beat 2: golden ring expand */}
          <motion.div
            initial={{ width: 0, height: 0, opacity: 0.9 }}
            animate={{ width: '200vmax', height: '200vmax', opacity: 0.12 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(244,63,94,0.3) 35%, transparent 70%)',
            }}
          />

          {/* Beat 2b: ring border */}
          <motion.div
            initial={{ width: 0, height: 0, opacity: 1, borderWidth: 6 }}
            animate={{ width: '140vmax', height: '140vmax', opacity: 0, borderWidth: 1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{ border: '2px solid #fbbf24', boxShadow: '0 0 60px rgba(251,191,36,0.5)' }}
          />

          {/* Beat 3: text */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2, ease: 'easeOut' }}
            className="relative text-center text-text-primary px-6 max-w-xl"
          >
            <Crown size={42} className="text-amber-300 mx-auto mb-3" />
            <div className="text-[11px] font-mono uppercase tracking-[0.5em] text-amber-200 mb-1">
              Boss conquered
            </div>
            <div className="text-3xl md:text-4xl font-display font-black mb-2">
              {lesson?.title || 'Boss'}
            </div>
            {course?.mentorName && (
              <div className="text-xs text-text-muted mb-4">by {course.mentorName}</div>
            )}

            {/* Beat 4: concepts the user just touched */}
            {concepts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 2.5 }}
                className="mt-4"
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mb-2">
                  Concepts you just touched
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {concepts.slice(0, 4).map((c, i) => (
                    <motion.span
                      key={c.slug || c}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 2.6 + i * 0.1 }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fde68a' }}
                    >
                      <Sparkles size={9} /> {c.label || c.slug || c}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Beat 5: continue + share */}
            {showContinue && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={onDone}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest text-text-on-accent"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f43f5e)' }}
                >
                  Continue <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `I just conquered a Boss Level on Orbit`,
                        text: `${lesson?.title || 'Boss'} — by ${course?.mentorName || 'a mentor'}`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href).catch(() => {});
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border border-border-subtle text-text-primary"
                >
                  <Share2 size={14} /> Share
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BossCeremony;
