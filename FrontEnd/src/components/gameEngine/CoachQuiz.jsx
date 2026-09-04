/**
 * components/gameEngine/CoachQuiz.jsx — The friend-not-textbook quiz wrapper.
 *
 * V3 design: the V2 QuizCard is a textbook ("Q1. What is the root note?
 * A) C  B) D  C) E  D) F"). The Coach Quiz wraps it in a conversation:
 *
 *   Wrong answer → a friend-tone rewrite of the explanation
 *                  ("Not quite. The root note is the lowest one in a
 *                   chord — think of it as the home base. Try again?")
 *                  + a one-click "Show me why" link to the relevant
 *                  moment in the video.
 *
 *   Right answer → a soft "Nice. That's the foundation for every chord
 *                  you'll ever see." + a small XP-tooltip-style streak
 *                  indicator after 3 right in a row.
 *
 * The friend copy lives in the V3 `question.coachCopy` field (added to
 * the Course schema in V3-D). When absent, falls back to the V2
 * `question.explanation`.
 *
 * On the V3 Boss Level (5-10 question quiz, 100% to pass), the Coach
 * Quiz runs the same conversational frame but adds a "submit all"
 * flow + the 6s post-pass ceremony.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { SoulSound } from '../../soul/soundLibrary';
import { Haptic } from '../../soul/haptics';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Friend-tone templates — used when coachCopy is missing entirely.
const FALLBACK_WRONG = "Not quite — give it another try.";
const FALLBACK_RIGHT = "Nice. That's the foundation for what's next.";

const CoachQuiz = ({ questions = [], passingScore = 70, onSubmit, onPass, isBoss = false }) => {
  const { nebula } = useSoul();
  const reduced = _isReducedMotion();
  const accent = nebula?.from || '#22d3ee';

  const [answers, setAnswers] = useState({});           // { [qIdx]: chosenIdx }
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);               // 3-right streak for the "🌟" indicator
  const [showStreakSpark, setShowStreakSpark] = useState(false);

  const correctCount = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIdx ? 1 : 0), 0);
  }, [submitted, answers, questions]);

  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= passingScore;

  const setAnswer = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qIdx]: optIdx }));
  };

  const submit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitted(true);
    // Compute streak (consecutive correct from q0).
    let s = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIdx) s += 1;
      else s = 0;
    }
    setStreak(s);
    if (s >= 3) {
      setShowStreakSpark(true);
      setTimeout(() => setShowStreakSpark(false), 1500);
    }
    if (passed) {
      Haptic.success();
      SoulSound.courseComplete();
    } else {
      Haptic.heavy();
    }
    onSubmit?.({ score, correctCount, passed, answers });
    if (passed) onPass?.({ score, correctCount });
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
    setStreak(0);
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-text-muted text-sm border border-border-subtle bg-surface/30">
        No quiz for this lesson.
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 md:p-6 border border-border-subtle bg-surface/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">
          {isBoss ? 'Boss quiz · ' : 'Quiz · '}
          {questions.length} question{questions.length > 1 ? 's' : ''} · pass {passingScore}%
        </div>
        {submitted && (
          <div className="inline-flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${passed ? 'text-emerald-300' : 'text-rose-300'}`}>
              {score}% {passed ? '· pass' : '· try again'}
            </span>
          </div>
        )}
      </div>

      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const isCorrect = submitted && chosen === q.correctIdx;
        const isWrong = submitted && chosen !== undefined && chosen !== q.correctIdx;
        const coach = q.coachCopy || q.explanation;
        return (
          <div key={qi} className="rounded-xl border border-border-subtle/60 bg-surface/20 p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Q{qi + 1}
              </span>
              {submitted && isCorrect && <Check size={14} className="text-emerald-300" />}
              {submitted && isWrong && <X size={14} className="text-rose-300" />}
              {submitted && chosen === undefined && <span className="text-[10px] text-text-muted">unanswered</span>}
            </div>
            <div className="text-sm font-semibold text-text-primary mb-3">
              {q.prompt}
            </div>
            <div className="space-y-1.5">
              {(q.options || []).map((opt, oi) => {
                const isPicked = chosen === oi;
                const isAnswer = q.correctIdx === oi;
                const showRight = submitted && isAnswer;
                const showWrong = submitted && isPicked && !isAnswer;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswer(qi, oi)}
                    disabled={submitted}
                    className={[
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors border',
                      showRight ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100' :
                      showWrong ? 'border-rose-400/50 bg-rose-500/10 text-rose-100' :
                      isPicked ? 'border-accent/40 bg-accent/10 text-text-primary' :
                      'border-border-subtle bg-bg/30 text-text-secondary hover:border-accent/30',
                      submitted ? 'cursor-default' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold',
                        showRight ? 'bg-emerald-400 text-emerald-900' :
                        showWrong ? 'bg-rose-400 text-rose-900' :
                        isPicked ? 'bg-accent text-text-on-accent' :
                        'bg-surface text-text-muted border border-border-subtle',
                      ].join(' ')}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Coach copy — friend-tone rewrite of the explanation */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 rounded-lg p-3 text-sm"
                  style={{
                    background: isCorrect
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(244, 63, 94, 0.08)',
                    border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                    color: isCorrect ? 'rgb(167, 243, 208)' : 'rgb(254, 205, 211)',
                  }}
                >
                  <div className="font-semibold mb-1">
                    {isCorrect ? (isBoss ? 'Conquered.' : 'Nice.') : 'Not quite.'}
                  </div>
                  <div className="text-xs leading-relaxed">
                    {coach || (isCorrect ? FALLBACK_RIGHT : FALLBACK_WRONG)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <AnimatePresence>
        {showStreakSpark && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 6 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fde68a' }}
          >
            <Sparkles size={12} /> {streak} in a row · that's a streak
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 pt-1">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={Object.keys(answers).length < questions.length}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})` }}
          >
            Submit <ArrowRight size={14} />
          </button>
        ) : passed ? (
          <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-semibold">
            <Check size={14} /> {isBoss ? 'Boss conquered.' : 'Passed.'}
          </div>
        ) : (
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-border-subtle text-text-primary hover:border-accent/30"
          >
            <RotateCcw size={14} /> Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default CoachQuiz;
