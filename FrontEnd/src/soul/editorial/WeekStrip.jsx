/**
 * soul/editorial/WeekStrip.jsx
 *
 * A single-row, 7-cell "day by day" strip for the current ISO week.
 * Replaces the 12-week heatmap (a GitHub trope with no editorial
 * payload). The strip reads in two seconds and carries real
 * meaning: where in the week did the user actually work?
 *
 * Each cell is a 36px square; the cell is colored by activity
 * intensity (5-step gradient in the soul accent). Day labels
 * (Mon–Sun) sit beneath. Below the strip, a 1-line caption: the
 * day with the most activity, or "A quiet week" if there's none.
 */

import { useMemo } from 'react';
import { useSoul } from '../../hooks/useSoul';

const startOfWeekMs = (d) => {
  const t = new Date(d);
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() - (day - 1));
  t.setUTCHours(0, 0, 0, 0);
  return t.getTime();
};

function bucketByDate(events = []) {
  const counts = {};
  for (const e of events) {
    const t = e.createdAt ? new Date(e.createdAt).getTime() : 0;
    if (!t) continue;
    const key = new Date(t).toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function intensity(count) {
  if (count === 0) return 0;
  if (count <= 2)  return 1;
  if (count <= 5)  return 2;
  if (count <= 9)  return 3;
  return 4;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeekStrip({ events = [] }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';

  const { cells, caption } = useMemo(() => {
    const counts = bucketByDate(events);
    const thisWeekStart = startOfWeekMs(new Date());

    const cells = [];
    for (let d = 0; d < 7; d += 1) {
      const day = new Date(thisWeekStart + d * 86400000);
      const key = day.toISOString().slice(0, 10);
      const c = counts[key] || 0;
      cells.push({ date: key, count: c, level: intensity(c), label: DAY_LABELS[d] });
    }
    const total = cells.reduce((s, c) => s + c.count, 0);

    // Caption: the busiest day, or "A quiet week — find your first day."
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let cap;
    if (total === 0) {
      cap = 'A quiet week. Today is the first day.';
    } else {
      const busiest = cells.reduce((acc, c, i) => c.count > cells[acc].count ? i : acc, 0);
      const today = new Date().getDay(); // 0=Sun
      const todayIdx = today === 0 ? 6 : today - 1; // map to 0=Mon..6=Sun
      if (busiest === todayIdx) {
        cap = `Today is your busiest day so far.`;
      } else {
        cap = `Your busiest day this week was ${dayNames[busiest]}.`;
      }
    }
    return { cells, caption: cap };
  }, [events]);

  const fills = [
    'rgba(255,255,255,0.04)',
    `${accent}33`,
    `${accent}66`,
    `${accent}AA`,
    accent,
  ];

  return (
    <section className="py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-baseline justify-between mb-5">
        <p
          className="font-mono uppercase tracking-[0.28em]"
          style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}
        >
          III. Day by day.
        </p>
        <p
          className="font-mono uppercase tracking-[0.22em]"
          style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}
        >
          {cells.reduce((s, c) => s + c.count, 0)} this week
        </p>
      </div>

      <div className="flex items-end gap-3">
        {cells.map((c, i) => (
          <div key={c.date} className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div
              title={`${c.date} · ${c.count} event${c.count === 1 ? '' : 's'}`}
              style={{
                width: '100%',
                maxWidth: 44,
                aspectRatio: '1 / 1',
                borderRadius: 4,
                background: fills[c.level],
                border: c.level === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                transition: 'background 240ms ease-out',
              }}
            />
            <span
              className="font-mono uppercase tracking-[0.2em]"
              style={{
                fontSize: '0.58rem',
                color: 'var(--text-muted)',
              }}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-5 leading-[1.5]"
        style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
      >
        {caption}
      </p>
    </section>
  );
}
