/**
 * soul/studio/VideoArrival.jsx — The 600ms "video arrival" animation.
 *
 * When a student taps a lesson node on the Course Map, the node
 * "consumes" the viewport (transform: scale 1.0 → 5.0, fade) over
 * 600ms. The parent fires onDone at 620ms, which navigates to the
 * player route.
 *
 * This is a faster, local version of the CameraZoom (V3-B's transit
 * from the planet into the course). Same vocabulary — "the lesson
 * arrives" — but the scale is smaller and the duration shorter.
 *
 * Reduced-motion: 200ms cross-fade, then onDone.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const VideoArrival = ({ sourceRect, lesson, onDone, onCancel }) => {
  const reduced = _isReducedMotion();

  useEffect(() => {
    if (!sourceRect) return undefined;
    if (reduced) {
      const t = setTimeout(() => onDone?.(), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => onDone?.(), 620);
    return () => clearTimeout(t);
  }, [sourceRect, reduced, onDone]);

  // Escape key dismisses.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (!sourceRect) return null;

  if (reduced) {
    return (
      <AnimatePresence>
          <motion.div
            key="arrival-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[250] bg-[#060810]"
            aria-hidden
          />
      </AnimatePresence>
    );
  }

  const startX = sourceRect.left;
  const startY = sourceRect.top;
  const startW = sourceRect.width;
  const startH = sourceRect.height;
  const endScale = Math.max(window.innerWidth / startW, window.innerHeight / startH) * 1.4;

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none">
      <motion.div
        initial={{ x: startX, y: startY, width: startW, height: startH, scale: 1, opacity: 1 }}
        animate={{
          x: (window.innerWidth - startW * endScale) / 2,
          y: (window.innerHeight - startH * endScale) / 2,
          width: startW * endScale,
          height: startH * endScale,
          scale: 1,
          opacity: 0.3,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.4), rgba(13,148,136,0.2) 60%, transparent)',
          boxShadow: '0 0 80px rgba(34,211,238,0.5)',
        }}
      >
        <Play size={48} className="text-white opacity-80" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="absolute inset-0 flex items-end justify-center pb-10"
      >
        <div className="text-text-primary text-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mb-1">
            Loading
          </div>
          <div className="text-lg font-display font-bold">{lesson?.title || 'Lesson'}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoArrival;
