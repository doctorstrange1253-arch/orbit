import { usePactHall, usePactMe } from '../../hooks/usePact';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { tierById } from '../../services/pact';
import { Crown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * PactHall — the leaderboard table.
 *
 * Renders the caller's group with rival indicators (you in the middle, the
 * 2 above + 2 below highlighted). Inline rank-change animations on update
 * via the key+layout pattern.
 */
const PactHall = () => {
    const { data: hall, isLoading } = usePactHall();
    const { data: me } = usePactMe();

    if (isLoading) return <div className="text-text-secondary text-sm py-6">Loading Pact Hall…</div>;
    if (!hall || !Array.isArray(hall.items)) {
        return <div className="text-text-secondary text-sm py-6">No group this week yet. Check back Monday.</div>;
    }

    return (
        <div className="rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-border-subtle/40 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                <span>Group {hall.groupId?.split(':').pop()}</span>
                <span>Week {hall.weekId}</span>
            </div>
            <ol className="divide-y divide-border-subtle/30">
                {hall.items.map((u) => {
                    const tier = tierById(u.pact?.divisionId);
                    const isMe = u.isMe;
                    const isPromotion = u.rank <= 7;
                    const isRelegation = u.rank > hall.items.length - 7;
                    return (
                        <motion.li
                            key={u._id}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                            className={`flex items-center gap-3 p-3 ${
                                isMe ? 'bg-accent/10 border-l-2 border-accent' : ''
                            }`}
                        >
                            <span className="w-7 text-right text-xs font-black tabular-nums text-text-muted">
                                {u.rank === 1 ? <Crown className="w-4 h-4 text-amber-300 inline" /> : u.rank}
                            </span>
                            {u.avatar ? (
                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
                                    {u.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-text-primary truncate flex items-center gap-2">
                                    {isMe ? 'You' : (u.name || 'Mentor')}
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tier.glow }}>{tier.label}</span>
                                </div>
                                <div className="text-[10px] text-text-muted">
                                    {isPromotion ? <span className="text-emerald-300 inline-flex items-center gap-0.5"><ArrowUp className="w-3 h-3" /> Promotion zone</span>
                                        : isRelegation ? <span className="text-rose-300 inline-flex items-center gap-0.5"><ArrowDown className="w-3 h-3" /> Relegation zone</span>
                                        : 'Safe'}
                                </div>
                            </div>
                            {!isMe && (
                                <Link to={`/profile/${u._id}`} className="text-[10px] text-text-muted hover:text-accent">View →</Link>
                            )}
                            <div className="w-16 text-right text-sm font-bold tabular-nums text-text-primary">{u.pact?.weekScore || 0}</div>
                        </motion.li>
                    );
                })}
            </ol>
        </div>
    );
};

export default PactHall;
