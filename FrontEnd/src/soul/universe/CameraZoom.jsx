/**
 * soul/universe/CameraZoom.jsx — The 800ms camera zoom transit.
 *
 * When the user taps a planet, the planet "consumes" the viewport over
 * 800ms (transform: scale 1.0 → 5.0 + opacity 1 → 0 on the rest of the
 * universe). The Transit Sequence doesn't fire here — this is a faster,
 * local transition into the Course Studio (V3-C).
 *
 * Usage:
 *   const [zoom, setZoom] = useState(null);  // { sourceRect, enrollment, course }
 *   {zoom && <CameraZoom {...zoom} onDone={() => navigate(...)} onCancel={() => setZoom(null)} />}
 *
 * The component:
 *   1. Captures the source rect of the tapped planet
 *   2. Renders an absolutely-positioned clone at that rect
 *   3. Animates the clone to fill the viewport
 *   4. Calls onDone() at 800ms
 *   5. The parent (Universe.jsx) navigates to the course detail page
 *
 * Reduced-motion: no clone, no scale — just a 200ms cross-fade and call
 * onDone immediately. The course detail page renders in place.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const CameraZoom = ({ sourceRect, course, onDone, onCancel }) => {
  const reduced = _isReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!sourceRect) return undefined;
    if (reduced) {
      const t = setTimeout(() => onDone?.(), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => onDone?.(), 820);
    return () => clearTimeout(t);
  }, [sourceRect, reduced, onDone]);

  // Dismiss on Escape.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (!sourceRect) return null;

  if (reduced) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            key="zoom-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[250] bg-[#060810]"
            aria-hidden
          />
        )}
      </AnimatePresence>
    );
  }

  // Compute the final rect (viewport-filling).
  const finalX = 0;
  const finalY = 0;
  const finalW = window.innerWidth;
  const finalH = window.innerHeight;

  // The planet is a circular gradient — we replicate it as a div for the
  // clone (the real Planet component would be too expensive to mount
  // here, and we only need its visual gist).
  const startX = sourceRect.left;
  const startY = sourceRect.top;
  const startW = sourceRect.width;
  const startH = sourceRect.height;

  // Animate scale + position.
  const startScale = 1;
  const endScale = Math.max(finalW / startW, finalH / startH) * 1.2;

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none">
      <motion.div
        initial={{
          x: startX,
          y: startY,
          width: startW,
          height: startH,
          scale: startScale,
          opacity: 1,
        }}
        animate={{
          x: finalX + (finalW - startW * endScale) / 2,
          y: finalY + (finalH - startH * endScale) / 2,
          width: startW * endScale,
          height: startH * endScale,
          scale: 1,
          opacity: 0.4,
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #fbbf24, #f43f5e 60%, rgba(0,0,0,0.6))',
          boxShadow: '0 0 120px rgba(251, 191, 36, 0.6)',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="absolute inset-0 flex items-end justify-center pb-12"
      >
        <div className="text-center text-text-primary">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mb-1">
            Entering
          </div>
          <div className="text-xl font-display font-bold">{course?.title || 'Course'}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default CameraZoom;
