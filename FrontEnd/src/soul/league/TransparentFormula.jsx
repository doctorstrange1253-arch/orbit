/**
 * soul/league/TransparentFormula.jsx — The "Weekly XP formula" popover.
 *
 * V3 design: a small info icon next to "Weekly XP" in the Gameology
 * page opens a popover explaining exactly how the number is computed.
 * The formula is the trust contract between the user and the engine:
 * if the user knows the math, they can trust the league.
 *
 * Formula (per V3 plan §7):
 *   Weekly XP =
 *     lessons_completed * 50
 *     + quizzes_passed * 30
 *     + perfect_quiz_bonuses * 10
 *     + courses_completed * 200
 *     + sessions_completed * 100
 *     + peer_swaps_completed * 40
 *     + qa_replies * 5
 *     + streak_bonuses (every 7 days) * 20
 *
 * Display: a small list with each row's source. The "reset" rule:
 * the weekly counter resets every Monday 00:00 UTC.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';

const ROWS = [
  { event: 'Lesson completed',        xp: 50,  note: 'one per lesson' },
  { event: 'Quiz passed',             xp: 30,  note: 'one per quiz' },
  { event: 'Perfect quiz (first try)',xp: 10,  note: 'bonus on top of "passed"' },
  { event: 'Course completed',        xp: 200, note: 'one per 100% course' },
  { event: 'Paid session completed',  xp: 100, note: 'student side' },
  { event: 'Peer swap completed',     xp: 40,  note: 'per swap' },
  { event: 'Q&A reply posted',        xp: 5,   note: 'per reply' },
  { event: 'Streak bonus (7-day)',    xp: 20,  note: 'one per weekly milestone' },
];

const TransparentFormula = () => {
  const { nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="How is weekly XP calculated?"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-text-muted hover:text-text-primary"
      >
        <Info size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 left-0 top-full mt-2 w-80 rounded-xl border border-border-subtle p-4 shadow-2xl"
            style={{ background: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)' }}
            role="dialog"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">
                Weekly XP formula
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-primary"
                aria-label="Close"
              >
                <X size={12} />
              </button>
            </div>
            <p className="text-[11px] text-text-secondary mb-2">
              Your weekly XP resets every Monday 00:00 UTC. The total is the sum of:
            </p>
            <table className="w-full text-[11px] text-text-primary">
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.event} className="border-b border-border-subtle/30 last:border-0">
                    <td className="py-1.5 pr-2">{r.event}</td>
                    <td className="py-1.5 pr-2 text-right tabular-nums font-bold" style={{ color: accent }}>+{r.xp}</td>
                    <td className="py-1.5 text-text-muted text-[10px]">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[10px] text-text-muted">
              Boss level pass: +150 XP (3x a normal lesson). Achievement bonuses: per achievement.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default TransparentFormula;
