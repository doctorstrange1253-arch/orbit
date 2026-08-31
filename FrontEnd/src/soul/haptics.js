/**
 * soul/haptics.js — The haptic vocabulary.
 *
 * Mobile haptics (navigator.vibrate) are how we make achievement LIVE IN THE
 * BODY. Every V3 moment that "lands" — lesson complete, rank up, signal
 * flare, soul switch — has a corresponding haptic pattern here. The patterns
 * are deliberately short (15-120ms total) so they feel like confirmation
 * taps, not buzzes.
 *
 * Two guards before each vibrate:
 *   1. `typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'`
 *      — `navigator.vibrate` is undefined on iOS Safari and desktop, so the
 *      `?.` call alone would throw. The guard makes the no-op safe.
 *   2. `prefers-reduced-motion: reduce` check (via `_isReducedMotion()`).
 *      — users who have asked for less motion get LESS haptics too. We still
 *      call the strongest haptics (rank up, denied) because the user has
 *      *interacted* with that moment and the haptic IS the confirmation —
 *      but the ambient patterns (light, pulse tick) skip.
 *
 * Each helper is a NAMED function, not a magic number. The whole point of
 * the vocabulary is that "medium" and "heavy" mean something; if a component
 * needs the precise timing, it should call `Haptic.medium()` and not invent
 * its own vibrate call. This keeps the V3 sensory language consistent.
 */

const _isBrowser = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

function _vibrate(pattern, opts = {}) {
  if (!_isBrowser()) return;
  // Reduced-motion: skip the ambient patterns, keep the heavy/confirmation ones.
  if (_isReducedMotion() && !opts.alwaysFire) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* vibrate() can throw in some WebView edge cases — never break the UI. */
  }
}

export const Haptic = {
  // A single 15ms tap. The default "something happened" confirmation.
  // Used by: XP toast, hover ticks, generic feedback.
  light: () => _vibrate(15),

  // A 30-20-60ms double-tap. The "lesson complete" feel.
  // Used by: lesson complete, course milestone.
  medium: () => _vibrate([30, 20, 60]),

  // A 80-40-80-40-120ms heavy pattern. The "rank up" / "boss level" feel.
  // The `alwaysFire: true` means this fires even under prefers-reduced-motion
  // because the user has just performed the action that earned it.
  heavy: () => _vibrate([80, 40, 80, 40, 120], { alwaysFire: true }),

  // A 40-20-40-20-80ms success pattern. The "you finished" feel.
  // Used by: course complete, skill map shared.
  success: () => _vibrate([40, 20, 40, 20, 80], { alwaysFire: true }),

  // The 3-1 transit rhythm: three short taps, a pause, a long one. The
  // "you're moving between souls" feel. Matches the Transit Sequence bloom
  // timing in TransitSequence.jsx.
  transit: () => _vibrate([50, 30, 50, 30, 50, 60, 100], { alwaysFire: true }),

  // A 20-30 staggered 4-tap pattern. The "signal flare launching" feel.
  flare: () => _vibrate([20, 30, 20, 30, 20, 30, 80]),

  // A 100-50-100 double-tap. The "this was denied" feel (Yellow Card).
  // Heavier than `heavy` so the user notices the moderation.
  denied: () => _vibrate([100, 50, 100], { alwaysFire: true }),

  // A 50ms soft click. The "horizon bar ticking" feel. Fires often (every
  // minute on the active horizon) so it must be cheap and gentle.
  pulseTick: () => _vibrate(8),

  // Cancel any in-flight pattern. Useful when a long haptic is interrupted
  // by another event (e.g. user switches souls mid-transit).
  cancel: () => {
    if (!_isBrowser()) return;
    try { navigator.vibrate(0); } catch { /* noop */ }
  },
};

// Test hook for unit tests. Lets a test inject a fake navigator.vibrate
// without monkey-patching the real one. Not exported in the public API.
export const _hapticsTest = {
  isBrowser: _isBrowser,
  isReducedMotion: _isReducedMotion,
};
