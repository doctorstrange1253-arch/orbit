import { useGameologyMe } from './useGameology';
import { useToday } from './useNow';

/**
 * useStreak — returns the current learning streak + a dayKey for branching
 * the visual state of <StreakFlame />.
 *
 * dayKey values:
 *   'today'      — lastActiveDate is today, streak still alive
 *   'yesterday'  — lastActiveDate is yesterday, streak at risk of breaking
 *   'older'      — streak may already have reset (or never started)
 *   'never'      — no lastActiveDate recorded
 */
export function useStreak() {
    const { data } = useGameologyMe();
    const last = data?.lastActiveDate;
    const { today, yesterday } = useToday();

    let dayKey = 'never';
    if (last === today) dayKey = 'today';
    else if (last === yesterday) dayKey = 'yesterday';
    else if (last) dayKey = 'older';

    return {
        streak: data?.currentStreak || 0,
        longest: data?.longestStreak || 0,
        lastActiveDate: last,
        dayKey,
    };
}
