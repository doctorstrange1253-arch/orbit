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
import { SkillGridSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/common/ErrorState';
import Masthead from '../../soul/editorial/Masthead';
import HeroBand from '../../soul/editorial/HeroBand';
import StatsStrip from '../../soul/editorial/StatsStrip';
import WeekStrip from '../../soul/editorial/WeekStrip';
import SkillsPolaroid from '../../soul/editorial/SkillsPolaroid';
import PeopleRow from '../../soul/editorial/PeopleRow';
import PullQuote from '../../soul/editorial/PullQuote';
import EditorialFooter from '../../soul/editorial/EditorialFooter';

const MyOrbit = () => {
  const { user } = useAuthStore();
  const { nebula } = useSoul();

  // One fetch for the lede, stats strip, week strip, and (kept
  // for future use) the today timeline. 500 events covers ~12
  // weeks comfortably.
  const { data: history = [] } = useQuery({
    queryKey: ['gameology', 'history', 'myorbit-editorial'],
    queryFn: () => api.get('/gameology/history?limit=500').then((r) => r.data || []),
    refetchInterval: 60_000,
  });

  // My skills — drives the archive-card grid.
  const { data: skills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['skills', 'my'],
    queryFn: () => api.get('/skills/my').then((r) => r.data),
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
      <Masthead />

      {/* I. The week that was. (hero) */}
      <HeroBand events={history} />

      {/* II. By the numbers. */}
      <StatsStrip events={history} skillsCount={skillList.length} />

      {/* III. Day by day. */}
      <WeekStrip events={history} />

      {/* IV. The skills you carry. */}
      <section className="py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-baseline justify-between mb-6">
          <p
            className="font-mono uppercase tracking-[0.28em]"
            style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}
          >
            IV. The skills you carry.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.22em] transition-opacity hover:opacity-100"
            style={{ fontSize: '0.66rem', color: 'var(--text-muted)', opacity: 0.7 }}
            aria-label="Add a new skill"
          >
            <Plus size={11} strokeWidth={2.4} />
            Add skill
          </button>
        </div>

        {error && <ErrorState message="Failed to load your skills." onRetry={refetch} />}

        {error ? null : isLoading ? (
          <SkillGridSkeleton count={3} />
        ) : skillList.length === 0 ? (
          <p
            className="leading-[1.6] max-w-[44ch]"
            style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}
          >
            You haven't archived a skill yet. The first one is the slowest; it gets easier.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {skillList.map((s, i) => <SkillsPolaroid key={s._id} skill={s} index={i} />)}
          </div>
        )}
      </section>

      {/* V. The people who stayed. */}
      <PeopleRow />

      {/* VI. The quote you earned. (optional) */}
      <PullQuote />

      {/* COLOPHON */}
      <EditorialFooter />

      <SkillForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default MyOrbit;
