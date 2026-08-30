import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pact } from '../services/pact';

// Mentor Pact hooks — weekly league, rivals, history, pulse.

export function usePactMe() {
    return useQuery({
        queryKey: ['pact', 'me'],
        queryFn: () => pact.me(),
        staleTime: 30_000,
    });
}

export function usePactHall() {
    return useQuery({
        queryKey: ['pact', 'hall'],
        queryFn: () => pact.hall(),
        staleTime: 30_000,
    });
}

export function usePactRivals() {
    return useQuery({
        queryKey: ['pact', 'rivals'],
        queryFn: () => pact.rivals(),
        staleTime: 30_000,
    });
}

export function usePactHistory(limit = 12) {
    return useQuery({
        queryKey: ['pact', 'history', limit],
        queryFn: () => pact.history(limit),
        staleTime: 60_000,
    });
}

export function usePactPulse() {
    return useQuery({
        queryKey: ['pact', 'pulse'],
        queryFn: () => pact.pulse(),
        staleTime: 60_000,
    });
}

export function useMarkPactPulseSeen() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => pact.markPulseSeen(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pact', 'pulse'] });
        },
    });
}
