/**
 * soul/horizon/HorizonBar.jsx — The 60-minute activity timeline.
 *
 * One of the V3 "horizon" devices: the user's day as a cityscape of light.
 * 60 minutes laid out as 60 thin columns (one per minute). Active minutes
 * (those that contain at least one learning event) light up in the active
 * soul's Pulsar nebula color. Idle minutes stay dim. The CURRENT minute
 * column pulses so the user always knows where they are on the line.
 *
 * The data source is the user's recent gameology.history (last 60 events).
 * Each event is bucketed into a minute slot by its createdAt. The
 * component is read-only — it doesn't dispatch anything.
 *
 * Reduced-motion: the current-minute pulse is replaced by a static bright
 * column. No horizontal motion.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSoul } from '../../hooks/useSoul';

const MINUTES = 60;
const COLUMN_WIDTH_PX = 3;     // 60 * 3 = 180px bar width
const COLUMN_GAP_PX = 1;       // 60 * (3+1) = 240px incl. gaps

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * events: Array<{ createdAt: ISOString | Date, event: string, ... }>
 * now: a Date representing the user's "now" (defaults to current time).
 *      Passed in for testability.
 *
 * Returns a 60-length array of integers (0 = idle, 1+ = activity count).
 */
export function bucketEventsByMinute(events, now = new Date()) {
  const buckets = new Array(MINUTES).fill(0);
  if (!Array.isArray(events)) return buckets;
  const nowMs = now.getTime();
  const windowMs = MINUTES * 60 * 1000;
  for (const ev of events) {
    const t = ev?.createdAt ? new Date(ev.createdAt).getTime() : 0;
    if (!t) continue;
    const ageMs = nowMs - t;
    if (ageMs < 0 || ageMs > windowMs) continue;
    const minuteIdx = MINUTES - 1 - Math.floor(ageMs / 60000);
    if (minuteIdx >= 0 && minuteIdx < MINUTES) {
      buckets[minuteIdx] += 1;
    }
  }
  return buckets;
}

const HorizonBar = ({ events = [] }) => {
  const { soul, nebula } = useSoul();
  const reduced = _isReducedMotion();

  const { buckets, currentMinute, totalActive } = useMemo(() => {
    const b = bucketEventsByMinute(events);
    const now = new Date();
    const cur = now.getMinutes(); // 0-59; the current minute bucket
    const total = b.reduce((a, n) => a + (n > 0 ? 1 : 0), 0);
    return { buckets: b, currentMinute: cur, totalActive: total };
  }, [events]);

  const accent = nebula?.from || '#22d3ee';
  const accentDim = `${accent}30`;   // 30% alpha for idle columns
  const accentHot = `${accent}E6`;   // ~90% alpha for active

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">
            Your horizon — last 60 minutes
          </div>
          <div className="mt-1 text-sm text-text-secondary">
            {totalActive === 0
              ? 'A quiet hour. Make a swap or post a Q&A reply to light a column.'
              : `${totalActive} of 60 minutes lit`}
          </div>
        </div>
        <div className="text-[10px] font-mono text-text-muted">
          {String(currentMinute).padStart(2, '0')}:{String(new Date().getSeconds()).padStart(2, '0')}
        </div>
      </div>

      {/* The bar itself: 60 columns */}
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{
          height: 56,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
        }}
        role="img"
        aria-label={`Horizon bar: ${totalActive} of 60 minutes active`}
      >
        <div
          className="absolute inset-0 flex items-end"
          style={{
            gap: `${COLUMN_GAP_PX}px`,
            padding: '0 8px',
          }}
        >
          {buckets.map((count, i) => {
            const isActive = count > 0;
            // Scale the column height by the number of events in that minute.
            // 1 event = 35%, 5+ events = 100%. The visual reads as a skyline.
            const heightPct = isActive ? Math.min(100, 35 + count * 15) : 6;
            const isCurrent = i === MINUTES - 1;
            return (
              <motion.div
                key={i}
                className="rounded-sm"
                style={{
                  width: COLUMN_WIDTH_PX,
                  background: isActive ? accentHot : accentDim,
                  opacity: isActive ? 1 : 0.55,
                  boxShadow: isActive ? `0 0 8px ${accent}80` : 'none',
                  height: `${heightPct}%`,
                  transformOrigin: 'bottom',
                }}
                animate={
                  reduced || !isCurrent
                    ? undefined
                    : { opacity: [0.6, 1, 0.6] }
                }
                transition={
                  reduced || !isCurrent
                    ? undefined
                    : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                }
                title={`${i} min ago: ${count} event${count === 1 ? '' : 's'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HorizonBar;
