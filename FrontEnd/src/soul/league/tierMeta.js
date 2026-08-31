/**
 * soul/league/tierMeta.js — V3 Pulse tier constants (frontend).
 *
 * Mirrors the backend's `TIERS` and `TIER_THRESHOLDS` in
 * services/gameologyService.js. Kept in sync by convention — if you
 * add a tier, update both files.
 *
 * 8 tiers, named after cosmic career paths (per V3 plan §7):
 *   dust (0 XP) → meteor (100) → comet (500) → star (2000) →
 *   giant (5000) → nebula (10000) → pulsar (20000) → singularity (50000)
 *
 * Exposed:
 *   TIERS            — slug → { label, color, from, to } (matches TierBadge)
 *   TIER_THRESHOLDS  — slug → minimum weeklyXp to reach
 *   TIERS_ORDER       — ordered list of slugs low → high
 */

export const TIERS = {
  dust:        { label: 'Dust',        color: '#a8a29e', from: '#a8a29e', to: '#78716c' },
  meteor:      { label: 'Meteor',      color: '#fb923c', from: '#fb923c', to: '#ea580c' },
  comet:       { label: 'Comet',       color: '#fbbf24', from: '#fbbf24', to: '#f59e0b' },
  star:        { label: 'Star',        color: '#fde68a', from: '#fde68a', to: '#fbbf24' },
  giant:       { label: 'Giant',       color: '#fff8e1', from: '#fff8e1', to: '#fde68a' },
  nebula:      { label: 'Nebula',      color: '#f472b6', from: '#f472b6', to: '#a78bfa' },
  pulsar:      { label: 'Pulsar',      color: '#22d3ee', from: '#22d3ee', to: '#0d9488' },
  singularity: { label: 'Singularity', color: '#fff8e1', from: '#fff8e1', to: '#fde68a' },
};

export const TIER_THRESHOLDS = {
  dust:        0,
  meteor:    100,
  comet:     500,
  star:     2000,
  giant:    5000,
  nebula:  10000,
  pulsar:  20000,
  singularity: 50000,
};

export const TIERS_ORDER = [
  'dust', 'meteor', 'comet', 'star', 'giant', 'nebula', 'pulsar', 'singularity',
];

export function tierForWeeklyXp(weeklyXp) {
  let current = 'dust';
  for (const t of TIERS_ORDER) {
    if (weeklyXp >= TIER_THRESHOLDS[t]) current = t;
  }
  return current;
}

export function nextTierOf(currentTier) {
  const i = TIERS_ORDER.indexOf(currentTier);
  if (i < 0 || i >= TIERS_ORDER.length - 1) return null;
  return TIERS_ORDER[i + 1];
}
