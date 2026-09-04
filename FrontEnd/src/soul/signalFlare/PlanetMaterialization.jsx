/**
 * soul/signalFlare/PlanetMaterialization.jsx — The 2s "a planet appeared" animation.
 *
 * Plays when a mentor publishes a course in a genre the user flared for.
 * The server emits a `signal-flare:responded` socket event with the
 * new course's id; the user-facing `useSignalFlareListener` hook picks
 * it up and opens this overlay.
 *
 * Beats (over 2s):
 *   0.0-0.4s : "A new course just appeared" eyebrow fades in
 *   0.4-1.2s : Golden ring expands from center
 *   1.2-2.0s : Planet blooms + course title + CTA
 *   2.0s     : Auto-dismiss
 *
 * On dismiss → navigate to the new course's detail page.
 * Reduced-motion: 600ms cross-fade with the title + CTA.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { SoulSound } from '../soundLibrary';
import { Haptic } from '../haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const PlanetMaterialization = ({ course, onDone, onCancel }) => {
  const reduced = _isReducedMotion();
  const navigate = useNavigate();
  const accent = '#fbbf24';

  useEffect(() => {
    if (!course) return undefined;
    SoulSound.flareLanded();
    Haptic.success();
    if (reduced) {
      const t = setTimeout(() => onDone?.(), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => onDone?.(), 2000);
    return () => clearTimeout(t);
  }, [course, reduced, onDone]);

  // Escape dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const onView = () => {
    if (course?.courseId) navigate(`/courses/${course.courseId}`);
    onDone?.();
  };

  if (!course || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {reduced ? (
          <motion.div
            key="planet-reduced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[290] flex items-center justify-center"
            style={{ background: 'rgba(6,8,16,0.88)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-center text-text-primary px-6 max-w-md">
              <Sparkles size={32} className="text-amber-300 mx-auto mb-2" />
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-amber-200 mb-1">A new course just appeared</div>
              <div className="text-2xl font-display font-black">{course.courseTitle || 'A course'}</div>
              <button
                type="button"
                onClick={onView}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f43f5e)' }}
              >
                View <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="planet-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[290] flex items-center justify-center pointer-events-auto"
            style={{ background: 'rgba(6,8,16,0.82)', backdropFilter: 'blur(8px)' }}
            onClick={onDone}
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {/* Beat 1: golden ring expand */}
            <motion.div
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: '180vmax', height: '180vmax', opacity: 0.12 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute rounded-full"
              style={{
                background: `radial-gradient(circle, ${accent}55, ${accent}22 35%, transparent 70%)`,
              }}
            />
            {/* Beat 2: planet bloom */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute"
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                background: `linear-gradient(135deg, ${accent}, #f43f5e)`,
                boxShadow: `0 0 60px ${accent}, inset 0 0 20px rgba(255,255,255,0.3)`,
              }}
            />
            {/* Beat 3: caption + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="relative text-center text-text-primary px-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-200 mb-1 inline-flex items-center gap-1.5">
                <Sparkles size={11} /> A new course just appeared
              </div>
              <div className="text-2xl md:text-3xl font-display font-black mt-1">{course.courseTitle || 'A course'}</div>
              <div className="text-xs text-text-muted mt-1">
                in response to your Signal Flare
              </div>
              <button
                type="button"
                onClick={onView}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest text-text-on-accent"
                style={{ background: `linear-gradient(135deg, ${accent}, #f43f5e)` }}
              >
                View <ArrowRight size={14} />
              </button>
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>,
    document.body
  );
};

export default PlanetMaterialization;
