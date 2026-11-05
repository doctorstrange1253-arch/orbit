import api from './api';

// Gameology — student XP / level / streak / achievements.
// All routes are /api/gameology/* (mounted in BackEnd/server.js).

export const gameology = {
    me: () => api.get('/gameology/me').then((r) => r.data),
    leaderboard: (params = {}) => api.get('/gameology/leaderboard', { params }).then((r) => r.data),
    catalog: () => api.get('/gameology/achievements').then((r) => r.data?.items || []),
    myAchievements: () => api.get('/gameology/achievements/me').then(({ data }) => {
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        return items.map((achievement) => ({ ...achievement, unlocked: Boolean(achievement.unlockedAt || achievement.unlocked) }));
    }),
    history: (limit = 30) => api.get('/gameology/history', { params: { limit } }).then((r) => r.data?.items || []),
    award: (event, metadata = {}) => api.post('/gameology/award', { event, metadata }).then((r) => r.data),
};

export default gameology;
