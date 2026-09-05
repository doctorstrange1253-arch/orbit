import { usePactRivals, usePactMe } from '../../hooks/usePact';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { tierById } from '../../services/pact';

const RivalWatch = () => {
    const { data: me } = usePactMe();
    const { data: rivals = [] } = usePactRivals();

    if (!me) return null;

    return (
        <div>
            <div
                className="flex items-center justify-between pb-2.5 mb-1"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
            >
                <span
                    className="font-mono uppercase"
                    style={{ fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                >
                    Rivals
                </span>
                <span
                    className="font-mono uppercase"
                    style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.40)' }}
                >
                    Four closest
                </span>
            </div>

            <ol>
                {rivals.map((r) => {
                    const isMe = String(r._id) === String(me._id);
                    const tierId = r.divisionId || me.pact?.divisionId;
                    const tier = tierById(tierId);
                    return (
                        <motion.li
                            key={r._id}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <Link
                                to={`/profile/${r._id}`}
                                className="flex items-center gap-3 py-2.5"
                                style={{
                                    textDecoration: 'none',
                                    background: isMe ? 'rgba(255,255,255,0.04)' : 'transparent',
                                }}
                            >
                                <span
                                    aria-hidden
                                    className="rounded-full flex-shrink-0"
                                    style={{
                                        width: 8,
                                        height: 8,
                                        background: tier.glow,
                                        boxShadow: `0 0 6px ${tier.glow}55`,
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="truncate"
                                        style={{
                                            fontFamily: isMe ? 'var(--font-editorial)' : 'var(--font-serif)',
                                            fontStyle: isMe ? 'italic' : 'normal',
                                            fontWeight: isMe ? 700 : 500,
                                            fontSize: '0.95rem',
                                            lineHeight: 1.1,
                                            color: isMe ? 'var(--text-primary)' : 'rgba(245,245,245,0.85)',
                                        }}
                                    >
                                        {isMe ? 'You' : r.name}
                                    </div>
                                    <div
                                        className="font-mono uppercase mt-0.5"
                                        style={{ fontSize: '0.54rem', letterSpacing: '0.18em', fontWeight: 700, color: tier.glow }}
                                    >
                                        {tier.label}
                                    </div>
                                </div>
                                <div
                                    className="font-mono tabular-nums"
                                    style={{
                                        fontSize: '1.0rem',
                                        fontWeight: 700,
                                        color: isMe ? 'var(--text-primary)' : 'rgba(245,245,245,0.85)',
                                    }}
                                >
                                    {r.weekScore || 0}
                                </div>
                            </Link>
                        </motion.li>
                    );
                })}
            </ol>
        </div>
    );
};

export default RivalWatch;
