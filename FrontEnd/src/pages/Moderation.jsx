/**
 * pages/Moderation.jsx — Mentor's moderation inbox at /mentor/moderation.
 *
 * V3 — the mentor's private review queue. Lists every Yellow Card
 * the pipeline has issued (audio keyword hits + 5% random sample).
 * The mentor can:
 *   - Edit the lesson (deep-links to /mentor/courses/:id/edit)
 *   - Appeal with a 200-char note
 *   - Mark as false positive (resets the FP rate)
 *
 * Top panel shows the mentor's false-positive rate (last 30 days).
 * If > 50%, the system has paused auto-moderation for them for 7
 * days (anti-punishment).
 */

import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useSoul } from '../hooks/useSoul';
import ModerationInbox from '../soul/moderation/ModerationInbox';

const Moderation = () => {
  const { soul, nebula } = useSoul();
  const accent = nebula?.from || '#22d3ee';
  return (
    <div className="space-y-6">
      <Helmet><title>Moderation Inbox · Orbit</title></Helmet>
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-surface border border-border-subtle mb-3">
          <ShieldAlert size={14} style={{ color: accent }} /> Mentor · Moderation
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
          Your moderation inbox.
        </h1>
        <p className="text-text-secondary text-sm mt-1 max-w-2xl">
          The system flags a small share of lessons for a second look. These are private — only you see this page. False-positive flags tune the system so it gets better over time.
        </p>
      </header>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ModerationInbox />
      </motion.div>
    </div>
  );
};

export default Moderation;
