/**
 * pages/mentor/Observatory.jsx — The Mentor Soul Home (V3).
 *
 * Replaces V2's `MentorHub.jsx` as the V3 `/mentor/observatory` route.
 * The page is composed of three layers:
 *
 *   1. Luminosity Star (the mentor's signature) — centered above the map
 *   2. Star map of students — full-bleed canvas, mouse-tied parallax
 *   3. Compact mentor metrics + recent activity (below the fold)
 *
 * The V2 mentor application flow stays intact via a small link at the
 * top — mentors who haven't applied yet get redirected to the
 * application form. Once approved, they see the Observatory proper.
 *
 * Empty state: when a mentor has zero students (no connections AND no
 * course enrollments), the ObservatoryEmpty component replaces the
 * star map with a tone-matched message + CTA.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Telescope, GraduationCap, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint, tintHalo } from '../../soul/tints';
import StarMap from '../../soul/observatory/StarMap';
import LuminosityStar from '../../soul/observatory/LuminosityStar';
import ObservatoryEmpty from '../../soul/observatory/ObservatoryEmpty';
import PactBadge from '../../components/pact/PactBadge';
import PactPulse from '../../components/pact/PactPulse';
import RivalWatch from '../../components/pact/RivalWatch';
import api from '../../services/api';

const STATE_META = {
  not_applied: { title: 'Become a mentor.', chip: 'Not yet applied', chipClass: 'bg-surface text-text-secondary border border-border-subtle' },
  submitted:   { title: 'Application under review.', chip: 'Pending review', chipClass: 'bg-warning/10 text-warning border border-warning/30' },
  rejected:    { title: 'Application declined.', chip: 'Application declined', chipClass: 'bg-danger/10 text-danger border border-danger/30' },
  suspended:   { title: 'Account suspended.', chip: 'Suspended', chipClass: 'bg-danger/10 text-danger border border-danger/30' },
  approved:    { title: 'Your observatory.', chip: 'Live mentor', chipClass: 'bg-success/10 text-success border border-success/30' },
};

const Observatory = () => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#a78bfa';

  // Mentor application status (drives the not-yet-applied branch).
  const { data: mentorData } = useQuery({
    queryKey: ['sessions', 'mentor', 'me'],
    queryFn: () => api.get('/sessions/mentor/me').then((r) => r.data),
    staleTime: 30_000,
  });
  const appState = mentorData?.profile?.applicationStatus || 'not_applied';
  const isApproved = appState === 'approved';

  // Connections = students the mentor has taught (paid sessions + peer swaps).
  // We use this as a proxy for "students" since V3's Student model is not
  // yet wired. V3-B phase 2 will replace this with a dedicated /api/mentor/
  // students endpoint.
  const { data: connections = [] } = useQuery({
    queryKey: ['connections', 'mine'],
    queryFn: () => api.get('/connections?status=completed&limit=200').then((r) => r.data?.items || r.data || []),
    enabled: isApproved,
    staleTime: 60_000,
  });

  // Course enrollments — another way students appear in the map.
  const { data: courses = [] } = useQuery({
    queryKey: ['mentor', 'courses', 'observatory'],
    queryFn: () => api.get('/courses?mentor=me&limit=100').then((r) => r.data?.items || r.data || []),
    enabled: isApproved,
    staleTime: 60_000,
  });

  // Pact subdoc — drives the Luminosity Star.
  const { data: pact } = useQuery({
    queryKey: ['pact', 'me'],
    queryFn: () => api.get('/pact/me').then((r) => r.data),
    enabled: isApproved,
    staleTime: 60_000,
  });

  // Build the student list. Each entry: { userId, name, lastActiveMs }.
  const students = useMemo(() => {
    const byId = new Map();
    for (const c of connections) {
      const u = c.peer || c.user || {};
      const id = u._id || c.peerId;
      if (!id) continue;
      const lastActive = c.completedAt || c.updatedAt;
      if (!byId.has(id)) {
        byId.set(id, {
          userId: id,
          name: u.name || u.cosmicName || 'Learner',
          lastActiveMs: lastActive ? new Date(lastActive).getTime() : 0,
        });
      }
    }
    return Array.from(byId.values());
  }, [connections]);

  // If the mentor is not yet approved, show the application state.
  if (!isApproved) {
    const meta = STATE_META[appState] || STATE_META.not_applied;
    return (
      <div className="space-y-7">
        <Helmet><title>The Observatory | Orbit</title></Helmet>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
            <Telescope size={14} style={{ color: accent }} /> Mentor · The Observatory
          </div>
          <h1
            className="text-3xl md:text-4xl font-display font-black tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {meta.title}
          </h1>
          <p className="text-text-secondary text-sm mt-1">Your observatory unlocks once your mentor application is approved.</p>
        </div>
        <div className="rounded-2xl p-8 text-center"
          style={{ ...surfaceRecipe('mentor'), border: borderTint(nebula, 24) }}>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-widest ${meta.chipClass}`}>
            <Clock size={12} /> {meta.chip}
          </span>
          <p className="text-text-secondary text-sm mt-4 max-w-md mx-auto">
            Once approved, your students will appear as points of light here, and your Luminosity Star will rise.
          </p>
          <Link
            to="/mentor/hub"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-semibold text-text-on-accent"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})`,
              boxShadow: tintHalo(nebula, 32),
            }}
          >
            <ExternalLink size={14} /> Open mentor hub
          </Link>
        </div>
      </div>
    );
  }

  // Approved mentor — the Observatory proper.
  return (
    <div className="space-y-7">
      <Helmet>
        <title>The Observatory | Orbit</title>
        <meta name="description" content="Your students as points of light. Your signature as a star." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
            <Telescope size={14} style={{ color: accent }} /> Mentor · The Observatory
            <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-pill text-[9px] bg-success/10 text-success border border-success/30">
              <CheckCircle size={9} /> {STATE_META.approved.chip}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-display font-black tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The Observatory.
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {students.length === 0
              ? 'Your first star is one booking away.'
              : `${students.length} student${students.length === 1 ? '' : 's'} on your map.`}
          </p>
        </div>
        <Link
          to="/mentor/courses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-text-on-accent"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#3b82f6'})`,
            boxShadow: tintHalo(nebula, 32),
          }}
        >
          <GraduationCap size={16} /> New course
        </Link>
      </div>

      {/* LUMINOSITY STAR — the mentor's signature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-6 flex flex-col items-center"
        style={{ ...surfaceRecipe('mentor'), border: borderTint(nebula, 18) }}
      >
        <LuminosityStar
          studentsCount={students.length}
          weeklyScore={pact?.weekScore || 0}
          division={pact?.divisionId || 'initiate'}
          avgRating={pact?.avgRating || 0}
          steadyWeeks={pact?.steadyShieldWeeks || 0}
        />
        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          {pact?.divisionId && <PactBadge size={20} withLabel />}
        </div>
      </motion.div>

      {/* STAR MAP — students as points of light OR empty state */}
      {students.length === 0 ? (
        <ObservatoryEmpty />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StarMap students={students} width={1200} height={520} />
        </motion.div>
      )}

      {/* Pact Pulse + Rival Watch — the V2 widgets, kept intact */}
      <div className="grid md:grid-cols-[1fr_auto] gap-4">
        <PactPulse />
        <RivalWatch />
      </div>
    </div>
  );
};

export default Observatory;
