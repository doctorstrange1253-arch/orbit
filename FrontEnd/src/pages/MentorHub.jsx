/**
 * MentorHub.jsx — mentor-side dashboard at /teach.
 *
 * Single page, 5 application states driven by GET /api/sessions/mentor/me:
 *
 *   not_applied → Big pitch + the application form. CTA = submit form.
 *   submitted   → "Under review" + read-only summary of submitted fields.
 *   approved    → Earnings / rating / upcoming bookings dashboard.
 *   rejected    → Rejection reason + re-apply form pre-filled from prior.
 *   suspended   → Suspension reason + appeal instructions.
 *
 * Themed like the rest of the Sessions surface: FuturisticBackdrop,
 * glass-card-glow panels, gradient-text title, btn-gradient primary CTAs,
 * semantic status tokens for the 5 state colors.
 */
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    GraduationCap, Sparkles, Clock, Star, IndianRupee, Calendar, Loader,
    CheckCircle, XCircle, PauseCircle, IndianRupee as RupeeIcon, Edit3,
    Eye, BookOpen, MessageSquare, ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import MentorApplicationForm from '../components/mentor/MentorApplicationForm';
import AvailabilityEditor from '../components/sessions/AvailabilityEditor';
import { useAuthStore } from '../store/authStore';
import PactPulse from '../components/pact/PactPulse';
import RivalWatch from '../components/pact/RivalWatch';
import PactBadge from '../components/pact/PactBadge';

// State-level visual config. Each state has a title, a tinted chip color, an
// icon, and copy for the hero. Colors use the semantic tokens so the state
// reads correctly in both themes.
const STATE_META = {
    not_applied: {
        title: "Become a mentor.",
        sub: "Earn from your expertise. Set your own hours, your own rate.",
        chip: "Not yet applied",
        chipClass: "bg-surface text-text-secondary border border-border-subtle",
        Icon: GraduationCap,
    },
    submitted: {
        title: "Application under review.",
        sub: "Our team usually reviews within 24–48 hours. We'll ping you here.",
        chip: "Pending review",
        chipClass: "bg-warning/10 text-warning border border-warning/30",
        Icon: Clock,
    },
    approved: {
        title: "You're live.",
        sub: "Students can book you right now. Your earnings update after each session completes.",
        chip: "Live mentor",
        chipClass: "bg-success/10 text-success border border-success/30",
        Icon: CheckCircle,
    },
    rejected: {
        title: "Not approved this time.",
        sub: "Update your application based on the feedback below and re-submit.",
        chip: "Application declined",
        chipClass: "bg-danger/10 text-danger border border-danger/30",
        Icon: XCircle,
    },
    suspended: {
        title: "Account suspended.",
        sub: "Reach out to the team to appeal and get back online.",
        chip: "Suspended",
        chipClass: "bg-danger/10 text-danger border border-danger/30",
        Icon: PauseCircle,
    },
};

const MentorHub = () => {
    const qc = useQueryClient();
    // Some users are both mentor + student on the same account (e.g. they
    // teach React and book sessions for Public Speaking). The /my-sessions
    // quick-link is only valid for those users — pure mentors get a scroll
    // anchor to the upcoming-sessions section on this same page instead.
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
        <div className="aurora-stage relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>Teach · Orbit Sessions</title></Helmet>

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="pt-2 pb-10"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <div className="font-mono uppercase tracking-[0.22em] text-[0.68rem] font-bold text-text-muted mb-5 flex items-center gap-2">
                        <GraduationCap className="w-3 h-3 text-accent" /> Teach on Orbit
                    </div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-editorial)',
                            fontStyle: 'italic',
                            fontWeight: 700,
                            lineHeight: 0.96,
                            letterSpacing: '-0.03em',
                            fontSize: 'clamp(2.6rem, 5.8vw, 4.6rem)',
                            color: 'var(--text-primary)',
                            marginBottom: 14,
                        }}
                    >
                        {meta.title}
                    </h1>
                    <p className="text-text-secondary text-base md:text-lg max-w-2xl">{meta.sub}</p>
                    {profile && (
                        <div className={`inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest ${meta.chipClass}`}>
                            {state === "approved" && (
                                <span
                                    className="w-2 h-2 rounded-full bg-success"
                                    style={{ boxShadow: '0 0 6px var(--success)' }}
                                />
                            )}
                            <meta.Icon className="w-3.5 h-3.5" />
                            {meta.chip}
                        </div>
                    )}
                </motion.header>

                {/* Body — branches on state */}
                {isLoading ? (
                    <div className="glass-card-glow p-6 text-text-secondary flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" /> Loading your mentor profile…
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
        </div>
    );
};

// ── State views ────────────────────────────────────────────────────────────

