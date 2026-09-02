/**
 * pages/Moderation.jsx — Mentor's moderation inbox at /mentor/moderation.
 *
 * V3 — the masthead uses Playfair Display italic. No gradient
 * text, no glass panels. The intro paragraph reads as a private
 * dispatch from the moderation pipeline, not a status banner.
 */
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import ModerationInbox from '../soul/moderation/ModerationInbox';
import {
    MentorEyebrow,
    MentorTitle,
    MentorDeck,
} from '../components/pact/MentorEditorial';

const Moderation = () => {
  return (
    <div className="space-y-7">
      <Helmet><title>Moderation · Orbit Mentor</title></Helmet>
      <header>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={14} style={{ color: 'rgba(245,245,245,0.55)' }} />
          <MentorEyebrow>Mentor · Review</MentorEyebrow>
        </div>
        <MentorTitle size="xl">Your moderation inbox</MentorTitle>
        <div className="mt-2 max-w-2xl">
          <MentorDeck>
            The system flags a small share of lessons for a second look. These are private —
            only you see this page. False-positive flags tune the system so it gets better
            over time.
          </MentorDeck>
        </div>
      </header>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <ModerationInbox />
      </motion.div>
    </div>
  );
};

export default Moderation;
