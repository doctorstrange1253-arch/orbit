/**
 * useSigilState.js — the four data points the OrbitSigil reads.
 *
 * The Sigil sits in the navbar and shows the user's level, current
 * learning streak, stardust (currency) and league at a glance. The
 * numbers come from the auth store (already loaded on login) so the
 * hook is synchronous and never triggers a network call.
 *
 * League colour resolution lives here too: the V3 8-tier names
 * (dust → singularity) are mapped to a per-tier hex. If the user
 * is on a pre-V3 leagueId (bronze/silver/...) we still pick a
 * sensible colour so the sigil never renders uncoloured.
 */

import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

// 8 V3 tiers + 6 V2 legacy tiers, all in one map so the Sigil colours
// itself correctly regardless of which era the user account is from.
const LEAGUE_COLOR = {
  // V3 League 2.0
  dust:        '#6b7280',
  meteor:      '#94a3b8',
  comet:       '#06b6d4',
  star:        '#3b82f6',
  giant:       '#a855f7',
  nebula:      '#ec4899',
  pulsar:      '#22d3ee',
  singularity: '#fff8e1',
  // V2 legacy (in case the migration hasn't run for this user yet)
  bronze:      '#a16207',
  silver:      '#94a3b8',
  gold:        '#fbbf24',
  platinum:    '#22d3ee',
  diamond:     '#a855f7',
  legend:      '#fff8e1',
};

const LEAGUE_LABEL = {
  dust: 'DUST', meteor: 'METEOR', comet: 'COMET', star: 'STAR',
  giant: 'GIANT', nebula: 'NEBULA', pulsar: 'PULSAR', singularity: 'SINGULARITY',
  bronze: 'BRONZE', silver: 'SILVER', gold: 'GOLD', platinum: 'PLATINUM',
  diamond: 'DIAMOND', legend: 'LEGEND',
};

export function useSigilState() {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const g = user?.gameology || {};
    const o = user?.orbit || {};
    const level = g.level || 1;
    const streak = g.currentStreak || 0;
    const stardust = typeof o.stardust === 'number' ? o.stardust : (typeof o.photons === 'number' ? o.photons : 0);
    const leagueId = g.leagueId || 'dust';
    return {
      level,
      streak,
      stardust,
      leagueId,
      leagueColor: LEAGUE_COLOR[leagueId] || '#94a3b8',
      leagueLabel: LEAGUE_LABEL[leagueId] || 'DUST',
      ariaLabel: `Level ${level}, ${streak}-day streak, ${stardust.toLocaleString()} stardust, ${LEAGUE_LABEL[leagueId] || 'DUST'} league`,
    };
  }, [user]);
}
