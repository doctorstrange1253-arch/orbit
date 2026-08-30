import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldAlert, Flame, X } from 'lucide-react';
import { useState } from 'react';
import { usePactPulse, useMarkPactPulseSeen } from '../../hooks/usePact';

/**
 * PactPulse — the Wednesday mid-week message widget.
 *
 * Tone branches the headline + accent color:
 *   encourage  → flame icon, accent green, "you can promote"
 *   steady     → heart icon, accent blue, "hold the line"
 *   caution    → shield icon, accent amber, "stay sharp"
 *
 * Dismissible per-week via the /pact/pulse/seen endpoint.
 */
const ICONS = {
    encourage: Flame,
    steady: Heart,
    caution: ShieldAlert,
};
const ACCENT = {
    encourage: 'from-emerald-500/20 to-cyan-500/10 border-emerald-400/30 text-emerald-100',
    steady:    'from-indigo-500/20 to-blue-500/10 border-indigo-400/30 text-indigo-100',
    caution:   'from-amber-500/20 to-rose-500/10 border-amber-400/30 text-amber-100',
};

const PactPulse = () => {
    const { data, isLoading } = usePactPulse();
    const markSeen = useMarkPactPulseSeen();
    const qc = useQueryClient();
    const [hidden, setHidden] = useState(false);

    if (isLoading || !data) return null;
    if (data.seen || hidden) return null;

    const tone = data.tone || 'steady';
    const Icon = ICONS[tone] || Heart;

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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${ACCENT[tone]} p-4`}
            >
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface/40 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                            Pact Pulse · {tone}
                        </div>
                        <p className="text-sm leading-relaxed">{data.message}</p>
                        {data.rank && (
                            <div className="mt-2 text-[11px] opacity-80">
                                Rank {data.rank.rank}/{data.rank.groupSize} · {data.rank.daysLeftInWeek}d left in week
                            </div>
                        )}
                    </div>
                    <button onClick={dismiss} className="p-1 rounded-full hover:bg-black/10" aria-label="Dismiss">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PactPulse;
