import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * tourStore — remembers which first-visit walkthroughs a user has already seen
 * (per device, in localStorage). Each tour has a stable key; once completed or
 * skipped it will not auto-open again. The Settings > Help center can replay any
 * tour by calling replay(key), which clears its seen flag and forces it open on
 * the next visit to that page.
 */
export const useTourStore = create(
  persist(
    (set, get) => ({
      seen: {},          // { [tourKey]: true }
      replayKey: null,   // a tour explicitly forced open from the Help center

      hasSeen: (key) => !!get().seen[key],

      markSeen: (key) =>
        set((s) => ({
          seen: { ...s.seen, [key]: true },
          replayKey: s.replayKey === key ? null : s.replayKey,
        })),

      replay: (key) =>
        set((s) => ({
          seen: { ...s.seen, [key]: false },
          replayKey: key,
        })),

      clearReplay: () => set({ replayKey: null }),

      resetAll: () => set({ seen: {}, replayKey: null }),
    }),
    { name: 'orbit-tours' }
  )
);
