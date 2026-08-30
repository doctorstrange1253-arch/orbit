/**
 * useBinaryStars.js — react-query hooks for co-op Binary Star streaks
 * (Orbit Engine, Tier 2). The "Constellation" → "Binary Star" rename
 * shipped with the Orbit Sessions slice; the URL is /api/orbit/binary-stars.
 *
 * Mirrors useOrbit.js patterns.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const KEY = ['orbit', 'binaryStars'];

/** My active binary stars + incoming/outgoing invites. */
export function useBinaryStars({ enabled = true } = {}) {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get('/orbit/binary-stars').then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/** The viewer's established connections (partner picker for invites). */
export function useConnectionsForInvite(enabled = true) {
  return useQuery({
    queryKey: ['connections', 'all'],
    queryFn: () => api.get('/connections/all').then((r) => r.data),
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useInviteBinaryStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partnerId) => api.post('/orbit/binary-stars/invite', { partnerId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRespondBinaryStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => api.post(`/orbit/binary-stars/${id}/respond`, { action }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDissolveBinaryStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/orbit/binary-stars/${id}/dissolve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
