import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { courseShape } from './stages';

const VB_W = 340;
const NODE_GAP = 118;
const WEAVE = 96;
const TOP_PAD = 64;
const BOTTOM_PAD = 92;
const NODE_R = 17;
const FINALE_R = 22;

function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function nodePoints(count) {
  const cx = VB_W / 2;
  return Array.from({ length: count }, (_, i) => ({
    i,
    x: cx + WEAVE * Math.sin(i * (Math.PI / 3)),
    y: TOP_PAD + i * NODE_GAP,
  }));
}

function trajectory(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const k = (b.y - a.y) * 0.55;
    d += ` C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`;
  }
  return d;
}

const MONO = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
};

function Starfield({ height, reduced }) {
  const stars = useMemo(() => {
    const rows = Math.max(40, Math.round(height / 14));
    return Array.from({ length: rows }, (_, k) => {
      const a = seeded(k * 3 + 1);
      const b = seeded(k * 7 + 2);
      const c = seeded(k * 11 + 3);
      return {
        k,
        x: a * VB_W,
        y: b * height,
        r: 0.4 + c * 1.1,
        o: 0.14 + c * 0.5,
        dur: 3 + a * 5,
        delay: b * 4,
      };
    });
  }, [height]);

  return (
    <g aria-hidden="true">
      {stars.map((s) => (
        <circle key={s.k} cx={s.x} cy={s.y} r={s.r} fill="#f5f5f5" opacity={s.o}>
          {!reduced && (
            <animate
              attributeName="opacity"
              values={`${s.o};${s.o * 0.25};${s.o}`}
              dur={`${s.dur}s`}
              begin={`${s.delay}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}
    </g>
  );
}

const PLANET_KINDS = [
  { fill: '#7c83ff', ring: false, band: 'rgba(255,255,255,0.10)' },
  { fill: '#f59e0b', ring: true,  band: 'rgba(0,0,0,0.16)' },
  { fill: '#5eead4', ring: false, band: 'rgba(255,255,255,0.08)' },
  { fill: '#fb7185', ring: false, band: 'rgba(0,0,0,0.14)' },
  { fill: '#a78bfa', ring: true,  band: 'rgba(255,255,255,0.09)' },
];

function Planets({ height, reduced }) {
  const bodies = useMemo(() => {
    const n = Math.max(2, Math.min(7, Math.round(height / 520)));
    return Array.from({ length: n }, (_, k) => {
      const a = seeded(k * 17 + 5);
      const b = seeded(k * 23 + 6);
      const kind = PLANET_KINDS[k % PLANET_KINDS.length];
      const r = 16 + a * 26;
      return {
        k,
        kind,
        r,
        x: a > 0.5 ? VB_W - r - 6 - b * 22 : r + 6 + b * 22,
        y: TOP_PAD + 140 + (k * height) / Math.max(1, n) + b * 90,
        drift: 5 + b * 5,
        dur: 26 + a * 22,
      };
    });
  }, [height]);

  return (
    <g aria-hidden="true">
      {bodies.map((p) => (
        <g key={p.k} opacity="0.4">
          {!reduced && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 0; 0 ${p.drift}; 0 0`}
              dur={`${p.dur}s`}
              repeatCount="indefinite"
            />
          )}
          <circle cx={p.x} cy={p.y} r={p.r + 7} fill={p.kind.fill} opacity="0.07" />
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.kind.fill} opacity="0.30" />
          <path
            d={`M ${p.x - p.r} ${p.y - p.r * 0.28} A ${p.r} ${p.r} 0 0 0 ${p.x + p.r} ${p.y - p.r * 0.28}`}
            fill="none"
            stroke={p.kind.band}
            strokeWidth="1.4"
          />
          {p.kind.ring && (
            <ellipse
              cx={p.x}
              cy={p.y}
              rx={p.r * 1.75}
              ry={p.r * 0.42}
              fill="none"
              stroke={p.kind.fill}
              strokeOpacity="0.42"
              strokeWidth="1.1"
              transform={`rotate(-16 ${p.x} ${p.y})`}
            />
          )}
        </g>
      ))}
    </g>
  );
}

