import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { BarChart3, TrendingDown } from 'lucide-react';
import api from '../../services/api';
import SectionBoundary from '../../soul/editorial/SectionBoundary';
import {
    MentorBackLink,
    MentorEyebrow,
    MentorTitle,
    MentorDeck,
    MentorDotLeader,
    MentorStat,
    MentorTag,
} from '../../components/pact/MentorEditorial';

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

const formatInr = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));

const Analytics = () => {
    const { data: learners, isLoading } = useQuery({
        queryKey: ['mentor', 'learners'],
        queryFn: () => api.get('/courses/mentor/learners').then((r) => r.data),
        staleTime: 60_000,
    });

    const { data: earningsData } = useQuery({
        queryKey: ['sessions', 'mentor', 'me'],
        queryFn: () => api.get('/sessions/mentor/me').then((r) => r.data),
        staleTime: 60_000,
    });

    const courseStats = learners?.courses || [];
    const earnings = earningsData?.earnings || { totalInr: 0, pendingInr: 0, releasedInr: 0 };

    const funnel = useMemo(() => courseStats.reduce(
        (acc, c) => ({
            enrolled: acc.enrolled + c.enrolled,
            started: acc.started + c.started,
            halfway: acc.halfway + c.halfway,
            finished: acc.finished + c.finished,
        }),
        { enrolled: 0, started: 0, halfway: 0, finished: 0 },
    ), [courseStats]);

    const dropOff = useMemo(() => {
        const rows = [];
        for (const c of courseStats) {
            for (const l of c.dropOff || []) {
                if (l.stalled > 0) rows.push({ ...l, courseTitle: c.title, courseId: c._id });
            }
        }
        return rows.sort((a, b) => b.stalled - a.stalled).slice(0, 12);
    }, [courseStats]);

    const worstStall = dropOff[0]?.stalled || 0;
    const completionRate = funnel.enrolled > 0 ? Math.round((funnel.finished / funnel.enrolled) * 100) : 0;

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-10">
                <p
                    className="py-14 text-center"
                    style={{ fontFamily: 'var(--font-serif)', color: MUTED }}
                >
                    Reading the numbers.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
            <Helmet><title>Analytics · Orbit Mentor</title></Helmet>

            <div className="mb-3">
                <MentorBackLink to="/mentor/observatory">Observatory</MentorBackLink>
            </div>

            <header className="pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} style={{ color: MUTED }} />
                    <MentorEyebrow>Mentor · The Readings</MentorEyebrow>
                </div>
                <MentorTitle size="xl">How your teaching lands</MentorTitle>
                <div className="mt-3 max-w-2xl">
                    <MentorDeck>
                        Not vanity numbers. Where learners stop is the one figure that tells you
                        which lesson to rewrite.
                    </MentorDeck>
                </div>
            </header>

            {courseStats.length === 0 ? (
                <section className="py-14">
                    <MentorTitle size="md">No readings yet</MentorTitle>
                    <div className="mt-3 max-w-lg">
                        <MentorDeck>
                            Publish a course and enrol your first learner. The funnel and the
                            drop-off chart fill themselves from there.
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
                    <SectionBoundary name="The funnel">
                        <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                            <div className="flex items-baseline gap-3 mb-4">
                                <MentorEyebrow>I</MentorEyebrow>
                                <MentorTitle size="md">The funnel</MentorTitle>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${HAIRLINE}` }}>
                                <MentorStat label="Enrolled" value={funnel.enrolled} />
                                <MentorStat label="Started" value={funnel.started} />
                                <MentorStat label="Past halfway" value={funnel.halfway} />
                                <MentorStat label="Finished" value={funnel.finished} tone="success" last />
                            </div>
                            <p
                                className="mt-4"
                                style={{ fontFamily: 'var(--font-serif)', color: MUTED, fontSize: '0.98rem' }}
                            >
                                {completionRate}% of everyone who enrolled has finished.
                                {funnel.enrolled > funnel.started
                                    ? ` ${funnel.enrolled - funnel.started} never opened a lesson.`
                                    : ' Everyone who enrolled has at least started.'}
                            </p>
                        </section>
                    </SectionBoundary>

                    <SectionBoundary name="Where they stop">
                        <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                            <div className="flex items-baseline gap-3 mb-1">
                                <MentorEyebrow>II</MentorEyebrow>
                                <MentorTitle size="md">Where they stop</MentorTitle>
                            </div>
                            <div className="mb-5 max-w-xl">
                                <MentorDeck style={{ fontSize: '0.98rem' }}>
                                    Each bar counts the learners whose furthest completed lesson is this
                                    one. A tall bar is where attention breaks.
                                </MentorDeck>
                            </div>

                            {dropOff.length === 0 ? (
                                <p style={{ fontFamily: 'var(--font-serif)', color: MUTED }}>
                                    Nobody is stalled mid-course. Either everyone is finishing, or nobody
                                    has started.
                                </p>
                            ) : (
                                <div>
                                    {dropOff.map((l) => (
                                        <div
                                            key={`${l.courseId}-${l.lessonId}`}
                                            className="py-3"
                                            style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}
                                        >
                                            <div className="flex items-baseline gap-3">
                                                <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                                                    {String(l.order || 0).padStart(2, '0')}
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--font-serif)',
                                                        fontSize: '1.02rem',
                                                        color: 'var(--text-primary)',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {l.title}
                                                </span>
                                                <MentorDotLeader />
                                                <span
                                                    style={{
                                                        ...MONO_MICRO,
                                                        color: 'rgba(251,191,36,1)',
                                                        fontVariantNumeric: 'tabular-nums',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {l.stalled} stalled
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-3">
                                                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.08)' }}>
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            width: `${worstStall ? (l.stalled / worstStall) * 100 : 0}%`,
                                                            background: 'rgba(251,191,36,0.75)',
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)', fontSize: '0.52rem' }}>
                                                    {l.courseTitle}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 flex items-center gap-2">
                                        <TrendingDown size={12} style={{ color: 'rgba(251,191,36,1)' }} />
                                        <span style={{ ...MONO_MICRO, color: MUTED }}>
                                            Rewrite the top bar first
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>
                    </SectionBoundary>

                    <SectionBoundary name="Revenue">
                        <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                            <div className="flex items-baseline gap-3 mb-4">
                                <MentorEyebrow>III</MentorEyebrow>
                                <MentorTitle size="md">Revenue</MentorTitle>
                            </div>
                            <div className="grid grid-cols-3" style={{ border: `1px solid ${HAIRLINE}` }}>
                                <MentorStat label="Lifetime" value={`₹${formatInr(earnings.totalInr)}`} tone="success" />
                                <MentorStat label="Released" value={`₹${formatInr(earnings.releasedInr)}`} />
                                <MentorStat label="Pending" value={`₹${formatInr(earnings.pendingInr)}`} tone="warning" last />
                            </div>
                            <p
                                className="mt-4"
                                style={{ fontFamily: 'var(--font-serif)', color: MUTED, fontSize: '0.98rem' }}
                            >
                                Session earnings only. Course pricing is displayed but not yet billed.
                            </p>
                        </section>
                    </SectionBoundary>

                    <SectionBoundary name="By course">
                        <section className="py-8">
                            <div className="flex items-baseline gap-3 mb-5">
                                <MentorEyebrow>IV</MentorEyebrow>
                                <MentorTitle size="md">By course</MentorTitle>
                            </div>
                            {courseStats.map((c) => (
                                <div key={c._id} className="py-4" style={{ borderBottom: `1px solid ${HAIRLINE_SOFT}` }}>
                                    <div className="flex items-baseline gap-3">
                                        <Link
                                            to={`/mentor/courses/${c._id}/edit`}
                                            style={{
                                                fontFamily: 'var(--font-editorial)',
                                                fontWeight: 700,
                                                fontSize: '1.18rem',
                                                letterSpacing: '-0.02em',
                                                color: 'var(--text-primary)',
                                                textDecoration: 'none',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {c.title}
                                        </Link>
                                        <MentorDotLeader />
                                        <span style={{ ...MONO_MICRO, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                                            {c.enrolled} enrolled
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                                            {c.lessonsCount} lesson{c.lessonsCount === 1 ? '' : 's'}
                                        </span>
                                        <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)' }}>·</span>
                                        <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                                            {c.started} started
                                        </span>
                                        <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.40)' }}>·</span>
                                        <span style={{ ...MONO_MICRO, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
                                            {c.halfway} past half
                                        </span>
                                        {c.finished > 0 && <MentorTag tone="success">{c.finished} finished</MentorTag>}
                                        {c.enrolled === 0 && <MentorTag tone="neutral">No learners</MentorTag>}
                                    </div>
                                </div>
                            ))}
                        </section>
                    </SectionBoundary>
                </>
            )}
        </div>
    );
};

export default Analytics;
