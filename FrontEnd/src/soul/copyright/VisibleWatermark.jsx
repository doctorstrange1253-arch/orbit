/**
 * soul/copyright/VisibleWatermark.jsx — The human-readable "ORBIT · userId · date" overlay.
 *
 * V3 copyright layer 2: a semi-transparent watermark in the bottom-
 * right of the video. The watermark **fades in for 4s, then fades
 * out for 8s** on a loop. The fade cycle resists static masking
 * (e.g. cropping the watermark out of one frame) because the
 * marker is *present* in some frames and *absent* in others.
 *
 * The text is small (~10px) but legible at fullscreen. A
 * screen-recording would have to mask the same 60-pixel region in
 * every frame to hide the watermark, which is rare in practice.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const VisibleWatermark = ({ userId, displayName, enabled = true }) => {
  const [visible, setVisible] = useState(false);
  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (!enabled || reduced) {
      setVisible(true);  // static (always-on) under reduced-motion
      return undefined;
    }
    // 4s in, 8s out, 4s in, ... (12s cycle, 33% on / 67% off)
    const on = () => setVisible(true);
    const off = () => setVisible(false);
    on();
    const i1 = setInterval(on, 12_000);
    const i2 = setTimeout(() => {
      off();
      const cycle = () => { off(); setTimeout(on, 8_000); };
      cycle();
      setInterval(cycle, 12_000);
    }, 4_000);
    return () => { clearInterval(i1); clearTimeout(i2); };
  }, [enabled, reduced]);

  if (!enabled) return null;
  const date = new Date().toISOString().slice(0, 10);
  const tag = (displayName || 'Orbit').slice(0, 16);

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: visible ? 0.55 : 0 }}
      transition={{ duration: visible ? 0.6 : 0.8 }}
      className="absolute bottom-3 right-3 pointer-events-none select-none"
      style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 9,
        lineHeight: 1.2,
        color: 'rgba(255,255,255,0.95)',
        textShadow: '0 0 4px rgba(0,0,0,0.7)',
        letterSpacing: '0.05em',
        textAlign: 'right',
      }}
    >
      <div>ORBIT</div>
      <div style={{ opacity: 0.75 }}>{tag} · {date}</div>
    </motion.div>
  );
};

export default VisibleWatermark;
