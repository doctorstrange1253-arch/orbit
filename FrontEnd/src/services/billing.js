import api from './api';

export const billing = {
    plans: () => api.get('/billing/plans').then((r) => r.data),
    me: () => api.get('/billing/me').then((r) => r.data),
    entitlement: (courseId) => api.get(`/billing/entitlement/${courseId}`).then((r) => r.data),
    subscribe: (planKey) => api.post('/billing/subscribe', { planKey }).then((r) => r.data),
};

export default billing;
