import api from './api';

export const honours = {
  tiers: () => api.get('/sessions/honours/tiers').then((r) => r.data?.items || []),
  forMentor: (userId) => api.get(`/sessions/mentors/${userId}/honours`).then((r) => r.data),
  send: (userId, body) => api.post(`/sessions/mentors/${userId}/honours`, body).then((r) => r.data),
};

export const TIER_ORDER = ['beacon', 'comet', 'supernova'];

export const TIER_META = {
  beacon: { label: 'Beacon', photons: 50, blurb: 'You lit the way.' },
  comet: { label: 'Comet', photons: 200, blurb: 'That lesson moved fast and left a tail.' },
  supernova: { label: 'Supernova', photons: 1000, blurb: 'Rare. Something changed for good.' },
};

export default honours;
