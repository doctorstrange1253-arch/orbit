import { motion } from 'framer-motion';
import { courseShape, ROMAN } from './stages';

const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.08)';
const MUTED = 'rgba(245,245,245,0.55)';

const MONO_MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.20em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

export function StageRail({ course, completedLessonIds, compact = false, onSelectStage }) {
  const shape = courseShape(course, completedLessonIds);
  if (shape.stageCount === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" aria-label={`${shape.clearedCount} of ${shape.stageCount} stages cleared`}>
        {shape.stages.map((s) => (
          <span
            key={s.number}
            title={`${s.name} — ${s.pct}%`}
            style={{
              width: 18,
              height: 3,
              background: s.isCleared
                ? s.glow
                : s.isCurrent
                  ? `linear-gradient(90deg, ${s.glow} ${s.pct}%, rgba(255,255,255,0.10) ${s.pct}%)`
                  : 'rgba(255,255,255,0.10)',
              boxShadow: s.isCleared ? `0 0 6px ${s.glow}66` : 'none',
            }}
          />
        ))}
        <span style={{ ...MONO_MICRO, color: MUTED, marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
          {shape.clearedCount}/{shape.stageCount}
        </span>
      </div>
    );
  }

  return (
    <div style={{ border: `1px solid ${HAIRLINE}` }}>
      <div
        className="flex items-baseline justify-between gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}
      >
        <span style={{ ...MONO_MICRO, color: MUTED }}>
          {shape.stageCount} stage{shape.stageCount === 1 ? '' : 's'} · {shape.videoCount} video{shape.videoCount === 1 ? '' : 's'}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.92rem',
            color: MUTED,
          }}
        >
          {shape.scaleLabel}
        </span>
      </div>

      <div className={`grid`} style={{ gridTemplateColumns: `repeat(${Math.min(shape.stageCount, 3)}, minmax(0, 1fr))` }}>
        {shape.stages.map((s, i) => {
          const clickable = typeof onSelectStage === 'function' && s.isUnlocked;
          return (
            <div
              key={s.number}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => onSelectStage(s) : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onSelectStage(s); } : undefined}
              className="px-4 py-4"
              style={{
                borderRight: (i + 1) % Math.min(shape.stageCount, 3) === 0 ? 'none' : `1px solid ${HAIRLINE_SOFT}`,
                borderTop: i >= Math.min(shape.stageCount, 3) ? `1px solid ${HAIRLINE_SOFT}` : 'none',
                opacity: s.isUnlocked ? 1 : 0.42,
                cursor: clickable ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  aria-hidden="true"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: s.isCleared ? s.glow : 'transparent',
                    border: `1px solid ${s.glow}`,
                    boxShadow: s.isCleared ? `0 0 8px ${s.glow}88` : 'none',
                    flexShrink: 0,
                  }}
                />
                <span style={{ ...MONO_MICRO, color: s.isCurrent ? 'var(--text-primary)' : MUTED }}>
                  {s.roman}
                </span>
                {s.isFinale && (
                  <span style={{ ...MONO_MICRO, color: s.glow, fontSize: '0.5rem' }}>Finale</span>
                )}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 700,
                  fontSize: '1.22rem',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: s.isCurrent ? 'var(--text-primary)' : 'rgba(245,245,245,0.78)',
                }}
              >
                {s.name}
              </div>

              <div className="mt-2.5" style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%', background: s.glow }}
                />
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                  {s.lessonsDone}/{s.lessonCount}
                </span>
                <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)', fontVariantNumeric: 'tabular-nums' }}>
                  +{s.xpReward} xp
                </span>
              </div>

              {s.isCurrent && (
                <p
                  className="mt-2.5"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    color: 'rgba(245,245,245,0.62)',
                  }}
                >
                  {s.blurb}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StageChip({ course, lessonId, completedLessonIds }) {
  const shape = courseShape(course, completedLessonIds);
  const stage = shape.stages.find((s) => s.lessonIds.includes(String(lessonId)));
  if (!stage) return null;
  const n = stage.lessonIds.indexOf(String(lessonId)) + 1;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: stage.glow,
          boxShadow: `0 0 6px ${stage.glow}aa`,
        }}
      />
      <span style={{ ...MONO_MICRO, color: stage.glow }}>
        {ROMAN[stage.index] || stage.number} · {stage.name}
      </span>
      <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
        {n}/{stage.lessonCount}
      </span>
    </span>
  );
}

export default StageRail;
