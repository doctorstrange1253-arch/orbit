/**
 * soul/editorial/StatsStrip.jsx
 *
 * "By the numbers" — section II of the MyOrbit issue.
 *
 * Magazine-style table, NOT a dashboard grid. Four rows, one stat per
 * row, dot leaders connecting label to value. Values are big serif
 * numerals (Playfair Display, the same family as the FolioHeader) so
 * the number is the design, not a chip.
 *
 *   Swaps · this week ............  12
 *   Lessons · this week ..........   3
 *   Skills carried · lifetime ....   8
 *   XP earned · this week ........ 480
 *
 *   A signature line beneath: a small italic epigraph, hand-set.
 *
 *   "Numbers don't tell the whole story. But they're the spine."
 *
 * The dot leaders are a CSS trick: the row is a flex container with
 * the value at the right edge and a `::before` pseudo-element on the
 * middle that fills with `radial-gradient(circle, ...)` dots. The
 * trick survives translation and zoom because the dots are a
 * background, not text.
 *
 * Computed from the same gameology history the HeroBand reads so the
 * "week that was" and "by the numbers" sections are guaranteed to
 * agree. Falls back to zero for any metric not present in the log.
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
  // Unique skills touched this week — from metadata.skillId or skillOffered.
  const skillsTouched = new Set(
    recent
      .map((e) => e?.metadata?.skillId || e?.metadata?.skillOffered)
      .filter(Boolean)
  ).size;

  return { swaps, lessons, skills: skillsCount || skillsTouched, xp };
}

// Hand-drawn-feel micro-icons drawn with inline SVG. They feel like
// marginalia on a printed page rather than icon-set buttons. Kept
// mono-color so they read as ink, not UI.
const Mark = {
  Swap: (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M2 5h9M9 3l2 2-2 2" />
      <path d="M12 9H3M5 7l-2 2 2 2" />
    </svg>
  ),
  Lesson: (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3.5h7l3 3v4H2z" />
      <path d="M9 3.5V6.5h3" />
    </svg>
  ),
  Skills: (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M7 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.8l-3.2 1.6.6-3.6L1.8 5.3l3.6-.5z" />
    </svg>
  ),
  XP: (color) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 1l1.7 4.4L13 6l-3.6 3 .9 4.5L7 11.5 3.7 13.5l.9-4.5L1 6l4.3-.6z" />
    </svg>
  ),
};

export default function StatsStrip({ events = [], skillsCount = 0 }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  // Hard defense: never iterate over a non-array.
  const safeEvents = Array.isArray(events) ? events : [];
  const stats = useMemo(() => computeStats(safeEvents, skillsCount), [safeEvents, skillsCount]);

  // Four rows, varied. The "Skills carried" row uses lifetime count
  // (skillsCount), the others use this-week values. The label on the
  // left ends with a thin separator dot so the eye knows where the
  // eyebrow ends and the label begins.
  const rows = [
    { Mark: Mark.Swap,   label: 'Swaps',          sub: 'this week',     value: stats.swaps,  highlight: false },
    { Mark: Mark.Lesson, label: 'Lessons',        sub: 'this week',     value: stats.lessons, highlight: false },
    { Mark: Mark.Skills, label: 'Skills carried', sub: 'lifetime',      value: stats.skills, highlight: false },
    { Mark: Mark.XP,     label: 'XP earned',      sub: 'this week',     value: stats.xp,     highlight: true  },
  ];

  return (
    <section className="pt-2 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <FolioHeader
        folio="II"
        eyebrow="Section two · the ledger"
        title="By the numbers, this week."
        note="What you did. No spin, no streaks to maintain, no one watching — just the math of a week lived."
        accent={accent}
      />

      <div className="mt-8 max-w-[640px]">
        {rows.map(({ Mark: Icon, label, sub, value, highlight }) => (
          <div
            key={label}
            className="group flex items-baseline gap-3 py-3"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* The mark — small inline icon, accent-tinted */}
            <span
              className="flex-shrink-0 self-center"
              style={{ opacity: highlight ? 1 : 0.78 }}
            >
              {Icon(highlight ? accent : 'rgba(245,245,245,0.55)')}
            </span>

            {/* Label cluster — Cormorant serif label + small mono sub */}
            <div className="flex-shrink-0 min-w-[140px] md:min-w-[200px]">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.32rem',
                  lineHeight: 1,
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}
              >
                {label}
              </span>
              <span
                className="ml-2 font-mono uppercase"
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.22em',
                  color: 'rgba(245,245,245,0.5)',
                  fontWeight: 500,
                }}
              >
                · {sub}
              </span>
            </div>

            {/* The dot leaders — fills the gap between label and value */}
            <span
              aria-hidden
              className="flex-1 self-center"
              style={{
                height: 1,
                background: `radial-gradient(circle, ${highlight ? accent : 'rgba(255,255,255,0.22)'} 1px, transparent 1.5px) 0 0 / 6px 1px repeat-x`,
                transform: 'translateY(2px)',
              }}
            />

            {/* The value — Playfair Display italic so it reads as a
                pulled quote, not a stat. Highlighted (XP) gets the
                accent gradient. */}
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: highlight ? 'clamp(2.4rem, 4.4vw, 3.2rem)' : 'clamp(2rem, 3.4vw, 2.4rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                color: highlight ? accent : 'var(--text-primary)',
                flexShrink: 0,
                minWidth: '4ch',
                textAlign: 'right',
                textShadow: highlight ? `0 0 24px ${accent}55` : 'none',
              }}
            >
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Hand-set italic epigraph */}
      <p
        className="mt-7 italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.05rem',
          lineHeight: 1.5,
          color: 'rgba(245,245,245,0.55)',
          maxWidth: '52ch',
          fontWeight: 400,
        }}
      >
        <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', lineHeight: 0, verticalAlign: '-0.2em', marginRight: 6 }}>&ldquo;</span>
        Numbers don&rsquo;t tell the whole story. But they&rsquo;re the spine.
        <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', lineHeight: 0, verticalAlign: '-0.2em', marginLeft: 4 }}>&rdquo;</span>
      </p>
    </section>
  );
}
