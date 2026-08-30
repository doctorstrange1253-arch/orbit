/**
 * SessionDetail.jsx — single mentor page (bio, skills, "Book" CTA). The
 * BookingModal opens here and is the only interactive piece on this page.
 */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, IndianRupee, MapPin, Globe } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import ErrorState from '../components/common/ErrorState';
import BookingModal from '../components/sessions/BookingModal';
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
        return <div className="p-8 max-w-4xl mx-auto"><SkillCardSkeleton /></div>;
    }
    if (error) {
        return <div className="p-8 max-w-4xl mx-auto"><ErrorState message="Couldn't load this mentor" /></div>;
    }
    if (!mentor) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center">
                <p className="text-slate-400 mb-4">This mentor isn't available right now.</p>
                <Link to="/sessions" className="text-violet-400 hover:underline">← Back to all mentors</Link>
            </div>
        );
    }

    const isMe = me && String(me._id) === String(mentor.userId);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-4 py-8">
            <Helmet><title>{mentor.name} · Sessions · Orbit</title></Helmet>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        {mentor.avatar ? (
                            <img src={mentor.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-violet-700/30 flex items-center justify-center text-2xl font-semibold">
                                {mentor.name?.[0] || "M"}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold">{mentor.name}</h1>
                            {mentor.headline && <p className="text-slate-300 mt-1">{mentor.headline}</p>}
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    <strong className="text-white">{mentor.hourlyRateInr}</strong>/hr
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <strong className="text-white">{(mentor.rating?.average || 0).toFixed(1)}</strong>
                                    <span>({mentor.rating?.count || 0})</span>
                                </span>
                                {mentor.timezone && (
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-3.5 h-3.5" />
                                        {mentor.timezone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {mentor.bio && (
                        <div className="mt-6">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">About</h2>
                            <p className="text-slate-200 whitespace-pre-wrap">{mentor.bio}</p>
                        </div>
                    )}

                    {Array.isArray(mentor.skills) && mentor.skills.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Topics</h2>
                            <div className="flex flex-wrap gap-2">
                                {mentor.skills.map((s, i) => (
                                    <span key={i} className="text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-full">
                                        {String(s)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex gap-3">
                        <button
                            disabled={isMe}
                            onClick={() => setBookOpen(true)}
                            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            {isMe ? "This is your own profile" : "Book a session"}
                        </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 text-center">
                        Escrow holds the money until the session completes. You'll be charged only when the mentor confirms.
                    </p>
                </div>
            </div>

            {bookOpen && (
                <BookingModal
                    mentor={mentor}
                    onClose={() => setBookOpen(false)}
                />
            )}
        </div>
    );
};

export default SessionDetail;
