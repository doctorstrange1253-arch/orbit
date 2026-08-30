/**
 * MentorSessions.jsx — Mentor window → /mentor/sessions.
 *
 * Fetches the caller's own bookings from GET /api/sessions/mentor/bookings
 * (which returns denormalized student info) and renders the same row layout
 * the student-side MySessions uses, but with two differences:
 *
 *   - Tab labels are "Upcoming" / "Past" (the mentor nav uses different
 *     verbs; the student window has Bookings/History).
 *   - The post-session CTA is "View student profile" instead of "Rate /
 *     rebook" — mentors don't need to rate themselves, but a link to
 *     the student's public profile is useful for context on repeat
 *     bookings.
 *
 * This is intentionally a separate page rather than a prop variant of
 * MySessions because the two audiences read the data differently:
 * the student cares about the counterparty as a Mentor-to-reread, the
 * mentor cares about the counterparty as a Student-to-recognize.
 */
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Video, IndianRupee, Clock, ListChecks, User } from 'lucide-react';
import api from '../../services/api';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';

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

const MentorSessions = () => {
    // URL-driven tab. ?tab=past → Past, otherwise Upcoming. Lets the
    // mentor share a deep link to their "completed this month" view.
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

    const { upcoming, past } = useMemo(() => {
        const now = Date.now();
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
    }, [sessions]);

    const list = tab === "upcoming" ? upcoming : past;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-14">
                <Helmet><title>My Sessions · Orbit Mentor</title></Helmet>

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                        <ListChecks className="w-3 h-3 text-accent" /> My Sessions
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">
                        <span className="gradient-text">Your bookings.</span>
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Students who've booked you, sorted by time.
                    </p>
                </motion.header>

                <div className="flex gap-2 mb-6">
                    {[
                        { key: "upcoming", label: `Upcoming (${upcoming.length})` },
                        { key: "past",     label: `Past (${past.length})` },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 text-sm font-semibold transition-all ${
                                tab === t.key
                                    ? 'btn-gradient'
                                    : 'nav-tab-glass text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="glass-card-glow p-4 h-20 skeleton rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <ErrorState message="Couldn't load your bookings" onRetry={refetch} />
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
                        {list.map((s) => {
                            const pillClass = STATUS_PILL[s.status] || STATUS_PILL.completed;
                            const studentName = s.student?.name || "Student";
                            const studentId = s.studentId;
                            return (
                                <li
                                    key={s._id}
                                    className="glass-card-glow p-4 flex flex-col md:flex-row md:items-center gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-text-muted mb-0.5">
                                            <span className={`px-2 py-0.5 rounded-pill text-[10px] uppercase tracking-widest font-bold ${pillClass}`}>
                                                {s.status.replace("_", " ")}
                                            </span>
                                            <span>· with {studentName}</span>
                                        </div>
                                        <div className="font-semibold mt-1 text-text-primary">
                                            {new Date(s.scheduledAt).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-text-secondary flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMin} min</span>
                                            <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{s.totalInr}</span>
                                            {s.status === "completed" && (
                                                <span className="flex items-center gap-1 text-success">
                                                    <IndianRupee className="w-3 h-3" />₹{s.mentorPayoutInr} payout
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {["booked", "confirmed", "live"].includes(s.status) && (
                                            <Link
                                                to={`/student/room/${s._id}`}
                                                className="inline-flex items-center gap-1.5 btn-gradient px-3.5 py-2 rounded-lg text-sm"
                                            >
                                                <Video className="w-4 h-4" /> Join
                                            </Link>
                                        )}
                                        {s.status === "completed" && studentId && (
                                            <Link
                                                to={`/profile/${studentId}`}
                                                className="inline-flex items-center gap-1.5 nav-tab-glass px-3.5 py-2 rounded-lg text-sm text-text-primary"
                                            >
                                                <User className="w-4 h-4" /> Student profile
                                            </Link>
                                        )}
                                    </div>
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
