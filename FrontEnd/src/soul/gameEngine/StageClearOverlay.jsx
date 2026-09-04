import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { STAGE_GLOW, ROMAN } from './stages';
import { Haptic } from '../haptics';
import { SoulSound } from '../soundLibrary';

const MONO_MICRO = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.24em',
  fontWeight: 700,
  textTransform: 'uppercase',
};

const HOLD_MS = 3200;

function reducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function StageClearOverlay({ stage, onDone }) {
  const [visible, setVisible] = useState(true);
  const glow = STAGE_GLOW[stage?.name] || '#a78bfa';
  const reduced = reducedMotion();

  useEffect(() => {
    if (!stage) return undefined;
    if (!reduced) {
      Haptic.medium();
      SoulSound.levelUp({ soul: 'student' });
    }
    const t = setTimeout(() => setVisible(false), reduced ? 900 : HOLD_MS);
    return () => clearTimeout(t);
  }, [stage, reduced]);

  useEffect(() => {
    if (visible) return undefined;
    const t = setTimeout(() => onDone?.(), 240);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!stage || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center px-6"
          style={{ background: 'rgba(4,5,10,0.92)' }}
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-lg text-center">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: 1, background: glow, transformOrigin: 'center' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="pt-7"
            >
              <span style={{ ...MONO_MICRO, color: glow }}>
                Stage {ROMAN[stage.number - 1] || stage.number} cleared
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-editorial)',
                fontWeight: 700,
                fontSize: 'clamp(2.4rem, 7vw, 4rem)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                margin: '14px 0 0',
              }}
            >
              {stage.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52, duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.08rem',
                lineHeight: 1.5,
                color: 'rgba(245,245,245,0.72)',
                margin: '16px auto 0',
                maxWidth: '34ch',
              }}
            >
              {stage.blurb}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="mt-7 inline-flex items-center gap-3"
            >
              <span style={{ ...MONO_MICRO, color: glow, fontVariantNumeric: 'tabular-nums' }}>
                +{stage.xpReward} xp
              </span>
              <span aria-hidden style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.20)' }} />
              <span style={{ ...MONO_MICRO, color: 'rgba(245,245,245,0.45)', fontVariantNumeric: 'tabular-nums' }}>
                {stage.lessonCount} lesson{stage.lessonCount === 1 ? '' : 's'} behind you
              </span>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8"
              style={{ height: 1, background: 'rgba(255,255,255,0.12)', transformOrigin: 'center' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default StageClearOverlay;
