import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useState } from 'react';
import { usePactPulse, useMarkPactPulseSeen, usePactMe } from '../../hooks/usePact';

const ARROW = {
  encourage: ArrowUp,
  steady:    Minus,
  caution:   ArrowDown,
};
const TONE = {
  encourage: { color: 'rgba(110,231,183,1)', ruleColor: 'rgba(110,231,183,0.45)', label: 'Promote' },
  steady:    { color: 'rgba(245,245,245,0.85)', ruleColor: 'rgba(255,255,255,0.30)', label: 'Hold' },
  caution:   { color: 'rgba(251,191,36,1)', ruleColor: 'rgba(251,191,36,0.45)', label: 'Steady' },
};

const PactPulse = () => {
    const { data, isLoading } = usePactPulse();
    const { data: me } = usePactMe();
    const markSeen = useMarkPactPulseSeen();
    const qc = useQueryClient();
    const [hidden, setHidden] = useState(false);

    if (isLoading || !data) return null;
    if (data.seen || hidden) return null;

    const tone = data.tone || 'steady';
    const Arrow = ARROW[tone] || Minus;
    const palette = TONE[tone] || TONE.steady;

    const dismiss = async () => {
        setHidden(true);
        try {
            await markSeen.mutateAsync();
        } catch {
            qc.invalidateQueries({ queryKey: ['pact', 'pulse'] });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="relative"
                style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderTop: `1px solid ${palette.ruleColor}`,
                    padding: '14px 16px',
                }}
            >
                <div className="flex items-start gap-3">
                    <Arrow
                        style={{ width: 18, height: 18, color: palette.color, flexShrink: 0, marginTop: 2 }}
                    />
                    <div className="flex-1 min-w-0">
                        <div
                            className="font-mono uppercase mb-1.5"
                            style={{ fontSize: '0.60rem', letterSpacing: '0.22em', fontWeight: 700, color: palette.color }}
                        >
                            The Pact Pulse · {palette.label}
                        </div>
                        <p
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.02rem',
                                lineHeight: 1.4,
                                color: 'rgba(245,245,245,0.85)',
                                margin: 0,
                            }}
                        >
                            {data.message}
                        </p>
                        {data.rank && (
                            <div
                                className="font-mono uppercase mt-2.5 pt-2.5 flex items-center gap-3"
                                style={{
                                    fontSize: '0.58rem',
                                    letterSpacing: '0.20em',
                                    fontWeight: 700,
                                    color: 'rgba(245,245,245,0.55)',
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <span>Rank {String(data.rank.rank).padStart(2, '0')}/{data.rank.groupSize}</span>
                                <span aria-hidden>·</span>
                                <span>{data.rank.daysLeftInWeek}d left</span>
                                {me?.pact?.weekScore != null && (
                                    <>
                                        <span aria-hidden>·</span>
                                        <span>Score {me.pact.weekScore}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={dismiss}
                        className="p-1 -mt-1 -mr-1"
                        aria-label="Dismiss"
                        style={{ color: 'rgba(245,245,245,0.40)' }}
                    >
                        <X style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PactPulse;