function Shuttle({ glow }) {
  return (
    <g>
      <ellipse cx="0" cy="13" rx="5.5" ry="12" fill={glow} opacity="0.22" />
      <ellipse cx="0" cy="9" rx="3" ry="8" fill={glow} opacity="0.5" />
      <path
        d="M 0 -13 C 5.2 -5.5, 5.6 4, 3.4 9 L -3.4 9 C -5.6 4, -5.2 -5.5, 0 -13 Z"
        fill="#0b0d16"
        stroke="#f5f5f5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M -3.4 5 L -8.6 11 L -3.4 9 Z" fill="#0b0d16" stroke="#f5f5f5" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M 3.4 5 L 8.6 11 L 3.4 9 Z" fill="#0b0d16" stroke="#f5f5f5" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="0" cy="-4.5" r="2.4" fill={glow} />
      <circle cx="0" cy="-4.5" r="2.4" fill="none" stroke="#f5f5f5" strokeWidth="0.9" />
    </g>
  );
}

function useShuttleTravel(pathRef, ratio, reduced) {
  const [pose, setPose] = useState(null);
  const fromRef = useRef(ratio);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return undefined;
    const total = el.getTotalLength();
    if (!total) return undefined;

    const readPose = (t) => {
      const at = Math.max(0, Math.min(1, t));
      const p = el.getPointAtLength(at * total);
      const ahead = el.getPointAtLength(Math.min(total, at * total + 1.5));
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI + 90;
      return { x: p.x, y: p.y, angle };
    };

    const from = fromRef.current;
    fromRef.current = ratio;

    if (reduced || Math.abs(ratio - from) < 0.0005) {
      setPose(readPose(ratio));
      return undefined;
    }

    const DURATION = 1100;
    let start = null;
    const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

    const step = (ts) => {
      if (start === null) start = ts;
      const u = Math.min(1, (ts - start) / DURATION);
      setPose(readPose(from + (ratio - from) * ease(u)));
      if (u < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pathRef, ratio, reduced]);

  return pose;
}

function Node({ point, lesson, stage, state, onPick, reduced }) {
  const r = stage.isFinale && state.isLast ? FINALE_R : NODE_R;
  const cleared = state.cleared;
  const current = state.current;
  const locked = !cleared && !current;

  return (
    <g
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={`Level ${state.number}: ${lesson.title}${locked ? ' (locked)' : ''}`}
      aria-disabled={locked}
      onClick={() => !locked && onPick?.(lesson, stage)}
      onKeyDown={(e) => { if (!locked && e.key === 'Enter') onPick?.(lesson, stage); }}
      style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
      opacity={locked ? 0.42 : 1}
    >
      {current && !reduced && (
        <circle cx={point.x} cy={point.y} r={r + 7} fill="none" stroke={stage.glow} strokeWidth="1">
          <animate attributeName="r" values={`${r + 5};${r + 13};${r + 5}`} dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0;0.55" dur="2.6s" repeatCount="indefinite" />
        </circle>
      )}
      {stage.isFinale && state.isLast && (
        <circle cx={point.x} cy={point.y} r={r + 5} fill="none" stroke={stage.glow} strokeOpacity="0.4" strokeWidth="1" />
      )}
      <circle
        cx={point.x}
        cy={point.y}
        r={r}
        fill={cleared ? stage.glow : '#0b0d16'}
        fillOpacity={cleared ? 0.9 : 0.88}
        stroke={stage.glow}
        strokeWidth={current ? 2 : 1.2}
        strokeOpacity={locked ? 0.45 : 1}
      />
      <text
        x={point.x}
        y={point.y + 4}
        textAnchor="middle"
        style={{ ...MONO, fontSize: 11 }}
        fill={cleared ? '#0b0d16' : '#f5f5f5'}
      >
        {String(state.number).padStart(2, '0')}
      </text>
      <text
        x={point.x}
        y={point.y + r + 15}
        textAnchor="middle"
        style={{ fontFamily: 'var(--font-serif)', fontSize: 12 }}
        fill="rgba(245,245,245,0.62)"
      >
        {lesson.title?.length > 22 ? `${lesson.title.slice(0, 21)}…` : lesson.title}
      </text>
    </g>
  );
}

