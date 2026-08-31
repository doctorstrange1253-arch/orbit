/**
 * hooks/useFlares.js — Signal Flare hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flares } from '../services/flares';

export function useFlareCount(constellation, genre) {
  return useQuery({
    queryKey: ['flares', 'count', constellation, genre],
    queryFn: () => flares.getCount(constellation, genre),
    enabled: !!(constellation && genre),
    staleTime: 60_000,
  });
}

export function useFireFlare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ constellation, genre }) => flares.fire(constellation, genre),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['flares', 'count', vars.constellation, vars.genre] });
      qc.invalidateQueries({ queryKey: ['flares', 'me'] });
    },
  });
}

export function useMyFlares() {
  return useQuery({
    queryKey: ['flares', 'me'],
    queryFn: () => flares.getMine(),
    staleTime: 60_000,
  });
}
