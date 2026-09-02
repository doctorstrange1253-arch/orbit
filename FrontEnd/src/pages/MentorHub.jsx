/**
 * MentorHub.jsx — mentor-side dashboard at /mentor/hub.
 *
 * Single page, 5 application states driven by GET /api/sessions/mentor/me:
 *
 *   not_applied → Big pitch + the application form. CTA = submit form.
 *   submitted   → "Under review" + read-only summary of submitted fields.
 *   approved    → Earnings / rating / upcoming bookings dashboard.
 *   rejected    → Rejection reason + re-apply form pre-filled from prior.
 *   suspended   → Suspension reason + appeal instructions.
 *
 * V3 — fully editorial. The masthead uses Playfair Display italic.
 * The state panels drop glass-card-glow and HolographicCard for a
 * 1px-hairline treatment that reads like a private-club roster.
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    GraduationCap, Clock, Star, IndianRupee, Calendar, Loader,
    CheckCircle, XCircle, PauseCircle, IndianRupee as RupeeIcon, Edit3,
    Eye, BookOpen, MessageSquare, ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import MentorApplicationForm from '../components/mentor/MentorApplicationForm';
import AvailabilityEditor from '../components/sessions/AvailabilityEditor';
import { useAuthStore } from '../store/authStore';
import PactPulse from '../components/pact/PactPulse';
import RivalWatch from '../components/pact/RivalWatch';
import PactBadge from '../components/pact/PactBadge';
import {
    MentorEyebrow,
    MentorTitle,
    MentorDeck,
    MentorStat,
    MentorTag,
} from '../components/pact/MentorEditorial';

const STATE_META = {
    not_applied: {
        title: "Become a mentor.",
        sub: "Earn from your expertise. Set your own hours, your own rate.",
        chip: "Not yet applied",
        tone: "neutral",
    },
    submitted: {
        title: "Application under review.",
        sub: "Our team usually reviews within 24–48 hours. We'll ping you here.",
        chip: "Pending review",
        tone: "warning",
    },
    approved: {
        title: "You're live.",
        sub: "Students can book you right now. Your earnings update after each session completes.",
        chip: "Live mentor",
        tone: "success",
    },
    rejected: {
        title: "Not approved this time.",
        sub: "Update your application based on the feedback below and re-submit.",
        chip: "Application declined",
        tone: "danger",
    },
    suspended: {
        title: "Account suspended.",
        sub: "Reach out to the team to appeal and get back online.",
        chip: "Suspended",
        tone: "danger",
    },
};

const MentorHub = () => {
    const qc = useQueryClient();
    const userRoles = useAuthStore((s) => s.user?.roles) || [];
    const hasStudentRole = userRoles.includes('student');
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['sessions', 'mentor', 'me'],
        queryFn: () => api.get('/sessions/mentor/me').then((r) => r.data),
        staleTime: 30_000,
    });

    const { data: bookingsData } = useQuery({
        queryKey: ['sessions', 'mentor', 'bookings'],
        queryFn: () => api.get('/sessions/mentor/bookings').then((r) => r.data),
        enabled: !!data?.profile && data.profile.applicationStatus === 'approved',
        staleTime: 60_000,
    });

    const state = useMemo(() => {
        if (!data) return "loading";
        if (!data.profile) return "not_applied";
        return data.profile.applicationStatus || "submitted";
    }, [data]);

    const meta = STATE_META[state] || STATE_META.not_applied;
    const profile = data?.profile || null;
    const earnings = data?.earnings || { totalInr: 0, pendingInr: 0, releasedInr: 0 };
    const bookings = bookingsData?.items || [];
    const upcomingBookings = bookings
        .filter((b) => ["booked", "confirmed", "live"].includes(b.status) && new Date(b.scheduledAt).getTime() > Date.now())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    return (
        <div className="space-y-10">
            <Helmet><title>Teach · Orbit</title></Helmet>

            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <GraduationCap size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
                    <MentorEyebrow>Teach on Orbit</MentorEyebrow>
                </div>
                <MentorTitle size="xl">{meta.title}</MentorTitle>
                <div className="mt-2 max-w-2xl">
                    <MentorDeck>{meta.sub}</MentorDeck>
                </div>
                {profile && (
                    <div className="mt-5">
                        <MentorTag tone={meta.tone}>
                            {state === "approved" && (
                                <span
                                    className="rounded-full"
                                    style={{
                                        width: 6,
                                        height: 6,
                                        background: 'var(--success)',
                                        display: 'inline-block',
                                        marginRight: 6,
                                        boxShadow: '0 0 6px var(--success)',
                                    }}
                                />
                            )}
                            {meta.chip}
                        </MentorTag>
                    </div>
                )}
            </motion.header>

            {isLoading ? (
                <div className="py-12 text-center">
                    <Loader className="w-4 h-4 inline-block animate-spin mr-2" />
                    <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.55)' }}>
                        Reading your mentor profile.
                    </span>
                </div>
            ) : error ? (
                <ErrorState message="Couldn't load your mentor profile" onRetry={refetch} />
            ) : state === "not_applied" ? (
                <NotAppliedView />
            ) : state === "submitted" ? (
                <PendingView profile={profile} />
            ) : state === "approved" ? (
                <ApprovedView
                    profile={profile}
                    earnings={earnings}
                    upcomingBookings={upcomingBookings}
                    onRefresh={() => {
                        qc.invalidateQueries({ queryKey: ['sessions', 'mentor', 'me'] });
                        qc.invalidateQueries({ queryKey: ['sessions', 'mentor', 'bookings'] });
                    }}
                />
            ) : state === "rejected" ? (
                <RejectedView profile={profile} />
            ) : state === "suspended" ? (
                <SuspendedView profile={profile} />
            ) : null}
        </div>
    );
};

// ── State views ────────────────────────────────────────────────────────────

const Panel = ({ tone = 'neutral', children, className = '', style = {} }) => {
    const topColor =
        tone === 'warning' ? 'rgba(251,191,36,0.45)' :
        tone === 'danger'  ? 'rgba(252,165,165,0.45)' :
        tone === 'success' ? 'rgba(110,231,183,0.45)' :
        'rgba(255,255,255,0.20)';
    return (
        <div
            className={className}
            style={{
                border: '1px solid rgba(255,255,255,0.10)',
                borderTop: `1px solid ${topColor}`,
                padding: '20px 22px',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

const NotAppliedView = () => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid lg:grid-cols-[1fr,1fr] gap-6"
    >
        <Panel>
            <MentorEyebrow>I · Why Mentor</MentorEyebrow>
            <div className="mt-2.5">
                <MentorTitle size="md">A quiet practice</MentorTitle>
            </div>
            <ul className="mt-5 space-y-4">
                <Bullet Icon={RupeeIcon} title="Keep 85% of every session" body="The payout multiplier rises to 90% once you have held a 4.8★ across 20+ ratings." />
                <Bullet Icon={Calendar} title="You set your own hours" body="Tune a weekly availability grid in UTC. No minimums, no quotas." />
                <Bullet Icon={Edit3} title="Escrow is handled for you" body="Razorpay holds the money; you are paid automatically on session completion." />
                <Bullet Icon={MessageSquare} title="Built-in messaging" body="Chat with students before the session using the same inbox you already use." />
            </ul>
        </Panel>
        <Panel>
            <MentorEyebrow>II · Apply</MentorEyebrow>
            <div className="mt-2.5 mb-4">
                <MentorTitle size="md">Tell us about your work</MentorTitle>
            </div>
            <MentorApplicationForm />
        </Panel>
    </motion.div>
);

const PendingView = ({ profile }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
    >
        <Panel tone="warning">
            <div className="flex items-center gap-2 mb-3">
                <Clock size={12} style={{ color: 'rgba(251,191,36,1)' }} />
                <MentorEyebrow>I · What You Submitted</MentorEyebrow>
            </div>
            <ReadOnlySummary profile={profile} />
            <p
                className="mt-4 pt-4"
                style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'rgba(245,245,245,0.55)',
                    fontSize: '0.95rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                Need to update something? Re-submitting will move your application back to the top of the review queue.
            </p>
        </Panel>
        <Panel>
            <div className="mb-3">
                <MentorEyebrow>II · Edit Your Application</MentorEyebrow>
            </div>
            <MentorApplicationForm initial={profile} />
        </Panel>
    </motion.div>
);

const ApprovedView = ({ profile, earnings, upcomingBookings, onRefresh }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
    >
        {/* Stats row */}
        <div>
            <div className="mb-3">
                <MentorEyebrow>I · The Standing</MentorEyebrow>
            </div>
            <div
                className="grid sm:grid-cols-3 gap-0"
                style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            >
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <MentorStat
                        label="Lifetime earnings"
                        value={`₹${earnings.totalInr || 0}`}
                        hint={`Pending ₹${earnings.pendingInr || 0} · Released ₹${earnings.releasedInr || 0}`}
                    />
                </div>
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <MentorStat
                        label="Rating"
                        value={(profile.rating?.average || 0).toFixed(1)}
                        hint={`${profile.rating?.count || 0} reviews`}
                    />
                </div>
                <div>
                    <MentorStat
                        label="Payout multiplier"
                        value={`${Math.round((profile.payoutMultiplier || 0.85) * 100)}%`}
                        hint={profile.ratingCutEligibleSince ? "Top tier unlocked" : "Top tier @ 4.8★ / 20+ ratings"}
                    />
                </div>
            </div>
        </div>

        {/* Pact row */}
        <div>
            <div className="mb-3">
                <MentorEyebrow>II · The Pact</MentorEyebrow>
            </div>
            <div className="grid md:grid-cols-[auto_1fr_1fr] gap-0" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                <Link
                    to="/mentor/pact"
                    className="flex items-center gap-3 p-4"
                    style={{
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                    }}
                >
                    <PactBadge size={36} withLabel />
                    <div className="min-w-0">
                        <div className="font-mono uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}>
                            Weekly Pact
                        </div>
                        <div style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            Your standing
                        </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'rgba(245,245,245,0.40)', marginLeft: 'auto' }} />
                </Link>
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
                    <PactPulse />
                </div>
                <div style={{ padding: '14px 16px' }}>
                    <RivalWatch />
                </div>
            </div>
        </div>

        {/* Quick links */}
        <div>
            <div className="mb-3">
                <MentorEyebrow>III · Quick Links</MentorEyebrow>
            </div>
            <div className="grid sm:grid-cols-3 gap-0" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                <QuickLink to={`/profile/${profile.userId}`} Icon={Eye} label="Public profile" />
                <a href="#edit-profile" className="block" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <QuickLinkBody Icon={Edit3} label="Edit profile" />
                </a>
                {hasStudentRole ? (
                    <Link to="/student/sessions" className="block" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                        <QuickLinkBody Icon={BookOpen} label="All bookings" />
                    </Link>
                ) : (
                    <a href="#upcoming" className="block" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                        <QuickLinkBody Icon={BookOpen} label="Upcoming sessions" />
                    </a>
                )}
            </div>
        </div>

        {/* Upcoming bookings */}
        <div>
            <div className="mb-3">
                <MentorEyebrow>IV · Upcoming Sessions</MentorEyebrow>
            </div>
            <Panel>
                {upcomingBookings.length === 0 ? (
                    <EmptyState
                        icon={<Calendar className="w-8 h-8" />}
                        title="No upcoming sessions"
                        message="When a student books a slot, it will appear here."
                    />
                ) : (
                    <ul className="space-y-0">
                        {upcomingBookings.map((b) => (
                            <li
                                key={b._id}
                                className="flex items-center gap-3 py-3"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
                                >
                                    {b.student?.name?.[0] || "S"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-text-primary truncate" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.02rem' }}>
                                        {b.student?.name || "Student"}
                                    </div>
                                    <div className="text-[11px] text-text-muted font-mono" style={{ letterSpacing: '0.06em' }}>
                                        {new Date(b.scheduledAt).toLocaleString()} · {b.durationMin} min
                                    </div>
                                </div>
                                <MentorTag tone="neutral">{b.status}</MentorTag>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>

        {/* Editable profile + availability */}
        <div id="edit-profile">
            <div className="mb-3">
                <MentorEyebrow>V · Your Workshop</MentorEyebrow>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <Panel>
                    <div className="mb-3">
                        <MentorEyebrow>Profile</MentorEyebrow>
                    </div>
                    <MentorApplicationForm initial={profile} />
                </Panel>
                <div className="space-y-4">
                    <Panel>
                        <div className="mb-3">
                            <MentorEyebrow>Availability</MentorEyebrow>
                        </div>
                        <AvailabilityEditor value={profile.availability} onSaved={onRefresh} />
                    </Panel>
                    <p
                        className="px-1"
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            color: 'rgba(245,245,245,0.55)',
                            fontSize: '0.95rem',
                            lineHeight: 1.4,
                        }}
                    >
                        Your public profile uses the <strong style={{ color: 'var(--text-primary)' }}>headline, bio, hourly rate, skills, and timezone</strong> above. Changes propagate to /sessions within a minute.
                    </p>
                </div>
            </div>
        </div>
    </motion.div>
);

const RejectedView = ({ profile }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
    >
        <Panel tone="danger">
            <div className="flex items-center gap-2 mb-3">
                <XCircle size={12} style={{ color: 'rgba(252,165,165,1)' }} />
                <MentorEyebrow>I · Why We Declined</MentorEyebrow>
            </div>
            <p
                className="mt-2"
                style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'rgba(245,245,245,0.85)',
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                    borderTop: '1px solid rgba(252,165,165,0.30)',
                    paddingTop: 12,
                }}
            >
                {profile.rejectionReason || "No reason was provided. Reach out to the team for details."}
            </p>
        </Panel>
        <Panel>
            <div className="mb-3">
                <MentorEyebrow>II · Update and Re-submit</MentorEyebrow>
            </div>
            <MentorApplicationForm initial={profile} />
        </Panel>
    </motion.div>
);

const SuspendedView = ({ profile }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
    >
        <Panel tone="danger">
            <div className="flex items-center gap-2 mb-3">
                <PauseCircle size={12} style={{ color: 'rgba(252,165,165,1)' }} />
                <MentorEyebrow>I · Why Your Account Was Suspended</MentorEyebrow>
            </div>
            <p
                className="mt-2"
                style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'rgba(245,245,245,0.85)',
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                    borderTop: '1px solid rgba(252,165,165,0.30)',
                    paddingTop: 12,
                }}
            >
                {profile.suspensionReason || "Reach out to support to learn more."}
            </p>
        </Panel>
        <Panel>
            <div className="mb-3">
                <MentorEyebrow>II · How to Appeal</MentorEyebrow>
            </div>
            <p
                className="text-sm"
                style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'rgba(245,245,245,0.70)',
                    fontSize: '1.02rem',
                    lineHeight: 1.5,
                }}
            >
                Email <span style={{ color: 'var(--text-primary)', fontStyle: 'normal', fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}>support@orbit.dev</span> with your account
                email and a brief explanation. We usually respond within 2 business days.
                Your public profile is hidden from the Sessions page while suspended; existing
                bookings are honored.
            </p>
            <a
                href="mailto:support@orbit.dev"
                className="inline-flex items-center gap-2 mt-5 font-mono uppercase"
                style={{
                    fontSize: '0.66rem',
                    letterSpacing: '0.22em',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.30)',
                    paddingBottom: 4,
                }}
            >
                Contact support
            </a>
        </Panel>
    </motion.div>
);

