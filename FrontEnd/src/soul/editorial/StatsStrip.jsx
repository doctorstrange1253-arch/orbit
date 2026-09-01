/**
 * soul/editorial/StatsStrip.jsx
 *
 * "By the numbers" — the 4-cell strip on the MyOrbit issue.
 *
 * Every cell is identical in shape: a big Playfair Display italic
 * number on top, a clean mono-caps label below, separated from its
 * neighbors by a hairline. No soul gradient, no glow, no signature
 * cell — the user picked the "very magazine" treatment, where the
 * cell hairlines do the visual work. The soul tinting still lives
 * in the greeting and the section hairlines.
 *
 * Section header is gone (FolioHeader is a thin pt-4 spacer now);
 * the 4 cells are the first thing the eye lands on after the
 * hairline rule above.
 */

import { useMemo } from 'react';
import FolioHeader from './FolioHeader';

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
  const skillsTouched = new Set(
    recent
      .map((e) => e?.metadata?.skillId || e?.metadata?.skillOffered)
      .filter(Boolean)
  ).size;

  return { swaps, lessons, skills: skillsCount || skillsTouched, xp };
}

export default function StatsStrip({ events = [], skillsCount = 0 }) {
  const safeEvents = Array.isArray(events) ? events : [];
  const stats = useMemo(() => computeStats(safeEvents, skillsCount), [safeEvents, skillsCount]);

  // Four cells in a row, identical shape. Every number is set in
  // Playfair Display italic, clean white, no gradient, no glow.
  const cells = [
    { key: 'swaps',   label: 'Swaps',          value: stats.swaps   },
    { key: 'lessons', label: 'Lessons',        value: stats.lessons },
    { key: 'skills',  label: 'Skills carried', value: stats.skills  },
    { key: 'xp',      label: 'XP',             value: stats.xp      },
  ];

  return (
    <section className="pt-2 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <FolioHeader />

      <div
        className="mt-7 grid grid-cols-4 gap-0"
        role="list"
        aria-label="This week's stats"
      >
        {cells.map((c, i) => {
          const isLast = i === cells.length - 1;
          return (
            <div
              key={c.key}
              role="listitem"
              className="relative px-3 sm:px-5 md:px-7 py-3"
              style={{
                borderRight: isLast
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.10)',
              }}
            >
              {/* The number — uniform Playfair Display italic, clean
                  white, no gradient, no glow. The cell hairlines do
                  the visual work. */}
              <div
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  lineHeight: 0.9,
                  letterSpacing: '-0.03em',
                  fontSize: 'clamp(2.4rem, 4.6vw, 3.6rem)',
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}
              >
                {c.value.toLocaleString()}
              </div>

              {/* Label — clean mono uppercase, no soul gradient. */}
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  fontWeight: 700,
                  color: 'rgba(245,245,245,0.72)',
                }}
              >
                {c.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
