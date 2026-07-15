/**
 * useOrbit.js — react-query hooks for the Orbit Engine API (streak, Gravity
 * Assist freeze, Stardust, weekly missions). Mirrors useCosmic.js patterns.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const ORBIT_KEY = ['orbit', 'me'];

/** The viewer's full orbit state. Self-heals weekly rollovers server-side. */
export function useOrbit({ enabled = true } = {}) {
  return useQuery({
    queryKey: ORBIT_KEY,
    queryFn: () => api.get('/orbit/me').then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/** Claim a completed weekly mission's Stardust. Returns the fresh orbit state. */
export function useClaimMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key) => api.post(`/orbit/missions/${key}/claim`).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(ORBIT_KEY, (prev) => ({ ...prev, ...data }));
      qc.invalidateQueries({ queryKey: ['orbit', 'shop'] }); // Photons earned → refresh shop affordability
    },
  });
}

/** Spend Photons to swap ONE unclaimed, incomplete mission for a fresh one. */
export function useRerollMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key) => api.post(`/orbit/missions/${key}/reroll`).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(ORBIT_KEY, (prev) => ({ ...prev, ...data }));
      qc.invalidateQueries({ queryKey: ['orbit', 'shop'] }); // Photons spent → refresh shop affordability
    },
  });
}

/** Gift Photons to an accepted connection ({ toUserId, amount, note? }). */
export function useGiftPhotons() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/orbit/photons/gift', payload).then((r) => r.data),
    // OPTIMISTIC: debit the balance + bump sentToday the instant the user taps
    // a preset, so the popover feels immediate; rolled back if the server
    // rejects (cap hit, not connected, insufficient balance).
    onMutate: async ({ amount }) => {
      await qc.cancelQueries({ queryKey: ORBIT_KEY });
      const prev = qc.getQueryData(ORBIT_KEY);
      qc.setQueryData(ORBIT_KEY, (old) => {
        if (!old) return old;
        const balance = Math.max(0, (old.photons ?? old.stardust ?? 0) - amount);
        return {
          ...old,
          photons: balance,
          stardust: balance,
          gift: old.gift ? { ...old.gift, sentToday: (old.gift.sentToday || 0) + amount } : old.gift,
        };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ORBIT_KEY, ctx.prev);
    },
    onSuccess: (data) => {
      qc.setQueryData(ORBIT_KEY, (prev) => ({ ...prev, ...data }));
      qc.invalidateQueries({ queryKey: ['orbit', 'shop'] }); // balance changed
    },
  });
}

/** Spend Photons to bank one extra Gravity Assist freeze. */
export function useBuyFreeze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/orbit/freeze/buy').then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(ORBIT_KEY, (prev) => ({ ...prev, ...data }));
      qc.invalidateQueries({ queryKey: ['orbit', 'shop'] }); // Photons spent → refresh shop affordability
    },
  });
}

/** Update engagement preferences (e.g. decay-reminder opt-out — Part 4). */
export function useOrbitPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs) => api.post('/orbit/prefs', prefs).then((r) => r.data),
    onSuccess: (data) => qc.setQueryData(ORBIT_KEY, (prev) => (prev ? { ...prev, prefs: data.prefs } : prev)),
  });
}

/** The viewer's recent Photon flows (earn/spend) for the Mission Log page. */
export function useLedger({ limit = 60 } = {}) {
  return useQuery({
    queryKey: ['orbit', 'ledger', limit],
    queryFn: () => api.get(`/orbit/ledger?limit=${limit}`).then((r) => r.data),
    staleTime: 30 * 1000,
    retry: 1,
  });
}
