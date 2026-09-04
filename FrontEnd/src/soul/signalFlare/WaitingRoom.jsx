/**
 * soul/signalFlare/WaitingRoom.jsx — The "no courses here yet" surface.
 *
 * Renders when a student browses to a Constellation → genre with no
 * published courses. The visual is a planet in formation (slow
 * swirling particles, dim glow) + a counter of how many students
 * are already waiting + a Signal Flare button + adjacent-genre
 * recommendations.
 *
 * The planet-in-formation is a CSS-only animation (no canvas) — a
 * large soft radial gradient with a slowly rotating mask. Reduced-
 * motion: no rotation, the gradient just sits there.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, BookOpen, Compass } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint, tintHalo } from '../tints';
import { useFlareCount, useFireFlare } from '../../hooks/useFlares';
import { Haptic } from '../haptics';
import { SoulSound } from '../soundLibrary';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Curated adjacent-genre recommendations. In V3 this is a 3-row hard-coded
// map per constellation; a real recommendation engine can replace it later.
const ADJACENT = {
  music:        ['music production', 'songwriting', 'music theory'],
  programming:  ['web development', 'data structures', 'mobile development'],
  design:       ['ui design', 'ux research', 'illustration'],
  business:     ['marketing', 'product management', 'entrepreneurship'],
  science:      ['physics', 'biology', 'astronomy'],
  writing:      ['fiction writing', 'copywriting', 'screenwriting'],
  photography:  ['portrait photography', 'photo editing', 'lighting'],
  fitness:      ['strength training', 'yoga', 'nutrition'],
  languages:    ['spanish', 'french', 'japanese'],
  general:      ['productivity', 'photography', 'writing'],
};

const WaitingRoom = ({ constellation = 'general', genre = 'general' }) => {
  const { nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#22d3ee';
  const [launched, setLaunched] = useState(false);
  const flare = useFireFlare();
  const { data: countData } = useFlareCount(constellation, genre);
  const count = countData?.count || 0;

  const adjacent = useMemo(() => ADJACENT[constellation] || ADJACENT.general, [constellation]);

  const onLaunch = () => {
    if (flare.isPending || launched) return;
    Haptic.flare();
    SoulSound.signalFlare();
    flare.mutate(
      { constellation, genre },
      {
        onSuccess: () => {
          setLaunched(true);
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 md:p-8"
      style={{
        ...surfaceRecipe('student'),
        border: borderTint(nebula, 24),
        boxShadow: tintHalo(nebula, 16),
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-3">
        The waiting room
      </div>

      {/* The planet-in-formation */}
      <div className="flex flex-col items-center my-6">
        <div
          className="relative w-40 h-40 md:w-52 md:h-52 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accent}44, ${nebula?.to || '#f43f5e'}22 60%, transparent 75%)`,
            boxShadow: `0 0 80px ${accent}33, inset 0 0 40px rgba(255,255,255,0.05)`,
            border: `1px solid ${accent}33`,
          }}
        >
          {!reduced && (
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.18) 30%, transparent 60%)',
                mixBlendMode: 'soft-light',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">
              forming
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-display font-extrabold text-center text-text-primary mb-2">
        No courses here yet. The sky is forming.
      </h2>
      <p className="text-sm text-text-secondary text-center max-w-md mx-auto mb-5">
        {count > 0
          ? `${count} student${count === 1 ? '' : 's'} ${count === 1 ? 'is' : 'are'} waiting for a mentor to teach this. Add yours — the louder the call, the faster it lands.`
          : 'Be the first to signal. A mentor who sees the call may light the planet.'}
      </p>

      <div className="flex items-center justify-center mb-6">
        <AnimatePresence mode="wait">
          {launched ? (
            <motion.div
              key="launched"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest"
              style={{ background: `${accent}22`, border: `1px solid ${accent}55`, color: accent }}
            >
              <Rocket size={14} />
              Your Flare launched
            </motion.div>
          ) : (
            <motion.button
              key="launch"
              type="button"
              onClick={onLaunch}
              disabled={flare.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-text-on-accent disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#f43f5e'})` }}
              whileHover={reduced ? undefined : { scale: 1.04 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
            >
              <Rocket size={16} />
              {flare.isPending ? 'Launching…' : 'Send a Signal Flare'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Adjacent genres */}
      <div className="pt-4 border-t border-border-subtle/40">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mb-2 inline-flex items-center gap-1.5">
          <Compass size={11} /> Or explore adjacent genres
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {adjacent.map((g) => (
            <Link
              key={g}
              to={`/courses?genre=${encodeURIComponent(g)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-semibold border border-border-subtle text-text-secondary hover:border-accent/30"
            >
              <BookOpen size={11} /> {g}
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WaitingRoom;
