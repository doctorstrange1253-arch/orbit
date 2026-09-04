import { useState, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plus, Save, Upload, Video, X, ChevronDown, ChevronRight, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { courses } from '../../services/courses';
import { proposeLevel, isStubProposal } from '../../services/ai';
import GenrePicker from '../../components/taxonomy/GenrePicker';
import {
    MentorBackLink,
    MentorEyebrow,
    MentorTitle,
} from '../../components/pact/MentorEditorial';

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
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <Helmet><title>New course · Orbit Mentor</title></Helmet>

            <div>
                <MentorBackLink to="/mentor/courses">My courses</MentorBackLink>
            </div>

            <motion.header
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <MentorEyebrow>Mentor · New course</MentorEyebrow>
                <div className="mt-2">
                    <MentorTitle size="xl">Begin a new course</MentorTitle>
                </div>
            </motion.header>

            <ol className="flex items-center gap-2 mb-2 flex-wrap">
                {STEPS.map((s, i) => {
                    const active = i === step;
                    const done = i < step;
                    return (
                        <li key={s} className="flex items-center gap-2">
                            <button
                                onClick={() => setStep(i)}
                                className="font-mono uppercase"
                                style={{
                                    fontSize: '0.60rem',
                                    letterSpacing: '0.22em',
                                    fontWeight: 700,
                                    color: active ? 'var(--text-primary)' : done ? 'rgba(110,231,183,1)' : 'rgba(245,245,245,0.50)',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: active ? '1px solid var(--text-primary)' : '1px solid transparent',
                                    padding: '6px 0',
                                    cursor: 'pointer',
                                }}
                            >
                                {String(i + 1).padStart(2, '0')} · {s}
                            </button>
                            {i < STEPS.length - 1 && (
                                <span style={{ color: 'rgba(245,245,245,0.30)', fontSize: '0.7rem' }}>→</span>
                            )}
                        </li>
                    );
                })}
            </ol>

            <div style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '20px 22px' }}>
                {step === 0 && (
                    <div className="space-y-3">
                        <Field label="Title">
                            <input value={state.title} onChange={(e) => dispatch({ type: 'SET', key: 'title', value: e.target.value })} className="w-full px-3 py-2" style={inputStyle} />
                        </Field>
                        <Field label="Subtitle (one-liner)">
                            <input value={state.subtitle} onChange={(e) => dispatch({ type: 'SET', key: 'subtitle', value: e.target.value })} className="w-full px-3 py-2" style={inputStyle} />
                        </Field>
                        <Field label="Description">
                            <textarea rows={4} value={state.description} onChange={(e) => dispatch({ type: 'SET', key: 'description', value: e.target.value })} className="w-full px-3 py-2" style={inputStyle} />
                        </Field>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <Field label="Genre">
                                <GenrePicker
                                    value={state.category}
                                    onChange={(value) => dispatch({ type: 'SET', key: 'category', value })}
                                    className="w-full px-3 py-2"
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Level">
                                <select value={state.level} onChange={(e) => dispatch({ type: 'SET', key: 'level', value: e.target.value })} className="w-full px-3 py-2" style={inputStyle}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </Field>
                            <Field label="Price (₹)">
                                <input type="number" min={0} value={state.priceInr} onChange={(e) => dispatch({ type: 'SET', key: 'priceInr', value: Math.max(0, Number(e.target.value) || 0) })} className="w-full px-3 py-2" style={inputStyle} />
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
                                courseTitle={state.title}
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
                            className="inline-flex items-center gap-2 font-mono uppercase"
                            style={{
                                fontSize: '0.62rem',
                                letterSpacing: '0.22em',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.30)',
                                padding: '8px 12px',
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={11} /> Add lesson
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-3">
                        <div>
                            <h3
                                style={{
                                    fontFamily: 'var(--font-editorial)',
                                    fontStyle: 'italic',
                                    fontWeight: 700,
                                    fontSize: '1.6rem',
                                    lineHeight: 1.1,
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {state.title}
                            </h3>
                            {state.subtitle && (
                                <p
                                    className="mt-1.5"
                                    style={{
                                        fontFamily: 'var(--font-serif)',
                                        fontStyle: 'italic',
                                        color: 'rgba(245,245,245,0.65)',
                                    }}
                                >
                                    {state.subtitle}
                                </p>
                            )}
                            <div
                                className="mt-2 font-mono uppercase"
                                style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                            >
                                {state.lessons.length} lesson{state.lessons.length === 1 ? '' : 's'} · {state.category} · {state.level}
                            </div>
                        </div>
                        {state.thumbnail?.url && (
                            <img src={state.thumbnail.url} alt="" style={{ width: '100%', maxWidth: 360, height: 'auto', border: '1px solid rgba(255,255,255,0.10)' }} />
                        )}
                        <p
                            style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                color: 'rgba(245,245,245,0.55)',
                            }}
                        >
                            Save the draft to create the course. You can add more lessons and publish from the editor.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 16 }}>
                <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="font-mono uppercase"
                    style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.22em',
                        fontWeight: 700,
                        color: 'rgba(245,245,245,0.55)',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        opacity: step === 0 ? 0.4 : 1,
                    }}
                >
                    Back
                </button>
                {step < STEPS.length - 1 ? (
                    <button
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canNext}
                        className="font-mono uppercase"
                        style={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.22em',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.30)',
                            padding: '8px 14px',
                            cursor: 'pointer',
                            opacity: canNext ? 1 : 0.4,
                        }}
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
                        className="inline-flex items-center gap-2 font-mono uppercase"
                        style={{
                            fontSize: '0.62rem',
                            letterSpacing: '0.22em',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.30)',
                            padding: '8px 14px',
                            cursor: 'pointer',
                        }}
                    >
                        <Save size={11} /> {create.isPending ? 'Saving…' : 'Save draft'}
                    </button>
                )}
            </div>
        </div>
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
            <div
                className="flex items-center justify-center"
                style={{
                    width: 144, height: 90,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                }}
            >
                {value?.url ? <img src={value.url} alt="" className="w-full h-full object-cover" /> : <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.45)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>No image</span>}
            </div>
            <label
                className="inline-flex items-center gap-1.5 font-mono uppercase cursor-pointer"
                style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.22em',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.30)',
                    padding: '8px 12px',
                }}
            >
                <Upload size={11} /> {uploading ? 'Uploading…' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={uploading} />
            </label>
        </div>
    );
};

