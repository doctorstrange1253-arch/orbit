/**
 * soul/universe/UniverseEmpty.jsx — My Universe empty state.
 *
 * Renders when the student has no enrollments. The visual is a single
 * dim star at the center, with a tone-matched message: "Your universe is
 * dark. Enroll in a course to light your first star."
 *
 * Tone: curious, "show me" — the student register.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Telescope } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint } from '../tints';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const UniverseEmpty = () => {
  const { nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#fbbf24';
  const accent2 = nebula?.to || '#f43f5e';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-8 text-center"
      style={{
        ...surfaceRecipe('student'),
        border: borderTint(nebula, 24),
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-4">
        My universe
      </div>
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 text-text-primary">
        Your universe is dark. Enroll in a course to light your first star.
      </h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
        Each course you enroll in becomes a planet. The more you learn, the more it reveals.
      </p>

      {/* A single dim star at the center */}
      <div className="mx-auto my-6 h-24 flex items-center justify-center">
        <motion.div
          className="rounded-full"
          style={{
            width: 12,
            height: 12,
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
            boxShadow: `0 0 24px ${accent}66`,
          }}
          animate={reduced ? { opacity: 0.5 } : { opacity: [0.2, 0.6, 0.2], scale: [1, 1.15, 1] }}
          transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
          }}
        >
          <BookOpen size={14} /> Browse courses
        </Link>
        <Link
          to="/student/mentors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-primary"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Telescope size={14} /> Browse mentors
        </Link>
      </div>
    </motion.div>
  );
};

export default UniverseEmpty;