// ── Shared bits ────────────────────────────────────────────────────────────

const ReadOnlySummary = ({ profile }) => (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-3">
        <Field label="Headline" value={profile.headline || "—"} />
        <Field label="Hourly rate" value={`₹${profile.hourlyRateInr || 0}/hr`} />
        <Field label="Timezone" value={profile.timezone || "—"} />
        <Field label="Skills" value={(profile.skills || []).join(", ") || "—"} />
        {profile.bio && (
            <div className="sm:col-span-2">
                <div
                    className="font-mono uppercase mb-1"
                    style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                >
                    Bio
                </div>
                <p
                    className="text-sm whitespace-pre-wrap leading-relaxed"
                    style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.85)', fontSize: '1.02rem' }}
                >
                    {profile.bio}
                </p>
            </div>
        )}
    </div>
);

const Field = ({ label, value }) => (
    <div>
        <div
            className="font-mono uppercase mb-1"
            style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
        >
            {label}
        </div>
        <div
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '1.02rem' }}
        >
            {value}
        </div>
    </div>
);

const Bullet = ({ Icon, title, body }) => (
    <li className="flex items-start gap-3">
        <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}
        >
            <Icon size={14} />
        </div>
        <div>
            <div
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}
            >
                {title}
            </div>
            <div
                className="text-xs leading-relaxed mt-0.5"
                style={{ fontFamily: 'var(--font-serif)', color: 'rgba(245,245,245,0.65)', fontSize: '0.95rem' }}
            >
                {body}
            </div>
        </div>
    </li>
);

const QuickLink = ({ to, Icon, label }) => (
    <Link
        to={to}
        className="flex items-center justify-between p-4"
        style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
    >
        <QuickLinkBody Icon={Icon} label={label} />
    </Link>
);

const QuickLinkBody = ({ Icon, label }) => (
    <>
        <span className="flex items-center gap-2">
            <Icon size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                {label}
            </span>
        </span>
        <ArrowRight size={12} style={{ color: 'rgba(245,245,245,0.40)' }} />
    </>
);

export default MentorHub;
