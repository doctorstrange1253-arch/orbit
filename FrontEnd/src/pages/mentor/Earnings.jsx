/**
 * Earnings.jsx — Mentor window → /mentor/earnings.
 *
 * Reads GET /api/sessions/mentor/me which returns:
 *   { profile: MentorProfile, earnings: { totalInr, pendingInr, releasedInr } }
 *
 * Three surfaces:
 *   1. Hero summary card — lifetime / pending / released totals, payout
 *      multiplier, and a "this month" stat when sessions exist.
 *   2. Recent bookings ledger — same data as /mentor/sessions, but rendered
 *      with a money-forward lens (rateInr / mentorPayoutInr columns).
 *   3. Empty / not-approved states — when the user has no MentorProfile yet
 *      (or it's not approved) we point them at /mentor/hub instead of
 *      leaving the page blank.
 *
 * Themed to match the rest of the Sessions surface: FuturisticBackdrop,
 * glass-card-glow panels, gradient-text title, semantic token colors.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    IndianRupee, TrendingUp, Wallet, Clock, AlertCircle,
    Calendar, Video, ArrowRight, ListChecks,
} from 'lucide-react';
import api from '../../services/api';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import HolographicCard from '../../components/fx/HolographicCard';

const STATUS_PILL = {
    pending_payment: "bg-warning/10 text-warning border border-warning/30",
    booked:          "bg-info/10 text-info border border-info/30",
    confirmed:       "bg-success/10 text-success border border-success/30",
    live:            "bg-danger/10 text-danger border border-danger/30",
    completed:       "bg-surface text-text-secondary border border-border-subtle",
    cancelled:       "bg-surface text-text-muted border border-border-subtle",
    no_show:         "bg-warning/10 text-warning border border-warning/30",
    disputed:        "bg-danger/10 text-danger border border-danger/30",
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

    // Recent completed sessions for the ledger section. We only need a
    // small slice (most recent 8 completed bookings) — the full list lives
    // at /mentor/sessions. The Earnings page is the money-forward view of
    // the same data.
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

    const recent = useMemo(() => {
        return (bookings || [])
            .filter((s) => s.status === 'completed')
            .slice(0, 8);
    }, [bookings]);

    // Empty / not-approved state. The Earnings page is only meaningful once
    // the user is an approved mentor; otherwise we redirect them to the
    // hub where they can apply.
    if (isLoading) {
        return (
            <div className="relative min-h-screen overflow-hidden">
                <FuturisticBackdrop />
                <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-14 space-y-4">
                    <div className="glass-card-glow p-6 h-32 skeleton rounded-2xl" />
                    <div className="glass-card-glow p-6 h-48 skeleton rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative min-h-screen overflow-hidden">
                <FuturisticBackdrop />
                <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-14">
                    <ErrorState message="Couldn't load your earnings" onRetry={refetch} />
                </div>
            </div>
        );
    }

    const profile = data?.profile;
    const earnings = data?.earnings || { totalInr: 0, pendingInr: 0, releasedInr: 0 };
    const isApproved = profile && profile.applicationStatus === 'approved';
    const isPending = profile && profile.applicationStatus !== 'approved';

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>Earnings · Orbit Mentor</title></Helmet>

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                        <Wallet className="w-3 h-3 text-accent" /> Mentor earnings
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">
                        <span className="gradient-text">What you've earned.</span>
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Paid out after each session completes. Pending clears within 24 hours.
                    </p>
                </motion.header>

                {!profile || isPending ? (
                    <motion.section
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="glass-card-glow p-6 md:p-8 text-center"
                    >
                        <AlertCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
                        <h2 className="text-xl font-bold mb-2">No earnings yet</h2>
                        <p className="text-sm text-text-secondary mb-5">
                            {isPending
                                ? "Your mentor application is still being reviewed. Earnings show up here once you're approved."
                                : "Apply to become a mentor to start earning from 1-on-1 video sessions."}
                        </p>
                        <Link
                            to="/mentor/hub"
                            className="inline-flex items-center gap-2 btn-gradient px-5 py-2.5 rounded-lg text-sm font-semibold"
                        >
                            Go to Mentor Hub <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.section>
                ) : (
                    <>
                        {/* ── Summary card ──────────────────────────────────────── */}
                        <HolographicCard
                            rarity="epic"
                            tilt
                            className="p-5 md:p-6 mb-5"
                        >
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatTile
                                    label="Lifetime"
                                    value={formatInr(earnings.totalInr)}
                                    Icon={TrendingUp}
                                    tone="text-success"
                                />
                                <StatTile
                                    label="Pending payout"
                                    value={formatInr(earnings.pendingInr)}
                                    Icon={Clock}
                                    tone="text-warning"
                                />
                                <StatTile
                                    label="This month"
                                    value={formatInr(thisMonth)}
                                    Icon={IndianRupee}
                                    tone="text-accent"
                                />
                            </div>
                            {profile.payoutMultiplier && profile.payoutMultiplier !== 1 && (
                                <div className="mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted flex items-center gap-2">
                                    <ListChecks className="w-3.5 h-3.5" />
                                    Payout multiplier: <span className="font-semibold text-text-primary">{(profile.payoutMultiplier * 100).toFixed(0)}%</span>
                                </div>
                            )}
                        </motion.section>
                        </HolographicCard>

                        {/* ── Released split ───────────────────────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 }}
                            className="glass-card-glow p-5 md:p-6 mb-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
                                    Released vs pending
                                </h2>
                                <span className="text-xs text-text-muted">Lifetime totals</span>
                            </div>
                            <div className="h-3 rounded-full bg-surface overflow-hidden flex">
                                {(() => {
                                    const total = Math.max(1, earnings.totalInr);
                                    const releasedPct = (earnings.releasedInr / total) * 100;
                                    return (
                                        <>
                                            <div
                                                className="bg-success h-full transition-all"
                                                style={{ width: `${releasedPct}%` }}
                                            />
                                            <div
                                                className="bg-warning h-full transition-all"
                                                style={{ width: `${100 - releasedPct}%` }}
                                            />
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs">
                                <div className="flex items-center gap-1.5 text-text-secondary">
                                    <span className="w-2 h-2 rounded-full bg-success" />
                                    Released · ₹{formatInr(earnings.releasedInr)}
                                </div>
                                <div className="flex items-center gap-1.5 text-text-secondary">
                                    Pending · ₹{formatInr(earnings.pendingInr)}
                                    <span className="w-2 h-2 rounded-full bg-warning" />
                                </div>
                            </div>
                        </motion.section>

                        {/* ── Recent completed bookings ledger ─────────────────── */}
                        <motion.section
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="glass-card-glow p-5 md:p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
                                    Recent payouts
                                </h2>
                                <Link
                                    to="/mentor/sessions"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                                >
                                    All sessions <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            {recent.length === 0 ? (
                                <EmptyState
                                    icon={<Calendar className="w-8 h-8" />}
                                    title="No completed sessions yet"
                                    message="Once a student finishes a session with you, the payout will appear here."
                                />
                            ) : (
                                <ul className="space-y-2.5">
                                    {recent.map((s) => {
                                        const pillClass = STATUS_PILL[s.status] || STATUS_PILL.completed;
                                        return (
                                            <li
                                                key={s._id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-surface/40 border border-border-subtle"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-[10px] text-text-muted mb-0.5">
                                                        <span className={`px-2 py-0.5 rounded-pill text-[9px] uppercase tracking-widest font-bold ${pillClass}`}>
                                                            {s.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-sm text-text-primary truncate">
                                                        {s.student?.name || "Student"}
                                                    </div>
                                                    <div className="text-[11px] text-text-secondary flex items-center gap-2 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(s.scheduledAt).toLocaleDateString()}
                                                        <span className="text-text-muted">·</span>
                                                        <Video className="w-3 h-3" />
                                                        {s.durationMin} min
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-success flex items-center justify-end gap-0.5">
                                                        <IndianRupee className="w-3 h-3" />
                                                        {formatInr(s.mentorPayoutInr)}
                                                    </div>
                                                    <div className="text-[10px] text-text-muted">
                                                        of ₹{formatInr(s.totalInr)}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </motion.section>
                    </>
                )}
            </div>
        </div>
    );
};

const StatTile = ({ label, value, Icon, tone }) => (
    <div className="rounded-xl border border-border-subtle bg-surface/40 p-4">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                {label}
            </span>
            {Icon && <Icon className={`w-4 h-4 ${tone || 'text-text-secondary'}`} />}
        </div>
        <div className="text-2xl font-black text-text-primary flex items-center gap-0.5">
            <IndianRupee className="w-4 h-4" />
            {value}
        </div>
    </div>
);

export default Earnings;
