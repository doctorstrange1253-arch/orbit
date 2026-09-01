/**
 * soul/editorial/PullQuote.jsx
 *
 * A single, large pull-quote rendered when the user has a rating worth
 * featuring. Reads like a magazine pull-quote: large italic display
 * type, an em-dash, and the attribution in mono.
 *
 * The quote is computed client-side from the user's connections +
 * recent reviews. If no quote is available, the section renders null
 * (it's optional). The empty state is *not* a "you don't have any
 * quotes" message — that would be editorial copy, which the user
 * said to avoid.
 *
 * Future: when /ratings/me is available, fetch the top-rated
 * received review and use its `body` here. For now, falls back to
 * a deterministic place-holder based on the user's streak so the
 * section never shows on a brand-new account.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

// Three short Orbit-voiced placeholders. The seed picks one of these
// based on the user's streak so the quote never repeats consecutively
// on the same user.
const PLACEHOLDERS = [
  'Every swap is a small orbit. Every orbit is a story.',
  'The teacher who never learns stops being a teacher.',
  'A constellation only exists because the stars agreed to be far apart.',
];

export default function PullQuote() {
  const user = useAuthStore((s) => s.user);
  const streak = user?.gameology?.currentStreak || 0;

  // Try to fetch a real review first. If the endpoint isn't there
  // or the user has no reviews, fall back to a placeholder.
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', 'received', 'pullquote'],
    queryFn: () => api.get('/ratings/received?limit=20')
      .then((r) => r.data?.ratings || r.data || [])
      .catch(() => []),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const featured = useMemo(() => {
    if (Array.isArray(reviews) && reviews.length) {
      const best = reviews
        .filter((r) => r?.body && (r.stars || r.rating) >= 4.7)
        .sort((a, b) => (b.stars || b.rating || 0) - (a.stars || a.rating || 0))[0];
      if (best) {
        return {
          body: best.body,
          attribution: best.from?.name || best.authorName || 'A peer',
          isReal: true,
        };
      }
    }
    // No real quote — pick a placeholder by streak (so it varies across
    // sessions without storing state).
    const seed = (streak + Math.floor(Date.now() / 86400000)) % PLACEHOLDERS.length;
    return {
      body: PLACEHOLDERS[seed],
      attribution: 'Orbit',
      isReal: false,
    };
  }, [reviews, streak]);

  // The "real" case (a real review) is the only case that should
  // reliably render. The placeholder case is gated on streak > 0 so
  // a brand-new account doesn't see a quote at all.
  if (!featured.isReal && streak === 0) return null;

  return (
    <section className="py-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <p
        className="font-mono uppercase tracking-[0.28em] mb-5"
        style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
      >
        The quote you earned.
      </p>
      <blockquote
        className="font-display italic leading-[1.15] tracking-[-0.02em] max-w-[28ch] md:max-w-[36ch]"
        style={{
          fontSize: 'clamp(1.6rem, 3.4vw, 2.6rem)',
          color: 'var(--text-primary)',
        }}
      >
        &ldquo;{featured.body}&rdquo;
      </blockquote>
      <p
        className="font-mono uppercase tracking-[0.22em] mt-5"
        style={{ fontSize: '0.7rem', color: 'rgba(245,245,245,0.66)' }}
      >
        — {featured.attribution}
      </p>
    </section>
  );
}
