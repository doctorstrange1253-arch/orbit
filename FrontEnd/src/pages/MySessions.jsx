/**
 * MySessions.jsx — Upcoming / Past tabs over the caller's booked + mentor
 * sessions. Pulls /api/sessions/me, classifies each by status + scheduledAt.
 * Themed: glass-card-glow row, status pills use semantic token colors,
 * nav-tab-glass tab switcher, gradient-text page title.
 */
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Video, IndianRupee, Clock, ListChecks } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import RateSessionButton from '../components/sessions/RateSessionButton';

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

const MySessions = () => {
    const me = useAuthStore((s) => s.user);
    // URL-driven tab so the Bookings/History nav pills can deep-link to
    // the right view. ?tab=past → Past, everything else → Upcoming.
    // Replaces the previous local useState so the tab survives a refresh
    // and can be shared as a link.
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming';
    const setTab = (next) => {
        if (next === tab) return;
        setSearchParams(next === 'past' ? { tab: 'past' } : {}, { replace: true });
    };

    const { data: sessions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['sessions', 'me'],
        queryFn: () => api.get('/sessions/me').then((r) => r.data?.items || []),
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
                <Helmet><title>My Sessions · Orbit</title></Helmet>

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
                        <ListChecks className="w-3 h-3 text-accent" /> My Sessions
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="gradient-text">Your session log.</span>
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Paid 1-on-1 video sessions, upcoming and historical.
                    </p>
                </motion.header>

                <div className="flex gap-2 mb-6">
                    {[
                        { key: "upcoming", label: `Bookings (${upcoming.length})` },
                        { key: "past",     label: `History (${past.length})` },
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
                    <ErrorState message="Couldn't load your sessions" onRetry={refetch} />
                ) : list.length === 0 ? (
                    <EmptyState
                        icon={<Calendar className="w-10 h-10" />}
                        title={tab === "upcoming" ? "No upcoming bookings" : "No session history yet"}
                        message={tab === "upcoming" ? "Book a session with a mentor to see it here." : "Once you complete a session, it'll show up here."}
                    />
                ) : (
                    <ul className="space-y-3">
                        {list.map((s) => {
                            const role = String(s.mentorId) === String(me?._id) ? "Mentor" : "Student";
                            const otherUserId = role === "Mentor" ? s.studentId : s.mentorId;
                            const pillClass = STATUS_PILL[s.status] || STATUS_PILL.completed;
                            return (
                                <li
                                    key={s._id}
                                    className="glass-card-glow p-4 flex flex-col md:flex-row md:items-center gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <span className={`px-2 py-0.5 rounded-pill text-[10px] uppercase tracking-widest font-bold ${pillClass}`}>
                                                {s.status.replace("_", " ")}
                                            </span>
                                            <span>· {role}</span>
                                        </div>
                                        <div className="font-semibold mt-1 text-text-primary">
                                            {new Date(s.scheduledAt).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-text-secondary flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMin} min</span>
                                            <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{s.totalInr}</span>
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
                                        {s.status === "completed" && (
                                            <>
                                                <RateSessionButton
                                                    session={s}
                                                    alreadyRated={role === "Mentor" ? !!s.mentorRating?.stars : !!s.studentRating?.stars}
                                                />
                                                <Link
                                                    to={`/student/mentors/${otherUserId}`}
                                                    className="inline-flex items-center gap-1.5 nav-tab-glass px-3.5 py-2 rounded-lg text-sm text-text-primary"
                                                >
                                                    <Calendar className="w-4 h-4" /> Rebook
                                                </Link>
                                            </>
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

export default MySessions;
