/**
 * pages/peer/Pulse.jsx — The Peer Soul Home (V3).
 *
 * Replaces V2's `MySkills.jsx` as the V3 `/peer/dashboard` route. The
 * page is a *place*, not a list — the user lands on a horizon of light
 * (HorizonBar), a cluster of 3 live counters (CounterCluster), and only
 * THEN the skill management tools below.
 *
 * The skill grid + Add Skill functionality from V2 is preserved (mounted
 * as `<SkillManagementPanel />` below the Pulse home) so the user can
 * still manage their skill cards without leaving the page. The Pulse
 * home is what the user sees first; the skill tools are below the fold.
 *
 * Layout:
 *   1. Header (eyebrow + supernova title + sub)
 *   2. HorizonBar (60-min activity timeline) — the "cityscape of light"
 *   3. CounterCluster (3 live counters: sessions / swaps / streak)
 *   4. Skill management panel (V2 functionality, kept intact)
 *
 * Empty state: when the user has zero gameology history AND zero skills,
 * the PulseEmpty component replaces steps 2-3 with a tone-matched message.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Layers } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';
import { surfaceRecipe, borderTint, tintHalo } from '../../soul/tints';
import HorizonBar from '../../soul/horizon/HorizonBar';
import CounterCluster from '../../soul/horizon/CounterCluster';
import PulseEmpty from '../../soul/horizon/PulseEmpty';
import api from '../../services/api';
import SkillCard from '../../components/skills/SkillCard';
import SkillForm from '../../components/skills/SkillForm';
import { SkillGridSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/common/ErrorState';

const Pulse = () => {
  const { soul, nebula } = useSoul();
  const [formOpen, setFormOpen] = useState(false);
  const accent = nebula?.from || '#22d3ee';

  // Gameology history — drives the horizon bar.
  const { data: history = [] } = useQuery({
    queryKey: ['gameology', 'history', 'pulse'],
    queryFn: () => api.get('/gameology/history?limit=200').then((r) => r.data || []),
    refetchInterval: 30000,
  });

  // My skills — drives the skill management panel below.
  const { data: skills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['skills', 'my'],
    queryFn: () => api.get('/skills/my').then((r) => r.data),
  });

  // Empty state condition: no history AND no skills. (The skill count
  // double-check protects against a brand-new account where the history
  // endpoint returns [].)
  const isEmpty = (Array.isArray(history) ? history.length === 0 : true) && (Array.isArray(skills) ? skills.length === 0 : true);

  return (
    <div className="space-y-7">
      <Helmet>
        <title>The Pulse | Orbit</title>
        <meta name="description" content="Your 60-minute horizon. The light of your learning day." />
        <meta property="og:title" content="The Pulse | Orbit" />
        <meta property="og:url" content="https://react-skill-swap-fully-fledged.vercel.app/peer/dashboard" />
        <link rel="canonical" href="https://react-skill-swap-fully-fledged.vercel.app/peer/dashboard" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
            <Layers size={14} style={{ color: accent }} /> Peer · The Pulse
          </div>
          <h1
            className="text-3xl md:text-4xl font-display font-black tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The Pulse.
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your day as a horizon. Every minute of attention is a column of light.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-text-on-accent"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})`,
            boxShadow: tintHalo(nebula, 32),
          }}
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {/* HOME — horizon + counters OR empty state */}
      {isEmpty ? (
        <PulseEmpty />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-5 md:p-6 space-y-5"
          style={{ ...surfaceRecipe('peer'), border: borderTint(nebula, 18) }}
        >
          <HorizonBar events={history} />
          <CounterCluster />
        </motion.div>
      )}

      {/* SKILL MANAGEMENT (V2 functionality preserved) */}
      <section>
        <h2 className="text-sm font-bold text-text-primary mb-3 inline-flex items-center gap-2">
          <Layers size={14} style={{ color: accent }} /> Your skills
        </h2>

        {error && <ErrorState message="Failed to load your skills." onRetry={refetch} />}

        {error ? null : isLoading ? (
          <SkillGridSkeleton count={3} />
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 rounded-2xl text-center"
            style={{ background: 'var(--bg-surface-glass)', border: '1px dashed var(--border-subtle)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
              <Layers size={20} style={{ color: accent }} />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">No skills yet</h3>
            <p className="text-text-muted text-xs mb-4 max-w-xs">Add what you can teach and what you want to learn to start matching.</p>
            <button onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-text-on-accent"
              style={{ background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})` }}>
              <Plus size={12} /> Add Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map(s => <SkillCard key={s._id} skill={s} variant="my-skills" />)}
          </div>
        )}
      </section>

      <SkillForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};

export default Pulse;
