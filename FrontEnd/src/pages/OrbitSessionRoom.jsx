/**
 * OrbitSessionRoom.jsx — paid-session wrapper around the free `DirectVideoCall`
 * transport. The whole WebRTC pipeline (offer/answer/ICE + whiteboard + chat)
 * is REUSED from pages/VideoCall.jsx. This page only adds:
 *   1. Resolve the :sessionId → OrbitSession + otherUser
 *   2. POST /api/sessions/:id/start when the local socket joins
 *   3. POST /api/sessions/:id/complete on unmount OR a hard "End session" click
 *   4. Post-session rating modal
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Star, X } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../services/socket';
import DirectVideoCall from './VideoCall'; // named export
import ErrorState from '../components/common/ErrorState';

const OrbitSessionRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const me = useAuthStore((s) => s.user);
    const socket = getSocket();
    const qc = useQueryClient();
    const [ratingOpen, setRatingOpen] = useState(false);
    const completedRef = useRef(false);

    const { data: session, error } = useQuery({
        queryKey: ['sessions', 'one', sessionId],
        queryFn: () => api.get(`/sessions/${sessionId}`).then((r) => r.data),
        enabled: !!sessionId,
    });

    const startMut = useMutation({
        mutationFn: () => api.post(`/sessions/${sessionId}/start`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions', 'one', sessionId] }),
    });
    const completeMut = useMutation({
        mutationFn: () => api.post(`/sessions/${sessionId}/complete`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sessions', 'one', sessionId] });
            qc.invalidateQueries({ queryKey: ['sessions', 'me'] });
        },
    });
    const rateMut = useMutation({
        mutationFn: ({ stars, comment }) => api.post(`/sessions/${sessionId}/rate`, { stars, comment }),
    });

    // Tell the server to mark this session live as soon as the page is mounted
    // by either participant. Idempotent: re-runs are no-ops because the FSM
    // guard at /start rejects "live" → "live".
    useEffect(() => {
        if (!sessionId) return;
        if (session && ["booked", "confirmed"].includes(session.status)) {
            startMut.mutate();
        }
    }, [sessionId, session?.status]); // eslint-disable-line react-hooks/exhaustive-deps

    // Tell the server to mark the session complete on unmount (browser tab
    // close, page nav, etc.). The `completedRef` collapses duplicate calls.
    useEffect(() => {
        return () => {
            if (completedRef.current) return;
            completedRef.current = true;
            try {
                // Fire-and-forget. The browser may already be tearing down.
                if (navigator.sendBeacon) {
                    const url = `${api.defaults.baseURL}/sessions/${sessionId}/complete`;
                    navigator.sendBeacon(url);
                } else {
                    api.post(`/sessions/${sessionId}/complete`).catch(() => {});
                }
            } catch {}
        };
    }, [sessionId]);

    // Socket relay: when the peer leaves or ends, nudge the local user to the
    // rating modal (if the session is already completed server-side).
    useEffect(() => {
        if (!socket) return;
        const onEnded = (payload) => {
            if (payload?.sessionId !== sessionId) return;
            if (session && ["booked", "confirmed", "live"].includes(session.status)) {
                completeMut.mutate(undefined, {
                    onSuccess: () => setRatingOpen(true),
                });
            }
        };
        socket.on("session:ended", onEnded);
        return () => socket.off("session:ended", onEnded);
    }, [socket, sessionId, session?.status]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleEnd = useCallback(() => {
        completeMut.mutate(undefined, {
            onSuccess: () => setRatingOpen(true),
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (error) {
        return <div className="p-8"><ErrorState message="Couldn't load this session" /></div>;
    }
    if (!session) {
        return <div className="p-8 text-slate-400">Loading session…</div>;
    }
    if (!["booked", "confirmed", "live"].includes(session.status)) {
        return (
            <div className="p-8 max-w-md mx-auto text-center text-slate-200">
                <h2 className="text-xl font-semibold mb-2">This session is {session.status}</h2>
                <p className="text-slate-400 mb-4">It can't be joined right now.</p>
                <Link to="/student/sessions" className="text-violet-400 hover:underline">Back to My Sessions</Link>
            </div>
        );
    }

    const otherUserId = String(session.mentorId) === String(me?._id) ? session.studentId : session.mentorId;
    const otherUser = { _id: otherUserId, name: "Your peer" };

    return (
        <div className="bg-black min-h-screen text-white">
            <Helmet><title>Orbit Session · {sessionId}</title></Helmet>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <button onClick={() => navigate("/student/sessions")} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4" /> My Sessions
                </button>
                <button
                    onClick={handleEnd}
                    className="flex items-center gap-1 text-sm bg-rose-700 hover:bg-rose-600 px-3 py-1.5 rounded"
                >
                    <X className="w-4 h-4" /> End session
                </button>
            </div>

            <DirectVideoCall
                roomId={session.roomId}
                otherUser={otherUser}
                isCaller={true}
                autoBoard={false}
                onEnd={handleEnd}
            />

            {ratingOpen && (
                <RatingModal
                    onClose={() => setRatingOpen(false)}
                    onSubmit={async ({ stars, comment }) => {
                        await rateMut.mutateAsync({ stars, comment });
                        setRatingOpen(false);
                        navigate("/student/sessions");
                    }}
                />
            )}
        </div>
    );
};

const RatingModal = ({ onClose, onSubmit }) => {
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState("");
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" /> Rate this session
                </h2>
                <div className="flex justify-center gap-1 my-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setStars(n)} className="p-1">
                            <Star className={`w-7 h-7 ${n <= stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                        </button>
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Optional feedback…"
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm mb-3"
                />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm">Skip</button>
                    <button onClick={() => onSubmit({ stars, comment })} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium">Submit</button>
                </div>
            </div>
        </div>
    );
};

export default OrbitSessionRoom;