const NotAppliedView = () => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid lg:grid-cols-[1fr,1fr] gap-6"
    >
        <div className="glass-card-glow p-6 space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Why mentor on Orbit?</h2>
            <ul className="space-y-3 text-sm text-text-secondary">
                <Bullet icon={<RupeeIcon className="w-4 h-4 text-accent" />} title="Keep 85% of every session" body="Payout multiplier jumps to 90% after 4.8★ across 20+ ratings." />
                <Bullet icon={<Calendar className="w-4 h-4 text-accent" />} title="You set your own hours" body="Tune a weekly availability grid in UTC. No minimums, no quotas." />
                <Bullet icon={<Sparkles className="w-4 h-4 text-accent" />} title="Escrow is handled for you" body="Razorpay holds the money; you get paid automatically on session completion." />
                <Bullet icon={<MessageSquare className="w-4 h-4 text-accent" />} title="Built-in messaging" body="Chat with students before the session using the same inbox you already use." />
            </ul>
        </div>
        <MentorApplicationForm />
    </motion.div>
);

const PendingView = ({ profile }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
    >
        <div className="glass-card-glow p-6 space-y-3">
            <div className="flex items-center gap-2 text-warning">
                <Clock className="w-4 h-4" />
                <h2 className="font-bold text-text-primary">What you submitted</h2>
            </div>
            <ReadOnlySummary profile={profile} />
            <p className="text-xs text-text-muted pt-2">
                Need to update something? Re-submitting will move your application back to the
                top of the review queue.
            </p>
        </div>
        <div className="glass-card-glow p-6">
            <h3 className="text-sm font-bold text-text-primary mb-3">Edit your application</h3>
            <MentorApplicationForm initial={profile} />
        </div>
    </motion.div>
);

