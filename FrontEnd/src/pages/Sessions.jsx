/**
 * Sessions.jsx — public list of approved mentors for paid 1-on-1 sessions.
 * Filters: skill (free-text), price cap, min rating, sort. Server-side
 * filtering is intentionally NOT used (the API is tiny; client filter
 * keeps the URL simple and pre-sorted by rating desc).
 */
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Search, Star, IndianRupee, Filter, X, Calendar, ListChecks } from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
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
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-4 py-8">
            <Helmet><title>Sessions · Orbit</title></Helmet>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Orbit Sessions</h1>
                        <p className="text-slate-400 max-w-2xl">
                            Book a paid 1-on-1 video session with a vetted mentor.
                            Escrow holds the money until the session completes; the mentor is paid only on a successful meet.
                        </p>
                    </div>
                    <Link
                        to="/my-sessions"
                        className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200 bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 px-3 py-2 rounded-lg transition-colors"
                    >
                        <ListChecks className="w-3.5 h-3.5" /> My Sessions
                    </Link>
                </header>

                <div className="grid md:grid-cols-[260px,1fr] gap-6">
                    {/* ── filters ─────────────────────────────────────────── */}
                    <aside className="space-y-4">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                            <label className="block text-sm text-slate-400 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name, headline, skill…"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                            <label className="block text-sm text-slate-400 mb-2">
                                Max rate: <span className="text-white">₹{maxRate}/hr</span>
                            </label>
                            <input
                                type="range"
                                min={300}
                                max={10000}
                                step={100}
                                value={maxRate}
                                onChange={(e) => setMaxRate(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                            <label className="block text-sm text-slate-400 mb-2">Min rating</label>
                            <div className="flex gap-1">
                                {[0, 3, 4, 4.5].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setMinRating(r)}
                                        className={`flex-1 text-xs py-1.5 rounded ${
                                            minRating === r
                                                ? "bg-violet-600 text-white"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        {r === 0 ? "Any" : `${r}+`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── results ─────────────────────────────────────────── */}
                    <section>
                        {isLoading ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => <SkillCardSkeleton key={i} />)}
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
                            <div className="grid sm:grid-cols-2 gap-4">
                                {filtered.map((m) => (
                                    <Link
                                        key={m.userId}
                                        to={`/sessions/${m.userId}`}
                                        className="group bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 rounded-xl p-5 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            {m.avatar ? (
                                                <img src={m.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-violet-700/30 flex items-center justify-center text-lg font-semibold">
                                                    {m.name?.[0] || "M"}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold truncate">{m.name}</div>
                                                <div className="text-xs text-slate-400 truncate">{m.headline}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <span className="flex items-center gap-1">
                                                <IndianRupee className="w-3.5 h-3.5" />
                                                {m.hourlyRateInr}/hr
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                {(m.rating?.average || 0).toFixed(1)}
                                                <span className="text-slate-500">({m.rating?.count || 0})</span>
                                            </span>
                                            <span className="ml-auto flex items-center gap-1 text-violet-300 group-hover:text-violet-200">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Book
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Sessions;
