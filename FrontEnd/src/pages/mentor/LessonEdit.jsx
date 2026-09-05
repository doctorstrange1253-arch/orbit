import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Save, Plus, X, Loader2, Sparkles, Crown } from 'lucide-react';
import { courses } from '../../services/courses';
import { proposeLevel, isStubProposal } from '../../services/ai';
import FuturisticBackdrop from '../../components/common/FuturisticBackdrop';
import YellowCard from '../../soul/moderation/YellowCard';
import api from '../../services/api';
import { StudioMasthead, StudioPanel } from '../../soul/studio/surfaces';

const LessonEdit = () => {
    const { id, lessonId } = useParams();
    const qc = useQueryClient();

    const { data: course, isLoading } = useQuery({
        queryKey: ['courses', 'detail', id],
        queryFn: () => courses.detail(id),
    });

    const lesson = useMemo(
        () => (course?.lessons || []).find((l) => String(l._id) === String(lessonId)),
        [course, lessonId]
    );

    const [form, setForm] = useState(null);
    useEffect(() => {
        if (lesson && !form) {
            setForm({
                title: lesson.title || '',
                description: lesson.description || '',
                isFree: !!lesson.isFree,
                isIntro: !!lesson.isIntro,
                isBoss: !!lesson.isBoss,
                bossChallenge: lesson.bossChallenge || '',
                promiseCopy: lesson.promiseCopy || '',
                whyCopy: lesson.whyCopy || '',
                rememberCopy: lesson.rememberCopy || '',
                quiz: lesson.quiz || { passingScore: 70, questions: [] },
            });
        }
    }, [lesson, form]);

    const updateLesson = useMutation({
        mutationFn: (body) => courses.updateLesson(id, lessonId, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['courses', 'detail', id] });
            qc.invalidateQueries({ queryKey: ['moderation', 'inbox'] });
        },
    });

    const { data: inboxData } = useQuery({
        queryKey: ['moderation', 'inbox'],
        queryFn: () => api.get('/moderation/me').then((r) => r.data),
        enabled: !!lessonId,
        staleTime: 60_000,
    });
    const lessonReview = useMemo(
        () => (inboxData?.items || []).find((r) => String(r.lessonId) === String(lessonId)),
        [inboxData, lessonId]
    );

    const respond = useMutation({
        mutationFn: ({ rid, action, note, falsePositive }) =>
            api.post(`/moderation/${rid}/respond`, { action, note, falsePositive }).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['moderation', 'inbox'] }),
    });

    const [aiBusy, setAiBusy] = useState(false);
    const [aiProposal, setAiProposal] = useState(null);
    const [aiError, setAiError] = useState(null);

    const handleAiSuggest = async () => {
        if (aiBusy || !form) return;
        setAiBusy(true);
        setAiError(null);
        try {
            const data = await proposeLevel({
                courseTitle: course?.title || '',
                lessonTitle: form.title || '',
                lessonDescription: form.description || '',
            });
            setAiProposal(data);
        } catch (e) {
            setAiError(e?.response?.data?.message || e?.message || 'AI unavailable');
        } finally {
            setAiBusy(false);
        }
    };

    const applyAiProposal = () => {
        if (!aiProposal || !form) return;
        const patch = { ...form };
        if (aiProposal.promiseCopy && !patch.promiseCopy) patch.promiseCopy = aiProposal.promiseCopy;
        if (aiProposal.whyCopy && !patch.whyCopy) patch.whyCopy = aiProposal.whyCopy;
        if (aiProposal.rememberCopy && !patch.rememberCopy) patch.rememberCopy = aiProposal.rememberCopy;
        if (aiProposal.bossChallenge && !patch.bossChallenge) patch.bossChallenge = aiProposal.bossChallenge;
        if (Array.isArray(aiProposal.quizQuestions) && aiProposal.quizQuestions.length > 0
            && (!patch.quiz?.questions || patch.quiz.questions.length === 0)) {
            patch.quiz = { ...(patch.quiz || { passingScore: 70 }), questions: aiProposal.quizQuestions };
        }
        setForm(patch);
        setAiProposal(null);
    };

    if (isLoading || !form) {
        return (
            <div className="relative min-h-screen">
                <FuturisticBackdrop />
                <div className="relative z-10 max-w-3xl mx-auto p-12 text-text-secondary">Loading…</div>
            </div>
        );
    }
    if (!lesson) {
        return (
            <div className="relative min-h-screen">
                <FuturisticBackdrop />
                <div className="relative z-10 max-w-3xl mx-auto p-12 text-text-secondary">Lesson not found.</div>
            </div>
        );
    }

    const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const setQuiz = (quiz) => setField('quiz', quiz);

    const addQuestion = () => {
        const questions = form.quiz?.questions || [];
        setQuiz({
            ...(form.quiz || { passingScore: 70 }),
            questions: [...questions, { prompt: '', options: ['', '', '', ''], correctIdx: 0, explanation: '', coachCopy: '' }],
        });
    };
    const updateQuestion = (qIdx, patch) => {
        const questions = (form.quiz?.questions || []).map((q, i) => i === qIdx ? { ...q, ...patch } : q);
        setQuiz({ ...(form.quiz || { passingScore: 70 }), questions });
    };
    const removeQuestion = (qIdx) => {
        const questions = (form.quiz?.questions || []).filter((_, i) => i !== qIdx);
        setQuiz({ ...(form.quiz || { passingScore: 70 }), questions });
    };

    const save = () => {
        updateLesson.mutate({
            title: form.title,
            description: form.description,
            isFree: form.isFree,
            isIntro: form.isIntro,
            isBoss: form.isBoss,
            bossChallenge: form.bossChallenge,
            promiseCopy: form.promiseCopy,
            whyCopy: form.whyCopy,
            rememberCopy: form.rememberCopy,
            quiz: form.quiz,
        });
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
                <Helmet><title>Edit lesson · {form.title || 'Lesson'}</title></Helmet>

                <Link to={`/mentor/courses/${id}/edit`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to {course?.title}
                </Link>

                <StudioMasthead
                    eyebrow={`${course?.isPublished ? 'Published' : 'Draft'} · Lesson`}
                    Icon={Crown}
                    title={form.title || 'Untitled lesson'}
                    deck={course?.title ? `In ${course.title}.` : undefined}
                />

                {lessonReview && (
                    <div className="mb-5">
                        <YellowCard
                            review={lessonReview}
                            onEdit={() => {}}
                            onAppeal={(rid, note) => respond.mutate({ rid, action: 'appealed', note })}
                            onFalsePositive={(rid) => respond.mutate({ rid, action: 'cleared', falsePositive: true })}
                        />
                    </div>
                )}

                <StudioPanel radius={18} className="space-y-3 p-4">
                    <Field label="Title">
                        <input value={form.title} onChange={(e) => setField('title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-text-primary" />
                    </Field>
                    <Field label="Description">
                        <textarea rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary" />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle/40">
                        <label className="flex items-center gap-2 text-xs text-text-secondary">
                            <input type="checkbox" checked={form.isFree} onChange={(e) => setField('isFree', e.target.checked)} disabled={form.isIntro} />
                            Free preview (anyone can watch)
                            {form.isIntro && <span className="text-[9px] text-text-muted">— forced on for the introduction</span>}
                        </label>
                        <label className={`flex items-center gap-2 text-xs ${form.isBoss ? 'text-amber-200' : 'text-text-secondary'}`}>
                            <input type="checkbox" checked={form.isBoss} onChange={(e) => setField('isBoss', e.target.checked)} />
                            <Crown size={12} className="text-amber-300" />
                            <span className="font-bold uppercase tracking-widest text-[10px]">Boss Level</span>
                            {form.isBoss && <span className="text-[9px] text-amber-300/80">— 5+ question quiz · 100% to pass · 6s ceremony on pass</span>}
                        </label>
                    </div>

                    <div className="pt-2 border-t border-border-subtle/40">
                        <label className={`flex items-start gap-2 text-xs ${form.isIntro ? 'text-cyan-200' : 'text-text-secondary'}`}>
                            <input
                                type="checkbox"
                                checked={form.isIntro}
                                onChange={(e) => {
                                    setField('isIntro', e.target.checked);
                                    if (e.target.checked) setField('isFree', true);
                                }}
                                className="mt-0.5"
                            />
                            <span>
                                <span className="font-bold uppercase tracking-widest text-[10px]">This is the introduction</span>
                                <span className="block text-[10px] text-text-muted mt-0.5">
                                    Every course needs one before it can be published. Students watch it free to judge your teaching before they subscribe — so it is always a free preview.
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="pt-2 border-t border-border-subtle/40">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Level Card</div>
                                <div className="text-[10px] text-text-muted mt-0.5">The 3-line card the student sees for 2-3s before the video starts.</div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAiSuggest}
                                disabled={aiBusy || !form.title}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-accent/10 text-accent border border-accent/30 text-[10px] font-bold uppercase tracking-widest hover:bg-accent/20 disabled:opacity-50"
                            >
                                {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                {aiBusy ? 'Drafting' : 'Suggest copy'}
                            </button>
                        </div>
                        {aiError && (
                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200 mb-2">{aiError}</div>
                        )}
                        {aiProposal && (
                            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-2 text-xs mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                                        {isStubProposal(aiProposal) ? 'Suggested (template)' : 'AI suggested'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setAiProposal(null)} className="text-text-muted hover:text-text-primary">Dismiss</button>
                                        <button onClick={applyAiProposal} className="text-accent hover:underline font-bold">Apply</button>
                                    </div>
                                </div>
                                {aiProposal.promiseCopy && <ProposalLine label="Promise" value={aiProposal.promiseCopy} />}
                                {aiProposal.whyCopy && <ProposalLine label="Why it matters" value={aiProposal.whyCopy} />}
                                {aiProposal.rememberCopy && <ProposalLine label="One thing to remember" value={aiProposal.rememberCopy} />}
                            </div>
                        )}
                        <Field label="Promise — what the student will be able to do (240 chars)" hint={`${form.promiseCopy.length} / 240`}>
                            <textarea rows={2} maxLength={240} value={form.promiseCopy} onChange={(e) => setField('promiseCopy', e.target.value)}
                                placeholder='In the next 4 minutes, you can read a chord progression by ear.'
                                className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary resize-none" />
                        </Field>
                        <Field label="Why it matters — the unlock (240 chars)" hint={`${form.whyCopy.length} / 240`}>
                            <textarea rows={2} maxLength={240} value={form.whyCopy} onChange={(e) => setField('whyCopy', e.target.value)}
                                placeholder="This unlocks Module 3's harmony section."
                                className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary resize-none" />
                        </Field>
                        <Field label="One thing to remember — the anchor (240 chars)" hint={`${form.rememberCopy.length} / 240`}>
                            <textarea rows={2} maxLength={240} value={form.rememberCopy} onChange={(e) => setField('rememberCopy', e.target.value)}
                                placeholder="The root note is the one that feels like home."
                                className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary resize-none" />
                        </Field>
                        {form.isBoss && (
                            <Field label="Boss challenge — what they must prove (800 chars)" hint={`${form.bossChallenge.length} / 800`}>
                                <textarea rows={3} maxLength={800} value={form.bossChallenge} onChange={(e) => setField('bossChallenge', e.target.value)}
                                    placeholder="Name every root by ear across two octaves, no instrument."
                                    className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-border-subtle text-sm text-text-primary resize-none" />
                            </Field>
                        )}
                    </div>

                    <div className="pt-2 border-t border-border-subtle/40">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Quiz</div>
                                {form.isBoss && (
                                    <div className="text-[10px] text-amber-300/80 mt-0.5">Boss Lessons need 5+ questions · 100% to pass</div>
                                )}
                            </div>
                            <button onClick={addQuestion} className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-text-primary">
                                <Plus className="w-3 h-3" /> Add question
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Passing score</span>
                            <input
                                type="number" min={50} max={100} step={5}
                                value={form.quiz?.passingScore || 70}
                                onChange={(e) => setQuiz({ ...(form.quiz || { questions: [] }), passingScore: Math.max(50, Math.min(100, Number(e.target.value) || 70)) })}
                                className="w-20 px-2 py-1 rounded bg-bg/50 border border-border-subtle text-sm text-text-primary"
                                disabled={form.isBoss}
                            />
                            {form.isBoss && <span className="text-[10px] text-amber-300/80">forced to 100% for Boss</span>}
                        </div>
                        {(form.quiz?.questions || []).map((q, qi) => (
                            <div key={qi} className="rounded-lg border border-border-subtle/60 bg-surface/20 p-2 mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Q{qi + 1}</span>
                                    <button onClick={() => removeQuestion(qi)} className="text-text-muted hover:text-rose-300"><X className="w-3 h-3" /></button>
                                </div>
                                <input value={q.prompt} onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                                    placeholder="Question prompt"
                                    className="w-full px-2 py-1.5 rounded bg-bg/50 border border-border-subtle text-sm text-text-primary mb-1" />
                                {(q.options || []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-1.5 mb-1">
                                        <input type="radio" name={`q-${qi}`} checked={q.correctIdx === oi} onChange={() => updateQuestion(qi, { correctIdx: oi })} />
                                        <input value={opt} onChange={(e) => {
                                            const options = q.options.slice();
                                            options[oi] = e.target.value;
                                            updateQuestion(qi, { options });
                                        }} placeholder={`Option ${oi + 1}`}
                                            className="flex-1 px-2 py-1 rounded bg-bg/50 border border-border-subtle text-sm text-text-primary" />
                                    </div>
                                ))}
                                <input value={q.explanation || ''} onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                                    placeholder="Explanation (shown on submit)"
                                    className="w-full px-2 py-1 rounded bg-bg/50 border border-border-subtle text-xs text-text-primary mb-1" />
                                <textarea rows={2} maxLength={1200} value={q.coachCopy || ''} onChange={(e) => updateQuestion(qi, { coachCopy: e.target.value })}
                                    placeholder="Coach copy (friend-not-textbook, shown when wrong — 1200 chars)"
                                    className="w-full px-2 py-1 rounded bg-bg/50 border border-border-subtle text-xs text-text-primary resize-none" />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border-subtle/40">
                        <button onClick={save} disabled={updateLesson.isPending}
                            className="inline-flex items-center gap-1.5 px-4 py-2 font-mono uppercase"
                            style={{
                                fontSize: '0.60rem', letterSpacing: '0.18em', fontWeight: 700,
                                color: '#0d0c1c', background: 'var(--studio-gradient)',
                                borderRadius: 999, border: 'none', cursor: 'pointer',
                            }}>
                            <Save className="w-3.5 h-3.5" /> {updateLesson.isPending ? 'Saving…' : 'Save lesson'}
                        </button>
                        <Link to={`/mentor/courses/${id}/edit`} className="ml-auto text-xs text-text-muted hover:text-text-primary">Cancel</Link>
                    </div>
                </StudioPanel>
            </div>
        </div>
    );
};

const Field = ({ label, hint, children }) => (
    <label className="block">
        <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
            {hint && <span className="text-[10px] text-text-muted">{hint}</span>}
        </div>
        {children}
    </label>
);

const ProposalLine = ({ label, value }) => (
    <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{label}</div>
        <div className="text-text-secondary">{value}</div>
    </div>
);

export default LessonEdit;
