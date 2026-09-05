import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Users2, Search } from 'lucide-react';
import api from '../../services/api';
import SectionBoundary from '../../soul/editorial/SectionBoundary';
import {
    MentorBackLink,
    MentorTitle,
    MentorDeck,
    MentorDotLeader,
    MentorStat,
    MentorTag,
} from '../../components/pact/MentorEditorial';
import { StudioMasthead } from '../../soul/studio/surfaces';

const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.06)';
const MUTED = 'rgba(245,245,245,0.55)';

const MONO_MICRO = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.58rem',
    letterSpacing: '0.20em',
    fontWeight: 700,
    textTransform: 'uppercase',
};

function sinceLabel(ms, now) {
    if (!ms) return 'never';
    const days = Math.floor((now - ms) / 86_400_000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

const QUIET_MS = 14 * 86_400_000;

function enrich(raw) {
    const now = Date.now();
    const items = (raw?.items || []).map((l) => ({
        ...l,
        seenLabel: sinceLabel(l.lastActiveMs, now),
        isStale: l.lastActiveMs > 0 && now - l.lastActiveMs > QUIET_MS,
    }));
    const finished = items.filter((l) => l.finished > 0).length;
    const quiet = items.filter((l) => l.isStale).length;
    const avg = items.length
        ? Math.round(items.reduce((n, l) => n + l.avgProgressPct, 0) / items.length)
        : 0;
    return { items, stats: { total: items.length, finished, quiet, avg } };
}

const SORTS = [
    { id: 'recent',   label: 'Last seen' },
    { id: 'progress', label: 'Progress' },
    { id: 'courses',  label: 'Courses' },
    { id: 'name',     label: 'Name' },
];

const LearnerRow = ({ learner }) => {
    const stale = learner.isStale;

    return (
        <article className="py-4" style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}>
            <div className="flex items-start gap-4">
                {learner.avatar ? (
                    <img
                        src={learner.avatar}
                        alt=""
                        className="w-11 h-11 object-cover flex-shrink-0"
                        style={{ border: `1px solid ${HAIRLINE_SOFT}` }}
                    />
                ) : (
                    <div
                        className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: `1px solid ${HAIRLINE_SOFT}`,
                            fontFamily: 'var(--font-editorial)',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {learner.name?.[0]?.toUpperCase() || '?'}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                        <Link
                            to={`/profile/${learner.userId}`}
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.12rem',
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                flexShrink: 0,
                            }}
                        >
                            {learner.name}
                        </Link>
                        <MentorDotLeader />
                        <span
                            style={{
                                ...MONO_MICRO,
                                color: 'var(--text-primary)',
                                fontVariantNumeric: 'tabular-nums',
                                flexShrink: 0,
                            }}
                        >
                            {learner.avgProgressPct}%
                        </span>
                    </div>

                    <div className="mt-2">
                        <div style={{ height: 2, background: 'rgba(255,255,255,0.08)' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${learner.avgProgressPct}%`,
                                    background: learner.finished > 0 ? 'rgba(110,231,183,0.85)' : 'var(--text-primary)',
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                            {learner.courseCount} course{learner.courseCount === 1 ? '' : 's'}
                        </span>
                        <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)' }}>·</span>
                        <span style={{ ...MONO_MICRO, color: stale ? 'rgba(251,191,36,0.85)' : MUTED }}>
                            Seen {learner.seenLabel}
                        </span>
                        {learner.finished > 0 && (
                            <MentorTag tone="success">{learner.finished} finished</MentorTag>
                        )}
                        {stale && learner.finished === 0 && <MentorTag tone="warning">Gone quiet</MentorTag>}
                    </div>

                    <div className="mt-2.5 flex flex-col gap-1">
                        {learner.courses.map((c) => (
                            <div key={`${learner.userId}-${c._id}`} className="flex items-baseline gap-2">
                                <span
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '0.92rem',
                                        color: 'rgba(245,245,245,0.62)',
                                        flexShrink: 0,
                                    }}
                                >
                                    {c.title}
                                </span>
                                <MentorDotLeader />
                                <span
                                    style={{
                                        ...MONO_MICRO,
                                        fontSize: '0.52rem',
                                        color: c.completedAt ? 'rgba(110,231,183,1)' : MUTED,
                                        fontVariantNumeric: 'tabular-nums',
                                        flexShrink: 0,
                                    }}
                                >
                                    {c.completedAt ? 'Done' : `${c.progressPct}%`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
};

const Students = () => {
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('recent');

    const { data, isLoading } = useQuery({
        queryKey: ['mentor', 'learners'],
        queryFn: () => api.get('/courses/mentor/learners').then((r) => r.data),
        staleTime: 60_000,
        select: enrich,
    });

    const all = data?.items || [];
    const stats = data?.stats || { total: 0, finished: 0, quiet: 0, avg: 0 };

    const visible = useMemo(() => {
        const needle = q.trim().toLowerCase();
        const rows = needle
            ? all.filter((l) =>
                l.name.toLowerCase().includes(needle) ||
                l.courses.some((c) => (c.title || '').toLowerCase().includes(needle)))
            : all.slice();
        switch (sort) {
            case 'progress': return rows.sort((a, b) => b.avgProgressPct - a.avgProgressPct);
            case 'courses':  return rows.sort((a, b) => b.courseCount - a.courseCount);
            case 'name':     return rows.sort((a, b) => a.name.localeCompare(b.name));
            case 'recent':
            default:         return rows.sort((a, b) => b.lastActiveMs - a.lastActiveMs);
        }
    }, [all, q, sort]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
            <Helmet><title>Students · Orbit Mentor</title></Helmet>

            <div className="mb-3">
                <MentorBackLink to="/mentor/observatory">Observatory</MentorBackLink>
            </div>

            <StudioMasthead
                eyebrow="Mentor · The Roll"
                Icon={Users2}
                title="Everyone you are teaching"
                deck="The Observatory renders these people as points of light. This is the same set, readable — one row per learner across all of your courses."
            />

            {isLoading ? (
                <p
                    className="py-14 text-center"
                    style={{ fontFamily: 'var(--font-serif)', color: MUTED }}
                >
                    Reading the roll.
                </p>
            ) : all.length === 0 ? (
                <section className="py-14">
                    <MentorTitle size="md">The roll is empty</MentorTitle>
                    <div className="mt-3 max-w-lg">
                        <MentorDeck>
                            Nobody has enrolled in your courses yet. Publish one, and the first
                            name appears here the moment someone joins.
                        </MentorDeck>
                    </div>
                    <Link
                        to="/mentor/courses"
                        className="inline-block mt-6 font-mono uppercase"
                        style={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.22em',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.30)',
                            padding: '10px 16px',
                        }}
                    >
                        My courses
                    </Link>
                </section>
            ) : (
                <>
                    <SectionBoundary name="By the numbers">
                        <section className="py-6" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <MentorStat label="Learners" value={stats.total} />
                                <MentorStat label="Avg progress" value={`${stats.avg}%`} />
                                <MentorStat label="Have finished" value={stats.finished} tone="success" />
                                <MentorStat label="Gone quiet" value={stats.quiet} tone="warning" last />
                            </div>
                        </section>
                    </SectionBoundary>

                    <section className="py-5 flex flex-wrap items-center gap-3" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                        <div className="relative flex-1 min-w-[200px]">
                            <Search
                                size={13}
                                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: MUTED }}
                            />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Find a learner or a course"
                                className="w-full font-mono"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${HAIRLINE}`,
                                    color: 'var(--text-primary)',
                                    fontSize: '0.78rem',
                                    padding: '9px 12px 9px 30px',
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span style={{ ...MONO_MICRO, color: MUTED }}>Sort</span>
                            {SORTS.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSort(s.id)}
                                    className="font-mono uppercase"
                                    style={{
                                        fontSize: '0.58rem',
                                        letterSpacing: '0.20em',
                                        fontWeight: 700,
                                        color: sort === s.id ? 'var(--text-primary)' : MUTED,
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: sort === s.id ? '1px solid var(--text-primary)' : '1px solid transparent',
                                        padding: '4px 0',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <SectionBoundary name="The roll">
                        <section className="py-6">
                            {visible.length === 0 ? (
                                <p style={{ fontFamily: 'var(--font-serif)', color: MUTED }}>
                                    No learner matches that.
                                </p>
                            ) : (
                                visible.map((learner) => <LearnerRow key={learner.userId} learner={learner} />)
                            )}
                        </section>
                    </SectionBoundary>
                </>
            )}
        </div>
    );
};

export default Students;
