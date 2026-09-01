/**
 * soul/editorial/WeekStrip.jsx
 *
 * A 7-cell "day by day" strip for the current ISO week. Each cell
 * is a 3D flip card:
 *   - FRONT: the date number, a vertical activity bar, the "today"
 *     treatment (accent border + accent text) on the current cell.
 *   - BACK:  a compact diary page of that day's events (type + time,
 *     up to 3, with a "+N more" line if there's overflow).
 *
 * Click a cell to flip. The flip fires `SoulSound.pageFlip` (paper
 * rustle + low thump) and `Haptic.pageFlip` (a 12ms tick) so the
 * gesture has weight. Click again to flip back.
 *
 * The strip reads in two seconds: the front tells the user WHERE in
 * the week the activity lives (taller = busier); the back tells them
 * WHAT they did that day.
 */

import { useMemo, useState } from 'react';
import { useSoul } from '../../hooks/useSoul';
import { SoulSound } from '../soundLibrary';
import { Haptic } from '../haptics';

const startOfWeekMs = (d) => {
  const t = new Date(d);
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() - (day - 1));
  t.setUTCHours(0, 0, 0, 0);
  return t.getTime();
};

function bucketByDate(events = []) {
  const map = {};
  for (const e of events) {
    const t = e.createdAt ? new Date(e.createdAt).getTime() : 0;
    if (!t) continue;
    const key = new Date(t).toISOString().slice(0, 10);
    (map[key] ||= []).push(e);
  }
  return map;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES  = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_FULL   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Friendly labels for the back-face diary. Keep them short so three
// of them fit in a 120px cell.
const EVENT_LABELS = {
  peer_swap_completed: 'Trade',
  lesson_completed:    'Lesson',
  quiz_passed:         'Quiz',
  quiz_perfect:        'Quiz (perfect)',
  peer_help_posted:    'Help reply',
  session_completed:   'Session',
  streak_bonus:        'Streak',
};
const eventLabel = (e) => EVENT_LABELS[e.event] || e.event || 'Event';

const formatTime = (iso) => {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const am = h < 12;
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m} ${am ? 'AM' : 'PM'}`;
};

const formatDayHeading = (date) => {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return `${DAY_FULL[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]} ${d.getUTCDate()}`;
};

export default function WeekStrip({ events = [] }) {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const accentTo = nebula?.to || '#0d9488';

  // Set of date keys (YYYY-MM-DD) that are currently flipped to the
  // back face. Click a cell to add/remove from the set.
  const [flipped, setFlipped] = useState(() => new Set());

  const { cells, caption, totalThisWeek } = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    const byDate = bucketByDate(safeEvents);
    const thisWeekStart = startOfWeekMs(new Date());

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const cells = [];
    for (let d = 0; d < 7; d += 1) {
      const day = new Date(thisWeekStart + d * 86400000);
      const key = day.toISOString().slice(0, 10);
      const dayEvents = (byDate[key] || []).slice().sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      cells.push({
        date: key,
        events: dayEvents,
        count: dayEvents.length,
        dayNum: day.getUTCDate(),
        label: DAY_LABELS[d],
        heading: DAY_NAMES[d],
        isToday: key === todayKey,
        isFuture: day.getTime() > today.getTime(),
      });
    }

    const total = cells.reduce((s, c) => s + c.count, 0);

    let cap;
    if (total === 0) {
      cap = 'A quiet week. Today is the first day.';
    } else {
      const busiest = cells.reduce((acc, c, i) => c.count > cells[acc].count ? i : acc, 0);
      const todayIdx = cells.findIndex((c) => c.isToday);
      if (busiest === todayIdx) {
        cap = `Today is your busiest day so far.`;
      } else {
        cap = `Your busiest day this week was ${DAY_FULL[busiest]}.`;
      }
    }
    return { cells, caption: cap, totalThisWeek: total };
  }, [events]);

  const handleFlip = (key) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    SoulSound.pageFlip();
    Haptic.pageFlip();
  };

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
          {totalThisWeek} {totalThisWeek === 1 ? 'event logged' : 'events logged'} this week
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {cells.map((c) => {
          const isFlipped = flipped.has(c.date);
          const visibleEvents = c.events.slice(0, 3);
          const overflow = Math.max(0, c.events.length - 3);
          return (
            <div
              key={c.date}
              className="flex flex-col items-stretch"
            >
              {/* The 3D flip card. Outer is the perspective frame; the
                  inner rotates 0° / 180° to swap front ↔ back. */}
              <div
                className="relative"
                style={{ perspective: 600, maxWidth: 130, margin: '0 auto', width: '100%' }}
              >
                <button
                  type="button"
                  onClick={() => handleFlip(c.date)}
                  aria-pressed={isFlipped}
                  aria-label={
                    isFlipped
                      ? `Hide ${formatDayHeading(c.date)}'s events`
                      : `Show ${formatDayHeading(c.date)}'s events`
                  }
                  className="block w-full focus:outline-none"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    aspectRatio: '1 / 1.05',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 620ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    // Disable pointer events on the inner faces during
                    // the flip so the click can't double-fire.
                    pointerEvents: isFlipped ? 'auto' : 'auto',
                  }}
                >
                  {/* ─── FRONT ─── */}
                  <span
                    aria-hidden={isFlipped}
                    style={{
                      position: 'absolute', inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: c.isToday
                        ? `linear-gradient(180deg, ${accent}1F 0%, ${accent}06 100%)`
                        : 'rgba(255,255,255,0.03)',
                      border: c.isToday
                        ? `1.5px solid ${accent}`
                        : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: c.isToday
                        ? `0 4px 14px -6px ${accent}80`
                        : '0 2px 8px -4px rgba(0,0,0,0.4)',
                      transition: 'box-shadow 240ms, border-color 240ms',
                    }}
                  >
                    {/* 4px top color block (the editorial "rule") */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${accent}, ${accentTo})`,
                      }}
                    />
                    {/* Day-label eyebrow */}
                    <span
                      className="font-mono uppercase tracking-[0.18em]"
                      style={{
                        position: 'absolute',
                        top: 8, left: 8,
                        fontSize: '0.5rem',
                        color: c.isToday ? accent : 'rgba(245,245,245,0.55)',
                        fontWeight: c.isToday ? 700 : 500,
                      }}
                    >
                      {c.heading}
                    </span>
                    {/* Today dot indicator */}
                    {c.isToday && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          top: 6, right: 6,
                          width: 5, height: 5,
                          borderRadius: '50%',
                          background: accent,
                        }}
                      />
                    )}
                    {/* Date number — the headline */}
                    <span
                      className="font-display font-bold leading-none"
                      style={{
                        fontSize: 'clamp(1.4rem, 2vw, 1.85rem)',
                        color: c.isToday ? accent : c.isFuture ? 'rgba(245,245,245,0.35)' : 'rgba(245,245,245,0.9)',
                        marginTop: 14,
                      }}
                    >
                      {c.dayNum}
                    </span>
                    {/* Activity bar — fills from bottom up */}
                    {c.count > 0 && (
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: `${Math.min(100, c.count * 22 + 14)}%`,
                          minHeight: 8,
                          marginTop: 'auto',
                          background: `linear-gradient(180deg, ${accentTo}, ${accent})`,
                          opacity: 0.85,
                          transition: 'height 320ms ease-out',
                        }}
                      />
                    )}
                    {/* Tap-to-flip hint, visible on hover */}
                    <span
                      className="font-mono uppercase tracking-[0.18em] absolute"
                      style={{
                        bottom: 6,
                        left: 0, right: 0,
                        textAlign: 'center',
                        fontSize: '0.45rem',
                        color: 'rgba(245,245,245,0.32)',
                        opacity: c.count === 0 ? 0.5 : 0,
                      }}
                    >
                      tap to open
                    </span>
                  </span>

                  {/* ─── BACK ─── */}
                  <span
                    aria-hidden={!isFlipped}
                    style={{
                      position: 'absolute', inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 6px 6px',
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: c.isToday
                        ? `linear-gradient(180deg, ${accent}14 0%, ${accent}04 100%)`
                        : 'rgba(255,255,255,0.025)',
                      border: c.isToday
                        ? `1.5px solid ${accent}`
                        : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Back-face heading: weekday + day number */}
                    <span
                      className="font-mono uppercase tracking-[0.18em] text-center"
                      style={{
                        fontSize: '0.5rem',
                        color: c.isToday ? accent : 'rgba(245,245,245,0.62)',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {c.heading} {c.dayNum}
                    </span>
                    {/* Events list (or "Quiet day.") */}
                    {visibleEvents.length === 0 ? (
                      <span
                        className="font-mono uppercase tracking-[0.16em] text-center flex-1 flex items-center justify-center"
                        style={{
                          fontSize: '0.5rem',
                          color: 'rgba(245,245,245,0.4)',
                          lineHeight: 1.25,
                        }}
                      >
                        Quiet day.
                      </span>
                    ) : (
                      <ul
                        className="flex-1 flex flex-col gap-[2px]"
                        style={{ listStyle: 'none', padding: 0, margin: 0 }}
                      >
                        {visibleEvents.map((ev, i) => (
                          <li
                            key={`${ev._id || i}-${ev.createdAt}`}
                            className="flex items-center gap-1"
                            style={{ minHeight: 12 }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 3, height: 3, borderRadius: '50%',
                                background: c.isToday ? accent : 'rgba(245,245,245,0.45)',
                                flexShrink: 0,
                              }}
                            />
                            <span
                              className="font-mono uppercase tracking-[0.12em] truncate"
                              style={{
                                fontSize: '0.48rem',
                                color: 'rgba(245,245,245,0.85)',
                                flex: 1,
                              }}
                              title={`${eventLabel(ev)} · ${formatTime(ev.createdAt)}`}
                            >
                              {eventLabel(ev)}
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: '0.45rem',
                                color: 'rgba(245,245,245,0.5)',
                                flexShrink: 0,
                              }}
                            >
                              {formatTime(ev.createdAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {overflow > 0 && (
                      <span
                        className="font-mono uppercase tracking-[0.16em] text-center"
                        style={{
                          fontSize: '0.46rem',
                          color: c.isToday ? accent : 'rgba(245,245,245,0.55)',
                          marginTop: 4,
                        }}
                      >
                        +{overflow} more
                      </span>
                    )}
                    {/* Close hint */}
                    <span
                      className="font-mono uppercase tracking-[0.18em] text-center"
                      style={{
                        fontSize: '0.42rem',
                        color: 'rgba(245,245,245,0.32)',
                        marginTop: 2,
                      }}
                    >
                      tap to close
                    </span>
                  </span>
                </button>
              </div>
              {/* Day label under the card (always visible) */}
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
