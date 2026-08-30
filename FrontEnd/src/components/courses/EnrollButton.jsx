import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Check } from 'lucide-react';
import { courses } from '../../services/courses';
import { useAuthStore } from '../../store/authStore';

/**
 * EnrollButton — the single CTA on /courses/:id.
 *
 * Three states: not-enrolled → "Enroll", enrolled → "Continue learning",
 * in-flight → spinner. Optimistic flip so the click feels instant.
 * Anonymous users get bounced to /login with a `from` redirect so they
 * land back here after sign-in.
 */
const EnrollButton = ({ courseId, isEnrolled }) => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const [optimistic, setOptimistic] = useState(isEnrolled);

    const enroll = useMutation({
        mutationFn: () => courses.enroll(courseId),
        onMutate: () => setOptimistic(true),
        onError: () => setOptimistic(isEnrolled),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
        },
    });

    const handleClick = () => {
        if (!user?._id) {
            navigate('/login', { state: { from: { pathname: `/courses/${courseId}` } } });
            return;
        }
        if (optimistic) {
            navigate(`/courses/${courseId}/learn`);
        } else {
            enroll.mutate();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={enroll.isPending}
            className={`inline-flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 rounded-pill text-sm font-bold uppercase tracking-widest transition ${
                optimistic
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:brightness-110'
            }`}
        >
            {enroll.isPending ? 'Enrolling…' : optimistic ? (
                <><Check className="w-4 h-4" /> Continue learning</>
            ) : (
                <><Sparkles className="w-4 h-4" /> Enroll — free</>
            )}
        </button>
    );
};

export default EnrollButton;
