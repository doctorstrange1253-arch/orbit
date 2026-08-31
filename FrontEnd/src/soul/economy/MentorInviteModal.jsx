/**
 * soul/economy/MentorInviteModal.jsx — The 2-question application modal.
 *
 * The V3 cross-soul economy surfaces a "Consider teaching?" invite to:
 *   - Top-5% students (by weekly XP over 90 days)
 *   - Top swappers (10+ peer swaps in 90 days, avg rating 4.5+)
 *
 * The modal is short on purpose. The user sees a short paragraph that
 * explains *why* they were invited (e.g. "you swapped 14 times with
 * 4.7★ avg"), then 2 questions:
 *   1. Why do you want to teach on Orbit?
 *   2. What would your first course be about?
 *
 * Submission posts to the V2 MentorApplicationForm endpoint (already
 * mounted). Dismiss fires the cross-soul "respond('dismissed')" so
 * the system respects the 90-day cooldown.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { Haptic } from '../haptics';

const MentorInviteModal = ({ invite, onDismiss, onAccept }) => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const navigate = useNavigate();
  const [step, setStep] = useState('intro');  // 'intro' | 'questions' | 'done'
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  if (!invite) return null;
  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const isTopSwapper = invite.kind === 'top_swapper';
  const isTopStudent = invite.kind === 'top_student';

  const metrics = invite.metrics || {};

  const onContinue = () => {
    Haptic.light();
    setStep('questions');
  };

  const onSubmit = () => {
    if (!q1.trim() || !q2.trim()) return;
    Haptic.medium();
    // The actual application submission goes to the V2 mentor hub. We
    // also fire the cross-soul "accepted" so the worker stops inviting
    // this user.
    onAccept?.({ q1: q1.trim(), q2: q2.trim() });
    setStep('done');
    setTimeout(() => {
      navigate('/mentor/apply');
    }, 1500);
  };

  const onNotNow = () => {
    Haptic.heavy();
    onDismiss?.(invite);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        style={{ background: 'rgba(6,8,16,0.88)', backdropFilter: 'blur(8px)' }}
        role="dialog"
      >
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-lg w-full rounded-2xl p-6 md:p-8 border"
          style={{
            ...(nebula ? { background: `linear-gradient(135deg, ${nebula.from}11, rgba(6,8,16,0.95))` } : {}),
            borderColor: `${accent}55`,
            boxShadow: `0 0 60px ${accent}33`,
          }}
        >
          <button
            type="button"
            onClick={onNotNow}
            className="absolute top-3 right-3 text-text-muted hover:text-text-primary"
            aria-label="Not now"
          >
            <X size={18} />
          </button>

          {step === 'intro' && (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-mono uppercase tracking-widest mb-4" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}>
                <Sparkles size={11} /> Cross-soul invite
              </div>
              <h2 className="text-2xl font-display font-black text-text-primary mb-2">
                {isTopSwapper ? 'You swap well.' : "You're in the top 5%."}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {isTopSwapper
                  ? `${metrics.swaps || 'Many'} peer swaps in 90 days, ${(metrics.avgRating || 4.5).toFixed(1)}★ average. Have you considered teaching?`
                  : `Your learning is in the top 5% of Orbit. Have you considered teaching what you know?`}
              </p>
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                The application is two questions. We respect your time. You'll hear back within 48 hours.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})` }}
                >
                  Tell me more <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={onNotNow}
                  className="px-3 py-2 text-xs text-text-muted hover:text-text-primary"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div>
              <h2 className="text-2xl font-display font-black text-text-primary mb-4">
                Two questions.
              </h2>
              <div className="space-y-3 mb-5">
                <label className="block">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                    Why do you want to teach on Orbit?
                  </div>
                  <textarea
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 rounded-lg bg-bg/40 border border-border-subtle text-sm text-text-primary resize-none"
                  />
                </label>
                <label className="block">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                    What would your first course be about?
                  </div>
                  <textarea
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 rounded-lg bg-bg/40 border border-border-subtle text-sm text-text-primary resize-none"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!q1.trim() || !q2.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})` }}
                >
                  Submit <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setStep('intro')}
                  className="px-3 py-2 text-xs text-text-muted hover:text-text-primary"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${accent}22`, border: `1px solid ${accent}55` }}>
                <Sparkles size={20} style={{ color: accent }} />
              </div>
              <h2 className="text-2xl font-display font-black text-text-primary mb-2">Sent.</h2>
              <p className="text-sm text-text-muted">Taking you to the application page…</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MentorInviteModal;