export function TrajectoryPath({ course, completedLessonIds, onPick }) {
  const reduced = useReducedMotion();
  const pathRef = useRef(null);

  const shape = courseShape(course, completedLessonIds);
  const done = useMemo(() => new Set((completedLessonIds || []).map(String)), [completedLessonIds]);

  const rows = useMemo(() => {
    const out = [];
    for (const stage of shape.stages) {
      stage.lessonIds.forEach((lid, k) => {
        const lesson = (course?.lessons || []).find((l) => String(l._id) === lid) || { _id: lid, title: 'Lesson' };
        out.push({ lessonId: lid, lesson, stage, firstOfStage: k === 0 });
      });
    }
    return out.map((r, i) => ({ ...r, number: i + 1, isLast: i === out.length - 1 }));
  }, [shape.stages, course]);

  const firstOpen = rows.findIndex((r) => !done.has(r.lessonId));
  const currentIndex = firstOpen === -1 ? rows.length - 1 : firstOpen;
  const clearedCount = rows.filter((r) => done.has(r.lessonId)).length;

  const points = useMemo(() => nodePoints(rows.length), [rows.length]);
  const d = useMemo(() => trajectory(points), [points]);
  const height = TOP_PAD + Math.max(0, rows.length - 1) * NODE_GAP + BOTTOM_PAD;

  const shuttleAt = rows.length <= 1 ? 0 : Math.min(clearedCount, rows.length - 1) / (rows.length - 1);
  const pose = useShuttleTravel(pathRef, shuttleAt, reduced);
  const travelled = rows.length <= 1 ? 0 : clearedCount / (rows.length - 1);

  if (rows.length === 0) return null;

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.10)', overflow: 'hidden' }}>
      <div
        className="flex items-baseline justify-between gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span style={{ ...MONO, fontSize: '0.58rem', color: 'rgba(245,245,245,0.55)' }}>
          The trajectory · {clearedCount}/{rows.length} cleared
        </span>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', color: 'rgba(245,245,245,0.55)' }}>
          {shape.scaleLabel}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${height}`}
        width="100%"
        style={{ display: 'block', background: 'radial-gradient(ellipse at 50% 0%, rgba(124,131,255,0.10), rgba(6,8,16,0) 60%)' }}
        role="img"
        aria-label={`Course trajectory: ${clearedCount} of ${rows.length} levels cleared`}
      >
        <Starfield height={height} reduced={reduced} />
        <Planets height={height} reduced={reduced} />

        <path ref={pathRef} d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.4" strokeDasharray="3 6" />
        <motion.path
          d={d}
          fill="none"
          stroke="rgba(245,245,245,0.85)"
          strokeWidth="1.8"
          pathLength="1"
          strokeDasharray="1 1"
          initial={false}
          animate={{ strokeDashoffset: 1 - travelled }}
          transition={reduced ? { duration: 0 } : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />

        {rows.map((r, i) => (
          r.firstOfStage && i > 0 ? (
            <g key={`wp-${r.stage.number}`} aria-hidden="true">
              <line
                x1="14"
                x2={VB_W - 14}
                y1={points[i].y - NODE_GAP / 2}
                y2={points[i].y - NODE_GAP / 2}
                stroke={r.stage.glow}
                strokeOpacity="0.28"
                strokeWidth="1"
              />
              <text
                x="14"
                y={points[i].y - NODE_GAP / 2 - 8}
                style={{ ...MONO, fontSize: 9 }}
                fill={r.stage.glow}
                fillOpacity="0.85"
              >
                {r.stage.roman} · {r.stage.name}
              </text>
            </g>
          ) : null
        ))}

        {rows.map((r, i) => (
          <Node
            key={r.lessonId}
            point={points[i]}
            lesson={r.lesson}
            stage={r.stage}
            state={{
              number: r.number,
              cleared: done.has(r.lessonId),
              current: i === currentIndex,
              isLast: r.isLast,
            }}
            onPick={onPick}
            reduced={reduced}
          />
        ))}

        {pose && (
          <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle})`}>
            <Shuttle glow={rows[Math.min(currentIndex, rows.length - 1)].stage.glow} />
          </g>
        )}
      </svg>
    </div>
  );
}

export default TrajectoryPath;
