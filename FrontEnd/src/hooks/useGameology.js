import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameology } from '../services/gameology';

// Gameology hooks — student's lifetime XP / level / streak / achievements.

export function useGameologyMe() {
    return useQuery({
        queryKey: ['gameology', 'me'],
        queryFn: () => gameology.me(),
        staleTime: 30_000,
    });
}

export function useGameologyLeaderboard(league, limit = 50) {
    return useQuery({
        queryKey: ['gameology', 'leaderboard', league, limit],
        queryFn: () => gameology.leaderboard({ league, limit }),
        staleTime: 60_000,
    });
}

export function useGameologyCatalog() {
    return useQuery({
        queryKey: ['gameology', 'catalog'],
        queryFn: () => gameology.catalog(),
        staleTime: 5 * 60_000,
    });
}

export function useMyAchievements() {
    return useQuery({
        queryKey: ['gameology', 'achievements-me'],
        queryFn: () => gameology.myAchievements(),
        staleTime: 30_000,
    });
}

export function useGameologyHistory(limit = 30) {
    return useQuery({
        queryKey: ['gameology', 'history', limit],
        queryFn: () => gameology.history(limit),
        staleTime: 30_000,
    });
}

export function useAwardXp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ event, metadata }) => gameology.award(event, metadata),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['gameology', 'me'] });
            qc.invalidateQueries({ queryKey: ['gameology', 'history'] });
        },
    });
}
