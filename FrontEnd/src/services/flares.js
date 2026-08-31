/**
 * services/flares.js — Signal Flare API wrapper.
 *
 * V3 endpoints:
 *   POST /api/flares                       — fire a flare
 *   GET  /api/flares/count?constellation=&genre=  — counter
 *   GET  /api/flares/me                     — caller's flares
 *   GET  /api/flares/queue?constellation=  — mentor scan
 *
 * The companion hook is hooks/useFlares.js.
 */

import api from './api';

export const flares = {
  fire: (constellation, genre) =>
    api.post('/flares', { constellation, genre }).then((r) => r.data),

  getCount: (constellation, genre) =>
    api.get('/flares/count', { params: { constellation, genre } }).then((r) => r.data),

  getMine: () =>
    api.get('/flares/me').then((r) => r.data),

  getQueue: (constellation) =>
    api.get('/flares/queue', { params: { constellation } }).then((r) => r.data),
};
