/**
 * services/knowledge.js — Knowledge Graph API wrapper.
 *
 * V3-D backend exposes:
 *   GET /api/knowledge/me                      → { items: top concepts }
 *   GET /api/knowledge/me/path                 → { items: strongest cluster }
 *   GET /api/knowledge/me/skill-map            → { stars, edges, clusters, path, meta }
 *   GET /api/knowledge/:userId/skill-map       → public variant
 *   GET /api/knowledge/concepts                → catalog
 *   GET /api/knowledge/concepts/:slug/mastery  → caller's mastery bar
 *
 * This file is a thin axios wrapper. Hooks live in hooks/useKnowledge.js.
 */

import api from './api';

export const knowledge = {
  getMyConcepts: (limit = 30) =>
    api.get('/knowledge/me', { params: { limit } }).then((r) => r.data),

  getMyPath: () =>
    api.get('/knowledge/me/path').then((r) => r.data),

  getMySkillMap: () =>
    api.get('/knowledge/me/skill-map').then((r) => r.data),

  getPublicSkillMap: (userId) =>
    api.get(`/knowledge/${userId}/skill-map`).then((r) => r.data),

  getConceptsCatalog: (params = {}) =>
    api.get('/knowledge/concepts', { params }).then((r) => r.data),

  getMyMastery: (slug) =>
    api.get(`/knowledge/concepts/${slug}/mastery`).then((r) => r.data),
};
