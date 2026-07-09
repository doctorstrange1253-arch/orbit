import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { TOURS } from './tours';
import { useTourStore } from '../../store/tourStore';

/**
 * Walkthrough — a zero-dependency first-visit tour rendered as a centered
 * message-card carousel ("this is this, that is that"). It opens itself the first
 * time a page is visited (tracked in tourStore) and can be replayed from the
 * Settings > Help center. Reduced-motion safe; closes on Esc, backdrop, or Skip.
 */
const BRAND_BTN = { background: 'linear-gradient(90deg,#38bdf8,#8b5cf6,#ec4899)' };
const CARD_TRANS = { duration: 0.28, ease: 'easeOut' };
const SHOW = { opacity: 1 };
const SHOW_CARD = { y: 0, opacity: 1, scale: 1 };

export default function Walkthrough({ tourKey }) {
  const tour = TOURS[tourKey];
  const reduce = useReducedMotion();
  const seenFlag = useTourStore((s) => s.seen[tourKey]);
  const replayKey = useTourStore((s) => s.replayKey);
  const markSeen = useTourStore((s) => s.markSeen);

  const shouldOpen = !!tour && (!seenFlag || replayKey === tourKey);
  const [open, setOpen] = useState(shouldOpen);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (shouldOpen) {
      setOpen(true);
      setI(0);
    }
  }, [shouldOpen]);

  useEffect(() => {
    if (!open || !tour) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        markSeen(tourKey);
      } else if (e.key === 'ArrowRight') {
        setI((n) => Math.min(n + 1, tour.steps.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setI((n) => Math.max(n - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, tour, tourKey, markSeen]);

  if (!tour || !open) return null;

  const steps = tour.steps;
  const last = i >= steps.length - 1;
  const step = steps[i];

  const finish = () => {
    setOpen(false);
    markSeen(tourKey);
  };
  const next = () => {
    if (last) finish();
    else setI((n) => Math.min(n + 1, steps.length - 1));
  };
  const back = () => setI((n) => Math.max(n - 1, 0));

  const overlayInit = reduce ? SHOW : { opacity: 0 };
  const cardInit = reduce ? SHOW_CARD : { y: 16, opacity: 0, scale: 0.98 };

  const node = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] grid place-items-center p-4"
        initial={overlayInit}
        animate={SHOW}
        exit={overlayInit}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={finish} />
        <motion.div
          key={i}
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl"
          initial={cardInit}
          animate={SHOW_CARD}
          transition={CARD_TRANS}
        >
          <button
            onClick={finish}
            aria-label="Skip walkthrough"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>

          <div className="mb-3 text-3xl leading-none" aria-hidden="true">{step.icon}</div>
          <h2 className="text-lg font-bold text-white">{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.body}</p>

          <div className="mt-5 flex items-center justify-center gap-1.5">
            {steps.map((s, n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all ${n === i ? 'w-5 bg-violet-400' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button onClick={finish} className="text-xs font-semibold text-slate-400 hover:text-slate-200">
              Skip
            </button>
            <div className="flex items-center gap-2">
              {i > 0 && (
                <button
                  onClick={back}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                >
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <button
                onClick={next}
                className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-black text-slate-900"
                style={BRAND_BTN}
              >
                {last ? (<><Check size={13} /> Done</>) : (<>Next <ArrowRight size={13} /></>)}
              </button>
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] uppercase tracking-widest text-slate-500">
            {tour.title} · {i + 1}/{steps.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}
