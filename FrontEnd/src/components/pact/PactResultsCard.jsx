import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { tierById, nextTierId, prevTierId } from '../../services/pact';

/**
 * PactResultsCard — Monday morning end-of-week summary.
 *
 * Reads the latest weeklyHistory row and frames the past week as a
 * small dispatch from the Pact. Set as a single hairline card with
 * mono eyebrow + Poppins verdict. Steady Shield surfaces as
 * a separate mono tag when the mentor has held 4+ weeks.
 */
const PactResultsCard = ({ history, me }) => {
    if (!Array.isArray(history) || history.length === 0) return null;
    const last = history[0];
    if (!last) return null;

    const result = last.result || 'held';
    const Icon = result === 'promoted' ? ArrowUp : result === 'relegated' ? ArrowDown : Minus;
    const tier = tierById(last.divisionId);
    const nextTier = tierById(nextTierId(last.divisionId));
    const droppedTier = tierById(prevTierId(last.divisionId));
    const rank = last.rank || 0;
    const groupSize = last.groupSize || 0;

    const toneColor = result === 'promoted'
        ? 'rgba(110,231,183,1)'
        : result === 'relegated'
            ? 'rgba(252,165,165,1)'
            : 'rgba(245,245,245,0.85)';
    const ruleColor = result === 'promoted'
        ? 'rgba(110,231,183,0.45)'
        : result === 'relegated'
            ? 'rgba(252,165,165,0.45)'
            : 'rgba(255,255,255,0.20)';
    const verb = result === 'promoted' ? 'You promoted' : result === 'relegated' ? 'You relegated' : 'You held';

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
            style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
                borderTop: `1px solid ${ruleColor}`,
                padding: '14px 18px',
            }}
        >
            <div className="flex items-start gap-3">
                <Icon style={{ width: 22, height: 22, color: toneColor, flexShrink: 0, marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                    <div
                        className="font-mono uppercase mb-1.5"
                        style={{ fontSize: '0.60rem', letterSpacing: '0.22em', fontWeight: 700, color: toneColor }}
                    >
                        Monday Dispatch · {last.weekId}
                    </div>
                    <div
                        style={{
                            fontFamily: 'var(--font-editorial)',
                            fontWeight: 700,
                            fontSize: '1.4rem',
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {verb}.
                    </div>
                    <p
                        style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'rgba(245,245,245,0.78)',
                            fontSize: '1.02rem',
                            lineHeight: 1.4,
                            marginTop: 6,
                        }}
                    >
                        Last week in{' '}
                        <span style={{ color: tier.glow, fontStyle: 'normal', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.86rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                            {tier.label}
                        </span>
                        , you stood rank{' '}
                        <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{String(rank).padStart(2, '0')}/{groupSize}</span>
                        {' '}with a score of{' '}
                        <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{last.score}</span>.
                        {result === 'promoted' && <> You begin the new week in <span style={{ color: nextTier.glow, fontStyle: 'normal', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.86rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{nextTier.label}</span>.</>}
                        {result === 'relegated' && <> You drop to <span style={{ color: droppedTier.glow, fontStyle: 'normal', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.86rem', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{droppedTier.label}</span>. The work continues.</>}
                        {result === 'held' && <> This week you stand in the same group. Steady.</>}
                    </p>
                    {(me?.pact?.steadyShieldWeeks || 0) >= 4 && result === 'held' && (
                        <div className="mt-3 flex items-center gap-2">
                            <span
                                className="font-mono uppercase"
                                style={{
                                    fontSize: '0.58rem',
                                    letterSpacing: '0.20em',
                                    fontWeight: 700,
                                    color: 'rgba(251,191,36,1)',
                                    border: '1px solid rgba(251,191,36,0.40)',
                                    padding: '3px 8px',
                                }}
                            >
                                Steady Shield · {me.pact.steadyShieldWeeks} weeks held
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PactResultsCard;
