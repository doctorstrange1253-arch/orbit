/**
 * soul/horizon/PulseEmpty.jsx — The Pulse empty state.
 *
 * Renders when the user has no activity yet today. The message is
 * tone-matched to the Peer register (energetic, "let's go") and offers
 * two CTAs: browse matches, post a Q&A reply. The visual is a dim
 * horizon bar with a single column about to be lit.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSoul } from '../../hooks/useSoul';
import { Users, MessageCircle } from 'lucide-react';
import { surfaceRecipe, borderTint } from '../tints';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const PulseEmpty = () => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#22d3ee';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-8 text-center"
      style={{
        ...surfaceRecipe('peer'),
        border: borderTint(nebula, 24),
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-4">
        The night sky is forming
      </div>
      <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 text-text-primary">
        Take a swap, post a Q&amp;A reply, or schedule a session.
      </h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
        Your first light appears within a day. The horizon lights up as you learn — every event, every reply, every minute of attention.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          to="/peer/matches"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})`,
          }}
        >
          <Users size={14} /> Browse matches
        </Link>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-primary"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <MessageCircle size={14} /> Browse courses
        </Link>
      </div>

      {/* Faint horizon-line animation hint */}
      {!reduced && (
        <div className="mt-8 flex items-end justify-center gap-1 h-12">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-sm"
              style={{ width: 4, background: accent, opacity: 0.18 }}
              animate={{ height: ['20%', '40%', '20%'] }}
              transition={{ duration: 2 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PulseEmpty;
