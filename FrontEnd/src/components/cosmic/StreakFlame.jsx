import { motion } from 'framer-motion';
import { Flame, Snowflake } from 'lucide-react';
import { useStreak } from '../../hooks/useStreak';

/**
 * StreakFlame — the learning streak chip.
 *
 * Distinct from the existing `OrbitStreakBadge` (engagement streak). This
 * one tracks "I LEARNED something today" — ticked by every awardXp call
 * via the Gameology engine. Two streaks, on purpose: an engaged user who
 * hasn't learned anything should see the flame cool down, and vice versa.
 *
 * Visual states (dayKey):
 *   today     → pulsing flame, accent color
 *   yesterday → flame with caution glow ("save it before midnight")
 *   older     → snowflake (streak at risk / already broken)
 *   never     → outline only ("start a streak today")
 */
const StreakFlame = ({ compact = false }) => {
    const { streak, dayKey } = useStreak();

    const palette = {
        today:     { from: '#fb923c', to: '#ef4444', text: 'text-orange-300', border: 'border-orange-400/40' },
        yesterday: { from: '#f59e0b', to: '#fbbf24', text: 'text-amber-300',  border: 'border-amber-400/40' },
        older:     { from: '#94a3b8', to: '#64748b', text: 'text-slate-300',  border: 'border-slate-400/30' },
        never:     { from: '#475569', to: '#334155', text: 'text-slate-400',  border: 'border-slate-500/30' },
    }[dayKey];

    const Icon = dayKey === 'older' || dayKey === 'never' ? Snowflake : Flame;
    const isPulsing = dayKey === 'today';

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${palette.border} bg-surface/60 backdrop-blur-sm ${palette.text}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-bold tabular-nums">{streak}</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border ${palette.border} bg-surface/60 backdrop-blur-sm`}
            title={
                dayKey === 'today' ? `${streak}-day learning streak — alive!`
                : dayKey === 'yesterday' ? `${streak}-day streak — one lesson keeps it alive`
                : dayKey === 'older' ? 'Streak cooled. One lesson starts a new one.'
                : 'Start a learning streak today.'
            }
        >
            <motion.div
                animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
                transition={isPulsing ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
                className="relative"
            >
                <Icon className={`w-4 h-4 ${palette.text}`} style={{
                    filter: isPulsing ? `drop-shadow(0 0 6px ${palette.from})` : undefined,
                }} />
            </motion.div>
            <span className={`text-sm font-bold tabular-nums ${palette.text}`}>{streak}</span>
        </motion.div>
    );
};

export default StreakFlame;
