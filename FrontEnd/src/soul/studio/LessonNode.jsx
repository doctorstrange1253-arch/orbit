/**
 * soul/studio/LessonNode.jsx — A single lesson node on the Course Map.
 *
 * Rendered as a circular node connected to siblings by a path line.
 * States:
 *   - completed  → golden border + check icon
 *   - active     → pulsing border (the next lesson to take)
 *   - locked     → grey + lock icon (not yet enrolled / not free)
 *   - free       → emerald dot (preview lesson)
 *
 * Click → fires onPick(lesson). The parent renders <VideoArrival> which
 * blooms the node into the player.
 */

import { motion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const LessonNode = ({ lesson, index, isCompleted, isActive, isLocked, isFree, onPick }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#22d3ee';

  const stateColor = isCompleted
    ? '#fbbf24'                                      // golden (completed)
    : isActive
      ? accent                                       // active soul accent
      : isLocked
        ? 'rgba(255,255,255,0.18)'                   // dim
        : accent;                                    // default = unlocked

  return (
    <motion.button
      type="button"
      onClick={() => !isLocked && typeof onPick === 'function' && onPick(lesson)}
      disabled={isLocked}
      className="relative flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
      whileHover={reduced || isLocked ? undefined : { scale: 1.06 }}
      whileTap={reduced || isLocked ? undefined : { scale: 0.94 }}
      aria-label={`Lesson ${index + 1}: ${lesson.title}${isLocked ? ' (locked)' : ''}`}
    >
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: isCompleted
            ? 'rgba(251, 191, 36, 0.18)'
            : isActive
              ? `linear-gradient(135deg, ${accent}55, ${nebula?.to || '#0d9488'}55)`
              : 'rgba(255, 255, 255, 0.06)',
          border: `2px solid ${stateColor}`,
          boxShadow: isActive ? `0 0 24px ${accent}99` : isCompleted ? `0 0 18px rgba(251,191,36,0.45)` : 'none',
        }}
      >
        {isCompleted ? (
          <Check size={20} className="text-amber-300" strokeWidth={3} />
        ) : isLocked ? (
          <Lock size={16} className="text-text-muted" />
        ) : isFree ? (
          <Play size={18} style={{ color: accent }} />
        ) : (
          <Play size={18} style={{ color: accent }} />
        )}

        {/* Active pulse ring */}
        {isActive && !reduced && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: `2px solid ${accent}`,
              animation: 'lesson-pulse 2.4s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Title + index */}
      <div className="text-center max-w-[140px]">
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className={`text-[11px] font-semibold line-clamp-2 ${isLocked ? 'text-text-muted' : 'text-text-primary'}`}>
          {lesson.title}
        </div>
      </div>

      <style>{`
        @keyframes lesson-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%      { transform: scale(1.18); opacity: 0.2; }
        }
      `}</style>
    </motion.button>
  );
};

export default LessonNode;
