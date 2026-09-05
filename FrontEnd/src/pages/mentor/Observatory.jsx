import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Telescope, GraduationCap, ExternalLink, CheckCircle, Clock, BookOpen, Eye, Edit3, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import StarMap from '../../soul/observatory/StarMap';
import LuminosityStar from '../../soul/observatory/LuminosityStar';
import ObservatoryEmpty from '../../soul/observatory/ObservatoryEmpty';
import PactBadge from '../../components/pact/PactBadge';
import PactPulse from '../../components/pact/PactPulse';
import RivalWatch from '../../components/pact/RivalWatch';
import PactHallTable from '../../components/pact/PactHall';
import LeagueRail from '../../components/pact/LeagueRail';
import HonoursStrip from '../../components/mentor/HonoursStrip';
import {
    MentorEyebrow,
    MentorTitle,
    MentorTag,
} from '../../components/pact/MentorEditorial';
import { StudioMasthead } from '../../soul/studio/surfaces';
import api from '../../services/api';

const STATE_META = {
  not_applied: { title: 'Become a mentor.',        chip: 'Not yet applied',       tone: 'neutral' },
  submitted:   { title: 'Application under review.', chip: 'Pending review',     tone: 'warning' },
  rejected:    { title: 'Application declined.',     chip: 'Application declined', tone: 'danger' },
  suspended:   { title: 'Account suspended.',        chip: 'Suspended',            tone: 'danger' },
  approved:    { title: 'The Observatory',           chip: 'Live mentor',          tone: 'success' },
};

