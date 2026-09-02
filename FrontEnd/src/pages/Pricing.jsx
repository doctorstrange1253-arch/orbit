import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Handshake, PlayCircle, X } from 'lucide-react';
import { billing } from '../services/billing';
import SectionBoundary from '../soul/editorial/SectionBoundary';
import { Eyebrow, Title, Deck, DotLeader } from '../soul/editorial/primitives';

const HAIRLINE = 'rgba(255,255,255,0.10)';
const HAIRLINE_SOFT = 'rgba(255,255,255,0.06)';
const MUTED = 'rgba(245,245,245,0.55)';

const MONO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.58rem',
  letterSpacing: '0.20em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const TIER_GLOW = {
  free: 'rgba(245,245,245,0.45)',
  orbit_two: '#5eead4',
  orbit_five: '#a78bfa',
  orbit_ten: '#fde68a',
};

const INCLUDED = {
  free: [
    'Every introduction video, on every course',
    'The whole catalogue, browsable',
    'Peer swaps — free forever, no limit',
    'Your Skill Map, XP, streak and stages',
  ],
  paid: [
    'Every lesson in the courses you seat',
    'Quizzes, boss levels and certificates',
    'Q&A with the mentor who made it',
    'Progress kept forever, even if you pause',
  ],
};

function glowOf(key) {
  return TIER_GLOW[key.replace('_year', '')] || 'rgba(245,245,245,0.45)';
}

