import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const DUEL_KEY = ['orbit', 'duels'];

/** The viewer's duel for this week, plus their record. Settles stale weeks on read. */
export function useDuels({ enabled = true } = {}) {
  return useQuery({
    queryKey: DUEL_KEY,
    queryFn: () => api.get('/orbit/duels/me').then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useChallengePeer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toUserId) => api.post('/orbit/duels', { toUserId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DUEL_KEY }),
  });
}

export function useRespondDuel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }) => api.post(`/orbit/duels/${id}/respond`, { accept }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DUEL_KEY }),
  });
}