const ApprovedView = ({ profile, earnings, upcomingBookings, onRefresh }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
    >
        {/* Stats row */}
        <div className="grid sm:grid-cols-3 gap-3">
            <Stat label="Lifetime earnings" value={`₹${earnings.totalInr}`} sub={`Pending ₹${earnings.pendingInr} · Released ₹${earnings.releasedInr}`} Icon={RupeeIcon} />
            <Stat label="Rating" value={(profile.rating?.average || 0).toFixed(1)} sub={`${profile.rating?.count || 0} reviews`} Icon={Star} />
            <Stat label="Payout multiplier" value={`${Math.round((profile.payoutMultiplier || 0.85) * 100)}%`} sub={profile.ratingCutEligibleSince ? "Top tier unlocked" : "Top tier @ 4.8★ / 20+ ratings"} Icon={Sparkles} />
        </div>

        {/* Mentor Pact row — weekly league + pulse + rivals. The Pact Badge
            here shows the caller's own tier (uses /pact/me under the hood). */}
        <div className="grid md:grid-cols-[auto_1fr_1fr] gap-3 items-stretch">
            <Link to="/mentor/pact" className="glass-card-glow p-4 flex items-center gap-3 hover:border-accent/40">
                <PactBadge size={36} withLabel />
                <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Weekly Pact</div>
                    <div className="text-sm font-bold text-text-primary">Your standing</div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted ml-auto" />
            </Link>
            <PactPulse />
            <RivalWatch />
        </div>

        {/* Quick links — only show "All bookings" if the user also holds the
            student role. /my-sessions is the student-side view; mentors who
            don't also pay for sessions get a separate Upcoming/Past list
            rendered further down this page, not /my-sessions. */}
        <div className="grid sm:grid-cols-3 gap-3">
            <Link to={`/profile/${profile.userId}`} className="nav-tab-glass p-4 flex items-center justify-between hover:border-accent/40">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary"><Eye className="w-4 h-4 text-accent" /> Public profile</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
            </Link>
            <a href="#edit-profile" className="nav-tab-glass p-4 flex items-center justify-between hover:border-accent/40">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary"><Edit3 className="w-4 h-4 text-accent" /> Edit profile</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
            </a>
            {hasStudentRole ? (
              <Link to="/student/sessions" className="nav-tab-glass p-4 flex items-center justify-between hover:border-accent/40">
                  <span className="flex items-center gap-2 text-sm font-semibold text-text-primary"><BookOpen className="w-4 h-4 text-accent" /> All bookings</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
              </Link>
            ) : (
              <a href="#upcoming" className="nav-tab-glass p-4 flex items-center justify-between hover:border-accent/40">
                  <span className="flex items-center gap-2 text-sm font-semibold text-text-primary"><BookOpen className="w-4 h-4 text-accent" /> Upcoming sessions</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
              </a>
            )}
        </div>

        {/* Upcoming bookings */}
        <div className="glass-card-glow p-6">
            <h3 className="text-sm font-bold text-text-primary mb-3">Upcoming sessions</h3>
            {upcomingBookings.length === 0 ? (
                <EmptyState
                    icon={<Calendar className="w-8 h-8" />}
                    title="No upcoming sessions"
                    message="When a student books a slot, it'll show up here."
                />
            ) : (
                <ul className="space-y-2">
                    {upcomingBookings.map((b) => (
                        <li key={b._id} className="flex items-center gap-3 text-sm p-3 rounded-xl nav-tab-glass">
                            <div className="w-9 h-9 rounded-full bg-surface border border-border-subtle flex items-center justify-center font-bold text-text-primary">
                                {b.student?.name?.[0] || "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-text-primary truncate">{b.student?.name || "Student"}</div>
                                <div className="text-xs text-text-muted">
                                    {new Date(b.scheduledAt).toLocaleString()} · {b.durationMin} min
                                </div>
                            </div>
                            <div className="text-xs px-2 py-0.5 rounded-pill bg-info/10 text-info border border-info/30">
                                {b.status}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Editable profile + availability */}
        <div id="edit-profile" className="grid lg:grid-cols-2 gap-4">
            <MentorApplicationForm initial={profile} />
            <div className="space-y-4">
                <AvailabilityEditor value={profile.availability} onSaved={onRefresh} />
                <div className="glass-card-glow p-4 text-xs text-text-muted leading-relaxed">
                    <strong className="text-text-primary">Heads up:</strong> your public profile
                    uses the <em>headline, bio, hourly rate, skills, and timezone</em> above.
                    Changes propagate to /sessions within a minute.
                </div>
            </div>
        </div>
    </motion.div>
);

const RejectedView = ({ profile }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
    >
        <div className="glass-card-glow p-6 space-y-3 border-danger/30">
            <div className="flex items-center gap-2 text-danger">
                <XCircle className="w-4 h-4" />
                <h2 className="font-bold text-text-primary">Why we declined</h2>
            </div>
            <p className="text-sm text-text-primary bg-danger/5 border border-danger/20 rounded-lg p-3">
                {profile.rejectionReason || "No reason was provided. Reach out to the team for details."}
            </p>
        </div>
        <div className="glass-card-glow p-6">
            <h3 className="text-sm font-bold text-text-primary mb-3">Update and re-submit</h3>
            <MentorApplicationForm initial={profile} />
        </div>
    </motion.div>
);

const SuspendedView = ({ profile }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
    >
        <div className="glass-card-glow p-6 space-y-3 border-danger/30">
            <div className="flex items-center gap-2 text-danger">
                <PauseCircle className="w-4 h-4" />
                <h2 className="font-bold text-text-primary">Why your account was suspended</h2>
            </div>
            <p className="text-sm text-text-primary bg-danger/5 border border-danger/20 rounded-lg p-3">
                {profile.suspensionReason || "Reach out to support to learn more."}
            </p>
        </div>
        <div className="glass-card-glow p-6 space-y-3">
            <h3 className="text-sm font-bold text-text-primary">How to appeal</h3>
            <p className="text-sm text-text-secondary">
                Email <span className="text-accent">support@orbit.dev</span> with your account
                email and a brief explanation. We usually respond within 2 business days.
                Your public profile is hidden from the Sessions page while suspended; existing
                bookings are honored.
            </p>
            <a
                href="mailto:support@orbit.dev"
                className="inline-block btn-gradient px-5 py-2.5 rounded-xl text-sm"
            >
                Contact support
            </a>
        </div>
    </motion.div>
);

// ── Shared bits ────────────────────────────────────────────────────────────

const ReadOnlySummary = ({ profile }) => (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Field label="Headline" value={profile.headline || "—"} />
        <Field label="Hourly rate" value={`₹${profile.hourlyRateInr || 0}/hr`} />
        <Field label="Timezone" value={profile.timezone || "—"} />
        <Field label="Skills" value={(profile.skills || []).join(", ") || "—"} />
        {profile.bio && (
            <div className="sm:col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Bio</div>
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
            </div>
        )}
    </div>
);

const Field = ({ label, value }) => (
    <div>
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">{label}</div>
        <div className="text-sm text-text-primary">{value}</div>
    </div>
);

const Stat = ({ label, value, sub, Icon }) => (
    <div className="glass-card-glow p-4">
        <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-widest font-semibold mb-2">
            <Icon className="w-3.5 h-3.5 text-accent" />
            {label}
        </div>
        <div className="text-2xl font-black gradient-text">{value}</div>
        {sub && <div className="text-xs text-text-muted mt-1">{sub}</div>}
    </div>
);

const Bullet = ({ icon, title, body }) => (
    <li className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-surface border border-border-subtle flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <div>
            <div className="text-sm font-semibold text-text-primary">{title}</div>
            <div className="text-xs text-text-secondary leading-relaxed">{body}</div>
        </div>
    </li>
);

export default MentorHub;
