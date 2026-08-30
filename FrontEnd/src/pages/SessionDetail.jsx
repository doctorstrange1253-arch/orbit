/**
 * SessionDetail.jsx — single mentor page (bio, skills, "Book" CTA).
 * Themed: glass-card-glow profile, gradient-text name, btn-gradient CTA,
 * animated status pills for the rating/timezone. The BookingModal opens
 * from here and is the only interactive piece on this page.
 */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, IndianRupee, Globe, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import ErrorState from '../components/common/ErrorState';
import BookingModal from '../components/sessions/BookingModal';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
import { SkillCardSkeleton } from '../components/skeletons';

const SessionDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const me = useAuthStore((s) => s.user);
    const [bookOpen, setBookOpen] = useState(false);

    const { data: mentor, isLoading, error } = useQuery({
        queryKey: ['sessions', 'mentor', userId],
        queryFn: () => api.get(`/sessions/mentors/${userId}`).then((r) => r.data),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="relative min-h-screen">
                <FuturisticBackdrop />
                <div className="relative z-10 p-8 max-w-4xl mx-auto"><SkillCardSkeleton /></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="relative min-h-screen">
                <FuturisticBackdrop />
                <div className="relative z-10 p-8 max-w-4xl mx-auto"><ErrorState message="Couldn't load this mentor" /></div>
            </div>
        );
    }
    if (!mentor) {
        return (
            <div className="relative min-h-screen">
                <FuturisticBackdrop />
                <div className="relative z-10 p-8 max-w-4xl mx-auto text-center">
                    <p className="text-text-secondary mb-4">This mentor isn't available right now.</p>
                    <Link to="/sessions" className="text-accent hover:underline">← Back to all mentors</Link>
                </div>
            </div>
        );
    }

    const isMe = me && String(me._id) === String(mentor.userId);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-10">
                <Helmet><title>{mentor.name} · Sessions · Orbit</title></Helmet>

                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-card-glow p-6 md:p-8"
                >
                    <div className="flex items-start gap-4 flex-wrap">
                        {mentor.avatar ? (
                            <img src={mentor.avatar} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-accent/30" />
                        ) : (
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-text-primary bg-surface border border-border-subtle ring-2 ring-accent/30">
                                {mentor.name?.[0] || "M"}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-pill bg-surface border border-border-subtle text-text-secondary mb-2">
                                <Sparkles className="w-3 h-3 text-accent" /> Live mentor
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-1">
                                <span className="gradient-text">{mentor.name}</span>
                            </h1>
                            {mentor.headline && <p className="text-text-secondary">{mentor.headline}</p>}
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-text-secondary">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface border border-border-subtle text-text-primary">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    <strong>{mentor.hourlyRateInr}</strong>/hr
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <strong className="text-text-primary">{(mentor.rating?.average || 0).toFixed(1)}</strong>
                                    <span className="text-text-muted">({mentor.rating?.count || 0})</span>
                                </span>
                                {mentor.timezone && (
                                    <span className="inline-flex items-center gap-1">
                                        <Globe className="w-3.5 h-3.5" />
                                        {mentor.timezone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {mentor.bio && (
                        <div className="mt-6">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">About</h2>
                            <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{mentor.bio}</p>
                        </div>
                    )}

                    {Array.isArray(mentor.skills) && mentor.skills.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Topics</h2>
                            <div className="flex flex-wrap gap-2">
                                {mentor.skills.map((s, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-2.5 py-1 rounded-pill text-accent border border-accent/30 bg-accent/5"
                                    >
                                        {String(s)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            disabled={isMe}
                            onClick={() => setBookOpen(true)}
                            className="w-full btn-gradient py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-text-on-accent"
                        >
                            {isMe ? "This is your own profile" : "Book a session"}
                        </button>
                    </div>

                    <p className="text-xs text-text-muted mt-3 text-center">
                        Escrow holds the money until the session completes. You'll be charged only when the mentor confirms.
                    </p>
                </motion.div>
            </div>

            {bookOpen && (
                <BookingModal mentor={mentor} onClose={() => setBookOpen(false)} />
            )}
        </div>
    );
};

export default SessionDetail;
