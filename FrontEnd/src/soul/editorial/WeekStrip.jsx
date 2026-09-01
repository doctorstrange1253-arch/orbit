/**
 * soul/editorial/WeekStrip.jsx
 *
 * A 7-cell "day by day" strip for the current ISO week. Each cell
 * is a small "plaque": the date number, a vertical activity bar
 * that scales with the day's event count, and a "today" treatment
 * (accent border + accent text) on the current cell.
 *
 * The strip reads in two seconds and carries real meaning: where
 * in the week did the user actually work? The activity bar is the
 * payload — taller = busier day.
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

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeekStrip({ events = [] }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const accentTo = nebula?.to || '#0d9488';

  const { cells, caption } = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    const counts = bucketByDate(safeEvents);
    const thisWeekStart = startOfWeekMs(new Date());

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const cells = [];
    let maxCount = 1;
    for (let d = 0; d < 7; d += 1) {
      const day = new Date(thisWeekStart + d * 86400000);
      const key = day.toISOString().slice(0, 10);
      const c = counts[key] || 0;
      if (c > maxCount) maxCount = c;
      cells.push({
        date: key,
        count: c,
        dayNum: day.getUTCDate(),
        label: DAY_LABELS[d],
        isToday: key === todayKey,
        isFuture: day.getTime() > today.getTime(),
      });
    }

    const total = cells.reduce((s, c) => s + c.count, 0);

    // Caption: the busiest day, or "A quiet week" if there's none.
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let cap;
    if (total === 0) {
      cap = 'A quiet week. Today is the first day.';
    } else {
      const busiest = cells.reduce((acc, c, i) => c.count > cells[acc].count ? i : acc, 0);
      const todayIdx = cells.findIndex((c) => c.isToday);
      if (busiest === todayIdx) {
        cap = `Today is your busiest day so far.`;
      } else {
        cap = `Your busiest day this week was ${dayNames[busiest]}.`;
      }
    }
    return { cells, caption: cap };
  }, [events]);

  return (
    <section className="py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-baseline justify-between mb-5">
        <p
          className="font-mono uppercase tracking-[0.28em]"
          style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
        >
          <span style={{ color: accent }}>III.</span> Day by day.
        </p>
        <p
          className="font-mono uppercase tracking-[0.22em]"
          style={{ fontSize: '0.66rem', color: 'rgba(245,245,245,0.66)' }}
        >
          {cells.reduce((s, c) => s + c.count, 0)} this week
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {cells.map((c) => {
          // Bar height: scales 0% (no activity) → 100% (max activity).
          // Even a count of 1 gets a small bar so the user sees "something happened."
          const barPct = c.count === 0 ? 0 : Math.max(12, Math.round((c.count / Math.max(1, c.count === 0 ? 1 : c.count)) * 100));
          const showFullBar = c.count > 0;
          return (
            <div
              key={c.date}
              className="flex flex-col items-stretch"
              title={`${c.date} · ${c.count} event${c.count === 1 ? '' : 's'}`}
            >
              {/* The plaque: date + bar */}
              <div
                className="relative flex flex-col items-center justify-end overflow-hidden"
                style={{
                  aspectRatio: '1 / 1.3',
                  maxWidth: 56,
                  margin: '0 auto',
                  width: '100%',
                  borderRadius: 3,
                  background: c.isToday
                    ? `linear-gradient(180deg, ${accent}1A 0%, ${accent}05 100%)`
                    : 'rgba(255,255,255,0.03)',
                  border: c.isToday
                    ? `1.5px solid ${accent}`
                    : '1px solid rgba(255,255,255,0.07)',
                  transition: 'background 240ms, border-color 240ms',
                }}
              >
                {/* Date number */}
                <span
                  className="font-display font-bold leading-none pt-2"
                  style={{
                    fontSize: 'clamp(1.05rem, 1.4vw, 1.3rem)',
                    color: c.isToday ? accent : c.isFuture ? 'rgba(245,245,245,0.3)' : 'rgba(245,245,245,0.85)',
                  }}
                >
                  {c.dayNum}
                </span>
                {/* Activity bar — fills from bottom up */}
                {showFullBar && (
                  <div
                    className="mt-auto mb-0"
                    style={{
                      width: '100%',
                      height: `${Math.min(100, c.count * 18 + 10)}%`,
                      minHeight: 6,
                      background: `linear-gradient(180deg, ${accentTo}, ${accent})`,
                      opacity: 0.85,
                      transition: 'height 320ms ease-out',
                    }}
                  />
                )}
                {/* Today dot indicator */}
                {c.isToday && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: accent,
                    }}
                  />
                )}
              </div>
              {/* Day label */}
              <span
                className="font-mono uppercase tracking-[0.18em] text-center mt-2"
                style={{
                  fontSize: '0.58rem',
                  color: c.isToday ? accent : 'rgba(245,245,245,0.55)',
                  fontWeight: c.isToday ? 700 : 500,
                }}
              >
                {c.label}
              </span>
            </div>
          );
        })}
      </div>

      <p
        className="mt-5 leading-[1.5]"
        style={{ fontSize: '0.88rem', color: 'rgba(245,245,245,0.72)' }}
      >
        {caption}
      </p>
    </section>
  );
}
