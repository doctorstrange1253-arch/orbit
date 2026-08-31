/**
 * soul/horizon/CounterCluster.jsx — Three live counters.
 *
 * Sits below the HorizonBar. The three numbers are the user's "now" —
 * sessions completed today, peer swaps today, current streak days. Each
 * counter has a tiny live-update loop (refetch every 30s) so the user
 * sees their day moving.
 *
 * The counters are intentionally the V2 gameology events:
 *   - session_completed: +100 XP for student/peer
 *   - peer_swap_completed: +40 XP for peer_learner
 *   - currentStreak: the consecutive-day learning streak
 *
 * Visual: each counter is a NebulaCard with a giant numeric figure, a
 * small label, and a faint Pulsar-tinted icon. The active counter (the
 * one that just ticked up) gets a brief glow + Haptic.light().
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { borderTint, surfaceRecipe, tintHalo } from '../tints';
import { Haptic } from '../haptics';
import api from '../../services/api';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Count occurrences of an event in today's history (UTC date match).
function countTodayEvents(history, eventName) {
  if (!Array.isArray(history)) return 0;
  const today = new Date().toISOString().slice(0, 10);
  return history.filter((h) => {
    if (h?.event !== eventName) return false;
    const t = h?.createdAt ? new Date(h.createdAt).toISOString().slice(0, 10) : '';
    return t === today;
  }).length;
}

const Counter = ({ value, label, icon: Icon, accent, active }) => {
  const reduced = _isReducedMotion();
  return (
    <motion.div
      className="relative p-4 rounded-2xl"
      style={{
        ...surfaceRecipe('peer'),
        ...(active ? { boxShadow: tintHalo({ from: accent, to: accent }, 32) } : {}),
      }}
      animate={reduced ? undefined : active ? { scale: [1, 1.04, 1] } : undefined}
      transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}22`, border: borderTint({ from: accent, to: accent }, 28) }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-text-muted">
          Live
        </div>
      </div>
      <div className="text-3xl font-black tabular-nums text-text-primary">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted mt-1">
        {label}
      </div>
    </motion.div>
  );
};

const CounterCluster = () => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const lastValues = useRef({ sessions: 0, swaps: 0, streak: 0 });
  const [activeIdx, setActiveIdx] = useState(-1);

  // The history endpoint. Refetch every 30s so the counters feel live.
  const { data: history = [] } = useQuery({
    queryKey: ['gameology', 'history', 'live'],
    queryFn: () => api.get('/gameology/history?limit=200').then((r) => r.data || []),
    refetchInterval: 30000,
  });

  // The gameology subdoc for the streak.
  const { data: me } = useQuery({
    queryKey: ['gameology', 'me'],
    queryFn: () => api.get('/gameology/me').then((r) => r.data),
    refetchInterval: 60000,
  });

  const sessions = countTodayEvents(history, 'session_completed');
  const swaps = countTodayEvents(history, 'peer_swap_completed');
  const streak = me?.currentStreak || 0;

  // Detect changes and fire haptic + highlight the active counter.
  useEffect(() => {
    const prev = lastValues.current;
    let fired = -1;
    if (sessions > prev.sessions) fired = 0;
    else if (swaps > prev.swaps) fired = 1;
    else if (streak > prev.streak) fired = 2;
    if (fired >= 0) {
      Haptic.light();
      setActiveIdx(fired);
      const t = setTimeout(() => setActiveIdx(-1), 700);
      lastValues.current = { sessions, swaps, streak };
      return () => clearTimeout(t);
    }
    lastValues.current = { sessions, swaps, streak };
    return undefined;
  }, [sessions, swaps, streak]);

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      <Counter
        value={sessions}
        label="Sessions today"
        icon={Calendar}
        accent={accent}
        active={activeIdx === 0}
      />
      <Counter
        value={swaps}
        label="Swaps today"
        icon={Users}
        accent={accent}
        active={activeIdx === 1}
      />
      <Counter
        value={streak}
        label="Day streak"
        icon={Sparkles}
        accent={accent}
        active={activeIdx === 2}
      />
    </div>
  );
};

export default CounterCluster;
