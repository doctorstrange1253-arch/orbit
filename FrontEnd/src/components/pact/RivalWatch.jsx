import { usePactRivals, usePactMe } from '../../hooks/usePact';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import PactDivisionIcons from './PactDivisionIcons';

/**
 * RivalWatch — the 2-above / 2-below widget.
 *
 * Renders the 5-member slice of the leaderboard centered on the caller,
 * with the caller in the middle and rival markers on either side. Tapping
 * any rival opens their public profile (no private data exposed).
 */
const RivalWatch = () => {
    const { data: me } = usePactMe();
    const { data: rivals = [] } = usePactRivals();

    if (!me) return null;

    return (
        <div className="rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm p-3">
            <div className="flex items-center gap-2 mb-3">
                <Eye className="w-3.5 h-3.5 text-text-muted" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Rival Watch</h4>
                <span className="text-[10px] text-text-muted">· week {me.pact?.weekId}</span>
            </div>
            <ul className="space-y-1.5">
                {rivals.map((r) => {
                    const isMe = String(r._id) === String(me._id);
                    return (
                        <motion.li
                            key={r._id}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Link
                                to={`/profile/${r._id}`}
                                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                                    isMe ? 'bg-accent/10 border border-accent/30' : 'hover:bg-accent/5'
                                }`}
                            >
                                {r.avatar ? (
                                    <img src={r.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
                                        {r.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-text-primary truncate">
                                        {isMe ? 'You' : r.name}
                                    </div>
                                    <div className="mt-0.5">
                                        <PactDivisionIcons tierId={r.divisionId || me.pact?.divisionId} size={7} />
                                    </div>
                                </div>
                                <div className="text-xs font-bold tabular-nums text-text-primary">{r.weekScore || 0}</div>
                            </Link>
                        </motion.li>
                    );
                })}
            </ul>
        </div>
    );
};

export default RivalWatch;
