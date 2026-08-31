/**
 * soul/observatory/ObservatoryEmpty.jsx — The Observatory empty state.
 *
 * Renders when a mentor has zero students (no connections yet). The
 * visual is a near-empty star map with a single blinking cursor at the
 * center — "your observatory is dark, but it's ready." The CTA points
 * to mentor application.
 *
 * Tone: steady, "I've been here" — the mentor register.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Telescope } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint } from '../tints';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const ObservatoryEmpty = () => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#a78bfa';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-8 text-center"
      style={{
        ...surfaceRecipe('mentor'),
        border: borderTint(nebula, 24),
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-4">
        Your observatory
      </div>
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 text-text-primary">
        The sky is dark. It's ready.
      </h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
        Each student you teach becomes a point of light in your map. The first star appears when someone books a session, completes a course, or rates a class.
      </p>

      {/* Blinking cursor at the center */}
      <div className="mx-auto my-6 h-24 flex items-center justify-center">
        <motion.div
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            background: accent,
            boxShadow: `0 0 20px ${accent}80`,
          }}
          animate={reduced ? { opacity: 0.8 } : { opacity: [0.2, 1, 0.2] }}
          transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          to="/mentor/courses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})`,
          }}
        >
          <GraduationCap size={14} /> Create a course
        </Link>
        <Link
          to="/mentor/sessions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-primary"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Telescope size={14} /> View session bookings
        </Link>
      </div>
    </motion.div>
  );
};

export default ObservatoryEmpty;