const PlanCard = ({ plan, cycle, onPick, busy }) => {
  const glow = glowOf(plan.key);
  const isFree = plan.priceMinor === 0;
  const list = isFree ? INCLUDED.free : INCLUDED.paid;

  return (
    <article
      className="flex flex-col p-6"
      style={{ border: `1px solid ${HAIRLINE}`, borderTop: `1px solid ${glow}`, minHeight: 440 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          aria-hidden="true"
          style={{ width: 7, height: 7, borderRadius: '50%', background: glow, boxShadow: `0 0 8px ${glow}88` }}
        />
        <span style={{ ...MONO, color: glow }}>{isFree ? 'Always' : `${plan.seats} courses a month`}</span>
      </div>

      <Title size="md" as="h2">{plan.name.replace(' · Yearly', '')}</Title>

      <div className="mt-5 flex items-baseline gap-2">
        <span
          style={{
            fontFamily: 'var(--font-editorial)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 'clamp(2.2rem, 4vw, 3rem)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}
        >
          {plan.priceLabel}
        </span>
        {!isFree && <span style={{ ...MONO, color: MUTED }}>{plan.priceSuffix}</span>}
      </div>

      <p
        className="mt-2"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.92rem', color: MUTED }}
      >
        {plan.taxNote}
      </p>

      {!isFree && (
        <div className="mt-3 flex flex-col gap-1">
          <span style={{ ...MONO, color: 'rgba(245,245,245,0.45)', fontVariantNumeric: 'tabular-nums' }}>
            {plan.perSeatLabel}
          </span>
          {cycle === 'yearly' && (
            <span style={{ ...MONO, color: glow, fontVariantNumeric: 'tabular-nums' }}>
              {plan.perMonthLabel} · {plan.monthsFree} months free
            </span>
          )}
        </div>
      )}

      <div className="mt-5 mb-5" style={{ height: 1, background: HAIRLINE_SOFT }} />

      <p
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.5, color: 'rgba(245,245,245,0.72)' }}
      >
        {plan.blurb}
      </p>

      <ul className="mt-5 flex flex-col gap-2.5 flex-1">
        {list.map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <Check size={12} style={{ color: glow, marginTop: 4, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', lineHeight: 1.45, color: 'rgba(245,245,245,0.72)' }}>
              {line}
            </span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <Link
          to="/courses"
          className="mt-6 inline-flex items-center justify-center gap-2 font-mono uppercase"
          style={{
            fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700,
            color: 'var(--text-primary)', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.30)', padding: '12px 16px',
          }}
        >
          <PlayCircle size={12} /> Start free
        </Link>
      ) : (
        <button
          onClick={() => onPick(plan)}
          disabled={busy}
          className="mt-6 inline-flex items-center justify-center gap-2 font-mono uppercase"
          style={{
            fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700,
            color: glow, background: 'transparent',
            border: `1px solid ${glow}`, padding: '12px 16px', cursor: 'pointer',
          }}
        >
          {busy ? 'One moment…' : `Choose ${plan.name.replace(' · Yearly', '')}`}
        </button>
      )}
    </article>
  );
};

const ComingSoon = ({ payload, onClose }) => (
  <AnimatePresence>
    {payload && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9990] flex items-center justify-center px-5"
        style={{ background: 'rgba(4,5,10,0.9)' }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg p-7"
          style={{ background: 'rgba(8,10,18,0.98)', border: `1px solid ${HAIRLINE}`, borderTop: '1px solid rgba(255,255,255,0.28)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <Eyebrow>{payload.heading}</Eyebrow>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          </div>
          <div className="mt-3">
            <Title size="md" as="h2">Checkout opens soon</Title>
          </div>
          <div className="mt-4">
            <Deck>{payload.body}</Deck>
          </div>
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${HAIRLINE_SOFT}` }}>
            <div className="flex items-baseline gap-3">
              <span style={{ ...MONO, color: MUTED }}>{payload.plan?.name}</span>
              <DotLeader />
              <span style={{ ...MONO, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {payload.plan?.priceLabel} {payload.plan?.priceSuffix}
              </span>
            </div>
          </div>
          <Link
            to="/peer/dashboard"
            className="mt-6 inline-flex items-center gap-2 font-mono uppercase"
            style={{
              fontSize: '0.62rem', letterSpacing: '0.22em', fontWeight: 700,
              color: 'var(--text-primary)', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.30)', padding: '10px 15px',
            }}
          >
            <Handshake size={12} /> Swap a skill free instead
          </Link>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Pricing = () => {
  const [cycle, setCycle] = useState('monthly');
  const [soon, setSoon] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billing.plans(),
    staleTime: 10 * 60_000,
  });

  const subscribe = useMutation({
    mutationFn: (planKey) => billing.subscribe(planKey),
    onError: (err) => {
      const d = err?.response?.data;
      if (d?.code === 'PAYMENTS_COMING_SOON') setSoon(d);
    },
  });

  const rows = (cycle === 'yearly' ? data?.yearly : data?.monthly) || [];
  const free = (data?.monthly || []).find((p) => p.priceMinor === 0);
  const paid = rows.filter((p) => p.priceMinor > 0);
  const shown = free && cycle === 'monthly' ? [free, ...paid] : paid;

  return (
    <div className="max-w-[1180px] mx-auto">
      <Helmet>
        <title>Plans · Orbit</title>
        <meta name="description" content="Three plans, all taxes included. Peer swaps stay free forever." />
      </Helmet>

      <header className="pt-4 pb-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <Eyebrow>Orbit · Plans</Eyebrow>
        <div className="mt-2">
          <Title size="xl">What it costs to learn here</Title>
        </div>
        <div className="mt-3 max-w-2xl">
          <Deck>
            Every price below includes all taxes. Peer swaps are free forever — the plans
            are only for mentor-made courses, and every course lets you watch its
            introduction before you decide.
          </Deck>
        </div>

        <div className="mt-6 inline-flex" style={{ border: `1px solid ${HAIRLINE}` }}>
          {['monthly', 'yearly'].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className="font-mono uppercase"
              style={{
                fontSize: '0.60rem', letterSpacing: '0.22em', fontWeight: 700,
                color: cycle === c ? 'var(--text-primary)' : MUTED,
                background: cycle === c ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', padding: '10px 18px', cursor: 'pointer',
              }}
            >
              {c === 'yearly' ? 'Yearly · 2 months free' : 'Monthly'}
            </button>
          ))}
        </div>
      </header>

      <SectionBoundary name="Plans">
        <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          {isLoading ? (
            <p className="py-14 text-center" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: MUTED }}>
              Reading the price list.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {shown.map((plan) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  cycle={cycle}
                  busy={subscribe.isPending}
                  onPick={(p) => subscribe.mutate(p.key)}
                />
              ))}
            </div>
          )}
        </section>
      </SectionBoundary>

      <SectionBoundary name="How mentors are paid">
        <section className="py-8" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
          <Eyebrow>Where your money goes</Eyebrow>
          <div className="mt-2 mb-4">
            <Title size="md" as="h2">Most of it reaches the person teaching you</Title>
          </div>
          <div className="max-w-2xl">
            <Deck>
              Orbit keeps a quarter of the after-tax amount to run the platform. The rest is
              divided between the mentors whose courses you actually seated that month — half
              evenly, half by how far you got. A mentor cannot earn more by uploading more
              videos; only by being chosen and being finished.
            </Deck>
          </div>
        </section>
      </SectionBoundary>

      <ComingSoon payload={soon} onClose={() => setSoon(null)} />
    </div>
  );
};

export default Pricing;
