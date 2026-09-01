/**
 * soul/editorial/Masthead.jsx
 *
 * The thin horizontal bar at the top of the peer home that establishes
 * the page as a magazine issue. Three pieces, separated by middle dots:
 *   MY ORBIT · ISSUE N · WEEK 36 · 2026
 *
 * The issue number is derived from the current ISO week so the page
 * reads as "this week's issue" without any persistence. The week number
 * is canonical and changes every Monday, which gives the masthead a
 * weekly rhythm without a server round-trip.
 */

// ISO week (1–53). Source: stackoverflow canonical algorithm.
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
}

export default function Masthead() {
  const now = new Date();
  const week = isoWeek(now);
  const year = now.getFullYear();

  return (
    <div
      className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      role="banner"
    >
      <span
        className="font-display font-bold tracking-[0.18em] uppercase"
        style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}
      >
        My Orbit
      </span>
      <span
        className="font-mono uppercase tracking-[0.22em] hidden sm:inline"
        style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}
      >
        Issue {week} · Week {week} · {year}
      </span>
      <span
        className="font-mono uppercase tracking-[0.22em]"
        style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}
      >
        Edited by you
      </span>
    </div>
  );
}
