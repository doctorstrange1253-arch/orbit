/**
 * soul/league/TierBadge.jsx — One of the 8 V3 Pulse tiers.
 *
 * Each tier is an SVG with a tier-specific color + glow. The badge
 * renders in 3 sizes (sm 16, md 28, lg 56). Tier list + colors:
 *
 *   dust         — soft grey-amber
 *   meteor       — warm orange
 *   comet        — bright amber
 *   star         — gold-white
 *   giant        — white-gold
 *   nebula       — pink-purple
 *   pulsar       — cyan
 *   singularity  — white-gold with intense halo
 *
 * The Pulse Ceremony uses the lg size + a tier-specific upward burst
 * animation.
 */

import { motion } from 'framer-motion';
import { TIERS as TIER_META } from './tierMeta';

const DEFAULT_META = { label: 'Dust', color: '#a8a29e', from: '#a8a29e', to: '#78716c' };

const TierBadge = ({ tier = 'dust', size = 28, withLabel = false, animated = false }) => {
  const meta = TIER_META[tier] || DEFAULT_META;
  const id = `tier-${tier}-${size}`;
  const gradient = `linear-gradient(135deg, ${meta.from}, ${meta.to})`;

  return (
    <span className="inline-flex items-center gap-2">
      <motion.span
        className="relative inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size }}
        initial={animated ? { scale: 0.7, opacity: 0 } : false}
        animate={animated ? { scale: [0.7, 1.15, 1], opacity: 1 } : undefined}
        transition={animated ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : undefined}
        aria-label={`${meta.label} tier`}
      >
        {/* Halo for higher tiers */}
        {(tier === 'pulsar' || tier === 'singularity') && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: gradient,
              filter: 'blur(6px)',
              opacity: 0.5,
              transform: 'scale(1.4)',
            }}
          />
        )}
        {/* The badge body */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: gradient,
            border: '1.5px solid rgba(255,255,255,0.18)',
            boxShadow: `inset 0 0 6px rgba(255,255,255,0.3), 0 0 12px ${meta.color}55`,
          }}
        />
        {/* Specular highlight */}
        <span
          className="absolute rounded-full"
          style={{
            top: '14%',
            left: '20%',
            width: '28%',
            height: '28%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)',
          }}
        />
        {/* SVG center motif — a tiny star for the cosmic tiers */}
        <svg viewBox="0 0 24 24" width={size * 0.4} height={size * 0.4} aria-hidden>
          <path d="M12 1 L13.5 9.5 L22 12 L13.5 14.5 L12 23 L10.5 14.5 L2 12 L10.5 9.5 Z" fill="rgba(255,255,255,0.85)" />
        </svg>
      </motion.span>
      {withLabel && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">
          {meta.label}
        </span>
      )}
    </span>
  );
};

export const TIERS = TIER_META;
export default TierBadge;
