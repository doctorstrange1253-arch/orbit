import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Eye, EyeOff, Save, Pencil, Trash2, Users, MessageCircle, Edit3, Crown } from 'lucide-react';
import { courses } from '../../services/courses';
import CommentThread from '../../components/courses/CommentThread';
import PactBadge from '../../components/pact/PactBadge';
import { MentorBackLink } from '../../components/pact/MentorEditorial';
import { StudioMasthead, StudioPanel } from '../../soul/studio/surfaces';
import { StageRail } from '../../soul/gameEngine/StageRail';

const TABS = [
    { id: 'lessons',      label: 'Lessons',      icon: BookOpen },
    { id: 'qa',           label: 'Q&A',          icon: MessageCircle },
    { id: 'enrollments',  label: 'Enrollments',  icon: Users },
    { id: 'settings',     label: 'Settings',     icon: Pencil },
];

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [tab, setTab] = useState('lessons');

    const { data: course } = useQuery({
        queryKey: ['courses', 'detail', id],
        queryFn: () => courses.detail(id),
    });

    const publish = useMutation({
        mutationFn: () => courses.publish(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'detail', id] }),
    });
    const unpublish = useMutation({
        mutationFn: () => courses.unpublish(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'detail', id] }),
    });
    const remove = useMutation({
        mutationFn: () => courses.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses', 'list'] });
            navigate('/mentor/courses');
        },
    });
    const updateLesson = useMutation({
        mutationFn: ({ lessonId, body }) => courses.updateLesson(id, lessonId, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'detail', id] }),
    });
    const deleteLesson = useMutation({
        mutationFn: (lessonId) => courses.deleteLesson(id, lessonId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', 'detail', id] }),
    });

    if (!course) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div
                    className="py-12 text-center"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'rgba(245,245,245,0.55)',
                    }}
                >
                    Reading the course.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
            <Helmet><title>Edit · {course.title}</title></Helmet>

            <div>
                <MentorBackLink to="/mentor/courses">My courses</MentorBackLink>
            </div>

            <StudioMasthead
                eyebrow={`${course.isPublished ? 'Published' : 'Draft'} · Course`}
                Icon={BookOpen}
                title={course.title}
                deck={`${course.lessons?.length || 0} lesson${(course.lessons?.length || 0) === 1 ? '' : 's'} in this course.`}
            >
                {course.isPublished ? (
                    <button
                        onClick={() => unpublish.mutate()}
                        disabled={unpublish.isPending}
                        className="inline-flex items-center gap-1.5 font-mono uppercase transition-transform duration-200 hover:scale-[1.03]"
                        style={{
                            fontSize: '0.62rem', letterSpacing: '0.20em', fontWeight: 700,
                            color: 'rgba(251,191,36,1)', background: 'rgba(251,191,36,0.10)',
                            border: '1px solid rgba(251,191,36,0.40)', borderRadius: 999,
                            padding: '11px 18px', cursor: 'pointer',
                        }}
                    >
                        <EyeOff size={11} /> Unpublish
                    </button>
                ) : (
                    <button
                        onClick={() => publish.mutate()}
                        disabled={publish.isPending}
                        className="inline-flex items-center gap-1.5 font-mono uppercase transition-transform duration-200 hover:scale-[1.03]"
                        style={{
                            fontSize: '0.62rem', letterSpacing: '0.20em', fontWeight: 700,
                            color: '#0d0c1c', background: 'var(--studio-gradient)',
                            border: 'none', borderRadius: 999,
                            padding: '11px 18px', cursor: 'pointer',
                        }}
                    >
                        <Eye size={11} /> Publish
                    </button>
                )}
            </StudioMasthead>

            <StudioPanel radius={18} className="p-4">
                <StageRail course={course} completedLessonIds={[]} />
            </StudioPanel>

            <div className="flex items-center gap-3 flex-wrap">
                <Link
                    to={`/courses/${id}`}
                    className="font-mono uppercase"
                    style={{
                        fontSize: '0.60rem', letterSpacing: '0.22em', fontWeight: 700,
                        color: 'rgba(245,245,245,0.55)', textDecoration: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.20)', paddingBottom: 3,
                    }}
                >
                    View public page →
                </Link>
                <PactBadge size={18} withLabel />
            </div>

            {publish.isError && (
                <p
                    className="max-w-xl"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        color: 'rgba(252,165,165,1)',
                        borderLeft: '1px solid rgba(252,165,165,0.45)',
                        paddingLeft: 12,
                    }}
                >
                    {publish.error?.response?.data?.message || 'Could not publish this course.'}
                    {publish.error?.response?.data?.code === 'INTRO_REQUIRED' && (
                        <span className="block mt-1.5" style={{ color: 'rgba(245,245,245,0.55)' }}>
                            Open a lesson below and tick <strong>This is the introduction</strong>.
                        </span>
                    )}
                </p>
            )}

            <div className="flex gap-4 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = t.id === tab;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className="inline-flex items-center gap-1.5 font-mono uppercase"
                            style={{
                                fontSize: '0.62rem',
                                letterSpacing: '0.22em',
                                fontWeight: 700,
                                color: active ? 'var(--text-primary)' : 'rgba(245,245,245,0.50)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: active ? '1px solid var(--text-primary)' : '1px solid transparent',
                                padding: '10px 0',
                                marginBottom: -1,
                                cursor: 'pointer',
                            }}
                        >
                            <Icon size={11} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'lessons' && (
                <div>
                    {(course.lessons || []).map((l, i) => (
                        <div
                            key={l._id}
                            className="flex items-center gap-3 py-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span
                                className="w-7 h-7 rounded-full flex items-center justify-center font-mono flex-shrink-0"
                                style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    background: l.isBoss ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: l.isBoss ? 'rgba(251,191,36,1)' : 'rgba(245,245,245,0.65)',
                                    border: l.isBoss ? '1px solid rgba(251,191,36,0.40)' : '1px solid rgba(255,255,255,0.10)',
                                }}
                            >
                                {l.isBoss ? <Crown size={11} /> : i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div
                                    className="truncate"
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '1.05rem',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {l.title}
                                    {l.isIntro && (
                                        <span
                                            className="ml-2 font-mono uppercase"
                                            style={{ fontSize: '0.54rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(103,232,249,1)' }}
                                        >
                                            Introduction
                                        </span>
                                    )}
                                    {l.isBoss && (
                                        <span
                                            className="ml-2 font-mono uppercase"
                                            style={{ fontSize: '0.54rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(251,191,36,1)' }}
                                        >
                                            Boss
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="font-mono uppercase mt-0.5"
                                    style={{ fontSize: '0.54rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.45)' }}
                                >
                                    {l.hasQuiz ? 'Quiz included' : 'No quiz'} · {l.isFree ? 'Free preview' : 'Gated'}
                                    {l.promiseCopy ? ' · Level Card' : ''}
                                </div>
                            </div>
                            <Link
                                to={`/mentor/courses/${id}/lessons/${l._id}`}
                                className="inline-flex items-center gap-1 font-mono uppercase"
                                style={{
                                    fontSize: '0.58rem',
                                    letterSpacing: '0.20em',
                                    fontWeight: 700,
                                    color: 'rgba(245,245,245,0.55)',
                                    textDecoration: 'none',
                                }}
                            >
                                <Edit3 size={9} /> Edit
                            </Link>
                            <button
                                onClick={() => updateLesson.mutate({ lessonId: l._id, body: { isFree: !l.isFree } })}
                                className="font-mono uppercase"
                                style={{
                                    fontSize: '0.58rem',
                                    letterSpacing: '0.20em',
                                    fontWeight: 700,
                                    color: 'rgba(245,245,245,0.55)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {l.isFree ? 'Make gated' : 'Make free'}
                            </button>
                            <button
                                onClick={() => { if (window.confirm('Delete this lesson?')) deleteLesson.mutate(l._id); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(252,165,165,0.70)',
                                    cursor: 'pointer',
                                    padding: 4,
                                }}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {(course.lessons || []).length === 0 && (
                        <div
                            className="py-8 text-center"
                            style={{
                                fontFamily: 'var(--font-serif)',
                                color: 'rgba(245,245,245,0.55)',
                            }}
                        >
                            No lessons yet. Use the course builder to add some.
                        </div>
                    )}
                </div>
            )}

            {tab === 'qa' && <CommentThread courseId={id} course={course} />}

            {tab === 'enrollments' && <EnrollmentsTab id={id} />}

            {tab === 'settings' && (
                <SettingsTab
                    course={course}
                    onSave={(body) => courses.update(id, body)}
                    onDelete={() => { if (window.confirm('Delete this course?')) remove.mutate(); }}
                />
            )}
        </div>
    );
};

const EnrollmentsTab = ({ id }) => {
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['courses', id, 'enrollments'],
        queryFn: () => courses.enrollments(id),
    });
    if (isLoading) {
        return (
            <div
                className="py-6"
                style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'rgba(245,245,245,0.55)',
                }}
            >
                Reading the rolls.
            </div>
        );
    }
    if (items.length === 0) {
        return (
            <div
                className="py-6"
                style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'rgba(245,245,245,0.55)',
                }}
            >
                No one enrolled yet.
            </div>
        );
    }
    return (
        <StudioPanel as="ul" radius={18} className="overflow-hidden">
            {items.map((e) => (
                <li
                    key={e._id}
                    className="flex items-center gap-3 p-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    {e.user?.avatar ? (
                        <img src={e.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-mono"
                            style={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                background: 'rgba(255,255,255,0.06)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {e.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div
                            className="truncate"
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.02rem',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {e.user?.name || 'Learner'}
                        </div>
                        <div
                            className="font-mono mt-0.5"
                            style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.55)' }}
                        >
                            Enrolled {new Date(e.enrolledAt).toLocaleDateString()} · {e.progressPct || 0}%{e.completedAt ? ' · Completed' : ''}
                        </div>
                    </div>
                    <div className="w-24 h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                            className="h-full"
                            style={{
                                width: `${e.progressPct || 0}%`,
                                background: 'var(--text-primary)',
                            }}
                        />
                    </div>
                </li>
            ))}
        </StudioPanel>
    );
};

