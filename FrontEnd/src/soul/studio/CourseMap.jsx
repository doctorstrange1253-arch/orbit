/**
 * soul/studio/CourseMap.jsx — The spatial Course Map.
 *
 * Renders a course's lessons as a vertical "path" with nodes connected
 * by a thin line. The path is divided into "valleys" (modules) with
 * "peaks" (the visual gap between modules). Each module boundary is
 * a soft horizontal break with the module's title.
 *
 * Lesson nodes render as <LessonNode>. Boss lessons (`isBoss: true`)
 * render as <BossNode>. The first lesson is the "active" one by
 * default; completed lessons (from the user's enrollment) render with
 * a check mark.
 *
 * Click a node → fires onPick(lesson). The parent decides whether to
 * trigger the Video Arrival (for normal lessons) or the Boss Ceremony
 * (for boss lessons) before navigating to the player.
 *
 * Reduced-motion: no path-draw animation; nodes appear immediately.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import LessonNode from './LessonNode';
import BossNode from './BossNode';
import { useSoul } from '../../hooks/useSoul';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Path stroke connecting two nodes — a thin vertical line.
const PathLine = ({ yStart, yEnd, x = '50%', completed }) => {
  const reduced = _isReducedMotion();
  const height = Math.max(2, yEnd - yStart);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: yStart,
        width: 2,
        height,
        transform: 'translateX(-50%)',
      }}
    >
      <motion.div
        initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 2,
          height: '100%',
          background: completed
            ? 'linear-gradient(180deg, #fbbf24 0%, rgba(251,191,36,0.4) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
          transformOrigin: 'top',
        }}
      />
    </div>
  );
};

// Module header — a soft horizontal break with the module title.
const ModuleHeader = ({ title, idx }) => (
  <div className="w-full flex items-center gap-3 py-3">
    <div className="flex-1 h-px bg-border-subtle/40" />
    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">
      Module {idx + 1}{title ? ` · ${title}` : ''}
    </div>
    <div className="flex-1 h-px bg-border-subtle/40" />
  </div>
);

/**
 * Group lessons into "modules" of N. If the course has explicit module
 * metadata on lessons (lesson.module), use that. Otherwise, just chunk
 * by 5 (a reasonable default that makes the path feel segmented).
 */
function _groupIntoModules(lessons = [], explicitModules = false) {
  if (explicitModules) {
    const groups = new Map();
    for (const l of lessons) {
      const key = l.module || 'default';
      if (!groups.has(key)) groups.set(key, { title: l.moduleTitle || l.module || 'Module', items: [] });
      groups.get(key).items.push(l);
    }
    return Array.from(groups.values());
  }
  const chunkSize = 5;
  const out = [];
  for (let i = 0; i < lessons.length; i += chunkSize) {
    out.push({ title: null, items: lessons.slice(i, i + chunkSize) });
  }
  return out;
}

const CourseMap = ({ course, completedLessonIds = [], activeLessonId, onPick }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const explicit = lessons.some((l) => l.module || l.moduleTitle);
  const modules = useMemo(() => _groupIntoModules(lessons, explicit), [lessons, explicit]);

  // Compute completion / active state.
  const isCompleted = (l) => completedLessonIds.includes(l._id || l.id);
  const isActive = (l) => (activeLessonId && activeLessonId === (l._id || l.id)) ||
    (!activeLessonId && !isCompleted(l) && lessons.findIndex((x) => x === l) === lessons.findIndex((x) => !isCompleted(x)));
  const isLocked = (l) => !l.isFree && false; // For V3-C MVP, locking logic is per-enrollment; default to unlocked.

  return (
    <div
      className="relative w-full"
      role="navigation"
      aria-label="Course map"
    >
      {/* Soft cosmic background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${nebula?.from || '#22d3ee'}10, transparent 60%)`,
        }}
      />

      <div className="flex flex-col items-center">
        {modules.map((mod, mIdx) => (
          <div key={mIdx} className="w-full flex flex-col items-center">
            {mIdx > 0 && <ModuleHeader title={mod.title} idx={mIdx} />}

            <div className="relative flex flex-col items-center gap-6 py-2">
              {mod.items.map((lesson, lIdx) => {
                const completed = isCompleted(lesson);
                const active = isActive(lesson);
                const locked = isLocked(lesson);
                const isBoss = !!lesson.isBoss;

                return (
                  <div key={lesson._id || lIdx} className="relative flex flex-col items-center">
                    {lIdx > 0 && (
                      <PathLine
                        yStart={-28}
                        yEnd={4}
                        completed={isCompleted(mod.items[lIdx - 1])}
                      />
                    )}

                    {isBoss ? (
                      <BossNode
                        lesson={lesson}
                        isCompleted={completed}
                        isLocked={locked}
                        onPick={onPick}
                      />
                    ) : (
                      <LessonNode
                        lesson={lesson}
                        index={lessons.findIndex((x) => x === lesson)}
                        isCompleted={completed}
                        isActive={active}
                        isLocked={locked}
                        isFree={!!lesson.isFree}
                        onPick={onPick}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseMap;
