import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
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
const EnrollButton = ({ courseId, isEnrolled, lastLessonId }) => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const [optimistic, setOptimistic] = useState(isEnrolled);

    useEffect(() => { setOptimistic(isEnrolled); }, [isEnrolled]);

    const enroll = useMutation({
        mutationFn: () => courses.enroll(courseId),
        onMutate: () => setOptimistic(true),
        onError: () => setOptimistic(isEnrolled),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses', 'detail', courseId] });
            qc.invalidateQueries({ queryKey: ['enrollment', 'me', courseId] });
            qc.invalidateQueries({ queryKey: ['courses', courseId, 'enrollment', 'me'] });
            qc.invalidateQueries({ queryKey: ['enrollments', 'me'] });
        },
    });

    const handleClick = () => {
        if (!user?._id) {
            navigate('/login', { state: { from: { pathname: `/courses/${courseId}` } } });
            return;
        }
        if (optimistic) {
            navigate(lastLessonId
                ? `/courses/${courseId}/learn/${lastLessonId}`
                : `/courses/${courseId}/learn`);
        } else {
            enroll.mutate();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={enroll.isPending}
            className="inline-flex items-center justify-center gap-2 w-full md:w-auto font-mono uppercase"
            style={{
                fontSize: '0.66rem',
                letterSpacing: '0.22em',
                fontWeight: 700,
                padding: '13px 22px',
                cursor: 'pointer',
                background: 'transparent',
                color: optimistic ? 'rgba(110,231,183,1)' : 'var(--text-primary)',
                border: `1px solid ${optimistic ? 'rgba(110,231,183,0.45)' : 'rgba(255,255,255,0.30)'}`,
            }}
        >
            {enroll.isPending ? 'Enrolling…' : optimistic ? (
                <><Check size={13} /> {lastLessonId ? 'Resume' : 'Continue learning'}</>
            ) : (
                <><Sparkles size={13} /> Enroll — free</>
            )}
        </button>
    );
};

export default EnrollButton;
