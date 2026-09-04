import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Lightbulb, Sparkles, Star } from 'lucide-react';
import { honours, TIER_ORDER, TIER_META } from '../../services/honours';
import { Haptic } from '../../soul/haptics';
import { SoulSound } from '../../soul/soundLibrary';

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const TIER_ICON = { beacon: Lightbulb, comet: Sparkles, supernova: Star };

const HonourModal = ({ mentor, balance, onClose }) => {
  const qc = useQueryClient();
  const [tier, setTier] = useState('beacon');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: () => honours.send(mentor.userId, { tier, note }),
    onSuccess: () => {
      Haptic.heavy();
      SoulSound.bloom?.();
      qc.invalidateQueries({ queryKey: ['honours', String(mentor.userId)] });
      qc.invalidateQueries({ queryKey: ['sessions', 'mentor', String(mentor.userId)] });
      qc.invalidateQueries({ queryKey: ['orbit'] });
      onClose();
    },
    onError: (e) => setError(e?.response?.data?.message || 'Could not send that honour.'),
  });

  const cost = TIER_META[tier].photons;
  const affordable = balance === null || balance === undefined || balance >= cost;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: 'rgba(3,4,10,0.82)' }}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg p-6"
        style={{ background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.14)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Honour ${mentor.name}`}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div style={{ ...MICRO, color: 'var(--text-muted)' }}>An honour, not a rating</div>
            <h2 className="text-xl mt-1.5" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
              Mark what {mentor.name} did for you
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm mb-5" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}>
          Honours are Photons you spend, not stars you award. They sit beside a mentor&apos;s name for good and never move their rating — which is exactly why they mean something. One per mentor per day.
        </p>

        <div className="space-y-2 mb-5">
          {TIER_ORDER.map((id) => {
            const meta = TIER_META[id];
            const Icon = TIER_ICON[id];
            const active = tier === id;
            const canAfford = balance === null || balance === undefined || balance >= meta.photons;
            return (
              <button
                key={id}
                onClick={() => setTier(id)}
                disabled={!canAfford}
                className="w-full flex items-baseline gap-3 px-3 py-3 text-left disabled:opacity-35"
                style={{
                  background: 'transparent',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span className="flex-1 min-w-0">
                  <span className="block" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-primary)' }}>
                    {meta.label}
                  </span>
                  <span className="block mt-0.5 text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}>
                    {meta.blurb}
                  </span>
                </span>
                <span style={{ ...MICRO, color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {meta.photons}
                </span>
              </button>
            );
          })}
        </div>

        <label className="block mb-4">
          <span className="block mb-1.5" style={{ ...MICRO, color: 'var(--text-muted)' }}>
            A line, if you want one <span style={{ opacity: 0.6 }}>{note.length}/240</span>
          </span>
          <textarea
            rows={2}
            maxLength={240}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What actually changed for you."
            className="w-full px-3 py-2 text-sm resize-none"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
          />
        </label>

        {error && (
          <div className="mb-4 px-3 py-2 text-xs" style={{ border: '1px solid rgba(244,63,94,0.4)', color: '#fecdd3' }}>{error}</div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => { setError(null); mutation.mutate(); }}
            disabled={mutation.isPending || !affordable}
            className="inline-flex items-center gap-2 px-4 py-2 disabled:opacity-40"
            style={{ ...MICRO, color: 'var(--text-primary)', background: 'transparent', border: '1px solid rgba(255,255,255,0.36)', cursor: 'pointer' }}
          >
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {affordable ? `Send · ${cost} Photons` : `You need ${cost} Photons`}
          </button>
          {balance !== null && balance !== undefined && (
            <span style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              You hold {balance}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HonourModal;
