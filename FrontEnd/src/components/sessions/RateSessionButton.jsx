import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Loader2, Check, X } from 'lucide-react';
import api from '../../services/api';
import { Haptic } from '../../soul/haptics';

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

/**
 * RateSessionButton — rates a completed session in place. The rating endpoint is
 * session-scoped, so this has to live where the session id is; the old "Rate /
 * rebook" link went to the mentor's page, which has no session context and no
 * rating UI, so nobody could rate a session outside the in-call modal.
 */
const RateSessionButton = ({ session, alreadyRated }) => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const rate = useMutation({
    mutationFn: () => api.post(`/sessions/${session._id}/rate`, { stars, comment: comment.trim() || undefined }),
    onSuccess: () => {
      Haptic.medium();
      qc.invalidateQueries({ queryKey: ['sessions', 'me'] });
      setOpen(false);
    },
    onError: (e) => setError(e?.response?.data?.message || 'Could not save that rating.'),
  });

  if (alreadyRated) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-2" style={{ ...MICRO, color: 'var(--text-muted)' }}>
        <Check className="w-3.5 h-3.5" /> Rated
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 nav-tab-glass px-3.5 py-2 rounded-lg text-sm text-text-primary"
      >
        <Star className="w-4 h-4" /> Rate
      </button>
    );
  }

  return (
    <div
      className="w-full sm:w-auto p-3 rounded-lg"
      style={{ border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(6,8,16,0.6)' }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span style={{ ...MICRO, color: 'var(--text-muted)' }}>How was it?</span>
        <button onClick={() => setOpen(false)} aria-label="Cancel" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setStars(n)}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <Star
              className="w-5 h-5"
              style={{
                color: n <= stars ? '#fbbf24' : 'rgba(255,255,255,0.24)',
                fill: n <= stars ? '#fbbf24' : 'transparent',
              }}
            />
          </button>
        ))}
      </div>

      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="A line for them, if you want one."
        className="w-full px-2.5 py-1.5 text-sm resize-none mb-2"
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.14)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-serif)',
        }}
      />

      {error && <p className="text-xs mb-2" style={{ color: '#fecdd3' }}>{error}</p>}

      <button
        onClick={() => { setError(null); rate.mutate(); }}
        disabled={!stars || rate.isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40"
        style={{ ...MICRO, color: 'var(--text-primary)', background: 'transparent', border: '1px solid rgba(255,255,255,0.32)', cursor: 'pointer' }}
      >
        {rate.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {stars ? `Send ${stars}★` : 'Pick a rating'}
      </button>
    </div>
  );
};

export default RateSessionButton;
