/**
 * soul/editorial/HeroBand.jsx
 *
 * The asymmetric cover of the issue. Left (7/12): a typographic
 * statement — the user's name as the anchor, with a 3-line varied-
 * cadence lede below that summarises the week. Right (5/12): a
 * single featured number in display type, with a mono caption.
 *
 * The lede is intentionally NOT three uniform declarative sentences
 * (that's a notification stack). It's a short statement, a medium
 * line with a clause, and a data-driven surprise. The surprise is
 * the most useful line — it tells the user something they didn't
 * know.
 *
 * No motion. No animation. The featured number does not count up.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useSoul } from '../../hooks/useSoul';
import FolioHeader from './FolioHeader';

// "Formal" salutation. The previous greeting was a single word with a
// trailing comma ('Evening,' / 'Morning,'); the user asked for a more
// formal tone. Each time-of-day now returns the full "Good ___,"
// phrase so the hero reads as a complete salutation, not a fragment.
const greeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night,';
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  if (h < 22) return 'Good evening,';
  return 'Good night,';
};

// Sequential word reveal — each token of the greeting fades in
// ~80ms after the previous, with a 4px upward drift that settles.
// Plays once on mount; no looping animation. The user wanted a
// "halki halki formal" (slight, formal) animation, not a flashy one.
const wordReveal = (i) => ({
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
});

const startOfWeekMs = () => {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
};

// Returns the day-of-week name with the most/least activity this
// week. Returns null if there are fewer than 3 events (not enough
// signal to call a surprise).
function dayExtremes(events = []) {
  const since = startOfWeekMs();
  const recent = events.filter((e) => new Date(e.createdAt).getTime() >= since);
  if (recent.length < 3) return null;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const e of recent) {
    const dow = new Date(e.createdAt).getDay();
    counts[dow] += 1;
  }
  let busiest = 0, quietest = Infinity;
  for (let i = 0; i < 7; i += 1) {
    if (counts[i] > counts[busiest]) busiest = i;
    if (counts[i] > 0 && counts[i] < counts[quietest]) quietest = i;
  }
  return { busiest: days[busiest], quietest: quietest < Infinity ? days[quietest] : null, total: recent.length };
}

// Three-line lede with varied cadence. Each line has a different
// rhythm: short statement, medium with a clause, data-driven surprise.
function buildLede(events = []) {
  const since = startOfWeekMs();
  const recent = events.filter((e) => new Date(e.createdAt).getTime() >= since);
  if (recent.length === 0) return 'Nothing yet this week. Today is the first day.';

  const swaps    = recent.filter((e) => e.event === 'peer_swap_completed').length;
  const lessons  = recent.filter((e) => e.event === 'lesson_completed').length;
  const quizzes  = recent.filter((e) => e.event === 'quiz_passed' || e.event === 'quiz_perfect').length;
  const helped   = recent.filter((e) => e.event === 'peer_help_posted').length;
  const sessions = recent.filter((e) => e.event === 'session_completed').length;

  // Line 1 — short statement of the dominant action.
  let line1;
  if (swaps > 0)      line1 = `${swaps} trade${swaps === 1 ? '' : 's'} this week.`;
  else if (lessons)   line1 = `${lessons} lesson${lessons === 1 ? '' : 's'} this week.`;
  else if (sessions)  line1 = `${sessions} session${sessions === 1 ? '' : 's'} this week.`;
  else                line1 = `${recent.length} small thing${recent.length === 1 ? '' : 's'} this week.`;

  // Line 2 — medium with a clause. The "kept" / "still open" framing
  // implies retention, not just completion.
  const extras = [];
  if (lessons) extras.push(`${lessons} kept`);
  if (quizzes) extras.push(`${quizzes} quizzed`);
  if (helped)  extras.push(`${helped} repl${helped === 1 ? 'y' : 'ies'}`);
  const line2 = extras.length === 0
    ? 'A quiet week, kept simple.'
    : `${extras.slice(0, 2).join(', ')}${extras.length > 2 ? ', and more in motion.' : '.'}`;

  // Line 3 — data-driven surprise. The day of the week with the most
  // (or least) activity. This is the line the user didn't expect.
  const extremes = dayExtremes(events);
  let line3;
  if (extremes && extremes.busiest && counts(swaps, lessons, quizzes, helped, sessions) >= 3) {
    line3 = `Your busiest day was ${extremes.busiest}.`;
  } else if (extremes && extremes.quietest && extremes.quietest !== extremes.busiest) {
    line3 = `Your quietest day was ${extremes.quietest}.`;
  } else {
    line3 = null; // No surprise available — caller drops the third line.
  }

  return [line1, line2, line3].filter(Boolean);
}

// Total event count for the day-extremes threshold.
const counts = (swaps, lessons, quizzes, helped, sessions) =>
  swaps + lessons + quizzes + helped + sessions;

function xpThisWeek(events = []) {
  const since = startOfWeekMs();
  return events
    .filter((e) => new Date(e.createdAt).getTime() >= since)
    .reduce((acc, e) => acc + (e.xpAwarded || 0), 0);
}

export default function HeroBand({ events = [] }) {
  // Hard defense: if a future refactor passes a non-array, render the
  // empty-state hero rather than crash on `events.filter`.
  const safeEvents = Array.isArray(events) ? events : [];

  const user = useAuthStore((s) => s.user);
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const accentTo = nebula?.to || '#0d9488';

  const firstName = (user?.name || 'you').split(' ')[0];
  const lede = useMemo(() => buildLede(safeEvents), [safeEvents]);
  const xp = useMemo(() => xpThisWeek(safeEvents), [safeEvents]);

  // Lede may be a string (empty case) or an array (varied-cadence).
  const ledeLines = Array.isArray(lede) ? lede : [lede];

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 pt-2 pb-10"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* LEFT — typographic statement */}
      <div className="md:col-span-7 min-w-0">
        <FolioHeader
          eyebrow="The lede"
          title="The week that was."
          accent={accent}
        />
        <h1
          className="mt-2"
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 700,
            fontStyle: 'normal',
            lineHeight: 0.96,
            letterSpacing: '-0.03em',
            fontSize: 'clamp(2.6rem, 5.8vw, 4.6rem)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Greeting — formal "Good evening," prefix, the user's
              first name, and an accent-tinted period. Each token
              fades in sequentially (~80ms apart) so the salutation
              appears as a deliberate reveal, not a flash. */}
          <motion.span
            {...wordReveal(0)}
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            {greeting().split(' ')[0]}
          </motion.span>{' '}
          <motion.span
            {...wordReveal(1)}
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            {greeting().split(' ')[1]}
          </motion.span>{' '}
          <motion.span {...wordReveal(2)} style={{ color: 'var(--text-primary)' }}>
            {firstName}
          </motion.span>
          <motion.span {...wordReveal(3)} style={{ color: accent, fontStyle: 'italic' }}>.</motion.span>
        </h1>
        <div className="mt-5 max-w-[44ch] space-y-2">
          {ledeLines.map((line, i) => (
            <p
              key={i}
              className="leading-[1.6]"
              style={{
                fontFamily: i === 0 ? 'var(--font-serif)' : 'var(--font-sans)',
                fontSize: i === 0 ? '1.15rem' : '0.94rem',
                color: i === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(245,245,245,0.7)',
                fontStyle: i === 0 ? 'italic' : 'normal',
                fontWeight: i === 0 ? 400 : 400,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* RIGHT — featured number, set like a poster credit. */}
      <div className="md:col-span-5 md:pl-10 md:border-l flex flex-col justify-end" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p
          className="font-mono uppercase"
          style={{
            fontSize: '0.66rem',
            letterSpacing: '0.32em',
            color: 'rgba(245,245,245,0.6)',
            fontWeight: 600,
          }}
        >
          Weekly XP
          <span
            className="ml-2"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '0.78rem',
              letterSpacing: '0.01em',
              color: 'rgba(245,245,245,0.45)',
              fontWeight: 400,
              textTransform: 'none',
            }}
          >
            earned so far
          </span>
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 800,
              fontStyle: 'italic',
              lineHeight: 0.86,
              letterSpacing: '-0.04em',
              fontSize: 'clamp(4.2rem, 9vw, 6.4rem)',
              background: `linear-gradient(135deg, ${accent}, ${accentTo})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
            }}
          >
            {xp.toLocaleString()}
          </span>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: '0.9rem',
              color: 'rgba(245,245,245,0.55)',
              fontWeight: 600,
              letterSpacing: '0.22em',
            }}
          >
            xp
          </span>
        </div>
        {/* A small italic tag-line under the big number, like a
            magazine cover credit. Anchors the number in time without
            repeating "this week" for the third time on the page. */}
        <p
          className="mt-2 italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.96rem',
            color: 'rgba(245,245,245,0.55)',
            fontWeight: 400,
          }}
        >
          {xp === 0
            ? 'A clean slate. The first point is the slowest; the rest come faster.'
            : xp < 50
              ? 'A modest haul. The week is young.'
              : xp < 200
                ? 'A working week. The kind that compounds.'
                : 'A heavy lift. The orbits are paying off.'}
        </p>
      </div>
    </section>
  );
}
