/**
 * CelebrationBurst — a rarity-weighted purchase celebration. A Lunar buy gets a
 * modest pop of sparks; a Multiversal buy fills the screen with an iridescent
 * radial flash, a big tier label, and a dense spark shower. Spark count, glow
 * and flash intensity all scale with the tier's `order` (rarity.js), so the
 * ladder is FELT, not just labeled.
 *
 * Purely visual and self-cleaning: mounts, plays once (~1.4s), calls onDone.
 * Reduced-motion / data-anim-off users get nothing (the toast still confirms).
 */
import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { rarityOf } from './rarity';

export default function CelebrationBurst({ rarity, itemName, onDone }) {
  const reduce = useReducedMotion();
  const r = rarityOf(rarity);
  const animOff = typeof document !== 'undefined' && document.documentElement.hasAttribute('data-anim-off');

  // 10 sparks for Lunar → 52 for Multiversal.
  const sparks = useMemo(() => {
    const n = 8 + r.order * 3;
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + (i % 3) * 0.31;
      const dist = 90 + ((i * 53) % 140) + r.order * 6;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 3 + ((i * 7) % 5),
        delay: (i % 8) * 0.028,
        hue: i % 3,
      };
    });
  }, [r.order]);

  useEffect(() => {
    if (reduce || animOff) { onDone?.(); return undefined; }
    const t = setTimeout(() => onDone?.(), 1500);
    return () => clearTimeout(t);
  }, [reduce, animOff, onDone]);

  if (reduce || animOff) return null;

  const big = r.card; // top tiers (HYPERNOVA+) get the full treatment
  const sparkColor = (hue) =>
    hue === 0 ? r.color : hue === 1 ? '#ffffff' : (r.iridescent ? '#ec4899' : r.color);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] grid place-items-center" aria-hidden="true">
      {/* radial flash — stronger + wider for card-glow tiers */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, big ? 0.5 : 0.25, 0] }}
        transition={{ duration: big ? 1.2 : 0.8, ease: 'easeOut' }}
        style={{
          background: r.iridescent
            ? 'radial-gradient(45% 45% at 50% 50%, rgba(168,85,247,.55), rgba(236,72,153,.25), transparent 70%)'
            : `radial-gradient(40% 40% at 50% 50%, ${r.color}66, transparent 70%)`,
        }}
      />

      {/* spark shower */}
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: s.size, height: s.size,
            background: sparkColor(s.hue),
            boxShadow: `0 0 ${6 + r.order}px ${r.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.3, 1, 0.5] }}
          transition={{ duration: 0.9 + r.order * 0.03, delay: s.delay, ease: 'easeOut' }}
        />
      ))}

      {/* tier stamp — big tiers announce themselves */}
      <motion.div
        className="relative flex flex-col items-center gap-1 text-center"
        initial={{ opacity: 0, scale: 0.7, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.7, big ? 1.15 : 1, 1, 0.96], y: [8, 0, 0, -6] }}
        transition={{ duration: 1.35, times: [0, 0.2, 0.75, 1], ease: 'easeOut' }}
      >
        <span
          className="font-black uppercase tracking-[0.22em]"
          style={{
            fontSize: big ? 22 : 15,
            color: r.iridescent ? '#e9d5ff' : r.color,
            textShadow: `0 0 ${r.glow}px ${r.color}, 0 1px 2px rgba(0,0,0,.5)`,
          }}
        >
          {r.label}
        </span>
        {itemName && (
          <span className="text-xs font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,.7)' }}>
            {itemName} unlocked
          </span>
        )}
      </motion.div>
    </div>
  );
}
