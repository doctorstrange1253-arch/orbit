import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lightbulb, Sparkles, Star } from 'lucide-react';
import { honours, TIER_ORDER, TIER_META } from '../../services/honours';
import HonourModal from './HonourModal';

const MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.56rem',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const TIER_ICON = { beacon: Lightbulb, comet: Sparkles, supernova: Star };

function when(at) {
  if (!at) return '';
  const days = Math.floor((Date.now() - new Date(at).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const HonoursStrip = ({ mentor, balance, canGive = true }) => {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['honours', String(mentor.userId)],
    queryFn: () => honours.forMentor(mentor.userId),
    enabled: !!mentor.userId,
  });

  const totals = data?.totals || mentor.honours || { count: 0, byTier: { beacon: 0, comet: 0, supernova: 0 } };
  const items = data?.items || [];
  const canHonourToday = data?.canHonourToday !== false;

  return (
    <div>
      <div className="h-px w-full mb-4" style={{ background: 'rgba(255,255,255,0.12)' }} />

      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <span style={{ ...MICRO, color: 'var(--text-muted)' }}>Honours</span>
        <span style={{ ...MICRO, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {totals.count || 0} in all
        </span>
        {canGive && (
          <button
            onClick={() => setOpen(true)}
            disabled={!canHonourToday}
            className="ml-auto px-3 py-1.5 disabled:opacity-40"
            style={{ ...MICRO, color: 'var(--text-primary)', background: 'transparent', border: '1px solid rgba(255,255,255,0.28)', cursor: canHonourToday ? 'pointer' : 'not-allowed' }}
          >
            {canHonourToday ? 'Give an honour' : 'Honoured today'}
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-6 mb-4">
        {TIER_ORDER.map((id) => {
          const Icon = TIER_ICON[id];
          const n = totals.byTier?.[id] || 0;
          return (
            <span key={id} className="inline-flex items-baseline gap-1.5" style={{ opacity: n ? 1 : 0.4 }}>
              <Icon className="w-3.5 h-3.5 self-center" style={{ color: n ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {n}
              </span>
              <span style={{ ...MICRO, color: 'var(--text-muted)' }}>{TIER_META[id].label}</span>
            </span>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.slice(0, 5).map((h) => (
            <div key={h._id} className="flex items-baseline gap-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ ...MICRO, color: 'var(--accent)' }}>{TIER_META[h.tier]?.label || h.tier}</span>
              <span className="min-w-0 flex-1 truncate text-sm" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                {h.note || `${h.from.name} said nothing, and meant it.`}
              </span>
              <span style={{ ...MICRO, color: 'var(--text-muted)' }}>{when(h.at)}</span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <HonourModal mentor={mentor} balance={balance} onClose={() => setOpen(false)} />
      )}
    </div>
  );
};

export default HonoursStrip;