const Observatory = () => {
  const userRoles = useAuthStore((s) => s.user?.roles) || [];
  const hasStudentRole = userRoles.includes('student');

  const { data: mentorData } = useQuery({
    queryKey: ['sessions', 'mentor', 'me'],
    queryFn: () => api.get('/sessions/mentor/me').then((r) => r.data),
    staleTime: 30_000,
  });
  const appState = mentorData?.profile?.applicationStatus || 'not_applied';
  const isApproved = appState === 'approved';
  const profile = mentorData?.profile;

  const { data: learners } = useQuery({
    queryKey: ['mentor', 'learners'],
    queryFn: () => api.get('/courses/mentor/learners').then((r) => r.data),
    enabled: isApproved,
    staleTime: 60_000,
  });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['mentor', 'courses', 'observatory'],
    queryFn: () => api.get('/courses?mentor=me&limit=100').then((r) => r.data?.items || []),
    enabled: isApproved,
    staleTime: 60_000,
  });

  const { data: pact } = useQuery({
    queryKey: ['pact', 'me'],
    queryFn: () => api.get('/pact/me').then((r) => r.data),
    enabled: isApproved,
    staleTime: 60_000,
  });

  const students = useMemo(
    () => (learners?.items || []).map((l) => ({
      userId: l.userId,
      name: l.name,
      avatar: l.avatar,
      lastActiveMs: l.lastActiveMs || 0,
      recentEventAt: l.lastActiveMs ? new Date(l.lastActiveMs).toISOString() : null,
    })),
    [learners]
  );

  if (!isApproved) {
    const meta = STATE_META[appState] || STATE_META.not_applied;
    return (
      <div className="space-y-7">
        <Helmet><title>The Observatory | Orbit</title></Helmet>
        <StudioMasthead
          eyebrow="Mentor · The Observatory"
          Icon={Telescope}
          title={meta.title}
          deck="Your observatory unlocks once your mentor application is approved."
        />
        <div
          className="text-center"
          style={{
            border: '1px solid rgba(255,255,255,0.10)',
            borderTop: `1px solid ${meta.tone === 'warning' ? 'rgba(251,191,36,0.45)' : meta.tone === 'danger' ? 'rgba(252,165,165,0.45)' : 'rgba(255,255,255,0.20)'}`,
            padding: '28px 24px',
          }}
        >
          <div className="inline-flex items-center gap-2">
            <Clock size={12} />
            <MentorTag tone={meta.tone}>{meta.chip}</MentorTag>
          </div>
          <p
            className="mt-4 max-w-md mx-auto"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'rgba(245,245,245,0.65)',
              fontSize: '1.05rem',
              lineHeight: 1.4,
            }}
          >
            Once approved, your students will appear as points of light here, and your
            Luminosity Star will rise.
          </p>
          <Link
            to="/mentor/hub"
            className="inline-flex items-center gap-2 mt-6 font-mono uppercase"
            style={{
              fontSize: '0.66rem',
              letterSpacing: '0.22em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
              paddingBottom: 4,
            }}
          >
            <ExternalLink size={11} /> Open Mentor Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <Helmet>
        <title>The Observatory | Orbit</title>
        <meta name="description" content="Your students as points of light. Your signature as a star." />
      </Helmet>

      {/* ── I. Masthead ───────────────────────────────────────────── */}
      <div>
        <StudioMasthead
          eyebrow="Mentor · The Observatory"
          Icon={Telescope}
          title="The Observatory"
          deck={students.length === 0
            ? 'Your first star is one booking away.'
            : `${students.length} student${students.length === 1 ? '' : 's'} on your map. Their movements draw the sky you watch over.`}
        >
          <MentorTag tone="success">
            <CheckCircle size={9} style={{ marginRight: 4, display: 'inline-block' }} />
            {STATE_META.approved.chip}
          </MentorTag>
        </StudioMasthead>
        <div className="mt-4">
          <Link
            to="/mentor/courses/new"
            className="inline-flex items-center gap-2 font-mono uppercase"
            style={{
              fontSize: '0.66rem',
              letterSpacing: '0.22em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.30)',
              paddingBottom: 4,
            }}
          >
            <GraduationCap size={12} /> New course
          </Link>
        </div>
      </div>

      {/* ── II. League Rail ───────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <LeagueRail currentTierId={pact?.pact?.divisionId || pact?.divisionId} mode="folio" />
      </motion.section>

      {/* ── III. Luminosity Star ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
        style={{
          border: '1px solid rgba(255,255,255,0.10)',
          borderTop: '1px solid rgba(255,255,255,0.20)',
          padding: '24px',
        }}
      >
        <LuminosityStar
          studentsCount={students.length}
          weeklyScore={pact?.pact?.weekScore || pact?.weekScore || 0}
          division={pact?.pact?.divisionId || pact?.divisionId || 'initiate'}
          avgRating={pact?.pact?.avgRating || pact?.avgRating || 0}
          steadyWeeks={pact?.pact?.steadyShieldWeeks || pact?.steadyShieldWeeks || 0}
        />
        <div className="mt-4 flex items-center gap-2">
          <PactBadge size={20} withLabel />
          <span
            className="font-mono uppercase"
            style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.55)' }}
          >
            {myCourses.length} course{myCourses.length === 1 ? '' : 's'}
          </span>
        </div>
        <p
          className="mt-3 text-center max-w-md"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'rgba(245,245,245,0.55)',
            fontSize: '0.95rem',
          }}
        >
          {students.length === 0
            ? 'The sky is dark. A student will light the first point soon.'
            : 'Your signature, sized by the students you have taught, colored by the division you hold.'}
        </p>
      </motion.div>

      {profile?.userId && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <HonoursStrip mentor={profile} canGive={false} />
        </motion.section>
      )}

      {/* ── IV. Star Map ──────────────────────────────────────────── */}      {students.length === 0 ? (
        <ObservatoryEmpty />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <MentorEyebrow>IV · The Sky Tonight</MentorEyebrow>
            <span className="font-mono uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.20em', fontWeight: 700, color: 'rgba(245,245,245,0.40)' }}>
              {students.length} point{students.length === 1 ? '' : 's'} of light
            </span>
          </div>
          <StarMap students={students} width={1200} height={520} />
        </motion.div>
      )}

      {/* ── V. The Roll ───────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '20px 22px' }}
      >
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <div>
            <MentorEyebrow>V · The Roll</MentorEyebrow>
            <div className="mt-1.5">
              <MentorTitle size="md">Your group this week</MentorTitle>
            </div>
          </div>
          <Link
            to="/mentor/pact"
            className="font-mono uppercase inline-flex items-center gap-1.5"
            style={{
              fontSize: '0.60rem',
              letterSpacing: '0.22em',
              fontWeight: 700,
              color: 'rgba(245,245,245,0.45)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.20)',
              paddingBottom: 3,
            }}
          >
            Full Pact Roll <ExternalLink size={9} />
          </Link>
        </div>
        <PactHallTable />
      </motion.section>

      {/* ── VI. Pulse + Rivals ────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '16px 18px' }}
        >
          <div className="mb-3">
            <MentorEyebrow>VI · The Pulse</MentorEyebrow>
          </div>
          <PactPulse />
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.40 }}
          style={{ border: '1px solid rgba(255,255,255,0.10)', padding: '16px 18px' }}
        >
          <RivalWatch />
        </motion.section>
      </div>

      {/* ── VII. Quick links ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <div className="mb-3">
          <MentorEyebrow>VII · Your Workshop</MentorEyebrow>
        </div>
        <div
          className="grid sm:grid-cols-3 gap-0"
          style={{ border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <Link
            to="/mentor/courses"
            className="flex items-center justify-between px-4 py-4"
            style={{
              borderRight: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                My courses
              </span>
            </span>
            <ArrowRight size={12} style={{ color: 'rgba(245,245,245,0.40)' }} />
          </Link>
          <Link
            to={`/profile/${profile?.userId}`}
            className="flex items-center justify-between px-4 py-4"
            style={{
              borderRight: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <Eye size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                Public profile
              </span>
            </span>
            <ArrowRight size={12} style={{ color: 'rgba(245,245,245,0.40)' }} />
          </Link>
          <Link
            to="/mentor/hub"
            className="flex items-center justify-between px-4 py-4"
            style={{
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <Edit3 size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                {hasStudentRole ? 'Edit profile' : 'Teach hub'}
              </span>
            </span>
            <ArrowRight size={12} style={{ color: 'rgba(245,245,245,0.40)' }} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Observatory;
