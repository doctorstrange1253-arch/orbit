import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    IndianRupee, Wallet, AlertCircle,
    Calendar, ArrowRight, Hourglass, CalendarDays,
} from 'lucide-react';
import api from '../../services/api';
import ErrorState from '../../components/common/ErrorState';
import { describeApiError } from '../../services/apiError';
import EmptyState from '../../components/common/EmptyState';
import {
    MentorEyebrow,
    MentorStat,
    MentorTag,
} from '../../components/pact/MentorEditorial';
import { StudioMasthead, StudioPanel } from '../../soul/studio/surfaces';

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

const formatInr = (n) => {
    const v = Number(n) || 0;
    return v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const Earnings = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['sessions', 'mentor', 'me'],
        queryFn: () => api.get('/sessions/mentor/me').then((r) => r.data),
        staleTime: 30_000,
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ['sessions', 'mentor', 'bookings'],
        queryFn: () => api.get('/sessions/mentor/bookings').then((r) => r.data?.items || []),
        enabled: !!data?.profile && data.profile.applicationStatus === 'approved',
        staleTime: 60_000,
    });

    const thisMonth = useMemo(() => {
        if (!Array.isArray(bookings)) return 0;
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return bookings
            .filter((s) => s.status === 'completed' && new Date(s.scheduledAt) >= start)
            .reduce((sum, s) => sum + (Number(s.mentorPayoutInr) || 0), 0);
    }, [bookings]);

    const monthSeries = useMemo(() => {
        const buckets = [0, 0, 0, 0, 0, 0];
        if (!Array.isArray(bookings)) return buckets;
        const now = new Date();
        const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth();
        const nowIdx = monthIndex(now);
        for (const s of bookings) {
            if (s.status !== 'completed') continue;
            const at = new Date(s.scheduledAt);
            const back = nowIdx - monthIndex(at);
            if (back < 0 || back > 5) continue;
            buckets[5 - back] += Number(s.mentorPayoutInr) || 0;
        }
        return buckets;
    }, [bookings]);

    const recent = useMemo(() => {
        return (bookings || [])
            .filter((s) => s.status === 'completed')
            .slice(0, 8);
    }, [bookings]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
                <div className="py-12 text-center">
                    <span
                        style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'rgba(245,245,245,0.55)',
                        }}
                    >
                        Reading the ledger.
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10">
                <ErrorState message="Couldn't load your earnings" detail={describeApiError(error)} onRetry={refetch} />
            </div>
        );
    }

    const profile = data?.profile;
    const earnings = data?.earnings || { totalInr: 0, pendingInr: 0, releasedInr: 0 };
    const isPending = profile && profile.applicationStatus !== 'approved';

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
            <Helmet><title>Earnings · Orbit Mentor</title></Helmet>

            <StudioMasthead
                eyebrow="Mentor · The Ledger"
                Icon={Wallet}
                title="What you have earned"
                deck="Paid out after each session completes. Pending clears within 24 hours."
            >
                {profile && !isPending && (
                    <div className="text-right">
                        <div
                            className="font-mono uppercase"
                            style={{ fontSize: '0.54rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}
                        >
                            Lifetime
                        </div>
                        <div
                            className="mt-1 tabular-nums"
                            style={{
                                fontFamily: 'var(--font-display)', fontWeight: 800,
                                fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1,
                                letterSpacing: '-0.035em', color: 'var(--text-primary)',
                            }}
                        >
                            ₹{formatInr(earnings.totalInr)}
                        </div>
                    </div>
                )}
            </StudioMasthead>

            {!profile || isPending ? (
                <StudioPanel radius={22} as={motion.section} className="text-center overflow-hidden"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ padding: '40px 24px' }}
                >
                    <span
                        className="inline-flex items-center justify-center"
                        style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: 'color-mix(in oklab, var(--studio-from) 16%, transparent)',
                            border: '1px solid color-mix(in oklab, var(--studio-from) 30%, transparent)',
                            color: 'var(--studio-from)',
                        }}
                    >
                        <AlertCircle size={24} />
                    </span>
                    <h2
                        className="mt-4"
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: '1.6rem',
                            letterSpacing: '-0.03em',
                            color: 'var(--text-primary)',
                        }}
                    >
                        No earnings yet
                    </h2>
                    <p
                        className="mt-2 max-w-md mx-auto"
                        style={{
                            fontFamily: 'var(--font-sans)',
                            color: 'rgba(245,245,245,0.62)',
                            fontSize: '0.95rem',
                            lineHeight: 1.6,
                        }}
                    >
                        {isPending
                            ? "Your mentor application is still being reviewed. Earnings show up here once you are approved."
                            : "Apply to become a mentor to start earning from 1-on-1 video sessions."}
                    </p>
                    <Link
                        to="/mentor/hub"
                        className="inline-flex items-center gap-2 mt-6 font-mono uppercase"
                        style={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.20em',
                            fontWeight: 700,
                            color: '#0d0c1c',
                            background: 'var(--studio-gradient)',
                            borderRadius: 999,
                            padding: '11px 18px',
                            textDecoration: 'none',
                        }}
                    >
                        Go to Mentor Hub <ArrowRight size={11} />
                    </Link>
                </StudioPanel>
            ) : (
                <>
                    <motion.section
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="mb-3">
                            <MentorEyebrow>I · The Totals</MentorEyebrow>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <MentorStat
                                index={0}
                                Icon={Wallet}
                                label="Lifetime"
                                value={`₹${formatInr(earnings.totalInr)}`}
                                tone="success"
                                hint="Everything you have ever earned"
                            />
                            <MentorStat
                                index={1}
                                Icon={Hourglass}
                                label="Pending payout"
                                value={`₹${formatInr(earnings.pendingInr)}`}
                                tone="warning"
                                hint="Sitting in escrow until release"
                            />
                            <MentorStat
                                index={2}
                                Icon={CalendarDays}
                                label="This month"
                                value={`₹${formatInr(thisMonth)}`}
                                tone="accent"
                                hint={monthSeries.some(Boolean) ? 'Last six months' : 'Nothing settled this month'}
                                series={monthSeries}
                            />
                        </div>
                        {profile.payoutMultiplier && profile.payoutMultiplier !== 1 && (
                            <div
                                className="mt-4 pt-4 flex items-center gap-2 font-mono uppercase"
                                style={{
                                    fontSize: '0.62rem',
                                    letterSpacing: '0.20em',
                                    fontWeight: 700,
                                    color: 'rgba(245,245,245,0.55)',
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <span>Payout multiplier</span>
                                <span
                                    style={{
                                        fontFamily: 'var(--font-editorial)',
                                        fontSize: '1.2rem',
                                        color: 'var(--text-primary)',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {(profile.payoutMultiplier * 100).toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                    >
                        <div className="mb-3">
                            <MentorEyebrow>II · Released vs Pending</MentorEyebrow>
                        </div>
                        <StudioPanel radius={18} style={{ padding: '20px 22px' }}>
                            <div className="h-3 overflow-hidden flex" style={{ borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
                                {(() => {
                                    const total = Math.max(1, earnings.totalInr);
                                    const releasedPct = (earnings.releasedInr / total) * 100;
                                    return (
                                        <>
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${releasedPct}%`,
                                                    background: 'rgba(110,231,183,1)',
                                                }}
                                            />
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${100 - releasedPct}%`,
                                                    background: 'rgba(251,191,36,1)',
                                                }}
                                            />
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center justify-between mt-3 font-mono uppercase" style={{ fontSize: '0.60rem', letterSpacing: '0.20em', fontWeight: 700 }}>
                                <div className="flex items-center gap-2" style={{ color: 'rgba(110,231,183,1)' }}>
                                    <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(110,231,183,1)' }} />
                                    Released · ₹{formatInr(earnings.releasedInr)}
                                </div>
                                <div className="flex items-center gap-2" style={{ color: 'rgba(251,191,36,1)' }}>
                                    Pending · ₹{formatInr(earnings.pendingInr)}
                                    <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(251,191,36,1)' }} />
                                </div>
                            </div>
                        </StudioPanel>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="flex items-end justify-between mb-3 gap-3 flex-wrap">
                            <div>
                                <MentorEyebrow>III · Recent Payouts</MentorEyebrow>
                                <div
                                    className="mt-1.5"
                                    style={{
                                        fontFamily: 'var(--font-display)', fontWeight: 800,
                                        fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', lineHeight: 1.1,
                                        letterSpacing: '-0.03em', color: 'var(--text-primary)',
                                    }}
                                >
                                    Completed sessions
                                </div>
                            </div>
                            <Link
                                to="/mentor/sessions"
                                className="font-mono uppercase inline-flex items-center gap-1.5"
                                style={{
                                    fontSize: '0.60rem',
                                    letterSpacing: '0.22em',
                                    fontWeight: 700,
                                    color: 'rgba(245,245,245,0.45)',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid rgba(255,255,255,0.20)',
                                    paddingBottom: 3,
                                }}
                            >
                                All sessions <ArrowRight size={9} />
                            </Link>
                        </div>
                        {recent.length === 0 ? (
                            <StudioPanel radius={18} style={{ padding: '8px 22px' }}>
                                <EmptyState
                                    icon={<Calendar className="w-8 h-8" />}
                                    title="No completed sessions yet"
                                    message="Once a student finishes a session with you, the payout will appear here."
                                />
                            </StudioPanel>
                        ) : (
                            <StudioPanel radius={18} style={{ padding: '0 22px' }}>
                                <ul>
                                    {recent.map((s) => {
                                        const tone = STATUS_TONE[s.status] || 'neutral';
                                        return (
                                            <li
                                                key={s._id}
                                                className="flex items-center gap-3 py-3"
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MentorTag tone={tone}>{s.status.replace("_", " ")}</MentorTag>
                                                    </div>
                                                    <div
                                                        className="truncate"
                                                        style={{
                                                            fontFamily: 'var(--font-display)',
                                                            fontWeight: 700,
                                                            fontSize: '1rem',
                                                            letterSpacing: '-0.015em',
                                                            color: 'var(--text-primary)',
                                                        }}
                                                    >
                                                        {s.student?.name || "Student"}
                                                    </div>
                                                    <div
                                                        className="font-mono mt-0.5 flex items-center gap-2"
                                                        style={{ fontSize: '0.78rem', color: 'rgba(245,245,245,0.55)' }}
                                                    >
                                                        <span>{new Date(s.scheduledAt).toLocaleDateString()}</span>
                                                        <span style={{ color: 'rgba(245,245,245,0.30)' }}>·</span>
                                                        <span>{s.durationMin} min</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className="font-mono tabular-nums flex items-center justify-end gap-0.5"
                                                        style={{ fontSize: '1.05rem', fontWeight: 700, color: 'rgba(110,231,183,1)' }}
                                                    >
                                                        <IndianRupee size={12} />
                                                        {formatInr(s.mentorPayoutInr)}
                                                    </div>
                                                    <div
                                                        className="font-mono mt-0.5"
                                                        style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.45)' }}
                                                    >
                                                        of ₹{formatInr(s.totalInr)}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </StudioPanel>
                        )}
                    </motion.section>
                </>
            )}
        </div>
    );
};

export default Earnings;
