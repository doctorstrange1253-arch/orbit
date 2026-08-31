import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { XP_EVENT_LABELS } from '../components/cosmic/xpEventLabels';
import { usePulseCeremony } from '../soul/league/pulseCeremony';
import { TIERS_ORDER } from '../soul/league/tierMeta';

/**
 * useXpToast — subscribes once to the `gameology:xp` socket event and
 * shows a celebratory toast + invalidates the Gameology queries so any
 * mounted LevelBadge / StreakFlame / leaderboard refetches immediately.
 *
 * V3 — also detects tier crossings (when the user's Pulse tier index
 * increases) and fires the Pulse Ceremony. The previous tier is
 * remembered in a ref so the first render after page load doesn't
 * accidentally fire the ceremony.
 *
 * Mirrors the LiftoffWatcher pattern but for the Gameology layer.
 */
export function useXpToast() {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);
    const qc = useQueryClient();
    const lastTierIdxRef = useRef(-1);
    const startPulse = usePulseCeremony((s) => s.start);

    useEffect(() => {
        if (!token || !user?._id) return;
        const socket = connectSocket(user._id);
        const onXp = (payload) => {
            const label = XP_EVENT_LABELS[payload?.event] || 'XP earned';
            const xp = payload?.xp ?? payload?.xpAwarded ?? 0;
            const body = xp > 0 ? `${label} · +${xp} XP` : label;
            toast.success(body, {
                duration: 3500,
                style: {
                    background: 'linear-gradient(135deg, rgba(124,131,255,0.18), rgba(94,234,212,0.12))',
                    color: 'var(--toast-text)',
                    border: '1px solid rgba(124,131,255,0.4)',
                },
            });
            if (payload?.leveledUp) {
                toast(`Level up! You're level ${payload.level} now.`, {
                    icon: '🚀',
                    duration: 5000,
                });
            }
            for (const key of payload?.newAchievements || []) {
                toast(`Achievement unlocked: ${key.replace(/_/g, ' ').toLowerCase()}`, {
                    icon: '🏅',
                    duration: 5500,
                });
            }
            // V3 — tier crossing? Compare the new league to the last
            // seen one. If the index increased, fire the Pulse Ceremony.
            const newTier = payload?.league;
            if (newTier && TIERS_ORDER.includes(newTier)) {
                const newIdx = TIERS_ORDER.indexOf(newTier);
                if (lastTierIdxRef.current >= 0 && newIdx > lastTierIdxRef.current) {
                    startPulse(newTier);
                }
                lastTierIdxRef.current = newIdx;
            }
            qc.invalidateQueries({ queryKey: ['gameology', 'me'] });
            qc.invalidateQueries({ queryKey: ['gameology', 'history'] });
            qc.invalidateQueries({ queryKey: ['knowledge', 'me'] });
        };
        socket.on('gameology:xp', onXp);
        return () => socket.off('gameology:xp', onXp);
    }, [token, user?._id, qc, startPulse]);
}
