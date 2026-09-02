import api from './api';

// Pact — mentor weekly head-to-head league.
// All routes are /api/pact/* (mounted in BackEnd/server.js).

export const pact = {
    me: () => api.get('/pact/me').then((r) => r.data),
    hall: () => api.get('/pact/hall').then((r) => r.data),
    rivals: () => api.get('/pact/rivals').then((r) => r.data?.items || []),
    history: (limit = 12) => api.get('/pact/history', { params: { limit } }).then((r) => r.data?.items || []),
    pulse: () => api.get('/pact/pulse').then((r) => r.data),
    markPulseSeen: () => api.post('/pact/pulse/seen').then((r) => r.data),
    publicBadge: (userId) => api.get(`/pact/user/${userId}`).then((r) => r.data),
};

export const PACT_TIERS = [
    { id: 'initiate', label: 'Initiate', glow: '#7c83ff', blurb: 'New mentor. Everyone starts here.' },
    { id: 'adept',    label: 'Adept',    glow: '#5eead4', blurb: 'Settled in, regular sessions.' },
    { id: 'mentor',   label: 'Mentor',   glow: '#a78bfa', blurb: 'The workhorse tier.' },
    { id: 'sage',     label: 'Sage',     glow: '#f59e0b', blurb: 'Sustained impact.' },
    { id: 'luminary', label: 'Luminary', glow: '#fb7185', blurb: 'Top-decile teaching.' },
    { id: 'oracle',   label: 'Oracle',   glow: '#fde68a', blurb: 'Apex. Top 1% ever reach here.' },
];

export function tierIndex(id) {
    return PACT_TIERS.findIndex((t) => t.id === id);
}
export function tierById(id) {
    return PACT_TIERS.find((t) => t.id === id) || PACT_TIERS[0];
}
export function nextTierId(id) {
    const i = tierIndex(id);
    if (i < 0 || i >= PACT_TIERS.length - 1) return id;
    return PACT_TIERS[i + 1].id;
}

export default pact;