const LessonEditor = ({ lesson, index, open, onToggle, onUpdate, onRemove, onAddQuestion, onUpdateQuestion, onRemoveQuestion, onUploadVideo, courseTitle }) => {
    const [uploading, setUploading] = useState(0);
    const [aiBusy, setAiBusy] = useState(false);
    const [aiProposal, setAiProposal] = useState(null);
    const [aiError, setAiError] = useState(null);

    const handleVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(1);
        try {
            await onUploadVideo(file, (pct) => setUploading(pct));
        } finally { setUploading(0); }
    };

    const handleAiSuggest = async () => {
        if (aiBusy) return;
        setAiBusy(true);
        setAiError(null);
        try {
            const data = await proposeLevel({
                courseTitle: courseTitle || '',
                lessonTitle: lesson.title || '',
                lessonDescription: lesson.description || '',
            });
            setAiProposal(data);
        } catch (e) {
            setAiError(e?.response?.data?.message || e?.message || 'AI unavailable');
        } finally {
            setAiBusy(false);
        }
    };

    const applyAiProposal = () => {
        if (!aiProposal) return;
        const patch = {};
        if (aiProposal.promiseCopy && !lesson.promiseCopy) patch.promiseCopy = aiProposal.promiseCopy;
        if (aiProposal.whyCopy && !lesson.whyCopy) patch.whyCopy = aiProposal.whyCopy;
        if (aiProposal.rememberCopy && !lesson.rememberCopy) patch.rememberCopy = aiProposal.rememberCopy;
        if (aiProposal.bossChallenge) patch.bossChallenge = aiProposal.bossChallenge;
        if (Array.isArray(aiProposal.quizQuestions) && aiProposal.quizQuestions.length > 0 && (!lesson.quiz?.questions || lesson.quiz.questions.length === 0)) {
            patch.quiz = { ...(lesson.quiz || { passingScore: 70 }), questions: aiProposal.quizQuestions };
        }
        onUpdate(patch);
        setAiProposal(null);
    };

    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <button onClick={onToggle} className="w-full flex items-center justify-between p-3 text-left" style={{ background: 'transparent', border: 'none' }}>
                <div className="flex items-center gap-2">
                    {open ? <ChevronDown size={14} style={{ color: 'rgba(245,245,245,0.55)' }} /> : <ChevronRight size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />}
                    <span
                        className="font-mono uppercase"
                        style={{ fontSize: '0.62rem', letterSpacing: '0.20em', fontWeight: 700, color: 'var(--text-primary)' }}
                    >
                        Lesson {String(index + 1).padStart(2, '0')}
                        {lesson.title ? ` — ${lesson.title}` : ''}
                    </span>
                </div>
                <span
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    style={{ color: 'rgba(252,165,165,0.70)', cursor: 'pointer', padding: 4 }}
                >
                    <Trash2 size={12} />
                </span>
            </button>
            {open && (
                <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="pt-2">
                        <Field label="Title">
                            <input value={lesson.title} onChange={(e) => onUpdate({ title: e.target.value })}
                                className="w-full px-2.5 py-1.5" style={{ ...inputStyle, fontSize: '0.92rem' }} />
                        </Field>
                        <div className="mt-2">
                            <Field label="Description">
                                <textarea rows={2} value={lesson.description} onChange={(e) => onUpdate({ description: e.target.value })}
                                    className="w-full px-2.5 py-1.5" style={{ ...inputStyle, fontSize: '0.92rem' }} />
                            </Field>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span
                            className="font-mono uppercase"
                            style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                        >
                            AI helper
                        </span>
                        <button
                            type="button"
                            onClick={handleAiSuggest}
                            disabled={aiBusy || !lesson.title}
                            className="inline-flex items-center gap-1.5 font-mono uppercase"
                            style={{
                                fontSize: '0.58rem',
                                letterSpacing: '0.20em',
                                fontWeight: 700,
                                color: aiBusy || !lesson.title ? 'rgba(245,245,245,0.30)' : 'var(--text-primary)',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.20)',
                                padding: '6px 10px',
                                cursor: aiBusy || !lesson.title ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {aiBusy ? <Loader2 size={9} className="animate-spin" /> : <Sparkles size={9} />}
                            {aiBusy ? 'Drafting' : 'Suggest lesson'}
                        </button>
                    </div>
                    {aiError && (
                        <div style={{ border: '1px solid rgba(252,165,165,0.30)', background: 'rgba(252,165,165,0.06)', padding: '8px 10px', color: 'rgba(252,165,165,0.85)', fontSize: '0.78rem' }}>
                            {aiError}
                        </div>
                    )}
                    {aiProposal && (
                        <div className="space-y-2" style={{ border: '1px solid rgba(255,255,255,0.20)', padding: '10px 12px' }}>
                            <div className="flex items-center justify-between">
                                <span
                                    className="font-mono uppercase"
                                    style={{ fontSize: '0.56rem', letterSpacing: '0.20em', fontWeight: 700, color: 'var(--text-primary)' }}
                                >
                                    {isStubProposal(aiProposal) ? 'Suggested (template)' : 'AI suggested'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setAiProposal(null)}
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.56rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={applyAiProposal}
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.56rem', letterSpacing: '0.20em', fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', borderBottom: '1px solid var(--text-primary)', cursor: 'pointer', paddingBottom: 2 }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                            {aiProposal.promiseCopy && (
                                <div>
                                    <div
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.50rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.55)', marginBottom: 2 }}
                                    >
                                        Promise
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>{aiProposal.promiseCopy}</div>
                                </div>
                            )}
                            {aiProposal.whyCopy && (
                                <div>
                                    <div
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.50rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.55)', marginBottom: 2 }}
                                    >
                                        Why it matters
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.75)', fontSize: '0.92rem' }}>{aiProposal.whyCopy}</div>
                                </div>
                            )}
                            {aiProposal.rememberCopy && (
                                <div>
                                    <div
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.50rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.55)', marginBottom: 2 }}
                                    >
                                        One thing to remember
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.75)', fontSize: '0.92rem' }}>{aiProposal.rememberCopy}</div>
                                </div>
                            )}
                            {Array.isArray(aiProposal.quizQuestions) && aiProposal.quizQuestions.length > 0 && (
                                <div>
                                    <div
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.50rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(245,245,245,0.55)', marginBottom: 2 }}
                                    >
                                        {aiProposal.quizQuestions.length} quiz question{aiProposal.quizQuestions.length > 1 ? 's' : ''}
                                    </div>
                                    <ol className="list-decimal pl-4" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.75)', fontSize: '0.86rem' }}>
                                        {aiProposal.quizQuestions.slice(0, 3).map((q, i) => (
                                            <li key={i} className="line-clamp-1">{q.prompt || `Question ${i + 1}`}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                            {aiProposal.bossChallenge && (
                                <div>
                                    <div
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.50rem', letterSpacing: '0.18em', fontWeight: 700, color: 'rgba(251,191,36,1)', marginBottom: 2 }}
                                    >
                                        Boss challenge
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(245,245,245,0.75)', fontSize: '0.92rem' }}>{aiProposal.bossChallenge}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <Field label="Video">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex-1 truncate"
                                    style={{ fontSize: '0.78rem', color: lesson.videoUrl ? 'rgba(245,245,245,0.75)' : 'rgba(245,245,245,0.45)' }}
                                >
                                    {lesson.videoUrl ? `✓ Uploaded` : 'No video uploaded'}
                                </div>
                                <label
                                    className="inline-flex items-center gap-1.5 font-mono uppercase cursor-pointer"
                                    style={{
                                        fontSize: '0.58rem',
                                        letterSpacing: '0.20em',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.20)',
                                        padding: '6px 10px',
                                    }}
                                >
                                    <Video size={9} /> {uploading > 0 ? `${uploading}%` : 'Upload'}
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideo} disabled={uploading > 0} />
                                </label>
                            </div>
                        </Field>
                    </div>
                    <label className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(245,245,245,0.65)' }}>
                        <input type="checkbox" checked={!!lesson.isFree} onChange={(e) => onUpdate({ isFree: e.target.checked })} />
                        Free preview (anyone can watch)
                    </label>

                    <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span
                                className="font-mono uppercase"
                                style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                            >
                                Quiz
                            </span>
                            <button
                                onClick={onAddQuestion}
                                className="inline-flex items-center gap-1 font-mono uppercase"
                                style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <Plus size={9} /> Add question
                            </button>
                        </div>
                        {(lesson.quiz?.questions || []).map((q, qi) => (
                            <div key={qi} className="mb-2" style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '8px 10px' }}>
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className="font-mono uppercase"
                                        style={{ fontSize: '0.56rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
                                    >
                                        Q{qi + 1}
                                    </span>
                                    <button
                                        onClick={() => onRemoveQuestion(qi)}
                                        style={{ background: 'transparent', border: 'none', color: 'rgba(252,165,165,0.70)', cursor: 'pointer', padding: 2 }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                                <input
                                    value={q.prompt}
                                    onChange={(e) => onUpdateQuestion(qi, { prompt: e.target.value })}
                                    placeholder="Question prompt"
                                    className="w-full px-2 py-1 mb-1"
                                    style={{ ...inputStyle, fontSize: '0.86rem' }}
                                />
                                {(q.options || []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-1.5 mb-1">
                                        <input type="radio" name={`q-${qi}`} checked={q.correctIdx === oi} onChange={() => onUpdateQuestion(qi, { correctIdx: oi })} />
                                        <input
                                            value={opt}
                                            onChange={(e) => {
                                                const options = q.options.slice();
                                                options[oi] = e.target.value;
                                                onUpdateQuestion(qi, { options });
                                            }}
                                            placeholder={`Option ${oi + 1}`}
                                            className="flex-1 px-2 py-1"
                                            style={{ ...inputStyle, fontSize: '0.86rem' }}
                                        />
                                    </div>
                                ))}
                                <input
                                    value={q.explanation}
                                    onChange={(e) => onUpdateQuestion(qi, { explanation: e.target.value })}
                                    placeholder="Explanation (optional)"
                                    className="w-full px-2 py-1"
                                    style={{ ...inputStyle, fontSize: '0.78rem' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;
