import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';
import { ROLE_META } from '../../store/authStore';

// Duplicated from pages/Landing.jsx — this is a 5-item constant that we want
// accessible during the cross-window transition without forcing Landing to be
// in the bundle. Keeping the array local here also lets us tweak the quotes
// independently of the landing page copy.
const QUOTES = [
  { text: "Every expert was once a beginner.", author: "Robin Sharma" },
  { text: "Teaching is the highest form of understanding.", author: "Aristotle" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "Share your knowledge. It is a way to achieve immortality.", author: "Dalai Lama" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
];

// Visibility store. Lives outside React so non-component code (e.g. the
// RoleSwitcher `pick` handler) can call `.getState().start(targetWindow)`
// without needing access to the component tree.
export const useWindowSwitchStore = create((set, get) => ({
  visible: false,
  targetWindow: null, // 'peer' | 'mentor' | 'student'
  quoteIndex: 0,
  start: (targetWindow) => {
    const quoteIndex = Math.floor(Math.random() * QUOTES.length);
    set({ visible: true, targetWindow, quoteIndex });
    // Auto-hide after ~1s of "hold" (the overlay's own fade animations add
    // 250ms in + 250ms out on top of this). Guarded by targetWindow identity
    // so a rapid second trigger doesn't prematurely hide the new overlay.
    setTimeout(() => {
      if (get().targetWindow === targetWindow && get().visible) {
        set({ visible: false });
      }
    }, 1000);
  },
}));

const WindowSwitchOverlay = () => {
  const visible = useWindowSwitchStore((s) => s.visible);
  const targetWindow = useWindowSwitchStore((s) => s.targetWindow);
  const quoteIndex = useWindowSwitchStore((s) => s.quoteIndex);

  // Cycle the quote while the overlay is visible (every 2.5s)
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      useWindowSwitchStore.setState((s) => ({
        quoteIndex: (s.quoteIndex + 1) % QUOTES.length,
      }));
    }, 2500);
    return () => clearInterval(id);
  }, [visible]);

  // Respect prefers-reduced-motion — short flash only.
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return visible ? (
      <div
        aria-hidden
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      />
    ) : null;
  }

  // Translate the store's 'peer' value back to ROLE_META's 'peer_learner' key.
  const label = targetWindow
    ? (ROLE_META[targetWindow === 'peer' ? 'peer_learner' : targetWindow]?.label || targetWindow)
    : 'Orbit';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="window-switch-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75), rgba(0,0,0,0.95))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          aria-live="polite"
          role="status"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md px-8"
          >
            <div
              className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-accent"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Entering {label}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-2xl font-display font-medium italic text-text-primary leading-relaxed">
                  &ldquo;{QUOTES[quoteIndex].text}&rdquo;
                </p>
                <p className="mt-3 text-xs text-text-muted tracking-wide">
                  &mdash; {QUOTES[quoteIndex].author}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-center gap-2" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-accent/30 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WindowSwitchOverlay;