/**
 * Sessions.jsx — student-side mentor browse.
 *
 * Theme: auto-adapts to dark/light via the `text-text-primary`, `bg-surface`,
 * `border-border-subtle` tokens. The "futuristic" feel is composed from the
 * existing site primitives:
 *   - <FuturisticBackdrop>  → animated grid + 3 floating accent orbs
 *   - .glass-card-glow      → translucent neon-rimmed card surface
 *   - .gradient-text        → shimmering multi-stop gradient title
 *   - .btn-gradient         → CTA with shifting cyan→violet→pink
 *   - .nav-tab-glass        → pill-style filter tabs
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    Search, Star, IndianRupee, Filter, ListChecks, Sparkles, Globe, Zap, ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import { SkillCardSkeleton } from '../components/skeletons';

const Sessions = () => {
    const [search, setSearch] = useState('');
    const [maxRate, setMaxRate] = useState(5000);
    const [minRating, setMinRating] = useState(0);

    const { data: mentors = [], isLoading, error, refetch } = useQuery({
        queryKey: ['sessions', 'mentors'],
        queryFn: () => api.get('/sessions/mentors').then((r) => r.data?.items || []),
        staleTime: 60_000,
    });

    const filtered = useMemo(() => {
        return mentors
            .filter((m) => m.hourlyRateInr <= maxRate)
            .filter((m) => (m.rating?.average || 0) >= minRating)
            .filter((m) => {
                if (!search) return true;
                const q = search.toLowerCase();
                return (
                    (m.name || "").toLowerCase().includes(q) ||
                    (m.headline || "").toLowerCase().includes(q) ||
                    (m.skills || []).join(" ").toLowerCase().includes(q)
                );
            });
    }, [mentors, search, maxRate, minRating]);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14">
                {/* Hero */}
                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-10 flex flex-wrap items-start justify-between gap-6"
                >
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-4">
                            <Sparkles className="w-3 h-3 text-accent" /> Orbit Sessions
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
                            <span className="gradient-text">1-on-1 with the best.</span>
                        </h1>
                        <p className="text-text-secondary text-base md:text-lg max-w-xl">
                            Book a paid video session with a vetted mentor. Escrow holds
                            the money until the session completes; the mentor is paid
                            only on a successful meet.
                        </p>
                    </div>
                    <Link
                        to="/student/sessions"
                        className="self-start inline-flex items-center gap-1.5 text-xs font-semibold nav-tab-glass px-3.5 py-2 transition-colors text-text-primary"
                    >
                        <ListChecks className="w-3.5 h-3.5 text-accent" /> My Sessions
                    </Link>
                </motion.header>

                <div className="grid md:grid-cols-[280px,1fr] gap-6">
                    {/* Filters */}
                    <aside className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="glass-card-glow p-4"
                        >
                            <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name, headline, skill…"
                                    className="w-full input-glass pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.18, duration: 0.5 }}
                            className="glass-card-glow p-4"
                        >
                            <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                                <span className="text-text-secondary">Max rate </span>
                                <span className="gradient-text font-bold">₹{maxRate}/hr</span>
                            </label>
                            <input
                                type="range"
                                min={300}
                                max={10000}
                                step={100}
                                value={maxRate}
                                onChange={(e) => setMaxRate(Number(e.target.value))}
                                className="w-full accent-accent"
                            />
                            <div className="flex justify-between text-[10px] text-text-muted mt-1 tabular-nums">
                                <span>₹300</span><span>₹10,000</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.26, duration: 0.5 }}
                            className="glass-card-glow p-4"
                        >
                            <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                                Min rating
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[0, 3, 4, 4.5].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setMinRating(r)}
                                        className={`text-xs py-1.5 rounded-lg transition-all ${
                                            minRating === r
                                                ? 'btn-gradient shadow-glow-accent'
                                                : 'nav-tab-glass text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        {r === 0 ? "Any" : `${r}+`}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.34, duration: 0.5 }}
                            className="glass-card-glow p-4"
                        >
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <Zap className="w-3.5 h-3.5 text-accent" />
                                <span>{filtered.length} mentor{filtered.length === 1 ? "" : "s"} match</span>
                            </div>
                        </motion.div>
                    </aside>

                    {/* Results */}
                    <section>
                        {isLoading ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonMentorCard key={i} />
                                ))}
                            </div>
                        ) : error ? (
                            <ErrorState message="Couldn't load mentors" onRetry={refetch} />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                icon={<Filter className="w-10 h-10" />}
                                title="No mentors match"
                                message="Try widening your filters or come back soon — new mentors get approved every week."
                            />
                        ) : (
                            <motion.div
                                initial="hidden" animate="show"
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                                className="grid sm:grid-cols-2 gap-4"
                            >
                                {filtered.map((m) => (
                                    <MentorCard key={m.userId} mentor={m} />
                                ))}
                            </motion.div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

const MentorCard = ({ mentor }) => {
    const isLive = (mentor.rating?.count || 0) > 0;
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.25 }}
        >
            <Link
                to={`/student/mentors/${mentor.userId}`}
                className="group block glass-card-glow p-5 transition-all hover:shadow-glow-accent"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                        {mentor.avatar ? (
                            <img src={mentor.avatar} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-accent/30" />
                        ) : (
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-text-primary bg-surface border border-border-subtle ring-2 ring-accent/30">
                                {mentor.name?.[0] || "M"}
                            </div>
                        )}
                        {isLive && (
                            <span
                                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-surface"
                                style={{ boxShadow: '0 0 8px var(--success)' }}
                                title="Active mentor"
                            />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-text-primary truncate">{mentor.name}</div>
                        <div className="text-xs text-text-secondary truncate">{mentor.headline || "Mentor"}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface border border-border-subtle text-text-primary">
                        <IndianRupee className="w-3 h-3" />{mentor.hourlyRateInr}/hr
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-text-primary">{(mentor.rating?.average || 0).toFixed(1)}</span>
                        <span className="text-text-muted text-xs">({mentor.rating?.count || 0})</span>
                    </span>
                    {mentor.timezone && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                            <Globe className="w-3 h-3" />{mentor.timezone}
                        </span>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-text-muted">Book a session</span>
                    <span className="inline-flex items-center gap-1 text-accent group-hover:translate-x-0.5 transition-transform">
                        Open <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
};

const SkeletonMentorCard = () => (
    <div className="glass-card-glow p-5">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full skeleton" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded skeleton" />
                <div className="h-2.5 w-1/2 rounded skeleton" />
            </div>
        </div>
        <div className="h-3 w-3/4 rounded skeleton mt-2" />
        <div className="h-3 w-1/2 rounded skeleton mt-2" />
    </div>
);

export default Sessions;
