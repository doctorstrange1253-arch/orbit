/**
 * pages/SkillMapPublic.jsx — The public shareable Skill Map.
 *
 * Mounted at /skill-map/:userId. Renders the same constellation as the
 * caller's SkillMap.jsx, but uses the public endpoint (no timestamps,
 * no mastery scores). Adds a "Shared by [name]" eyebrow when the
 * URL contains `?ref=share`.
 *
 * If the user isn't logged in, the page is fully anonymous — no auth
 * required to view someone else's constellation.
 */

import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, Award, ArrowRight } from 'lucide-react';
import ConstellationCanvas from '../soul/skillMap/ConstellationCanvas';
import { knowledge } from '../services/knowledge';
import { useSoul } from '../hooks/useSoul';

const SkillMapPublic = () => {
  const { userId } = useParams();
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const [searchParams] = useSearchParams();
  const isSharedView = searchParams.get('ref') === 'share';

  const { data, isLoading, error } = useQuery({
    queryKey: ['knowledge', 'skill-map', 'public', userId],
    queryFn: () => knowledge.getPublicSkillMap(userId),
    enabled: !!userId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto p-12 text-text-secondary">Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto p-12 text-center">
          <Sparkles size={32} className="mx-auto mb-3" style={{ color: accent }} />
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">This skill map is dark.</h1>
          <p className="text-sm text-text-muted mb-4">
            Either this learner hasn't completed a course yet, or the link is wrong.
          </p>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            <ArrowRight size={14} /> Back to Orbit
          </Link>
        </div>
      </div>
    );
  }

  const stars = data.stars || [];
  const path = data.path || [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-10">
        <Helmet><title>Skill Map · Orbit</title></Helmet>

        {isSharedView && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted bg-surface border border-border-subtle mb-3">
            <Sparkles size={11} /> Shared
          </div>
        )}

        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
            <Sparkles size={14} style={{ color: accent }} /> The Skill Map
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
            A constellation of learning.
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {stars.length} course{stars.length === 1 ? '' : 's'} completed · {path.length} concept{path.length === 1 ? '' : 's'} in the path.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <ConstellationCanvas data={data} width={1200} height={620} />
        </motion.div>

        {path.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold text-text-primary mb-3 inline-flex items-center gap-2">
              <Award size={14} style={{ color: accent }} /> Strongest path
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {path.map((c, i) => (
                <div
                  key={c.slug}
                  className="rounded-xl p-3 border border-border-subtle bg-surface/40"
                >
                  <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-text-muted">{i + 1}</div>
                  <div className="text-sm font-semibold text-text-primary mt-1 line-clamp-1">{c.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-text-primary"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}
          >
            Build your own on Orbit
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillMapPublic;
