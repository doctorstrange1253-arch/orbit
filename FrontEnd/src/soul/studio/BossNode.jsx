/**
 * soul/studio/BossNode.jsx — A boss-level checkpoint on the Course Map.
 *
 * Visually distinct from a LessonNode: wider (oval), golden ringed, with
 * a "BOSS" label. Click → fires onPick(lesson) which the parent uses to
 * trigger the Boss Ceremony (1.2s golden ring + bass) before opening
 * the player.
 *
 * The boss node sits at the end of a module (or the end of the course
 * if there's no module structure). Its presence is data-driven: a lesson
 * with `isBoss: true` in the Course schema renders as a BossNode rather
 * than a LessonNode.
 */

import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const BossNode = ({ lesson, isCompleted, isLocked, onPick }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#22d3ee';
  const gold = '#fbbf24';

  return (
    <motion.button
      type="button"
      onClick={() => !isLocked && typeof onPick === 'function' && onPick(lesson)}
      disabled={isLocked}
      className="relative flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
      whileHover={reduced || isLocked ? undefined : { scale: 1.04 }}
      whileTap={reduced || isLocked ? undefined : { scale: 0.94 }}
      aria-label={`Boss level: ${lesson.title}${isLocked ? ' (locked)' : ''}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 84,
          height: 56,
          borderRadius: 28,
          background: isCompleted
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(244, 63, 94, 0.25))'
            : `linear-gradient(135deg, ${gold}33, ${accent}33)`,
          border: `2px solid ${isCompleted ? gold : accent}`,
          boxShadow: isCompleted
            ? `0 0 24px ${gold}66`
            : !isLocked
              ? `0 0 28px ${accent}aa`
              : 'none',
        }}
      >
        {isLocked ? (
          <Lock size={18} className="text-text-muted" />
        ) : isCompleted ? (
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-200">Done</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <Crown size={18} style={{ color: accent }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>Boss</span>
          </div>
        )}

        {/* Outer rotating ring — only when not locked + not reduced */}
        {!isLocked && !isCompleted && !reduced && (
          <div
            className="absolute -inset-1 rounded-full pointer-events-none"
            style={{
              border: `1px solid ${accent}55`,
              animation: 'boss-ring 6s linear infinite',
            }}
          />
        )}
      </div>

      <div className="text-center max-w-[160px]">
        <div className="text-[9px] font-mono uppercase tracking-[0.25em]" style={{ color: gold }}>Checkpoint</div>
        <div className={`text-[11px] font-bold line-clamp-2 ${isLocked ? 'text-text-muted' : 'text-text-primary'}`}>
          {lesson.title}
        </div>
      </div>

      <style>{`
        @keyframes boss-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
};

export default BossNode;
