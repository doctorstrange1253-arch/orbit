/**
 * soul/editorial/StatsStrip.jsx
 *
 * Four big numbers in a horizontal row, separated by hairline dividers.
 * Each number is in display type; each caption is in mono uppercase.
 * No boxes, no chips, no colored backgrounds — the type is the design.
 *
 * Computed from the gameology history (last 500 events covers a full
 * quarter comfortably). Falls back to zero for any metric that's not
 * present in the event log.
 */

import { useMemo } from 'react';
import { useSoul } from '../../hooks/useSoul';

const startOfWeekMs = () => {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

function computeStats(events = [], skillsCount = 0) {
  const since = startOfWeekMs();
  const recent = events.filter((e) => new Date(e.createdAt).getTime() >= since);

  const swaps    = recent.filter((e) => e.event === 'peer_swap_completed').length;
  const lessons  = recent.filter((e) => e.event === 'lesson_completed').length;
  const xp       = recent.reduce((acc, e) => acc + (e.xpAwarded || 0), 0);
  // Unique skills touched this week — from metadata.skillId or skillOffered.
  const skillsTouched = new Set(
    recent
      .map((e) => e?.metadata?.skillId || e?.metadata?.skillOffered)
      .filter(Boolean)
  ).size;

  return { swaps, lessons, skills: skillsCount || skillsTouched, xp };
}

export default function StatsStrip({ events = [], skillsCount = 0 }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  // Hard defense: never iterate over a non-array.
  const safeEvents = Array.isArray(events) ? events : [];
  const stats = useMemo(() => computeStats(safeEvents, skillsCount), [safeEvents, skillsCount]);

  // Four columns, identical structure. The dividers are a single 1px
  // border-left on columns 2–4 so they line up regardless of the
  // number's width.
  const cols = [
    { value: stats.swaps,   label: 'Swaps' },
    { value: stats.lessons, label: 'Lessons' },
    { value: stats.skills,  label: 'Skills carried' },
    { value: stats.xp,      label: 'XP earned' },
  ];

  return (
    <section className="py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <p
        className="font-mono uppercase tracking-[0.28em] mb-5"
        style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
      >
        <span style={{ color: accent }}>II.</span> This week, by the numbers.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6">
        {cols.map((c, i) => (
          <div
            key={c.label}
            className={i === 0 ? '' : 'md:pl-6 md:border-l md:border-white/5'}
          >
            <div
              className="font-display font-black leading-[0.92] tracking-[-0.04em]"
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                color: i === 3 ? accent : 'var(--text-primary)',
                transition: 'color 240ms',
              }}
            >
              {c.value.toLocaleString()}
            </div>
            <div
              className="font-mono uppercase tracking-[0.22em] mt-2"
              style={{ fontSize: '0.66rem', color: 'rgba(245,245,245,0.66)' }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
