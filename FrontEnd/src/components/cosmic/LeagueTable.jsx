import { useState } from 'react';
import { useGameologyLeaderboard } from '../../hooks/useGameology';

const LEAGUES = [
    { id: 'bronze',   label: 'Bronze',   color: 'from-amber-700 to-amber-500' },
    { id: 'silver',   label: 'Silver',   color: 'from-slate-400 to-slate-200' },
    { id: 'gold',     label: 'Gold',     color: 'from-yellow-500 to-amber-300' },
    { id: 'platinum', label: 'Platinum', color: 'from-cyan-400 to-indigo-300' },
    { id: 'diamond',  label: 'Diamond',  color: 'from-sky-400 to-blue-200' },
    { id: 'legend',   label: 'Legend',   color: 'from-fuchsia-500 to-rose-300' },
];

/**
 * LeagueTable — leaderboard of Gameology top users.
 *
 * Tabs filter by league. The "All" tab shows the top 50 by level/xp.
 * Compact avatars + level chip + weekly XP bar. No fancy holo effects —
 * the Leaderboard page itself already wraps this in the WarpTransition
 * + cosmic chrome.
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
                {LEAGUES.map((l) => (
                    <button
                        key={l.id}
                        onClick={() => setLeague(l.id)}
                        className={`px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-widest transition border ${
                            league === l.id
                                ? `bg-gradient-to-r ${l.color} text-bg border-transparent`
                                : 'bg-surface/40 border-border-subtle text-text-secondary hover:border-accent/30'
                        }`}
                    >{l.label}</button>
                ))}
            </div>

            {isLoading && <div className="text-text-secondary text-sm py-6">Loading…</div>}
            {!isLoading && items.length === 0 && (
                <div className="text-text-secondary text-sm py-6">No one in this league yet. Be the first.</div>
            )}

            <ol className="divide-y divide-border-subtle/40">
                {items.map((u, i) => (
                    <li key={u._id} className="flex items-center gap-3 py-2.5">
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
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default LeagueTable;
