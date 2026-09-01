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
  const { nebula } = useSoul();
  const accentFrom = nebula?.from || '#22d3ee';
  const accentTo   = nebula?.to   || '#0d9488';
  const safeEvents = Array.isArray(events) ? events : [];
  const stats = useMemo(() => computeStats(safeEvents, skillsCount), [safeEvents, skillsCount]);

  // Four cells in a row, identical shape. XP is the signature — it
  // gets the gradient + glow; the other three are clean mono numerals.
  const cells = [
    { key: 'swaps',   label: 'Swaps',          sub: 'this week',  value: stats.swaps   },
    { key: 'lessons', label: 'Lessons',        sub: 'this week',  value: stats.lessons },
    { key: 'skills',  label: 'Skills carried', sub: 'lifetime',   value: stats.skills  },
    { key: 'xp',      label: 'XP',             sub: 'this week',  value: stats.xp,     isXP: true },
  ];

  // The label gradient: soul-tinted (peer = cyan→teal, mentor =
  // violet→blue, student = amber→rose). The same gradient is reused
  // for the XP number text-fill so the section reads as one motif.
  const labelGradient = `linear-gradient(135deg, ${accentFrom}, ${accentTo})`;

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
              {/* The number — XP is Playfair italic + gradient + glow;
                  the other three are clean mono numerals. The XP
                  gradient is the same soul gradient as the labels. */}
              <div
                style={
                  c.isXP
                    ? {
                        fontFamily: 'var(--font-editorial)',
                        fontWeight: 800,
                        fontStyle: 'italic',
                        lineHeight: 0.9,
                        letterSpacing: '-0.03em',
                        fontSize: 'clamp(2.6rem, 5.2vw, 4.2rem)',
                        background: labelGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: `0 0 28px ${accentFrom}55, 0 0 10px ${accentTo}40`,
                        marginBottom: 6,
                      }
                    : {
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        lineHeight: 1,
                        fontSize: 'clamp(1.9rem, 3.4vw, 2.6rem)',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        marginBottom: 8,
                      }
                }
              >
                {c.value.toLocaleString()}
              </div>

              {/* Label — every label wears the soul gradient (uppercase,
                  mono, tracking). The XP label and the XP number share
                  the same gradient, so the cell reads as a unit.
                  No sub-label ("this week" / "lifetime") — the user
                  said drop them. */}
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  fontWeight: 700,
                  background: labelGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
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
