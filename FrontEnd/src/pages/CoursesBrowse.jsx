import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import { courses } from '../services/courses';
import CourseCard from '../components/courses/CourseCard';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import EmptyState from '../components/common/EmptyState';
// V3 — Signal Flare Waiting Room. Mounted in the empty state of the
// catalog so users can ask for a genre that doesn't exist yet.
import WaitingRoom from '../soul/signalFlare/WaitingRoom';

const SORTS = [
    { id: 'newest',  label: 'Newest' },
    { id: 'rating',  label: 'Top rated' },
    { id: 'popular', label: 'Most enrolled' },
];

const LEVELS = [
    { id: 'beginner',     label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced',     label: 'Advanced' },
];

const CoursesBrowse = () => {
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

    const { data: categories = [] } = useQuery({
        queryKey: ['courses', 'categories'],
        queryFn: () => courses.categories(),
        staleTime: 5 * 60_000,
    });

    const params = { q: q || undefined, category: category || undefined, level: level || undefined, sort, page, limit: 24 };
    const { data, isLoading } = useQuery({
        queryKey: ['courses', 'list', params],
        queryFn: () => courses.list(params),
        keepPreviousData: true,
    });
    const items = data?.items || [];
    const total = data?.total || 0;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>Courses · Orbit</title></Helmet>

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                        <BookOpen className="w-3 h-3 text-accent" /> Course library
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="gradient-text">Learn at your orbit.</span>
                    </h1>
                    <p className="text-text-secondary text-sm max-w-2xl">
                        Bite-sized video courses from mentors you already trust. Watch, take a quiz,
                        finish the course — and earn a shareable certificate.
                    </p>
                </motion.header>

                {/* Filter bar */}
                <div className="rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm p-3 mb-6 flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            placeholder="Search courses…"
                            className="w-full pl-9 pr-3 py-2 rounded-pill bg-bg/50 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                        />
                    </div>

                    <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-pill bg-bg/50 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent/50">
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-pill bg-bg/50 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent/50">
                        <option value="">All levels</option>
                        {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>

                    <select value={sort} onChange={(e) => setSort(e.target.value)}
                        className="px-3 py-2 rounded-pill bg-bg/50 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent/50">
                        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </div>

                {isLoading ? (
                    <div className="text-text-secondary text-sm py-12 text-center">Loading courses…</div>
                ) : items.length === 0 ? (
                    <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-start">
                      {/* V3 — the Waiting Room replaces the empty state when
                          the user is filtering by a category/genre. The
                          user can fire a Signal Flare. If they're not
                          filtering by category, the V2 EmptyState is
                          shown alongside as a "no results" message. */}
                      <WaitingRoom constellation="general" genre={category || 'general'} />
                      <EmptyState
                          icon={<Sparkles className="w-8 h-8" />}
                          title="No courses match"
                          body="Try widening the filters or searching for a different topic."
                      />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((c) => <CourseCard key={c._id} course={c} />)}
                        </div>
                        {items.length < total && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-5 py-2 rounded-pill bg-surface/60 border border-border-subtle text-sm font-bold text-text-primary hover:border-accent/40"
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CoursesBrowse;