const SettingsTab = ({ course, onSave, onDelete }) => {
    const [title, setTitle] = useState(course.title);
    const [subtitle, setSubtitle] = useState(course.subtitle || '');
    const [description, setDescription] = useState(course.description || '');
    const [price, setPrice] = useState(course.priceInr || 0);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await onSave({ title, subtitle, description, priceInr: price });
        } finally { setSaving(false); }
    };

    return (
        <StudioPanel radius={20} className="space-y-3" style={{ padding: '22px 24px' }}>
            <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2" style={inputStyle} />
            </Field>
            <Field label="Subtitle">
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-3 py-2" style={inputStyle} />
            </Field>
            <Field label="Description">
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2" style={inputStyle} />
            </Field>
            <Field label="Price (₹)">
                <input type="number" min={0} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className="w-full px-3 py-2" style={inputStyle} />
            </Field>
            <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 font-mono uppercase transition-transform duration-200 hover:scale-[1.03]"
                    style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.20em',
                        fontWeight: 700,
                        color: '#0d0c1c',
                        background: 'var(--studio-gradient)',
                        border: 'none',
                        borderRadius: 999,
                        padding: '11px 18px',
                        cursor: 'pointer',
                        opacity: saving ? 0.6 : 1,
                    }}
                >
                    <Save size={11} /> {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                    onClick={onDelete}
                    className="ml-auto inline-flex items-center gap-1.5 font-mono uppercase"
                    style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.22em',
                        fontWeight: 700,
                        color: 'rgba(252,165,165,1)',
                        background: 'transparent',
                        border: '1px solid rgba(252,165,165,0.40)',
                        padding: '8px 12px',
                        cursor: 'pointer',
                    }}
                >
                    <Trash2 size={11} /> Delete course
                </button>
            </div>
        </StudioPanel>
    );
};

const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'var(--text-primary)',
    borderRadius: 8,
    fontSize: '0.95rem',
};

const Field = ({ label, children }) => (
    <label className="block">
        <span
            className="block font-mono uppercase mb-1.5"
            style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
        >
            {label}
        </span>
        {children}
    </label>
);

export default CourseEditor;
