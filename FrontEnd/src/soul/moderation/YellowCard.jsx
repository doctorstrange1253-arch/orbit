/**
 * soul/moderation/YellowCard.jsx — The mentor-private moderation overlay.
 *
 * V3 design: a mentor sees a Yellow Card on the lesson's edit page
 * when the moderation pipeline flagged the lesson. The card is private
 * to the mentor — students never see it. It carries:
 *   - the count of flagged moments
 *   - timestamps (deep-link to the video at that second)
 *   - the matched text + reason
 *   - three actions: edit, appeal, or mark-as-false-positive
 *
 * The false-positive flag is recorded on the ModerationReview row;
 * if the mentor's FP rate > 50% over 30 days, the moderation pipeline
 * pauses for them for 7 days (anti-punishment).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ExternalLink, Edit3, ShieldOff, X, Check } from 'lucide-react';
import { surfaceRecipe, tintHalo } from '../tints';
import { Haptic } from '../haptics';

const YellowCard = ({ review, onEdit, onAppeal, onFalsePositive, onDismiss }) => {
  const [note, setNote] = useState('');
  const [showAppeal, setShowAppeal] = useState(false);
  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const accent = '#fbbf24';

  if (!review) return null;
  const hits = review.hits || [];
  const onMarkFalsePositive = () => {
    Haptic.light();
    onFalsePositive?.(review._id, note || null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-5 relative"
        style={{
          ...surfaceRecipe('mentor'),
          border: `1px solid rgba(251, 191, 36, 0.35)`,
          boxShadow: tintHalo({ from: accent, to: accent }, 18),
          background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(6,8,16,0.4))',
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.4)' }}
          >
            <AlertTriangle size={18} className="text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-text-primary">Yellow Card</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[9px] font-bold uppercase tracking-widest bg-amber-500/15 text-amber-200 border border-amber-500/30">
                Private
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              We found {hits.length} moment{hits.length === 1 ? '' : 's'} in <span className="font-semibold text-text-primary">"{review.lessonTitle || 'this lesson'}"</span> that may not fit Orbit's guidelines.
            </p>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-text-muted hover:text-text-primary"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Hits list */}
        {hits.length > 0 && (
          <ol className="space-y-2 mb-4">
            {hits.map((h, i) => (
              <li
                key={i}
                className="rounded-lg p-3 text-sm flex items-center gap-3"
                style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.18)' }}
              >
                <span className="text-[10px] font-mono text-amber-200 tabular-nums">
                  {h.timestampSec > 0 ? `${Math.floor(h.timestampSec / 60)}:${String(h.timestampSec % 60).padStart(2, '0')}` : '—'}
                </span>
                <span className="text-text-primary flex-1">
                  <span className="text-text-muted text-[10px] uppercase tracking-widest mr-1">
                    {h.reason?.replace('_', ' ')}
                  </span>
                  {h.text}
                </span>
                {onEdit && h.timestampSec > 0 && (
                  <button
                    type="button"
                    onClick={() => onEdit(h.timestampSec)}
                    className="text-[10px] font-bold uppercase tracking-widest text-amber-200 hover:text-amber-100 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> Open at {Math.floor(h.timestampSec / 60)}:xx
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}

        {/* Appeal note (collapsible) */}
        <AnimatePresence>
          {showAppeal && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us why this is correct (200 char max)…"
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg bg-bg/40 border border-border-subtle text-sm text-text-primary resize-none"
                rows={2}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(0)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest text-text-on-accent"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f43f5e)' }}
            >
              <Edit3 size={12} /> Edit lesson
            </button>
          )}
          {onAppeal && (
            <button
              type="button"
              onClick={() => {
                if (showAppeal && note.trim()) {
                  Haptic.medium();
                  onAppeal(review._id, note.trim());
                  setNote('');
                  setShowAppeal(false);
                } else {
                  setShowAppeal(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest border border-border-subtle text-text-primary hover:border-amber-500/40"
            >
              {showAppeal && note.trim() ? <Check size={12} /> : null}
              Appeal
            </button>
          )}
          {onFalsePositive && (
            <button
              type="button"
              onClick={onMarkFalsePositive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary ml-auto"
              title="Tell the system this was wrong"
            >
              <ShieldOff size={12} /> This was wrong
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default YellowCard;
