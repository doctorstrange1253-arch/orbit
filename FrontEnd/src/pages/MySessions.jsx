/**
 * MySessions.jsx — Upcoming / Past tabs over the caller's booked + mentor
 * sessions. Pulls /api/sessions/me, classifies each by status + scheduledAt.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Video, Star, IndianRupee, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const STATUS_LABEL = {
    pending_payment: { label: "Awaiting payment", color: "text-amber-300 bg-amber-900/30" },
    booked:          { label: "Booked", color: "text-sky-300 bg-sky-900/30" },
    confirmed:       { label: "Confirmed", color: "text-emerald-300 bg-emerald-900/30" },
    live:            { label: "Live", color: "text-rose-300 bg-rose-900/30" },
    completed:       { label: "Completed", color: "text-slate-300 bg-slate-800" },
    cancelled:       { label: "Cancelled", color: "text-slate-400 bg-slate-800" },
    no_show:         { label: "No-show", color: "text-orange-300 bg-orange-900/30" },
    disputed:        { label: "Disputed", color: "text-red-300 bg-red-900/30" },
};

const MySessions = () => {
    const me = useAuthStore((s) => s.user);
    const [tab, setTab] = useState("upcoming");

    const { data: sessions = [], isLoading, error, refetch } = useQuery({
        queryKey: ['sessions', 'me'],
        queryFn: () => api.get('/sessions/me').then((r) => r.data?.items || []),
        refetchInterval: 60_000,
    });

    const now = Date.now();
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
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-4 py-8">
            <Helmet><title>My Sessions · Orbit</title></Helmet>
            <div className="max-w-3xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">My Sessions</h1>
                    <p className="text-slate-400 text-sm">Your paid 1-on-1 video sessions, booked and historical.</p>
                </header>

                <div className="flex gap-2 mb-6 border-b border-slate-800">
                    {[
                        { key: "upcoming", label: `Upcoming (${upcoming.length})` },
                        { key: "past", label: `Past (${past.length})` },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors ${
                                tab === t.key
                                    ? "border-violet-500 text-white"
                                    : "border-transparent text-slate-400 hover:text-white"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <p className="text-slate-500 text-sm">Loading…</p>
                ) : error ? (
                    <ErrorState message="Couldn't load your sessions" onRetry={refetch} />
                ) : list.length === 0 ? (
                    <EmptyState
                        icon={<Calendar className="w-10 h-10" />}
                        title={tab === "upcoming" ? "No upcoming sessions" : "No past sessions yet"}
                        message={tab === "upcoming" ? "Book a session with a mentor to see it here." : "Once you complete a session, it'll show up here."}
                    />
                ) : (
                    <ul className="space-y-3">
                        {list.map((s) => {
                            const role = String(s.mentorId) === String(me?._id) ? "Mentor" : "Student";
                            const otherUserId = role === "Mentor" ? s.studentId : s.mentorId;
                            const sLabel = STATUS_LABEL[s.status] || { label: s.status, color: "text-slate-300 bg-slate-800" };
                            return (
                                <li key={s._id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${sLabel.color}`}>
                                                {sLabel.label}
                                            </span>
                                            <span>· {role}</span>
                                        </div>
                                        <div className="font-semibold mt-1">
                                            {new Date(s.scheduledAt).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMin} min</span>
                                            <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{s.totalInr}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {["booked", "confirmed", "live"].includes(s.status) && (
                                            <Link
                                                to={`/session-room/${s._id}`}
                                                className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium"
                                            >
                                                <Video className="w-4 h-4 inline mr-1" /> Join
                                            </Link>
                                        )}
                                        {s.status === "completed" && (
                                            <Link
                                                to={`/sessions/${otherUserId}`}
                                                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium"
                                            >
                                                <Star className="w-4 h-4 inline mr-1" /> Rate / rebook
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

export default MySessions;
