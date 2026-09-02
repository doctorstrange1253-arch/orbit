import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Trophy, ChevronLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PactHallTable from '../../components/pact/PactHall';
import PactPulse from '../../components/pact/PactPulse';
import RivalWatch from '../../components/pact/RivalWatch';
import PactResultsCard from '../../components/pact/PactResultsCard';
import { usePactMe, usePactHistory } from '../../hooks/usePact';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import PactBadge from '../../components/pact/PactBadge';
import PactDivisionIcons from '../../components/pact/PactDivisionIcons';

/**
 * PactHall (page) — mentor's weekly leaderboard view.
 *
 * Layout:
 *   - Header: tier + weekScore + steady shield weeks
 *   - Left column: PactPulse + RivalWatch
 *   - Right column: full group leaderboard (PactHall component)
 *   - Bottom: weekly history feed + Monday morning results card (when
 *     there's a fresh history row)
 */
const PactHallPage = () => {
    const { data: me } = usePactMe();
    const { data: history = [] } = usePactHistory(12);
    const lastRolledWeek = history[0]?.weekId;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
                <Helmet><title>Pact Hall · Orbit Mentor</title></Helmet>

                <Link to="/mentor/hub" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
                    <ChevronLeft className="w-3.5 h-3.5" /> Mentor hub
                </Link>

                <motion.header
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start justify-between gap-3 flex-wrap"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                            <Trophy className="w-3 h-3 text-accent" /> Weekly Pact
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-1">
                            <span className="gradient-text">Pact Hall.</span>
                        </h1>
                        <p className="text-text-secondary text-sm">Your group this week. Rivals above and below.</p>
                    </div>
                    {me && (
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">This week</div>
                            <div className="mt-1 flex items-center gap-2">
                                <PactBadge size={32} tier={me.pact?.divisionId} withLabel steadyShieldWeeks={me.pact?.steadyShieldWeeks} />
                            </div>
                            <div className="mt-2 text-2xl font-black tabular-nums text-text-primary">
                                {me.pact?.weekScore || 0} <span className="text-xs text-text-muted">Pact Score</span>
                            </div>
                        </div>
                    )}
                </motion.header>

                {/* Monday-morning results card: when a fresh rolled week is in history */}
                {lastRolledWeek && me?.pact?.lastResult && (
                    <div className="mb-5">
                        <PactResultsCard history={history} me={me} />
                    </div>
                )}

                <div className="grid md:grid-cols-[280px_1fr] gap-5">
                    <aside className="space-y-4 md:sticky md:top-20 md:self-start">
                        <PactPulse />
                        <RivalWatch />
                    </aside>

                    <main className="space-y-6">
                        <PactHallTable />

                        {history.length > 1 && (
                            <section>
                                <h2 className="text-sm font-bold text-text-primary mb-2 inline-flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-accent" /> Recent weeks
                                </h2>
                                <ol className="rounded-xl border border-border-subtle bg-surface/30 divide-y divide-border-subtle/30">
                                    {history.slice(0, 8).map((h, i) => (
                                        <li key={i} className="flex items-center gap-3 p-3 text-xs">
                                            <span className="font-mono text-text-muted w-24">{h.weekId}</span>
                                            <span className="w-32">
                                                <PactDivisionIcons tierId={h.divisionId} size={8} />
                                            </span>
                                            <span className="text-text-muted">rank {h.rank}/{h.groupSize}</span>
                                            <span className="ml-auto font-bold tabular-nums">{h.score}</span>
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                                h.result === 'promoted' ? 'bg-emerald-500/15 text-emerald-300'
                                                : h.result === 'relegated' ? 'bg-rose-500/15 text-rose-300'
                                                : 'bg-slate-500/15 text-slate-300'
                                            }`}>{h.result}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PactHallPage;
