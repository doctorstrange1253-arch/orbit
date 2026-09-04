import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Award, History, BookOpen, GraduationCap, Lock } from 'lucide-react';
import { useGameologyMe, useMyAchievements, useGameologyHistory } from '../hooks/useGameology';
import { useStreak } from '../hooks/useStreak';
import { XP_EVENT_LABELS, XP_EVENT_ICONS } from '../components/cosmic/xpEventLabels';
import LevelBadge from '../components/cosmic/LevelBadge';
import StreakFlame from '../components/cosmic/StreakFlame';
import LeagueTable from '../components/cosmic/LeagueTable';
import HolographicCard from '../components/fx/HolographicCard';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
// V3 — Pulse tier indicator + transparent formula popover
import ThresholdIndicator from '../soul/league/ThresholdIndicator';
import TransparentFormula from '../soul/league/TransparentFormula';
import { TIERS } from '../soul/league/tierMeta';

const xpForLevel = (l) => 100 * Math.max(0, l - 1) ** 2;

/**
 * Gameology — student's lifetime identity dashboard.
 *
 * Sections (top to bottom):
 *   1. Hero — animated level ring, XP, current streak, weekly league
 *   2. Achievements — catalog grid (locked = grayscale + lock icon)
 *   3. League leaderboard — full LeagueTable (All + 6 league tabs)
 *   4. XP history — recent events feed
 *
 * The design intent: a single page that answers "who am I as a learner?"
 * without scrolling. Level + streak above the fold; everything else is
 * motivated discovery.
 */
const Gameology = () => {
    const { data: me } = useGameologyMe();
    const { data: catalog = [] } = useMyAchievements();
    const { data: history = [] } = useGameologyHistory(30);
    const { longest } = useStreak();

    const xp = me?.xp || 0;
    const level = me?.level || 1;
    const weeklyXp = me?.weeklyXp || 0;
    const leagueId = me?.leagueId || 'bronze';
    const cur = xpForLevel(level);
    const next = xpForLevel(level + 1);
    const pct = Math.max(0, Math.min(1, (xp - cur) / Math.max(1, next - cur)));
    const xpToNext = Math.max(0, next - xp);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
                <Helmet><title>Gameology · Orbit</title></Helmet>

                <header className="mb-6 flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                            <Sparkles className="w-3 h-3 text-accent" /> Lifetime identity
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-1">
                            <span className="gradient-text">Gameology.</span>
                        </h1>
                        <p className="text-text-secondary text-sm">Every lesson, quiz, session, and swap — your cosmic learning log.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/courses" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-accent/15 text-accent border border-accent/30 text-[11px] font-bold uppercase tracking-widest hover:bg-accent/25">
                            <BookOpen className="w-3.5 h-3.5" /> Browse courses
                        </Link>
                    </div>
                </header>

                {/* HERO — level + XP + streak + league */}
                <HolographicCard className="p-6 mb-6">
                    <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
                        <div className="flex items-center gap-3">
                            <LevelBadge size={80} />
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Level</div>
                                <div className="text-3xl font-bold text-text-primary tabular-nums">{level}</div>
                                <div className="text-[11px] text-text-secondary">{xp.toLocaleString()} XP total</div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                                <span>Progress to level {level + 1}</span>
                                <span className="tabular-nums text-accent">{Math.round(pct * 100)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-border-subtle/40 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct * 100}%` }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                    style={{ boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}
                                />
                            </div>
                            <div className="mt-1 text-[10px] text-text-muted">
                                {xpToNext.toLocaleString()} XP to level {level + 1}
                            </div>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-2">
                            <StreakFlame />
                            {/* V3 — weekly tier chip + threshold indicator + formula
                                popover. The tier name (Pulse tier) replaces the V2
                                league label; the threshold indicator appears when
                                the user is within 10% of the next tier; the
                                "i" button opens the transparent formula. */}
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <div
                                className="px-2.5 py-1 rounded-pill border"
                                style={{
                                  background: (() => {
                                    const m = TIERS[leagueId];
                                    return m ? `linear-gradient(135deg, ${m.from}, ${m.to})` : 'rgba(255,255,255,0.04)';
                                  })(),
                                  border: '1px solid rgba(255,255,255,0.12)',
                                  color: '#0f172a',
                                }}
                              >
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                      {(TIERS[leagueId] || { label: leagueId }).label} · {weeklyXp} this week
                                  </span>
                              </div>
                              <ThresholdIndicator weeklyXp={weeklyXp} currentTier={leagueId} />
                            </div>
                            <TransparentFormula />
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <Stat label="Total XP" value={xp.toLocaleString()} />
                        <Stat label="Weekly XP" value={weeklyXp.toLocaleString()} />
                        <Stat label="Longest streak" value={longest || 0} />
                        <Stat label="Achievements" value={catalog.filter((a) => a.unlocked).length + '/' + catalog.length} />
                    </div>
                </HolographicCard>

                {/* ACHIEVEMENTS */}
                <section className="mb-6">
                    <h2 className="text-sm font-bold text-text-primary mb-3 inline-flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent" /> Achievements
                    </h2>
                    {catalog.length === 0 ? (
                        <div className="text-text-muted text-sm py-6">Loading achievements…</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {catalog.map((a) => {
                                return (
                                    <HolographicCard
                                        key={a.key}
                                        rarity={a.unlocked ? a.rarity : 'common'}
                                        className={`p-3 text-center relative overflow-hidden transition ${!a.unlocked ? 'grayscale opacity-50' : ''}`}
                                    >
                                        <div className="text-3xl mb-1">{a.icon || '🏅'}</div>
                                        <div className="text-xs font-bold text-text-primary line-clamp-1">{a.title}</div>
                                        <div className="text-[10px] text-text-muted line-clamp-2 mt-0.5">{a.description}</div>
                                        {a.unlocked && a.xpReward > 0 && (
                                            <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-accent">+{a.xpReward} XP</div>
                                        )}
                                        {!a.unlocked && (
                                            <div className="absolute top-1 right-1 text-text-muted">
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        )}
                                    </HolographicCard>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* LEADERBOARD */}
                <section className="mb-6">
                    <h2 className="text-sm font-bold text-text-primary mb-3 inline-flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-accent" /> Weekly League
                    </h2>
                    <HolographicCard className="p-4">
                        <LeagueTable limit={50} />
                    </HolographicCard>
                </section>

                {/* HISTORY */}
                <section className="mb-12">
                    <h2 className="text-sm font-bold text-text-primary mb-3 inline-flex items-center gap-2">
                        <History className="w-4 h-4 text-accent" /> Recent activity
                    </h2>
                    {history.length === 0 ? (
                        <div className="text-text-muted text-sm py-6">No activity yet. Complete a lesson or join a session to start.</div>
                    ) : (
                        <ol className="rounded-xl border border-border-subtle bg-surface/40 divide-y divide-border-subtle/40">
                            {history.map((h, i) => {
                                const Icon = XP_EVENT_ICONS[h.event] || GraduationCap;
                                const label = XP_EVENT_LABELS[h.event] || h.event;
                                return (
                                    <li key={i} className="flex items-center gap-3 p-3">
                                        <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-text-primary">{label}</div>
                                            <div className="text-[10px] text-text-muted">
                                                {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold tabular-nums text-emerald-300">+{h.xpAwarded} XP</div>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>
            </div>
        </div>
    );
};

const Stat = ({ label, value }) => (
    <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</div>
        <div className="text-base font-bold tabular-nums text-text-primary">{value}</div>
    </div>
);

export default Gameology;
