import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Video, IndianRupee, Clock, ListChecks, User } from 'lucide-react';
import api from '../../services/api';
import ErrorState from '../../components/common/ErrorState';
import { describeApiError } from '../../services/apiError';
import EmptyState from '../../components/common/EmptyState';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import { useNow } from '../../hooks/useNow';
import { StudioMasthead, StudioPanel, Reveal } from '../../soul/studio/surfaces';
import { MentorTag } from '../../components/pact/MentorEditorial';

const STATUS_TONE = {
    pending_payment: 'warning',
    booked:          'accent',
    confirmed:       'success',
    live:            'danger',
    completed:       'neutral',
    cancelled:       'neutral',
    no_show:         'warning',
    disputed:        'danger',
};

const MentorSessions = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming';
    const setTab = (next) => {
        if (next === tab) return;
        setSearchParams(next === 'past' ? { tab: 'past' } : {}, { replace: true });
    };

    const { data: sessions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['sessions', 'mentor', 'bookings'],
        queryFn: () => api.get('/sessions/mentor/bookings').then((r) => r.data?.items || []),
        refetchInterval: 60_000,
    });

    const now = useNow();
    const { upcoming, past } = useMemo(() => {
        const up = [];
        const pa = [];
        for (const s of sessions) {
            const at = new Date(s.scheduledAt).getTime();
            const terminal = ["completed", "cancelled", "no_show", "disputed"].includes(s.status);
            if (terminal || at < now) pa.push(s); else up.push(s);
        }
        up.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        pa.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
        return { upcoming: up, past: pa };
    }, [sessions, now]);

    const list = tab === "upcoming" ? upcoming : past;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>My Sessions · Orbit Mentor</title></Helmet>

                <StudioMasthead
                    eyebrow="Mentor · My Sessions"
                    Icon={ListChecks}
                    title="Your bookings"
                    deck="Students who have booked you, sorted by time."
                >
                    <div className="text-right">
                        <div
                            className="font-mono uppercase"
                            style={{ fontSize: '0.54rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}
                        >
                            Upcoming
                        </div>
                        <div
                            className="mt-1 tabular-nums"
                            style={{
                                fontFamily: 'var(--font-display)', fontWeight: 800,
                                fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1,
                                letterSpacing: '-0.035em', color: 'var(--text-primary)',
                            }}
                        >
                            {String(upcoming.length).padStart(2, '0')}
                        </div>
                    </div>
                </StudioMasthead>

                <div className="flex gap-2 mb-6 mt-6">
                    {[
                        { key: "upcoming", label: `Upcoming · ${upcoming.length}` },
                        { key: "past",     label: `Past · ${past.length}` },
                    ].map((t) => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className="font-mono uppercase transition-all duration-200"
                                style={{
                                    fontSize: '0.60rem',
                                    letterSpacing: '0.20em',
                                    fontWeight: 700,
                                    borderRadius: 999,
                                    padding: '9px 16px',
                                    cursor: 'pointer',
                                    color: active ? '#0d0c1c' : 'rgba(245,245,245,0.60)',
                                    background: active ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.10)'}`,
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <StudioPanel key={i} radius={18} className="p-4 h-20 skeleton" />
                        ))}
                    </div>
                ) : error ? (
                    <ErrorState message="Couldn't load your bookings" detail={describeApiError(error)} onRetry={refetch} />
                ) : list.length === 0 ? (
                    <EmptyState
                        icon={<Calendar className="w-10 h-10" />}
                        title={tab === "upcoming" ? "No upcoming bookings" : "No past sessions yet"}
                        message={tab === "upcoming"
                            ? "When a student books you, it shows up here."
                            : "Completed sessions appear here for your records."}
                    />
                ) : (
                    <ul className="space-y-3">
                        {list.map((s, idx) => {
                            const tone = STATUS_TONE[s.status] || 'neutral';
                            const studentName = s.student?.name || "Student";
                            const studentId = s.studentId;
                            return (
                                <li key={s._id}>
                                    <Reveal index={idx}>
                                        <StudioPanel radius={18} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <MentorTag tone={tone}>{s.status.replace("_", " ")}</MentorTag>
                                                    <span
                                                        className="truncate"
                                                        style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(245,245,245,0.55)' }}
                                                    >
                                                        with {studentName}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        fontFamily: 'var(--font-display)', fontWeight: 700,
                                                        fontSize: '1rem', letterSpacing: '-0.015em',
                                                        color: 'var(--text-primary)',
                                                    }}
                                                >
                                                    {new Date(s.scheduledAt).toLocaleString()}
                                                </div>
                                                <div
                                                    className="font-mono flex items-center gap-3 mt-1 flex-wrap"
                                                    style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.55)' }}
                                                >
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMin} min</span>
                                                    <span className="flex items-center gap-1 tabular-nums"><IndianRupee className="w-3 h-3" />{s.totalInr}</span>
                                                    {s.status === "completed" && (
                                                        <span className="flex items-center gap-1 tabular-nums" style={{ color: 'rgba(110,231,183,1)' }}>
                                                            <IndianRupee className="w-3 h-3" />{s.mentorPayoutInr} payout
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                {["booked", "confirmed", "live"].includes(s.status) && (
                                                    <Link
                                                        to={`/student/room/${s._id}`}
                                                        className="inline-flex items-center gap-1.5 font-mono uppercase"
                                                        style={{
                                                            fontSize: '0.58rem', letterSpacing: '0.18em', fontWeight: 700,
                                                            color: '#0d0c1c', background: 'var(--studio-gradient)',
                                                            borderRadius: 999, padding: '9px 14px', textDecoration: 'none',
                                                        }}
                                                    >
                                                        <Video className="w-3.5 h-3.5" /> Join
                                                    </Link>
                                                )}
                                                {s.status === "completed" && studentId && (
                                                    <Link
                                                        to={`/profile/${studentId}`}
                                                        className="inline-flex items-center gap-1.5 font-mono uppercase"
                                                        style={{
                                                            fontSize: '0.58rem', letterSpacing: '0.18em', fontWeight: 700,
                                                            color: 'rgba(245,245,245,0.75)', background: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(255,255,255,0.12)',
                                                            borderRadius: 999, padding: '9px 14px', textDecoration: 'none',
                                                        }}
                                                    >
                                                        <User className="w-3.5 h-3.5" /> Profile
                                                    </Link>
                                                )}
                                            </div>
                                        </StudioPanel>
                                    </Reveal>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MentorSessions;
