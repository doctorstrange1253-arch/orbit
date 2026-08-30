import { useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plus, Save, ChevronLeft, Upload, Video, X, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { courses } from '../../services/courses';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import HolographicCard from '../../components/fx/HolographicCard';

/**
 * CourseBuilder — mentor course authoring (create + edit share the form).
 *
 * 5-step wizard (Basics → Thumbnail → Lessons → Quiz → Review). For MVP
 * the "quiz" is per-lesson (added in LessonEditor) so this collapses to
 * 4 visible steps. Uses useReducer for a clean form state.
 *
 * Uploads go straight through the /upload-video + /upload-thumbnail routes
 * (Cloudinary multer-storage), then the resulting {url, publicId} is stored
 * on the lesson / course doc via the create + addLesson flow.
 */
const blankLesson = () => ({
    _tempId: `tmp_${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    description: '',
    videoUrl: '',
    videoPublicId: '',
    durationSec: 0,
    resources: [],
    quiz: { passingScore: 70, questions: [] },
    isFree: false,
});

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET':        return { ...state, [action.key]: action.value };
        case 'ADD_LESSON': return { ...state, lessons: [...state.lessons, blankLesson()] };
        case 'UPDATE_LESSON': {
            const lessons = state.lessons.map((l) => l._tempId === action.id ? { ...l, ...action.patch } : l);
            return { ...state, lessons };
        }
        case 'REMOVE_LESSON': return { ...state, lessons: state.lessons.filter((l) => l._tempId !== action.id) };
        case 'ADD_QUESTION': {
            const lessons = state.lessons.map((l) => {
                if (l._tempId !== action.lessonId) return l;
                const q = { prompt: '', options: ['', '', '', ''], correctIdx: 0, explanation: '' };
                return { ...l, quiz: { ...(l.quiz || {}), questions: [...((l.quiz && l.quiz.questions) || []), q] } };
            });
            return { ...state, lessons };
        }
        case 'UPDATE_QUESTION': {
            const lessons = state.lessons.map((l) => {
                if (l._tempId !== action.lessonId) return l;
                const questions = (l.quiz?.questions || []).map((q, i) => i === action.qIdx ? { ...q, ...action.patch } : q);
                return { ...l, quiz: { ...(l.quiz || {}), questions } };
            });
            return { ...state, lessons };
        }
        case 'REMOVE_QUESTION': {
            const lessons = state.lessons.map((l) => {
                if (l._tempId !== action.lessonId) return l;
                const questions = (l.quiz?.questions || []).filter((_, i) => i !== action.qIdx);
                return { ...l, quiz: { ...(l.quiz || {}), questions } };
            });
            return { ...state, lessons };
        }
        default: return state;
    }
};

const STEPS = ['Basics', 'Thumbnail', 'Lessons', 'Review'];

const CourseBuilder = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [step, setStep] = useState(0);
    const [state, dispatch] = useReducer(reducer, {
        title: 'Untitled course',
        subtitle: '',
        description: '',
        category: 'general',
        level: 'beginner',
        language: 'English',
        priceInr: 0,
        tags: [],
        thumbnail: { url: '', publicId: '' },
        lessons: [blankLesson()],
    });
    const [openLessons, setOpenLessons] = useState(new Set([state.lessons[0]?._tempId]));

    const create = useMutation({
        mutationFn: (body) => courses.create(body),
        onSuccess: async (res) => {
            const id = res._id;
            // Add lessons (the create call accepts lessons inline, but for
            // clarity we re-add individually so the server-side addLesson
            // path handles videoUrl persistence + ordering).
            for (const l of state.lessons) {
                if (!l.title) continue;
                await courses.addLesson(id, {
                    title: l.title,
                    description: l.description,
                    videoUrl: l.videoUrl,
                    videoPublicId: l.videoPublicId,
                    durationSec: l.durationSec,
                    resources: l.resources,
                    quiz: l.quiz,
                    isFree: l.isFree,
                });
            }
            qc.invalidateQueries({ queryKey: ['courses', 'list'] });
            navigate(`/mentor/courses/${id}/edit`);
        },
    });

    const uploadThumb = async (file) => {
        const data = await courses.uploadThumbnail(file);
        dispatch({ type: 'SET', key: 'thumbnail', value: { url: data.url, publicId: data.publicId } });
    };
    const uploadVideo = async (file, lessonTempId, onProgress) => {
        const data = await courses.uploadVideo(file, onProgress);
        dispatch({ type: 'UPDATE_LESSON', id: lessonTempId, patch: { videoUrl: data.url, videoPublicId: data.publicId, durationSec: data.durationSec } });
    };

    const canNext = step === 0 ? state.title.trim().length > 0 : true;

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
                <Helmet><title>New course · Orbit Mentor</title></Helmet>

                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>

                <h1 className="text-2xl md:text-3xl font-black text-text-primary mb-2">Create a course</h1>

                {/* Stepper */}
                <ol className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {STEPS.map((s, i) => (
                        <li key={s} className="flex items-center gap-2">
                            <button
                                onClick={() => setStep(i)}
                                className={`px-2 py-1 rounded-pill ${i === step ? 'bg-accent/15 text-accent border border-accent/30' : i < step ? 'text-emerald-300' : ''}`}
                            >
                                {i + 1}. {s}
                            </button>
                            {i < STEPS.length - 1 && <span>→</span>}
                        </li>
                    ))}
                </ol>

                <HolographicCard className="p-5">
                    {step === 0 && (
                        <div className="space-y-3">
                            <Field label="Title">
                                <input value={state.title} onChange={(e) => dispatch({ type: 'SET', key: 'title', value: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
                            </Field>
                            <Field label="Subtitle (one-liner)">
                                <input value={state.subtitle} onChange={(e) => dispatch({ type: 'SET', key: 'subtitle', value: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
                            </Field>
                            <Field label="Description">
                                <textarea rows={4} value={state.description} onChange={(e) => dispatch({ type: 'SET', key: 'description', value: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
                            </Field>
                            <div className="grid sm:grid-cols-3 gap-3">
                                <Field label="Category">
                                    <input value={state.category} onChange={(e) => dispatch({ type: 'SET', key: 'category', value: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
                                </Field>
                                <Field label="Level">
                                    <select value={state.level} onChange={(e) => dispatch({ type: 'SET', key: 'level', value: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </Field>
                                <Field label="Price (₹)">
                                    <input type="number" min={0} value={state.priceInr} onChange={(e) => dispatch({ type: 'SET', key: 'priceInr', value: Math.max(0, Number(e.target.value) || 0) })}
                                        className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
                                </Field>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <Field label="Thumbnail">
                                <ThumbnailDrop value={state.thumbnail} onChange={uploadThumb} />
                            </Field>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-3">
                            {state.lessons.map((l, i) => (
                                <LessonEditor
                                    key={l._tempId}
                                    lesson={l}
                                    index={i}
                                    open={openLessons.has(l._tempId)}
                                    onToggle={() => {
                                        const next = new Set(openLessons);
                                        next.has(l._tempId) ? next.delete(l._tempId) : next.add(l._tempId);
                                        setOpenLessons(next);
                                    }}
                                    onUpdate={(patch) => dispatch({ type: 'UPDATE_LESSON', id: l._tempId, patch })}
                                    onRemove={() => dispatch({ type: 'REMOVE_LESSON', id: l._tempId })}
                                    onAddQuestion={() => dispatch({ type: 'ADD_QUESTION', lessonId: l._tempId })}
                                    onUpdateQuestion={(qIdx, patch) => dispatch({ type: 'UPDATE_QUESTION', lessonId: l._tempId, qIdx, patch })}
                                    onRemoveQuestion={(qIdx) => dispatch({ type: 'REMOVE_QUESTION', lessonId: l._tempId, qIdx })}
                                    onUploadVideo={(file, onProgress) => uploadVideo(file, l._tempId, onProgress)}
                                />
                            ))}
                            <button
                                onClick={() => { dispatch({ type: 'ADD_LESSON' }); }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-pill bg-surface/40 border border-border-subtle text-sm font-bold uppercase tracking-widest text-text-secondary hover:border-accent/40"
                            >
                                <Plus className="w-4 h-4" /> Add lesson
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-text-primary">{state.title}</h3>
                            {state.subtitle && <p className="text-sm text-text-secondary">{state.subtitle}</p>}
                            <div className="text-xs text-text-muted">{state.lessons.length} lesson{state.lessons.length === 1 ? '' : 's'} · {state.category} · {state.level}</div>
                            {state.thumbnail?.url && <img src={state.thumbnail.url} alt="" className="rounded-lg w-full max-w-sm" />}
                            <div className="text-sm text-text-secondary">
                                Click <strong>Save draft</strong> to create the course. You can add more lessons and publish from the editor.
                            </div>
                        </div>
                    )}
                </HolographicCard>

                <div className="mt-5 flex items-center justify-between">
                    <button
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 rounded-pill bg-surface/40 border border-border-subtle text-sm font-bold uppercase tracking-widest text-text-secondary disabled:opacity-50"
                    >
                        Back
                    </button>
                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canNext}
                            className="px-5 py-2 rounded-pill bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={() => create.mutate({
                                title: state.title,
                                subtitle: state.subtitle,
                                description: state.description,
                                category: state.category,
                                level: state.level,
                                language: state.language,
                                priceInr: state.priceInr,
                                thumbnail: state.thumbnail,
                                tags: state.tags,
                            })}
                            disabled={create.isPending}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-pill bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {create.isPending ? 'Saving…' : 'Save draft'}
                        </button>
                    )}
                </div>
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

const ThumbnailDrop = ({ value, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const handle = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try { await onChange(file); } finally { setUploading(false); }
    };
    return (
        <div className="flex items-center gap-3">
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-900/60 to-cyan-900/40 border border-border-subtle flex items-center justify-center">
                {value?.url ? <img src={value.url} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-text-muted">No image</span>}
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-accent/15 text-accent border border-accent/30 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-accent/25">
                <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading…' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={uploading} />
            </label>
        </div>
    );
};

const LessonEditor = ({ lesson, index, open, onToggle, onUpdate, onRemove, onAddQuestion, onUpdateQuestion, onRemoveQuestion, onUploadVideo }) => {
    const [uploading, setUploading] = useState(0);
    const handleVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(1);
        try {
            await onUploadVideo(file, (pct) => setUploading(pct));
        } finally { setUploading(0); }
    };
    return (
        <div className="rounded-xl border border-border-subtle bg-surface/30">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-3 text-left">
                <div className="flex items-center gap-2">
                    {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span className="text-sm font-bold text-text-primary">Lesson {index + 1}{lesson.title ? ` — ${lesson.title}` : ''}</span>
                </div>
                <span onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-text-muted hover:text-rose-300">
                    <Trash2 className="w-3.5 h-3.5" />
                </span>
            </button>
            {open && (
                <div className="px-3 pb-3 space-y-2 border-t border-border-subtle/40">
                    <Field label="Title">
                        <input value={lesson.title} onChange={(e) => onUpdate({ title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary" />
                    </Field>
                    <Field label="Description">
                        <textarea rows={2} value={lesson.description} onChange={(e) => onUpdate({ description: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary" />
                    </Field>
                    <Field label="Video">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 text-xs text-text-muted truncate">
                                {lesson.videoUrl ? `✓ ${lesson.videoUrl}` : 'No video uploaded'}
                            </div>
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-accent/15 text-accent border border-accent/30 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-accent/25">
                                <Video className="w-3.5 h-3.5" /> {uploading > 0 ? `${uploading}%` : 'Upload'}
                                <input type="file" accept="video/*" className="hidden" onChange={handleVideo} disabled={uploading > 0} />
                            </label>
                        </div>
                    </Field>
                    <label className="flex items-center gap-2 text-xs text-text-secondary">
                        <input type="checkbox" checked={!!lesson.isFree} onChange={(e) => onUpdate({ isFree: e.target.checked })} />
                        Free preview (anyone can watch)
                    </label>

                    {/* Quiz */}
                    <div className="pt-2 border-t border-border-subtle/40">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Quiz</span>
                            <button onClick={onAddQuestion} className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-text-primary">
                                <Plus className="w-3 h-3" /> Add question
                            </button>
                        </div>
                        {(lesson.quiz?.questions || []).map((q, qi) => (
                            <div key={qi} className="rounded-lg border border-border-subtle/60 bg-surface/20 p-2 mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Q{qi + 1}</span>
                                    <button onClick={() => onRemoveQuestion(qi)} className="text-text-muted hover:text-rose-300"><X className="w-3 h-3" /></button>
                                </div>
                                <input value={q.prompt} onChange={(e) => onUpdateQuestion(qi, { prompt: e.target.value })}
                                    placeholder="Question prompt"
                                    className="w-full px-2 py-1.5 rounded bg-bg/50 border border-border-subtle text-sm text-text-primary mb-1" />
                                {(q.options || []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-1.5 mb-1">
                                        <input type="radio" name={`q-${qi}`} checked={q.correctIdx === oi} onChange={() => onUpdateQuestion(qi, { correctIdx: oi })} />
                                        <input value={opt} onChange={(e) => {
                                            const options = q.options.slice();
                                            options[oi] = e.target.value;
                                            onUpdateQuestion(qi, { options });
                                        }} placeholder={`Option ${oi + 1}`}
                                            className="flex-1 px-2 py-1 rounded bg-bg/50 border border-border-subtle text-sm text-text-primary" />
                                    </div>
                                ))}
                                <input value={q.explanation} onChange={(e) => onUpdateQuestion(qi, { explanation: e.target.value })}
                                    placeholder="Explanation (optional)"
                                    className="w-full px-2 py-1 rounded bg-bg/50 border border-border-subtle text-xs text-text-primary" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;
