import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Check, Award, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { courses } from '../services/courses';
import LessonPlayer from '../components/courses/LessonPlayer';
import QuizCard from '../components/courses/QuizCard';
import CommentThread from '../components/courses/CommentThread';
import FuturisticBackdrop from '../components/common/FuturisticBackdrop';
// V3 — Game Engine. Level Card (pre-lesson), Attention Arc (decelerate
// on disengage), Coach Quiz (friend-not-textbook rewrite), and the
// post-pass Boss Ceremony for boss lessons.
import LevelCard from '../components/gameEngine/LevelCard';
import AttentionArc from '../components/gameEngine/AttentionArc';
import CoachQuiz from '../components/gameEngine/CoachQuiz';
import BossCeremony from '../components/gameEngine/BossCeremony';

const CourseLearn = () => {
    const { id, lessonId } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [quizResult, setQuizResult] = useState(null);
    const [openQa, setOpenQa] = useState(false);
    // V3 — the Game Engine state machine:
    //   card (LevelCard) → video (LessonPlayer + AttentionArc) → quiz
    //   (CoachQuiz) → done
    // For Boss lessons: same flow, but on quiz pass → BossCeremony
    // overlay (6s) before returning to the course.
    const [stage, setStage] = useState('card');  // 'card' | 'video' | 'quiz' | 'done' | 'boss'
    const [showBossCeremony, setShowBossCeremony] = useState(false);
    const [bossConcepts, setBossConcepts] = useState([]);
    const videoRef = useRef(null);

    const { data: course, isLoading } = useQuery({
        queryKey: ['courses', 'detail', id],
        queryFn: () => courses.detail(id),
    });

    // Pick the active lesson: from URL, or first one
    const activeLessonId = lessonId || (course?.lessons?.[0]?._id);
    const activeLesson = useMemo(
        () => (course?.lessons || []).find((l) => String(l._id) === String(activeLessonId)),
        [course, activeLessonId]
    );

    // Reset the stage when the user navigates to a new lesson.
    useEffect(() => {
        setStage('card');
        setShowBossCeremony(false);
        setQuizResult(null);
    }, [activeLessonId]);

    // Track completions optimistically
    const completed = new Set(
        (course?.lessons || []).filter((l) => l.isFree).map((l) => String(l._id))
    );

    const complete = useMutation({
        mutationFn: (lessonIdToComplete) => courses.completeLesson(id, lessonIdToComplete),
        onSuccess: (res) => {
            completed.add(activeLessonId);
            // V3 — Boss lessons: show the 6s ceremony, then route.
            if (activeLesson?.isBoss) {
                setBossConcepts(activeLesson?.conceptSlugs || []);
                setShowBossCeremony(true);
                return;
            }
            if (res?.justCompleted) {
                navigate(`/courses/${id}/certificate/${res.certificateId || 'new'}`);
            }
            qc.invalidateQueries({ queryKey: ['courses', 'detail', id] });
            qc.invalidateQueries({ queryKey: ['gameology', 'me'] });
            qc.invalidateQueries({ queryKey: ['knowledge', 'me'] });
        },
    });

    const submitQuiz = useMutation({
        mutationFn: (answers) => courses.submitQuiz(id, activeLessonId, answers),
        onSuccess: (res) => {
            setQuizResult(res);
            qc.invalidateQueries({ queryKey: ['gameology', 'me'] });
        },
    });

    // V3 — Coach Quiz onPass → mark lesson complete. The mutation's
    // onSuccess handles the boss-ceremony branch.
    const onCoachQuizPass = () => {
        if (!activeLesson) return;
        complete.mutate(activeLesson._id);
    };

    const onBossCeremonyDone = () => {
        setShowBossCeremony(false);
        // Advance to the next lesson if there is one.
        const lessons = course?.lessons || [];
        const i = lessons.findIndex((l) => String(l._id) === String(activeLessonId));
        const next = lessons[i + 1];
        if (next) navigate(`/courses/${id}/learn/${next._id}`);
        else navigate(`/courses/${id}`);
        qc.invalidateQueries({ queryKey: ['courses', 'detail', id] });
        qc.invalidateQueries({ queryKey: ['knowledge', 'me'] });
    };

    if (isLoading) {
        return <div className="relative min-h-screen"><FuturisticBackdrop /><div className="relative z-10 max-w-6xl mx-auto p-12 text-text-secondary">Loading…</div></div>;
    }
    if (!course) {
        return <div className="relative min-h-screen"><FuturisticBackdrop /><div className="relative z-10 max-w-6xl mx-auto p-12 text-text-secondary">Course not found.</div></div>;
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <FuturisticBackdrop />
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8">
                <Helmet><title>{activeLesson?.title || 'Learn'} · {course.title}</title></Helmet>

                <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-3">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to course
                </Link>

                <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar: lesson list */}
                    <aside className="md:sticky md:top-20 md:self-start">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">
                            {course.lessons?.length || 0} lessons
                        </h2>
                        <ol className="rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm divide-y divide-border-subtle/40 overflow-hidden">
                            {(course.lessons || []).map((l, i) => {
                                const isActive = String(l._id) === String(activeLessonId);
                                const isDone = completed.has(String(l._id));
                                return (
                                    <li key={l._id}>
                                        <button
                                            onClick={() => navigate(`/courses/${id}/learn/${l._id}`)}
                                            className={`w-full flex items-start gap-2 p-3 text-left hover:bg-accent/5 ${isActive ? 'bg-accent/10' : ''}`}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                                isDone ? 'bg-emerald-500/20 text-emerald-300' : isActive ? 'bg-accent/20 text-accent' : 'bg-surface text-text-muted'
                                            }`}>
                                                {isDone ? <Check className="w-3 h-3" /> : i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-xs font-semibold line-clamp-2 ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>{l.title}</div>
                                                {l.hasQuiz && <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] text-amber-300"><Award className="w-3 h-3" /> Quiz</span>}
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </aside>

                    {/* Main: player + quiz + Q&A */}
                    <main>
                        <motion.h1
                            key={activeLessonId}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl md:text-2xl font-black text-text-primary mb-1"
                        >
                            {activeLesson?.title || 'Pick a lesson'}
                        </motion.h1>
                        <div className="text-xs text-text-muted mb-3">
                            Lesson {(course.lessons || []).findIndex((l) => String(l._id) === String(activeLessonId)) + 1 || 0} of {course.lessons?.length || 0}
                        </div>

                        {/* V3 — Game Engine: 4-stage state machine
                            card → video (with attention arc) → quiz (coach copy) → done.
                            The stage advances as the user clicks Begin / finishes the
                            video / passes the quiz. Boss lessons get the 6s
                            BossCeremony after the quiz passes. */}
                        {stage === 'card' && (
                          <div className="mb-4">
                            <LevelCard
                              lesson={activeLesson}
                              onBegin={() => setStage('video')}
                            />
                          </div>
                        )}

                        {stage !== 'card' && (
                          <>
                            <div className="relative">
                              <LessonPlayer
                                  lesson={activeLesson}
                                  onComplete={() => {
                                    if (activeLesson?.hasQuiz) setStage('quiz');
                                    else if (!completed.has(String(activeLessonId))) complete.mutate(activeLessonId);
                                  }}
                                  isCompleted={completed.has(String(activeLessonId))}
                                  isMarkingComplete={complete.isPending}
                              />
                              <AttentionArc videoRef={videoRef} enabled={!completed.has(String(activeLessonId)) && stage === 'video'} />
                            </div>

                            {activeLesson?.description && (
                                <p className="mt-4 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                                    {activeLesson.description}
                                </p>
                            )}

                            {/* V3 — Coach Quiz (friend-not-textbook). For boss
                                lessons, the quiz is 5-10 questions + 100% to
                                pass (set in the V3 schema; for non-boss the
                                legacy passingScore applies). On pass, the
                                complete mutation fires which routes to the
                                BossCeremony for boss lessons. */}
                            {activeLesson?.hasQuiz && stage === 'quiz' && (
                                <div className="mt-6">
                                    <CoachQuiz
                                        questions={activeLesson.quiz?.questions || []}
                                        passingScore={activeLesson.isBoss ? 100 : (activeLesson.quiz?.passingScore || 70)}
                                        isBoss={!!activeLesson.isBoss}
                                        onSubmit={({ score, passed, answers }) => {
                                            // Also fire the V2 quiz endpoint so the
                                            // backend records the score + XP for the
                                            // quiz_passed event.
                                            submitQuiz.mutate(answers);
                                        }}
                                        onPass={onCoachQuizPass}
                                    />
                                </div>
                            )}

                            {/* Q&A */}
                            <div className="mt-6">
                                <button
                                    onClick={() => setOpenQa((v) => !v)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm hover:border-accent/30"
                                >
                                    <h3 className="text-sm font-bold text-text-primary inline-flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-accent" /> Q&amp;A
                                    </h3>
                                    <span className="text-xs text-text-muted">{openQa ? 'Hide' : 'Show'}</span>
                                </button>
                                {openQa && (
                                    <div className="mt-3">
                                        <CommentThread courseId={id} lessonId={activeLessonId} course={course} />
                                    </div>
                                )}
                            </div>

                            {/* Auto-advance to next lesson on completion (non-boss) */}
                            {complete.isSuccess && complete.data?.justCompleted && !activeLesson?.isBoss && (
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mt-6 p-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-center"
                                >
                                    <Sparkles className="w-6 h-6 text-emerald-300 mx-auto mb-1" />
                                    <div className="text-sm font-bold text-emerald-100">Course complete!</div>
                                    <div className="text-xs text-emerald-200/70">Taking you to your certificate…</div>
                                </motion.div>
                            )}
                          </>
                        )}
                    </main>
                </div>
            </div>

            {/* V3 — Boss Ceremony (6s) after passing a Boss Level quiz.
                Overlays the page until the student clicks Continue (or the
                6s auto-advance has elapsed). */}
            {showBossCeremony && activeLesson?.isBoss && (
              <BossCeremony
                lesson={activeLesson}
                course={course}
                concepts={bossConcepts}
                onDone={onBossCeremonyDone}
              />
            )}
        </div>
    );
};

export default CourseLearn;
