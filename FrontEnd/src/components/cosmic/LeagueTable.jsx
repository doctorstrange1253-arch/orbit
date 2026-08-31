import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameologyLeaderboard } from '../../hooks/useGameology';
import { TIERS, TIERS_ORDER } from '../../soul/league/tierMeta';

// V3 — 8 tiers. The V2 6-league labels (bronze/silver/gold/platinum/
// diamond/legend) were remapped to the V3 8-tier system in the
// migratePulseLeague worker. This table now reads the V3 slugs.

// V3 — Tailwind gradient strings keyed by tier. The dynamic lookup
// `from-${color}-...` would need a safelist; we use inline styles
// instead so the build is stable.
const TIER_GRADIENT = {
  dust:        'linear-gradient(135deg, #a8a29e, #57534e)',
  meteor:      'linear-gradient(135deg, #fb923c, #ea580c)',
  comet:       'linear-gradient(135deg, #fbbf24, #f59e0b)',
  star:        'linear-gradient(135deg, #fde68a, #fbbf24)',
  giant:       'linear-gradient(135deg, #fff8e1, #fde68a)',
  nebula:      'linear-gradient(135deg, #f472b6, #a78bfa)',
  pulsar:      'linear-gradient(135deg, #22d3ee, #0d9488)',
  singularity: 'linear-gradient(135deg, #fff8e1, #fde68a)',
};

/**
 * LeagueTable — leaderboard of Gameology top users.
 *
 * V3 — 8 tiers (Dust→Singularity), motion-animated row reordering on
 * live rank changes (framer-motion `layout` prop). The "All" tab shows
 * the top 50 by level/xp.
 */
const LeagueTable = ({ defaultLeague = null, limit = 50 }) => {
    const [league, setLeague] = useState(defaultLeague);
    const { data, isLoading } = useGameologyLeaderboard(league, limit);
    const items = data?.items || [];

    return (
        <div>
            <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                    onClick={() => setLeague(null)}
                    className={`px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-widest transition border ${
                        !league
                            ? 'bg-accent/15 border-accent/50 text-accent'
                            : 'bg-surface/40 border-border-subtle text-text-secondary hover:border-accent/30'
                    }`}
                >All</button>
                {TIERS_ORDER.map((id) => {
                  const t = TIERS[id];
                  return (
                    <button
                        key={id}
                        onClick={() => setLeague(id)}
                        className="px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-widest transition border"
                        style={league === id
                          ? { background: TIER_GRADIENT[id], color: '#0f172a', border: '1px solid transparent' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >{t.label}</button>
                  );
                })}
            </div>

            {isLoading && <div className="text-text-secondary text-sm py-6">Loading…</div>}
            {!isLoading && items.length === 0 && (
                <div className="text-text-secondary text-sm py-6">No one in this tier yet. Be the first.</div>
            )}

            <ol className="divide-y divide-border-subtle/40">
                <AnimatePresence initial={false}>
                  {items.map((u, i) => (
                    <motion.li
                        key={u._id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        className="flex items-center gap-3 py-2.5"
                    >
                        <span className="w-6 text-right text-xs font-black tabular-nums text-text-muted">
                            {i + 1}
                        </span>
                        {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-black text-bg">
                                {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-text-primary truncate">{u.name}</div>
                            <div className="text-[11px] text-text-muted uppercase tracking-widest">
                                Level {u.level} · {u.xp?.toLocaleString?.() || u.xp} XP
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                            {u.leagueId}
                        </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
            </ol>
        </div>
    );
};

export default LeagueTable;
