/**
 * soul/editorial/WeekStrip.jsx
 *
 * A 7-cell "day by day" strip for the current ISO week. Each cell
 * is a 3D flip card:
 *   - FRONT: a large date number, a vertical activity bar, and a
 *     subtle rotate-icon hint at the bottom corner. All cells wear
 *     a faint accent-tinted gradient so the row reads as a series
 *     of pages; today pops with the full accent.
 *   - BACK:  a compact diary page — heading (weekday + day number),
 *     up to 3 events with type + time, a "+N more" line if there's
 *     overflow, or a "Quiet day." note for an empty day.
 *
 * Click a cell to flip. The flip fires `SoulSound.pageFlip` (paper
 * rustle + low thump) and `Haptic.pageFlip` (a 12ms tick) so the
 * gesture has weight. Click again to flip back. The flip itself is
 * a quick 520ms cubic-bezier so the unreadable mid-rotation moment
 * is as short as possible.
 *
 * The strip reads in two seconds: the front tells the user WHERE in
 * the week the activity lives (taller bar = busier); the back tells
 * them WHAT they did that day.
 */

import { useMemo, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
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

// Friendly labels for the back-face diary. Kept short so three of
// them fit in a 130px cell without truncation.
const EVENT_LABELS = {
  peer_swap_completed: 'Trade',
  lesson_completed:    'Lesson',
  quiz_passed:         'Quiz',
  quiz_perfect:        'Quiz · perfect',
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
  return `${h}:${m}${am ? 'a' : 'p'}`;
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

          // Shared visual recipe so front and back look like the same page.
          // Today is the loudest version; the rest of the week is a quieter
          // echo of the same gradient.
          const cardBg = c.isToday
            ? `linear-gradient(170deg, ${accent}30 0%, ${accent}0A 100%)`
            : `linear-gradient(170deg, ${accent}12 0%, ${accent}04 100%)`;
          const cardBorder = c.isToday
            ? `2px solid ${accent}`
            : `1px solid ${accent}40`;
          const cardShadow = c.isToday
            ? `0 8px 22px -8px ${accent}80, inset 0 1px 0 ${accent}30`
            : `0 4px 12px -6px rgba(0,0,0,0.55), inset 0 1px 0 ${accent}18`;

          return (
            <div key={c.date} className="flex flex-col items-stretch">
              {/* The 3D flip card. Outer is the perspective frame; the
                  inner rotates 0° / 180° to swap front ↔ back. */}
              <div
                className="relative"
                style={{ perspective: 700, maxWidth: 140, margin: '0 auto', width: '100%' }}
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
                  className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    aspectRatio: '1 / 1.05',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 520ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                      alignItems: 'stretch',
                      justifyContent: 'flex-end',
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: cardBg,
                      border: cardBorder,
                      boxShadow: cardShadow,
                      transition: 'box-shadow 240ms, border-color 240ms',
                    }}
                  >
                    {/* 4px top accent rule (the editorial "header") */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${accent}, ${accentTo})`,
                      }}
                    />
                    {/* Day-label eyebrow (top-left) */}
                    <span
                      className="font-mono uppercase tracking-[0.2em]"
                      style={{
                        position: 'absolute',
                        top: 9, left: 9,
                        fontSize: '0.52rem',
                        color: c.isToday ? accent : `${accent}cc`,
                        fontWeight: 700,
                      }}
                    >
                      {c.heading}
                    </span>
                    {/* Today dot indicator (top-right) */}
                    {c.isToday && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          top: 9, right: 9,
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: accent,
                          boxShadow: `0 0 8px ${accent}`,
                        }}
                      />
                    )}
                    {/* The date number — the hero. Large, bold, bright. */}
                    <span
                      className="font-display font-extrabold leading-none text-center"
                      style={{
                        fontSize: 'clamp(2.4rem, 3.4vw, 3rem)',
                        color: c.isToday
                          ? accent
                          : c.isFuture
                            ? 'rgba(245,245,245,0.42)'
                            : 'rgba(255,255,255,0.96)',
                        marginTop: 22,
                        letterSpacing: '-0.03em',
                        textShadow: c.isToday
                          ? `0 0 24px ${accent}80`
                          : 'none',
                      }}
                    >
                      {c.dayNum}
                    </span>
                    {/* Activity bar — fills from bottom up. Even a count
                        of 1 gets a small bar so the user sees the day. */}
                    {c.count > 0 && (
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: `${Math.min(100, c.count * 22 + 14)}%`,
                          minHeight: 10,
                          marginTop: 'auto',
                          background: `linear-gradient(180deg, ${accentTo}, ${accent})`,
                          opacity: 0.9,
                          transition: 'height 320ms ease-out',
                        }}
                      />
                    )}
                    {/* Flip-hint icon (bottom-right). Subtle, but signals
                        "click to open" without taking a strip of text. */}
                    <span
                      aria-hidden="true"
                      className="absolute"
                      style={{
                        bottom: 5, right: 6,
                        color: c.isToday ? accent : `${accent}99`,
                        opacity: 0.85,
                      }}
                    >
                      <RotateCcw size={9} strokeWidth={2.4} />
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
                      padding: '8px 7px 7px',
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: cardBg,
                      border: cardBorder,
                      boxShadow: cardShadow,
                    }}
                  >
                    {/* 4px top accent rule — same as front, so the card
                        looks continuous when it flips. */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${accent}, ${accentTo})`,
                      }}
                    />
                    {/* Back-face heading: weekday + day number, with a
                        hairline beneath like a real diary heading. */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        paddingBottom: 3,
                        marginBottom: 5,
                        borderBottom: `1px solid ${c.isToday ? accent + '50' : 'rgba(255,255,255,0.10)'}`,
                      }}
                    >
                      <span
                        className="font-mono uppercase tracking-[0.18em]"
                        style={{
                          fontSize: '0.5rem',
                          color: c.isToday ? accent : 'rgba(245,245,245,0.78)',
                          fontWeight: 700,
                        }}
                      >
                        {c.heading}
                      </span>
                      <span
                        className="font-display font-extrabold leading-none"
                        style={{
                          fontSize: '0.95rem',
                          color: c.isToday ? accent : 'rgba(255,255,255,0.88)',
                        }}
                      >
                        {c.dayNum}
                      </span>
                    </div>
                    {/* Events list (or "Quiet day.") */}
                    {visibleEvents.length === 0 ? (
                      <span
                        className="font-display font-medium italic text-center flex-1 flex items-center justify-center"
                        style={{
                          fontSize: '0.7rem',
                          color: 'rgba(245,245,245,0.55)',
                          lineHeight: 1.2,
                        }}
                      >
                        Quiet day.
                      </span>
                    ) : (
                      <ul
                        className="flex-1 flex flex-col gap-[3px]"
                        style={{ listStyle: 'none', padding: 0, margin: 0 }}
                      >
                        {visibleEvents.map((ev, i) => (
                          <li
                            key={`${ev._id || i}-${ev.createdAt}`}
                            className="flex items-center gap-1.5"
                            style={{ minHeight: 14 }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 4, height: 4, borderRadius: '50%',
                                background: c.isToday ? accent : 'rgba(245,245,245,0.55)',
                                flexShrink: 0,
                                boxShadow: c.isToday ? `0 0 4px ${accent}` : 'none',
                              }}
                            />
                            <span
                              className="truncate"
                              style={{
                                fontSize: '0.6rem',
                                color: 'rgba(255,255,255,0.92)',
                                flex: 1,
                                fontWeight: 500,
                                letterSpacing: '0.005em',
                              }}
                              title={`${eventLabel(ev)} · ${formatTime(ev.createdAt)}`}
                            >
                              {eventLabel(ev)}
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: '0.52rem',
                                color: c.isToday ? accent : 'rgba(245,245,245,0.55)',
                                flexShrink: 0,
                                fontWeight: 600,
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
                          fontSize: '0.5rem',
                          color: c.isToday ? accent : 'rgba(245,245,245,0.7)',
                          marginTop: 5,
                          fontWeight: 600,
                        }}
                      >
                        +{overflow} more
                      </span>
                    )}
                    {/* Close icon (top-right of back) */}
                    <span
                      aria-hidden="true"
                      className="absolute"
                      style={{
                        top: 8, right: 8,
                        color: c.isToday ? accent : `${accent}99`,
                        opacity: 0.85,
                      }}
                    >
                      <X size={9} strokeWidth={2.4} />
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
