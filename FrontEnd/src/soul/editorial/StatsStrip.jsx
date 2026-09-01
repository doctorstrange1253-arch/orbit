/**
 * soul/editorial/StatsStrip.jsx
 *
 * "By the numbers" — section II of the MyOrbit issue.
 *
 * The strip is a 4-column grid (the "0 0 1 0" layout the user liked):
 * each cell is a stat with a big number on top and a mono label below,
 * separated from its neighbors by a hairline. The XP cell is the
 * signature: bigger, Playfair italic, with a soul-tinted gradient and
 * a soft glow. The labels themselves carry the soul's nebula gradient
 * (Pulsar cyan→teal on peer, Aurora violet→blue on mentor, Solaris
 * amber→rose on student) so the strip reads as the active soul's
 * ledger, not a dashboard.
 *
 * Reverted from the magazine-table version: the user wanted the grid
 * back, with the polish applied ONLY to XP and to the labels.
 */

import { useMemo } from 'react';
import { useSoul } from '../../hooks/useSoul';
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
  // The user picked the "very magazine" treatment — quiet, uniform,
  // the cell hairlines do the visual work.
  const cells = [
    { key: 'swaps',   label: 'Swaps',          value: stats.swaps   },
    { key: 'lessons', label: 'Lessons',        value: stats.lessons },
    { key: 'skills',  label: 'Skills carried', value: stats.skills  },
    { key: 'xp',      label: 'XP',             value: stats.xp      },
  ];

  // The four cells no longer use the soul gradient — that was tied
  // to the XP-only signature, which the user dropped. Labels are
  // clean mono uppercase, soul tinting still lives in the greeting
  // and the section hairline.

  return (
    <section className="pt-2 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <FolioHeader
        eyebrow="The ledger"
        title="By the numbers."
        accent={accentFrom}
      />

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

              {/* Label — clean mono uppercase, no soul gradient. The
                  magazine feel comes from the typography, not the
                  tint. */}
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
