import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, RotateCcw } from 'lucide-react';

/**
 * QuizCard — in-lesson multiple-choice quiz.
 *
 * Renders the lesson's quiz.questions[]. Submits to
 * /api/courses/:id/lessons/:lessonId/quiz. Shows correct/incorrect
 * explanations after submit. A retry button re-opens the quiz.
 */
const QuizCard = ({ lesson, onSubmit, onRetry, isSubmitting, result }) => {
    const questions = lesson?.quiz?.questions || [];
    const [answers, setAnswers] = useState({});

    if (questions.length === 0) return null;

    const choose = (qi, idx) => {
        if (result) return;
        setAnswers((a) => ({ ...a, [qi]: idx }));
    };

    const allAnswered = questions.every((_, i) => answers[i] !== undefined);

    return (
        <div className="rounded-xl border border-border-subtle bg-surface/40 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-sm font-bold text-text-primary">Quiz · pass {lesson.quiz.passingScore || 70}%</h4>
            </div>

            <ol className="space-y-4">
                {questions.map((q, qi) => {
                    const chosen = answers[qi];
                    const correct = result?.correct !== undefined && result.correct >= 0
                        ? q.correctIdx
                        : null;
                    return (
                        <li key={qi} className="space-y-2">
                            <div className="text-sm text-text-primary font-medium">
                                {qi + 1}. {q.prompt}
                            </div>
                            <div className="grid gap-1.5">
                                {(q.options || []).map((opt, oi) => {
                                    const isChosen = chosen === oi;
                                    const isCorrect = correct === oi;
                                    const isWrongPick = isChosen && result && oi !== q.correctIdx;
                                    return (
                                        <button
                                            key={oi}
                                            onClick={() => choose(qi, oi)}
                                            disabled={!!result}
                                            className={`text-left text-sm px-3 py-2 rounded-lg border transition ${
                                                isCorrect
                                                    ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
                                                    : isWrongPick
                                                        ? 'border-rose-400/50 bg-rose-500/10 text-rose-100'
                                                        : isChosen
                                                            ? 'border-accent/50 bg-accent/10 text-text-primary'
                                                            : 'border-border-subtle bg-surface/30 text-text-secondary hover:border-accent/30'
                                            }`}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                {isCorrect ? <Check className="w-3.5 h-3.5" /> : isWrongPick ? <X className="w-3.5 h-3.5" /> : null}
                                                {opt}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {result && q.explanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[12px] text-text-muted bg-surface/30 rounded-lg px-3 py-2 border-l-2 border-accent/40"
                                >
                                    {q.explanation}
                                </motion.div>
                            )}
                        </li>
                    );
                })}
            </ol>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.button
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        disabled={!allAnswered || isSubmitting}
                        onClick={() => onSubmit(questions.map((_, i) => answers[i]))}
                        className="mt-4 w-full py-2.5 rounded-pill bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm disabled:opacity-50"
                    >
                        {isSubmitting ? 'Grading…' : 'Submit answers'}
                    </motion.button>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-xl border border-accent/30 bg-accent/5"
                    >
                        <div className="text-sm font-bold text-text-primary">
                            You scored {result.score}% · {result.passed ? 'Passed' : 'Try again'}
                            {result.perfect && ' · 🎯 Perfect!'}
                        </div>
                        {!result.passed && (
                            <button
                                onClick={() => { onRetry(); setAnswers({}); }}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-accent hover:text-text-primary"
                            >
                                <RotateCcw className="w-3 h-3" /> Retry
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizCard;
