import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ExternalLink, Edit3, ShieldOff, X, Check } from 'lucide-react';
import { StudioPanel } from '../studio/surfaces';
import { Haptic } from '../haptics';

const AMBER = 'rgba(251,191,36,1)';

const MONO_MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.58rem',
  letterSpacing: '0.20em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const YellowCard = ({ review, onEdit, onAppeal, onFalsePositive, onDismiss }) => {
  const [note, setNote] = useState('');
  const [showAppeal, setShowAppeal] = useState(false);
  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (!review) return null;
  const hits = review.hits || [];
  const onMarkFalsePositive = () => {
    Haptic.light();
    onFalsePositive?.(review._id, note || null);
  };

  return (
    <StudioPanel
      as={motion.div}
      radius={20}
      className="relative p-5"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ borderColor: 'rgba(251,191,36,0.30)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 40, height: 40, borderRadius: 13,
            background: 'rgba(251,191,36,0.14)',
            border: '1px solid rgba(251,191,36,0.34)',
          }}
        >
          <AlertTriangle size={17} style={{ color: AMBER }} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '1.05rem', letterSpacing: '-0.02em',
                color: 'var(--text-primary)', margin: 0,
              }}
            >
              Yellow Card
            </h3>
            <span
              style={{
                ...MONO_MICRO,
                color: AMBER,
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.30)',
                borderRadius: 999,
                padding: '3px 9px',
              }}
            >
              Private
            </span>
          </div>
          <p
            style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', lineHeight: 1.55, color: 'rgba(245,245,245,0.62)', margin: 0 }}
          >
            {hits.length} moment{hits.length === 1 ? '' : 's'} in{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {review.lessonTitle || 'this lesson'}
            </span>{' '}
            may not fit Orbit&apos;s guidelines. Only you can see this.
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,245,245,0.45)', padding: 2 }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {hits.length > 0 && (
        <ol className="space-y-2 mb-4">
          {hits.map((h, i) => {
            const stamp = h.timestampSec > 0
              ? `${Math.floor(h.timestampSec / 60)}:${String(h.timestampSec % 60).padStart(2, '0')}`
              : '—';
            return (
              <li
                key={i}
                className="flex items-center gap-3 p-3"
                style={{
                  borderRadius: 12,
                  background: 'rgba(251,191,36,0.05)',
                  border: '1px solid rgba(251,191,36,0.16)',
                }}
              >
                <span
                  className="font-mono tabular-nums flex-shrink-0"
                  style={{ fontSize: '0.72rem', fontWeight: 700, color: AMBER }}
                >
                  {stamp}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block" style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.45)' }}>
                    {h.reason?.replace('_', ' ')}
                  </span>
                  <span
                    className="block mt-0.5"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'rgba(245,245,245,0.85)' }}
                  >
                    {h.text}
                  </span>
                </span>
                {onEdit && h.timestampSec > 0 && (
                  <button
                    type="button"
                    onClick={() => onEdit(h.timestampSec)}
                    className="inline-flex items-center gap-1 flex-shrink-0"
                    style={{ ...MONO_MICRO, color: AMBER, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <ExternalLink size={10} /> Open
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <AnimatePresence>
        {showAppeal && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us why this is correct (200 characters)…"
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2.5 resize-none"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                outline: 'none',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 flex-wrap">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(0)}
            className="inline-flex items-center gap-1.5 transition-transform duration-200 hover:scale-[1.03]"
            style={{
              ...MONO_MICRO,
              fontSize: '0.60rem',
              color: '#0d0c1c',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              border: 'none',
              borderRadius: 999,
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            <Edit3 size={11} /> Edit lesson
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
            className="inline-flex items-center gap-1.5"
            style={{
              ...MONO_MICRO,
              fontSize: '0.60rem',
              color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 999,
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            {showAppeal && note.trim() ? <Check size={11} /> : null}
            {showAppeal && note.trim() ? 'Send appeal' : 'Appeal'}
          </button>
        )}
        {onFalsePositive && (
          <button
            type="button"
            onClick={onMarkFalsePositive}
            title="Tell the system this was wrong"
            className="inline-flex items-center gap-1.5 ml-auto"
            style={{
              ...MONO_MICRO,
              fontSize: '0.60rem',
              color: 'rgba(245,245,245,0.55)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ShieldOff size={11} /> This was wrong
          </button>
        )}
      </div>
    </StudioPanel>
  );
};

export default YellowCard;
