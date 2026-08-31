/**
 * soul/league/pulseCeremony.jsx — The Pulse Ceremony.
 *
 * The V3 rank-up ritual. When the user crosses a Pulse tier threshold
 * (e.g. Meteor → Comet), this overlay fires:
 *
 *   0.0-0.4s : page freeze + radial nebula flood from center
 *   0.4-1.2s : tier badge blooms from center (TierBadge with
 *               animated=true, size ramps 28 → 96)
 *   1.2-2.5s : "<Tier> tier" eyebrow + "You've become a <tier>."
 *               caption fades in. Haptic.heavy() fires.
 *   2.5-4.0s : "Share your rank" button fades in
 *   4.0s     : auto-dismiss (or click outside to close)
 *
 * Sits on the page as a portal (document.body). Mounted once in
 * App.jsx. Reads from useIdentityTransit's pulse tier-up event (we
 * piggy-back on the same store but with a `pulse: <tier>` field).
 *
 * Reduced-motion: a 1.2s cross-fade with the tier badge centered,
 * no animation, no sound, no haptic.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { createPortal } from 'react-dom';
import { Share2, Sparkles, X } from 'lucide-react';
import { SoulSound } from '../soundLibrary';
import { Haptic } from '../haptics';
import TierBadge, { TIERS } from './TierBadge';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Tiny store. Lives outside React so non-component code can fire the
// ceremony. (Future: emit from the gameology:xp socket handler when
// the user's tier index increases.)
export const usePulseCeremony = create((set, get) => ({
  active: false,
  tier: 'dust',
  start: (tier) => {
    if (!tier) return;
    set({ active: true, tier });
    setTimeout(() => set({ active: false }), 4200);
  },
  cancel: () => set({ active: false, tier: 'dust' }),
}));

const RANK_COPY = {
  dust:        { caption: "You're here. The universe hasn't noticed yet." },
  meteor:      { caption: "Burning through. You're moving." },
  comet:       { caption: "Visible streak across the sky." },
  star:        { caption: "A fixed point of light." },
  giant:       { caption: "Bigger than the rest." },
  nebula:      { caption: "Surrounded by your own light." },
  pulsar:      { caption: "Pulsing with energy." },
  singularity: { caption: "Apex. There is no tier above." },
};

const PulseCeremony = () => {
  const active = usePulseCeremony((s) => s.active);
  const tier = usePulseCeremony((s) => s.tier);
  const cancel = usePulseCeremony((s) => s.cancel);
  const [mounted, setMounted] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const reduced = _isReducedMotion();
  const meta = TIERS[tier] || TIERS.dust;
  const copy = RANK_COPY[tier] || RANK_COPY.dust;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!active) {
      setShowShare(false);
      return undefined;
    }
    SoulSound.rankUp({ soul: 'student' });
    Haptic.heavy();
    if (reduced) {
      const t = setTimeout(() => setShowShare(true), 600);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setShowShare(true), 2500);
    return () => clearTimeout(t1);
  }, [active, reduced]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {active && (
        reduced ? (
          <motion.div
            key="pulse-reduced"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[280] flex items-center justify-center"
            style={{ background: 'rgba(6,8,16,0.9)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-center text-text-primary px-6 max-w-md">
              <TierBadge tier={tier} size={80} />
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mt-3">
                New tier
              </div>
              <div className="text-3xl font-display font-black mt-1">{meta.label}</div>
              <div className="text-sm text-text-secondary mt-2 italic">{copy.caption}</div>
              {showShare && (
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'My new Pulse tier', text: `I just became a ${meta.label} on Orbit.`, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href).catch(() => {});
                    }
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
                  style={{ borderColor: meta.color, color: meta.color }}
                >
                  <Share2 size={14} /> Share
                </button>
              )}
              <button
                type="button"
                onClick={cancel}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pulse-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[280] flex items-center justify-center pointer-events-auto"
            style={{ background: 'rgba(6,8,16,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={cancel}
          >
            {/* Beat 1: nebula flood from center */}
            <motion.div
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: '200vmax', height: '200vmax', opacity: 0.12 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute rounded-full"
              style={{
                background: `radial-gradient(circle, ${meta.color}55, ${meta.color}22 40%, transparent 70%)`,
              }}
            />
            {/* Beat 2: tier badge bloom */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <TierBadge tier={tier} size={120} animated />
            </motion.div>
            {/* Beat 3: caption */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="absolute text-center text-text-primary px-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted mt-3">
                New tier
              </div>
              <div className="text-3xl font-display font-black mt-1">{meta.label}</div>
              <div className="text-sm text-text-secondary mt-2 italic">{copy.caption}</div>
              {showShare && (
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'My new Pulse tier', text: `I just became a ${meta.label} on Orbit.`, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href).catch(() => {});
                    }
                  }}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
                  style={{ borderColor: meta.color, color: meta.color }}
                >
                  <Share2 size={14} /> Share
                </button>
              )}
            </motion.div>
            {/* Close button (top-right) */}
            <button
              type="button"
              onClick={cancel}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {/* Tiny sparkles around the badge */}
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 1.6, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
                className="absolute"
                style={{
                  left: `calc(50% + ${Math.cos((i / 8) * Math.PI * 2) * 180}px)`,
                  top: `calc(50% + ${Math.sin((i / 8) * Math.PI * 2) * 180}px)`,
                }}
              >
                <Sparkles size={10} style={{ color: meta.color }} />
              </motion.span>
            ))}
          </motion.div>
        )
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PulseCeremony;
