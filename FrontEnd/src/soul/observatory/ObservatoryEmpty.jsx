import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Telescope } from 'lucide-react';
import { StudioPanel } from '../studio/surfaces';

const isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const ObservatoryEmpty = () => {
  const reduced = isReducedMotion();

  return (
    <StudioPanel
      as={motion.div}
      radius={24}
      className="text-center overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '48px 28px' }}
    >
      <div
        className="font-mono uppercase mb-4"
        style={{ fontSize: '0.58rem', letterSpacing: '0.28em', fontWeight: 700, color: 'rgba(245,245,245,0.42)' }}
      >
        Your observatory
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.5rem, 3.4vw, 2.1rem)', lineHeight: 1.1,
          letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0,
        }}
      >
        The sky is dark. It is ready.
      </h2>

      <p
        className="mx-auto mt-3"
        style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', lineHeight: 1.65, color: 'rgba(245,245,245,0.55)', maxWidth: 460 }}
      >
        Every learner you teach becomes a point of light in your map. The first one appears when someone books a session, finishes a course, or rates a class.
      </p>

      <div className="mx-auto my-7 h-20 flex items-center justify-center">
        <motion.span
          style={{
            width: 8, height: 8, borderRadius: 999,
            background: 'var(--studio-from)',
            boxShadow: '0 0 22px color-mix(in oklab, var(--studio-from) 55%, transparent)',
          }}
          animate={reduced ? { opacity: 0.8 } : { opacity: [0.2, 1, 0.2] }}
          transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        <Link
          to="/mentor/courses/new"
          className="inline-flex items-center gap-2 font-mono uppercase transition-transform duration-200 hover:scale-[1.03]"
          style={{
            fontSize: '0.62rem', letterSpacing: '0.20em', fontWeight: 700,
            color: '#0d0c1c', background: 'var(--studio-gradient)',
            borderRadius: 999, padding: '12px 20px', textDecoration: 'none',
          }}
        >
          <GraduationCap size={13} /> Create a course
        </Link>
        <Link
          to="/mentor/sessions"
          className="inline-flex items-center gap-2 font-mono uppercase"
          style={{
            fontSize: '0.62rem', letterSpacing: '0.20em', fontWeight: 700,
            color: 'rgba(245,245,245,0.75)', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999, padding: '12px 20px', textDecoration: 'none',
          }}
        >
          <Telescope size={13} /> Session bookings
        </Link>
      </div>
    </StudioPanel>
  );
};

export default ObservatoryEmpty;
