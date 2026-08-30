import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, BookOpen, Eye, EyeOff, Save, Pencil, Trash2, Users, MessageCircle } from 'lucide-react';
import { courses } from '../../services/courses';
import CommentThread from '../../components/courses/CommentThread';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import PactBadge from '../../components/pact/PactBadge';

/**
 * CourseEditor — post-create management surface.
 *
 * Tabs: Lessons / Pricing / Q&A / Enrollments / Settings. For MVP we
 * implement Lessons + Settings + a read-only Enrollments list. Pricing
 * and Q&A reuse the same forms the builder uses, kept as placeholders
 * that point to the public Q&A thread.
 */
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
        return <div className="relative min-h-screen"><FuturisticBackdrop /><div className="relative z-10 max-w-3xl mx-auto p-12 text-text-secondary">Loading…</div></div>;
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
                <Helmet><title>Edit · {course.title}</title></Helmet>

                <Link to="/mentor/courses" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
                    <ChevronLeft className="w-3.5 h-3.5" /> My courses
                </Link>

                <motion.header
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-start justify-between gap-3 flex-wrap"
                >
                    <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                            {course.isPublished ? 'Published' : 'Draft'} · {course.lessons?.length || 0} lessons
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-text-primary line-clamp-2">{course.title}</h1>
                        <div className="mt-1 flex items-center gap-2">
                            <Link to={`/courses/${id}`} className="text-xs text-accent hover:underline">View public page →</Link>
                            <PactBadge size={18} withLabel />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {course.isPublished ? (
                            <button onClick={() => unpublish.mutate()} disabled={unpublish.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-amber-500/15 text-amber-200 border border-amber-400/30 text-xs font-bold uppercase tracking-widest">
                                <EyeOff className="w-3.5 h-3.5" /> Unpublish
                            </button>
                        ) : (
                            <button onClick={() => publish.mutate()} disabled={publish.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 text-xs font-bold uppercase tracking-widest">
                                <Eye className="w-3.5 h-3.5" /> Publish
                            </button>
                        )}
                    </div>
                </motion.header>

                <div className="flex gap-1.5 mb-4 border-b border-border-subtle/40 overflow-x-auto">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        const active = t.id === tab;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition ${
                                    active ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {tab === 'lessons' && (
                    <div className="space-y-2">
                        {(course.lessons || []).map((l, i) => (
                            <div key={l._id} className="rounded-xl border border-border-subtle bg-surface/40 p-3 flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-surface flex items-center justify-center text-xs font-black text-text-muted">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-text-primary truncate">{l.title}</div>
                                    <div className="text-[10px] text-text-muted">
                                        {l.hasQuiz ? 'Quiz included' : 'No quiz'} · {l.isFree ? 'Free preview' : 'Gated'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateLesson.mutate({ lessonId: l._id, body: { isFree: !l.isFree } })}
                                    className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent"
                                >
                                    {l.isFree ? 'Make gated' : 'Make free'}
                                </button>
                                <button
                                    onClick={() => { if (window.confirm('Delete this lesson?')) deleteLesson.mutate(l._id); }}
                                    className="text-text-muted hover:text-rose-300"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {(course.lessons || []).length === 0 && (
                            <div className="text-text-muted text-sm py-8 text-center">No lessons yet. Use the course builder to add some.</div>
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
        </div>
    );
};

const EnrollmentsTab = ({ id }) => {
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['courses', id, 'enrollments'],
        queryFn: () => courses.enrollments(id),
    });
    if (isLoading) return <div className="text-text-muted text-sm py-6">Loading…</div>;
    if (items.length === 0) return <div className="text-text-muted text-sm py-6">No one enrolled yet.</div>;
    return (
        <ul className="divide-y divide-border-subtle/40 rounded-xl border border-border-subtle bg-surface/30">
            {items.map((e) => (
                <li key={e._id} className="flex items-center gap-3 p-3">
                    {e.user?.avatar ? (
                        <img src={e.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
                            {e.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text-primary">{e.user?.name || 'Learner'}</div>
                        <div className="text-[10px] text-text-muted">
                            Enrolled {new Date(e.enrolledAt).toLocaleDateString()} · {e.progressPct || 0}%{e.completedAt ? ' · Completed' : ''}
                        </div>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-border-subtle/40 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${e.progressPct || 0}%` }} />
                    </div>
                </li>
            ))}
        </ul>
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
        <div className="space-y-3 rounded-xl border border-border-subtle bg-surface/40 p-4">
            <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
            </Field>
            <Field label="Subtitle">
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
            </Field>
            <Field label="Description">
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
            </Field>
            <Field label="Price (₹)">
                <input type="number" min={0} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
            </Field>
            <div className="flex items-center gap-2 pt-2">
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-accent/15 text-accent border border-accent/30 text-xs font-bold uppercase tracking-widest">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button onClick={onDelete} className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-rose-500/10 text-rose-300 border border-rose-400/30 text-xs font-bold uppercase tracking-widest">
                    <Trash2 className="w-3.5 h-3.5" /> Delete course
                </button>
            </div>
        </div>
    );
};

const Field = ({ label, children }) => (
    <label className="block">
        <span className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{label}</span>
        {children}
    </label>
);

export default CourseEditor;
