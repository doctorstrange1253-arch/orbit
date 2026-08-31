/**
 * soul/league/ThresholdIndicator.jsx — "Approaching <next tier>".
 *
 * V3 design: when the user is within 10% of the next tier's weekly-XP
 * threshold, a subtle badge appears next to their weekly XP indicator.
 * No countdown timer (no anxiety), just an ambient indicator.
 *
 * Reads from the gameology subdoc. Pure presentational.
 */

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { TIERS as TIER_META, TIER_THRESHOLDS, TIERS_ORDER } from './tierMeta';

function _nextTier(currentTier) {
  const i = TIERS_ORDER.indexOf(currentTier);
  if (i < 0 || i >= TIERS_ORDER.length - 1) return null;
  return TIERS_ORDER[i + 1];
}

const ThresholdIndicator = ({ weeklyXp = 0, currentTier = 'dust' }) => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const next = _nextTier(currentTier);
  if (!next) return null;
  const threshold = TIER_THRESHOLDS[next];
  const cur = TIER_THRESHOLDS[currentTier] || 0;
  const span = threshold - cur;
  const distance = Math.max(0, threshold - weeklyXp);
  const ratio = distance / Math.max(1, span);
  if (ratio > 0.10) return null;

  const nextMeta = TIER_META[next];
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent}55`,
        color: accent,
      }}
      aria-label={`Approaching ${nextMeta.label} — ${Math.round((1 - ratio) * 100)}% of the way`}
    >
      <Sparkles size={10} />
      Approaching {nextMeta.label} · {Math.round((1 - ratio) * 100)}%
    </motion.span>
  );
};

export default ThresholdIndicator;
