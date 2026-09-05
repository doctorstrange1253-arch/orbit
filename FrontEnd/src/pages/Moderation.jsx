import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import ModerationInbox from '../soul/moderation/ModerationInbox';
import { StudioMasthead } from '../soul/studio/surfaces';

const Moderation = () => {
  return (
    <div className="space-y-7">
      <Helmet><title>Moderation · Orbit Mentor</title></Helmet>
      <StudioMasthead
        eyebrow="Mentor · Review"
        Icon={ShieldAlert}
        title="Your moderation inbox"
        deck="The system flags a small share of lessons for a second look. These are private — only you see this page. False-positive flags tune the system so it gets better over time."
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <ModerationInbox />
      </motion.div>
    </div>
  );
};

export default Moderation;
