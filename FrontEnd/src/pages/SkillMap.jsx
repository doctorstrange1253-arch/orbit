/**
 * pages/SkillMap.jsx — The V3 Skill Map (caller's view).
 *
 * Renders the user's constellation chart at /skill-map. The page is
 * full-bleed — the canvas takes the whole screen above the fold, the
 * metadata + share button sit below.
 *
 * Data source: useMySkillMap() → GET /api/knowledge/me/skill-map.
 *   { stars, edges, clusters, path, meta }
 *
 * The user can tap a star to open the underlying course. (MVP: just
 * a soft pulse on the star + a small overlay showing the course title;
 * the V3 plan defers deep-link navigation to a follow-up.)
 */

import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Award } from 'lucide-react';
import { useSoul } from '../hooks/useSoul';
import ConstellationCanvas from '../soul/skillMap/ConstellationCanvas';
import SkillMapShare from '../soul/skillMap/SkillMapShare';
import { useAuthStore } from '../store/authStore';
import { knowledge } from '../services/knowledge';
import { useNavigate } from 'react-router-dom';

const SkillMap = () => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSharedView = searchParams.get('ref') === 'share';

  const { data: skillMap, isLoading } = useQuery({
    queryKey: ['knowledge', 'skill-map', 'me'],
    queryFn: () => knowledge.getMySkillMap(),
    staleTime: 120_000,
  });

  const { data: pathData } = useQuery({
    queryKey: ['knowledge', 'path'],
    queryFn: () => knowledge.getMyPath(),
    staleTime: 120_000,
  });

  const onSelectStar = (star) => {
    if (star?.courseId) navigate(`/courses/${star.courseId}`);
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto p-12 text-text-secondary">Drawing your constellation…</div>
      </div>
    );
  }

  const stars = skillMap?.stars || [];
  const path = skillMap?.path || [];
  const isEmpty = stars.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-10">
        <Helmet><title>Skill Map · Orbit</title></Helmet>

        <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            {isSharedView && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted bg-surface border border-border-subtle mb-3">
                <Sparkles size={11} /> Shared by {user?.name || 'a learner'}
              </div>
            )}
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
              {isEmpty ? 'Your sky is forming.' : 'Your constellation.'}
            </h1>
            <p className="text-text-secondary text-sm mt-1 max-w-md">
              {isEmpty
                ? 'Complete a course and the first star appears here. Every concept you touch adds a line.'
                : `${stars.length} star${stars.length === 1 ? '' : 's'} · ${skillMap?.meta?.totalConceptsTouched || 0} concept${(skillMap?.meta?.totalConceptsTouched || 0) === 1 ? '' : 's'} · ${path.length} in your path.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SkillMapShare userId={user?._id} displayName={user?.name} />
          </div>
        </header>

        {/* CANVAS */}
        {isEmpty ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(6,8,16,0.6)', border: '1px dashed var(--border-subtle)' }}>
            <Sparkles size={32} style={{ color: accent }} className="mx-auto mb-3" />
            <div className="text-text-primary text-sm">
              Complete a course to light your first star. Every concept you touch adds a line.
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-full text-sm font-semibold text-text-on-accent"
              style={{ background: `linear-gradient(135deg, ${accent}, ${nebula?.to || '#0d9488'})` }}
            >
              Browse courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ConstellationCanvas
              data={skillMap}
              width={1200}
              height={620}
              onSelectStar={onSelectStar}
            />
          </motion.div>
        )}

        {/* PATH — the user's strongest cluster */}
        {path.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold text-text-primary mb-3 inline-flex items-center gap-2">
              <Award size={14} style={{ color: accent }} /> Your strongest path
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {path.map((c, i) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  className="rounded-xl p-3 border border-border-subtle bg-surface/40"
                >
                  <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-text-muted">{i + 1}</div>
                  <div className="text-sm font-semibold text-text-primary mt-1 line-clamp-1">{c.label}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-border-subtle/40 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, (c.score || 0) * 10)}%`, background: `linear-gradient(90deg, ${accent}, ${nebula?.to || '#0d9488'})` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SkillMap;
