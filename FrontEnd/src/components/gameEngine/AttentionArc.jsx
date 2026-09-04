/**
 * components/gameEngine/AttentionArc.jsx — The decelerate-on-disengage logic.
 *
 * V3 design: the LessonPlayer watches the user's attention. After 60s
 * of no mouse / touch activity, the player auto-decelerates from 1.0x
 * → 0.85x as a gentle re-engagement. When the user moves the mouse or
 * touches the screen, the rate restores to 1.0x.
 *
 * This is a *gentle* mechanism — the video continues at a slower rate,
 * the user is not interrupted. A small "💫" indicator appears in the
 * corner for 2s to acknowledge the shift.
 *
 * Hooks into a <video> via the `videoRef` prop. The component renders
 * a thin invisible wrapper that just attaches the listeners; the actual
 * playback rate change is the only side-effect.
 *
 * Reduced-motion: still attaches listeners but doesn't change the
 * playback rate. The deceleration is a "motion" the user opted out of.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useSoul } from '../../hooks/useSoul';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const IDLE_BEFORE_DECEL_MS = 60_000;
const RESTORE_DELAY_MS = 1500;

const AttentionArc = ({ videoRef, enabled = true }) => {
  const { nebula } = useSoul();
  const reduced = _isReducedMotion();
  const lastActivityRef = useRef(0);
  const [decelerated, setDecelerated] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  // Activity listeners — bump lastActivity on any user gesture.
  useEffect(() => {
    if (!enabled) return undefined;
    lastActivityRef.current = Date.now();
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointerdown', 'wheel'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, [enabled]);

  // Idle check — runs every 5s. After 60s of no activity, decelerate.
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_BEFORE_DECEL_MS && !decelerated) {
        setDecelerated(true);
        setShowIndicator(true);
        if (videoRef?.current && !reduced) {
          try { videoRef.current.playbackRate = 0.85; } catch { /* noop */ }
        }
        setTimeout(() => setShowIndicator(false), 2000);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [enabled, decelerated, videoRef, reduced]);

  // Restore handler — if activity resumes, bump the rate back to 1.0x.
  useEffect(() => {
    if (!enabled || !decelerated) return undefined;
    let timeout;
    const onActivity = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (decelerated) {
          setDecelerated(false);
          if (videoRef?.current) {
            try { videoRef.current.playbackRate = 1.0; } catch { /* noop */ }
          }
        }
      }, RESTORE_DELAY_MS);
    };
    const events = ['mousemove', 'keydown', 'touchstart', 'pointerdown'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [enabled, decelerated, videoRef]);

  const accent = nebula?.from || '#22d3ee';
  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: 'rgba(6,8,16,0.7)',
            border: `1px solid ${accent}55`,
            color: accent,
          }}
        >
          <Sparkles size={10} /> slow · 0.85x
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttentionArc;
