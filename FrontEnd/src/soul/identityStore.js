/**
 * soul/identityStore.js — A tiny zustand store for the Transit Sequence.
 *
 * Lives outside React so non-component code (the URL-watcher in App.jsx, a
 * navbar click handler, anywhere) can call `useIdentityTransit.getState().start(...)`
 * without dragging a component tree into the call.
 *
 * The store is intentionally minimal — it only tracks `active` and the
 * `from` / `to` souls for the current transit. The TransitSequence overlay
 * component (mounted once in App.jsx) reads this store and renders the
 * ceremony. Reduced-motion users get a no-op ceremony.
 */

import { create } from 'zustand';
import { pickTransitThought } from './transitThoughts';

const TRANSIT_DURATION_MS = 3000;

export const useIdentityTransit = create((set, get) => ({
  active: false,
  from: null,         // 'peer' | 'mentor' | 'student'
  to: null,           // 'peer' | 'mentor' | 'student'
  thought: null,
  onDone: null,       // optional callback after the ceremony completes
  // Start a Transit Sequence. Idempotent: if a transit is already active and
  // the destination hasn't changed, we don't restart it (avoids flicker when
  // the URL-watcher fires multiple times in quick succession).
  start: ({ from, to, onDone }) => {
    if (!from || !to) return;
    const state = get();
    if (state.active && state.to === to) return;
    set({
      active: true,
      from,
      to,
      thought: pickTransitThought(),
      onDone: typeof onDone === 'function' ? onDone : null,
    });
    setTimeout(() => {
      const cb = get().onDone;
      set({ active: false, from: null, to: null, thought: null, onDone: null });
      if (typeof cb === 'function') {
        try { cb(); } catch { /* noop */ }
      }
    }, TRANSIT_DURATION_MS);
  },
  // Cancel an in-flight transit (used by reduced-motion users / cleanup).
  cancel: () => set({ active: false, from: null, to: null, thought: null, onDone: null }),
}));

export const TRANSIT = {
  DURATION_MS: TRANSIT_DURATION_MS,
};
