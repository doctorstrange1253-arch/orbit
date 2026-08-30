import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { tierById, nextTierId } from '../../services/pact';

/**
 * PactResultsCard — Monday morning end-of-week summary.
 *
 * Reads the latest weeklyHistory row and frames the past week:
 *   - promoted: green up-arrow, "+ 1 tier"
 *   - relegated: rose down-arrow, "− 1 tier"
 *   - held:      gray dash, "you held"
 * Steady Shield bonus appears as a separate badge when held 4+ weeks.
 */
const PactResultsCard = ({ history, me }) => {
    if (!Array.isArray(history) || history.length === 0) return null;
    const last = history[0];
    if (!last) return null;

    const result = last.result || 'held';
    const Icon = result === 'promoted' ? TrendingUp : result === 'relegated' ? TrendingDown : Minus;
    const tone = result === 'promoted'
        ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
        : result === 'relegated'
            ? 'border-rose-400/40 bg-rose-500/10 text-rose-100'
            : 'border-slate-400/30 bg-slate-500/10 text-slate-100';
    const verb = result === 'promoted' ? 'You promoted' : result === 'relegated' ? 'You relegated' : 'You held';
    const tier = tierById(last.divisionId);
    const nextTier = tierById(nextTierId(last.divisionId));
    const rank = last.rank || 0;
    const groupSize = last.groupSize || 0;

    return (
        <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-2xl border ${tone} p-4`}
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-surface/40 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Pact rolled · {last.weekId}</div>
                    <h3 className="text-base font-black">{verb}</h3>
                </div>
            </div>
            <p className="text-sm leading-relaxed">
                Last week in <span className="font-bold">{tier.label}</span>, you were rank{' '}
                <span className="font-bold tabular-nums">{rank}/{groupSize}</span> with a score of{' '}
                <span className="font-bold tabular-nums">{last.score}</span>.
                {result === 'promoted' && <> You're now in <span className="font-bold">{nextTier.label}</span>.</>}
                {result === 'held' && <> This week you're in the same group. Steady.</>}
            </p>
            {(me?.pact?.steadyShieldWeeks || 0) >= 4 && result === 'held' && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-pill text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    <Sparkles className="w-3 h-3" /> Steady Shield · {me.pact.steadyShieldWeeks}w
                </div>
            )}
        </motion.div>
    );
};

export default PactResultsCard;
