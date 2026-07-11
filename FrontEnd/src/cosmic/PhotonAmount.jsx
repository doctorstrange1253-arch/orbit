/**
 * PhotonAmount — an animated Photons balance readout for page-level chips
 * (Nebula Store / Holo-Bay headers). The navbar PhotonsChip has its own richer
 * treatment; this is the lightweight sibling for inline balances:
 *   - count-up/down roll when the balance changes (never jumps);
 *   - a brief color flash on the digits (emerald = earned, rose = spent);
 *   - a small floating "+N / −N" delta that drifts up and fades.
 * Reduced-motion / data-anim-off users get an instant, static number.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useReducedMotion } from 'framer-motion';

export default function PhotonAmount({ value = 0, className = '' }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  const [delta, setDelta] = useState(null); // { amount, id }
  const prevRef = useRef(value);
  const seededRef = useRef(false);
  const idRef = useRef(0);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;

    if (seededRef.current && value !== prev && !reduce) {
      idRef.current += 1;
      setDelta({ amount: value - prev, id: idRef.current });
    }
    seededRef.current = true;

    if (reduce) { setDisplay(value); mv.set(value); return; }
    const controls = animate(mv, value, {
      duration: 0.6, ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce, mv]);

  const flash = delta ? (delta.amount > 0 ? '#34d399' : '#fb7185') : null;

  return (
    <span className="relative inline-flex">
      <motion.span
        key={delta?.id ?? 'static'}
        className={`tabular-nums ${className}`}
        animate={flash ? { color: [flash, flash, ''] } : {}}
        transition={{ duration: 0.9, times: [0, 0.6, 1] }}
      >
        {display.toLocaleString()}
      </motion.span>
      <AnimatePresence>
        {delta && (
          <motion.span
            key={delta.id}
            className="pointer-events-none absolute left-1/2 top-0 whitespace-nowrap text-[10px] font-black"
            style={{ color: delta.amount > 0 ? '#34d399' : '#fb7185' }}
            initial={{ y: 0, x: '-50%', opacity: 0 }}
            animate={{ y: -16, opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            onAnimationComplete={() => setDelta(null)}
          >
            {delta.amount > 0 ? '+' : '−'}{Math.abs(delta.amount).toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
