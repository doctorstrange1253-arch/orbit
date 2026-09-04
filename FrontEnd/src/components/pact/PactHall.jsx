import { usePactHall } from '../../hooks/usePact';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { tierById } from '../../services/pact';
import { Crown, ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * PactHall — the leaderboard table.
 *
 * Renders the caller's group with rival indicators (you in the middle,
 * the 2 above + 2 below highlighted). Rank-change animations on
 * update via the key+layout pattern. The table is typeset, not
 * glassed — hairline rules separate rows, mono-caps for rank +
 * tabular numerals, Playfair italic for the "you" name, and a
 * tier dot to the left of every name so the eye can scan the
 * division at a glance.
 */
const PactHall = () => {
    const { data: hall, isLoading } = usePactHall();

    if (isLoading) {
        return (
            <div
                className="py-10 text-center"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.55)' }}
            >
                Drawing the roll.
            </div>
        );
    }
    if (!hall || !Array.isArray(hall.items) || hall.items.length === 0) {
        return (
            <div
                className="py-10 text-center"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.55)' }}
            >
                No group this week yet. The roll assembles on Monday.
            </div>
        );
    }

    const groupSize = hall.items.length;
    const promoteCutoff = 7;
    const relegateCutoff = groupSize - 7;

    return (
        <div>
            <div
                className="flex items-center justify-between pb-3 mb-1"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
            >
                <div className="font-mono uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}>
                    The Roll · Week {hall.weekId}
                </div>
                <div className="font-mono uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}>
                    {groupSize} mentors
                </div>
            </div>

            <ol>
                {hall.items.map((u) => {
                    const tier = tierById(u.pact?.divisionId);
                    const isMe = u.isMe;
                    const isPromotion = u.rank <= promoteCutoff;
                    const isRelegation = u.rank > relegateCutoff;
                    return (
                        <motion.li
                            key={u._id}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                            className="flex items-center gap-3 md:gap-4 py-2.5 px-1 md:px-2"
                            style={{
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                background: isMe ? 'rgba(255,255,255,0.04)' : 'transparent',
                            }}
                        >
                            <span
                                className="w-7 text-right font-mono tabular-nums"
                                style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    color: isMe ? 'var(--text-primary)' : 'rgba(245,245,245,0.55)',
                                }}
                            >
                                {u.rank === 1
                                    ? <Crown style={{ width: 14, height: 14, color: '#fcd34d', display: 'inline-block' }} />
                                    : String(u.rank).padStart(2, '0')}
                            </span>

                            <span
                                aria-hidden
                                className="rounded-full flex-shrink-0"
                                style={{
                                    width: 8,
                                    height: 8,
                                    background: tier.glow,
                                    boxShadow: `0 0 6px ${tier.glow}66`,
                                }}
                                title={tier.label}
                            />

                            <div className="flex-1 min-w-0">
                                <div
                                    className="truncate"
                                    style={{
                                        fontFamily: isMe ? 'var(--font-editorial)' : 'var(--font-serif)',
                                        fontStyle: isMe ? 'italic' : 'normal',
                                        fontWeight: isMe ? 700 : 500,
                                        fontSize: '0.98rem',
                                        lineHeight: 1.1,
                                        color: isMe ? 'var(--text-primary)' : 'rgba(245,245,245,0.85)',
                                    }}
                                >
                                    {isMe ? 'You' : (u.name || 'Mentor')}
                                </div>
                                <div
                                    className="font-mono uppercase mt-0.5"
                                    style={{ fontSize: '0.54rem', letterSpacing: '0.18em', fontWeight: 700 }}
                                >
                                    {isPromotion && (
                                        <span style={{ color: 'rgba(110,231,183,1)' }}>
                                            <ArrowUp style={{ width: 9, height: 9, display: 'inline-block', marginRight: 2 }} />
                                            Promotion zone
                                        </span>
                                    )}
                                    {isRelegation && !isPromotion && (
                                        <span style={{ color: 'rgba(252,165,165,1)' }}>
                                            <ArrowDown style={{ width: 9, height: 9, display: 'inline-block', marginRight: 2 }} />
                                            Relegation zone
                                        </span>
                                    )}
                                    {!isPromotion && !isRelegation && (
                                        <span style={{ color: 'rgba(245,245,245,0.50)' }}>
                                            <Minus style={{ width: 9, height: 9, display: 'inline-block', marginRight: 2 }} />
                                            Safe ground
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="hidden md:block w-20 text-right">
                                <span
                                    className="font-mono uppercase"
                                    style={{ fontSize: '0.58rem', letterSpacing: '0.18em', fontWeight: 700, color: tier.glow }}
                                >
                                    {tier.label}
                                </span>
                            </div>

                            {!isMe && (
                                <Link
                                    to={`/profile/${u._id}`}
                                    className="font-mono uppercase"
                                    style={{
                                        fontSize: '0.58rem',
                                        letterSpacing: '0.18em',
                                        fontWeight: 700,
                                        color: 'rgba(245,245,245,0.40)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Profile →
                                </Link>
                            )}

                            <div
                                className="w-16 text-right font-mono tabular-nums"
                                style={{
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    color: isMe ? 'var(--text-primary)' : 'rgba(245,245,245,0.85)',
                                }}
                            >
                                {u.pact?.weekScore || 0}
                            </div>
                        </motion.li>
                    );
                })}
            </ol>

            <div
                className="flex items-center gap-4 pt-3 mt-1 font-mono uppercase"
                style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.18em',
                    fontWeight: 700,
                    color: 'rgba(245,245,245,0.40)',
                }}
            >
                <span style={{ color: 'rgba(110,231,183,1)' }}>Top 7 promote</span>
                <span aria-hidden>·</span>
                <span style={{ color: 'rgba(245,245,245,0.55)' }}>Middle hold</span>
                <span aria-hidden>·</span>
                <span style={{ color: 'rgba(252,165,165,1)' }}>Bottom 7 relegate</span>
            </div>
        </div>
    );
};

export default PactHall;
