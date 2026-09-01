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
import { useAuthStore } from '../../store/authStore';
import { useSoul } from '../../hooks/useSoul';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Late,';
  if (h < 12) return 'Morning,';
  if (h < 17) return 'Afternoon,';
  if (h < 22) return 'Evening,';
  return 'Still up,';
};

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
  if (recent.length === 0) return 'Nothing in the can yet. Today is the first page.';

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
  if (helped)  extras.push(`${helped} reply${helped === 1 ? '' : 'ies'}`);
  const line2 = extras.length === 0
    ? 'A quiet week, kept simple.'
    : `${extras.slice(0, 2).join(', ')}${extras.length > 2 ? ', and a thread still open.' : '.'}`;

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
      className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 pt-6 pb-8"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* LEFT — typographic statement */}
      <div className="md:col-span-7 min-w-0">
        <p
          className="font-mono uppercase tracking-[0.28em]"
          style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
        >
          <span style={{ color: accent }}>I.</span> The week that was.
        </p>
        <h1
          className="font-display font-bold leading-[0.96] tracking-[-0.03em] mt-3"
          style={{
            fontSize: 'clamp(2.4rem, 5.6vw, 4.4rem)',
            color: 'var(--text-primary)',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{greeting()} </span>
          {firstName}.
        </h1>
        <div className="mt-5 max-w-[44ch] space-y-2">
          {ledeLines.map((line, i) => (
            <p
              key={i}
              className="leading-[1.55]"
              style={{
                fontSize: i === 0 ? '0.98rem' : '0.9rem',
                color: i === 0 ? 'rgba(255,255,255,0.88)' : 'rgba(245,245,245,0.66)',
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* RIGHT — featured number */}
      <div className="md:col-span-5 md:pl-8 md:border-l md:border-white/5 flex flex-col justify-end">
        <p
          className="font-mono uppercase tracking-[0.28em]"
          style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
        >
          The number
        </p>
        <div
          className="font-display font-black leading-[0.9] tracking-[-0.04em] mt-3"
          style={{
            fontSize: 'clamp(4rem, 9vw, 6.4rem)',
            background: `linear-gradient(135deg, ${accent}, ${accentTo})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {xp.toLocaleString()}
        </div>
        <p
          className="font-mono uppercase tracking-[0.22em] mt-2"
          style={{ fontSize: '0.7rem', color: 'rgba(245,245,245,0.66)' }}
        >
          XP earned this week
        </p>
      </div>
    </section>
  );
}
