/**
 * MyOrbit.jsx — the Peer Soul home (V3-B rethought).
 *
 * Replaces Pulse.jsx. The page is editorial, not cosmic: a 12-col grid
 * with a hero band (greeting + 1-line weekly summary), a vertical
 * "what you touched today" timeline, a museum-card skill grid, and a
 * quiet constellation of the user's network.
 *
 * Design constraints (from the user):
 *   - Advanced in design, NOT in motion. No "chitkabra" (flashy) animations.
 *   - No "PEER · THE PULSE" eyebrow, no horizon bar, no 3 live counters.
 *   - No illustrations or CTAs in the empty state. One line of honest copy.
 *   - All ten peer nav items remain visible in the navbar.
 *   - Status is a single 40×40 Sigil (built in components/layout/OrbitSigil).
 *   - No settings / chat / sound / noti-bell icons in the navbar.
 *
 * Layout (12-col editorial grid):
 *   Row 1   [ HERO BAND .......... ][ ............ HERO BAND ............ ]
 *   Row 2   [ SKILLS HEADING    ][ SKILLS HEADING ][ CONSTELLATION MINI   ]
 *   Row 3   [ SKILL MUSEUM CARD ][ SKILL MUSEUM CARD ][ TODAY TIMELINE    ]
 *   Row 4   [ SKILL MUSEUM CARD ][ SKILL MUSEUM CARD ][ TODAY TIMELINE    ]
 *
 * The grid collapses to a single column under md.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint, tintHalo } from '../../soul/tints';
import api from '../../services/api';
import SkillForm from '../../components/skills/SkillForm';
import SkillArtifact from '../../components/skills/SkillArtifact';
import { SkillGridSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/common/ErrorState';
import TodayTimeline from '../../soul/horizon/TodayTimeline';
import ConstellationMini from '../../soul/horizon/ConstellationMini';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Late night,';
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  if (h < 22) return 'Good evening,';
  return 'Still up,';
};

// Compute a single honest 1-line summary for the week from the
// 7 most recent XpEvents. Returns "Nothing yet this week." if
// the user has no events.
const weeklySummary = (events) => {
  if (!Array.isArray(events) || events.length === 0) return 'Nothing yet this week.';
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const recent = events.filter((e) => new Date(e.createdAt).getTime() >= oneWeekAgo);
  if (recent.length === 0) return 'Nothing yet this week.';
  const lessons = recent.filter((e) => e.event === 'lesson_completed').length;
  const swaps = recent.filter((e) => e.event === 'peer_swap_completed').length;
  const quizzes = recent.filter((e) => e.event === 'quiz_passed' || e.event === 'quiz_perfect').length;
  const pieces = [];
  if (lessons) pieces.push(`${lessons} lesson${lessons === 1 ? '' : 's'}`);
  if (swaps)   pieces.push(`${swaps} swap${swaps === 1 ? '' : 's'}`);
  if (quizzes) pieces.push(`${quizzes} quiz${quizzes === 1 ? '' : 'z'}`);
  if (pieces.length === 0) return `${recent.length} small thing${recent.length === 1 ? '' : 's'} this week.`;
  return `This week — ${pieces.join(' · ')}.`;
};

const MyOrbit = () => {
  const user = useAuthStore((s) => s.user);
  const { soul, nebula } = useSoul();
  const [formOpen, setFormOpen] = useState(false);
  const accent = nebula?.from || 'var(--nebula-pulsar-1, #22d3ee)';
  const accentTo = nebula?.to || 'var(--nebula-pulsar-2, #0d9488)';

  // Gameology history — drives the weekly summary + today's timeline.
  const { data: history = [] } = useQuery({
    queryKey: ['gameology', 'history', 'myorbit'],
    queryFn: () => api.get('/gameology/history?limit=200').then((r) => r.data || []),
    refetchInterval: 60000,
  });

  // My skills — drives the museum grid.
  const { data: skills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['skills', 'my'],
    queryFn: () => api.get('/skills/my').then((r) => r.data),
  });

  const skillList = Array.isArray(skills) ? skills : [];
  const summary = weeklySummary(history);
  const firstName = (user?.name || '').split(' ')[0] || 'traveler';

  return (
    <div className="space-y-8">
      <Helmet>
        <title>My Orbit | Orbit</title>
        <meta name="description" content="Your learning day, your skills, your people." />
        <meta property="og:title" content="My Orbit | Orbit" />
        <meta property="og:url" content="https://react-skill-swap-fully-fledged.vercel.app/peer/dashboard" />
        <link rel="canonical" href="https://react-skill-swap-fully-fledged.vercel.app/peer/dashboard" />
      </Helmet>

      {/* ── HERO BAND ── */}
      <header
        className="rounded-2xl p-6 md:p-8"
        style={{
          ...surfaceRecipe('peer'),
          border: borderTint(nebula, 18),
        }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="min-w-0">
            <p
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {greeting()} {firstName}.
            </p>
            <h1
              className="font-display font-bold leading-[1.02] tracking-[-0.02em] mt-1"
              style={{
                fontSize: 'clamp(1.85rem, 3.6vw, 2.7rem)',
                color: 'var(--text-primary)',
              }}
            >
              My Orbit.
            </h1>
            <p
              className="mt-3 font-mono text-[11px] tracking-[0.18em] uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              {summary}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentTo})`,
              color: '#fff',
              boxShadow: tintHalo(nebula, 28),
            }}
          >
            <Plus size={15} strokeWidth={2.4} />
            Add skill
          </button>
        </div>
      </header>

      {/* ── MAIN GRID (12-col, editorial) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
        {/* LEFT — Skills museum (8/12) */}
        <section className="md:col-span-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2
              className="font-display font-bold tracking-tight"
              style={{
                fontSize: 'clamp(1.15rem, 1.6vw, 1.35rem)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Your skills
            </h2>
            <span
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {skillList.length} {skillList.length === 1 ? 'card' : 'cards'}
            </span>
          </div>

          {error && <ErrorState message="Failed to load your skills." onRetry={refetch} />}

          {error ? null : isLoading ? (
            <SkillGridSkeleton count={3} />
          ) : skillList.length === 0 ? (
            <p
              className="rounded-2xl p-6 text-[13px] leading-relaxed"
              style={{
                background: 'var(--bg-surface-glass)',
                border: '1px dashed var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              You haven't added a skill yet. The first one is the slowest; it gets easier.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {skillList.map((s) => <SkillArtifact key={s._id} skill={s} />)}
            </div>
          )}
        </section>

        {/* RIGHT — Constellation + Today timeline (4/12) */}
        <aside className="md:col-span-4 space-y-6">
          {/* Constellation */}
          <div
            className="rounded-2xl p-5"
            style={{
              ...surfaceRecipe('peer'),
              border: borderTint(nebula, 14),
            }}
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2
                className="font-display font-bold tracking-tight"
                style={{
                  fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                People you orbit
              </h2>
            </div>
            <div className="flex justify-center">
              <ConstellationMini />
            </div>
          </div>

          {/* Today timeline */}
          <div
            className="rounded-2xl p-5"
            style={{
              ...surfaceRecipe('peer'),
              border: borderTint(nebula, 14),
            }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <h2
                className="font-display font-bold tracking-tight"
                style={{
                  fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Today
              </h2>
              <span
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {new Date().toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
            </div>
            <TodayTimeline events={history} />
          </div>
        </aside>
      </div>

      <SkillForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default MyOrbit;
