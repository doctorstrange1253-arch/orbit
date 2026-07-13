/**
 * GiftPhotonsButton — "Gift" action for an established connection. Opens a
 * compact popover with preset amounts; sending calls POST /orbit/photons/gift
 * (connection-checked + daily-capped server-side). Fully theme-tokenized so it
 * reads in light and dark; balance and today's remaining allowance come from
 * the shared ['orbit','me'] query.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import PhotonIcon from './PhotonIcon';
import { useOrbit, useGiftPhotons } from './useOrbit';
import { useUIStore } from '../store/uiStore';

const PRESETS = [25, 50, 100, 250];

export default function GiftPhotonsButton({ toUser }) {
  const [open, setOpen] = useState(false);
  const { data } = useOrbit();
  const gift = useGiftPhotons();
  const { addToast } = useUIStore();

  const balance = data?.photons ?? data?.stardust ?? 0;
  const limits = data?.gift; // { min, max, dailyCap, sentToday }
  const remaining = limits ? Math.max(0, limits.dailyCap - (limits.sentToday || 0)) : Infinity;

  const send = (amount) => {
    gift.mutate({ toUserId: toUser._id, amount }, {
      onSuccess: () => {
        addToast(`Sent ${amount} Photons to ${toUser.name}`, 'success');
        setOpen(false);
      },
      onError: (e) => addToast(e.response?.data?.message || 'Gift failed', 'error'),
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-purple hover:bg-purple/10 border border-border-subtle transition-all"
        title={`Send Photons to ${toUser?.name || 'this connection'}`}
      >
        <Gift size={15} /> Gift
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-border-subtle p-3 shadow-2xl"
            style={{ background: 'var(--surface)' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary">
                <PhotonIcon size={14} animated={false} /> Gift Photons
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close"
                className="grid h-6 w-6 place-items-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text-primary">
                <X size={12} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((amt) => {
                const blocked = amt > balance || amt > remaining || gift.isPending;
                return (
                  <button
                    key={amt}
                    disabled={blocked}
                    onClick={() => send(amt)}
                    className={`rounded-xl px-2 py-2 text-sm font-black tabular-nums transition
                      ${blocked
                        ? 'cursor-not-allowed bg-surface text-text-muted opacity-60'
                        : 'bg-purple/10 text-purple hover:bg-purple/20 ring-1 ring-purple/30'}`}
                  >
                    {amt}
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-[10px] leading-snug text-text-muted">
              Balance {balance.toLocaleString()} · {remaining === Infinity ? '' : `${remaining} giftable today`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
