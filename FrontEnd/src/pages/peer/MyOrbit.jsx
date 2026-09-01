/**
 * pages/peer/MyOrbit.jsx — the Peer Soul home (Editorial).
 *
 * A magazine-style "issue" that reads as a spread, not a dashboard.
 * Six numbered sections, each with a hairline rule above, each
 * carrying one piece of information:
 *
 *   I.   The week that was.      (hero: name + varied-cadence lede)
 *   II.  By the numbers.         (4-col stats strip)
 *   III. Day by day.             (7-cell current-week strip)
 *   IV.  The skills you carry.   (archive-card grid)
 *   V.   The people who stayed.  (horizontal person row)
 *   VI.  The quote you earned.   (optional pull quote, data-driven)
 *
 * Plus a thin masthead at the top and a colophon footer at the
 * bottom. No boxes, no chips, no colored backgrounds — the type
 * is the design. Hairlines separate sections.
 *
 * Design constraints from the user:
 *   - Advanced in design, not motion
 *   - No chitkabra (no flashy animation)
 *   - Empty states are one line of honest copy
 *
 * Data:
 *   - /gameology/history?limit=500   (for lede, stats, week strip, today)
 *   - /skills/my                     (for the archive-card grid)
 *   - /connections?status=accepted   (for the people row, via PeopleRow)
 *   - /ratings/received?limit=20     (for the pull quote, via PullQuote)
 *   - auth store                     (for the user's name)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSoul } from '../../hooks/useSoul';
import api from '../../services/api';
import SkillForm from '../../components/skills/SkillForm';
import SkillCard from '../../components/skills/SkillCard';
import { SkillGridSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/common/ErrorState';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import Masthead from '../../soul/editorial/Masthead';
import HeroBand from '../../soul/editorial/HeroBand';
import StatsStrip from '../../soul/editorial/StatsStrip';
import WeekStrip from '../../soul/editorial/WeekStrip';
import PeopleRow from '../../soul/editorial/PeopleRow';
import PullQuote from '../../soul/editorial/PullQuote';
import EditorialFooter from '../../soul/editorial/EditorialFooter';

// One section's failure must NOT take down the whole page. Each
// editorial section is wrapped in an ErrorBoundary with a thin,
// hairline-rule fallback so the issue reads as a missing page, not
// a crash. The page itself remains a magazine spread.
const SectionBoundary = ({ name, children }) => (
  <ErrorBoundary
    fallback={
      <section
        className="py-8"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        aria-label={`${name} (unavailable)`}
      >
        <p
          className="font-mono uppercase tracking-[0.28em]"
          style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}
        >
          {name} · Unavailable this issue.
        </p>
      </section>
    }
  >
    {children}
  </ErrorBoundary>
);

const MyOrbit = () => {
  const { user } = useAuthStore();
  // Wrap useSoul in a try/catch so even a hook failure degrades to a
  // default peer-soul accent rather than the full-page error boundary.
  let soul;
  try {
    soul = useSoul();
  } catch (err) {
    // Fall through to a default soul — keeps the page readable.
    soul = { nebula: { from: '#22d3ee', to: '#0d9488' } };
  }
  const { nebula } = soul;

  // One fetch for the lede, stats strip, week strip, and (kept
  // for future use) the today timeline. 500 events covers ~12
  // weeks comfortably.
  // The backend wraps the array in {items: [...]} — normalize at the
  // source so downstream components can iterate freely. Also handles
  // legacy {events}, {history}, {data} wrappers if they appear.
  const normalizeHistory = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.events)) return raw.events;
    if (Array.isArray(raw?.history)) return raw.history;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  };
  const { data: history = [] } = useQuery({
    queryKey: ['gameology', 'history', 'myorbit-editorial'],
    queryFn: () => api.get('/gameology/history?limit=500').then((r) => normalizeHistory(r.data)),
    refetchInterval: 60_000,
  });
  const safeHistory = Array.isArray(history) ? history : [];

  // My skills — drives the archive-card grid.
  const { data: skills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['skills', 'my'],
    queryFn: () => api.get('/skills/my').then((r) => {
      const d = r.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.skills)) return d.skills;
      if (Array.isArray(d?.data)) return d.data;
      return [];
    }),
  });

  const skillList = Array.isArray(skills) ? skills : [];

  // "Add a skill" opens the standard form. The button lives at the
  // top of the skills section so the section is self-contained.
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="max-w-[1180px] mx-auto">
      <Helmet>
        <title>My Orbit | Orbit</title>
        <meta name="description" content="Your learning day, your skills, your people." />
        <meta property="og:title" content="My Orbit | Orbit" />
        <meta property="og:url" content="https://react-skill-swap-fully-fledged.vercel.app/peer/dashboard" />
        <link rel="canonical" href="https://react-skill-swap-fully-fledged.vercel.app/peer/dashboard" />
      </Helmet>

      {/* MASTHEAD */}
      <SectionBoundary name="Masthead">
        <Masthead />
      </SectionBoundary>

      {/* I. The week that was. (hero) */}
      <SectionBoundary name="I. The week that was">
        <HeroBand events={safeHistory} />
      </SectionBoundary>

      {/* II. By the numbers. */}
      <SectionBoundary name="II. By the numbers">
        <StatsStrip events={safeHistory} skillsCount={skillList.length} />
      </SectionBoundary>

      {/* III. Day by day. */}
      <SectionBoundary name="III. Day by day">
        <WeekStrip events={safeHistory} />
      </SectionBoundary>

      {/* IV. The skills you carry. */}
      <SectionBoundary name="IV. The skills you carry">
        <section className="py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-baseline justify-between mb-6">
            <p
              className="font-mono uppercase tracking-[0.28em]"
              style={{ fontSize: '0.72rem', color: 'rgba(245,245,245,0.78)' }}
            >
              The skills you carry.
            </p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="btn-gradient flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              aria-label="Add a new skill"
            >
              <Plus size={16} strokeWidth={2.6} />
              Add Skill
            </button>
          </div>

          {error && <ErrorState message="Failed to load your skills." onRetry={refetch} />}

          {error ? null : isLoading ? (
            <SkillGridSkeleton count={3} />
          ) : skillList.length === 0 ? (
            <p
              className="leading-[1.6] max-w-[44ch]"
              style={{ fontSize: '0.9rem', color: 'rgba(245,245,245,0.72)' }}
            >
              You haven't archived a skill yet. The first one is the slowest; it gets easier.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {skillList.map((s) => <SkillCard key={s._id} skill={s} variant="my-skills" />)}
            </div>
          )}
        </section>
      </SectionBoundary>

      {/* V. The people who stayed. */}
      <SectionBoundary name="V. The people who stayed">
        <PeopleRow />
      </SectionBoundary>

      {/* VI. The quote you earned. (optional) */}
      <SectionBoundary name="VI. The quote you earned">
        <PullQuote />
      </SectionBoundary>

      {/* COLOPHON */}
      <SectionBoundary name="Colophon">
        <EditorialFooter />
      </SectionBoundary>

      <SkillForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default MyOrbit;
