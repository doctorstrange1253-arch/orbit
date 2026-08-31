/**
 * hooks/useKnowledge.js — Knowledge Graph hooks.
 *
 * Each hook is a thin wrapper around useQuery + the services/knowledge
 * module. Hooks are colocated in hooks/ per the V2 pattern (useGameology,
 * usePact, useXpToast).
 *
 * Hooks:
 *   useMyConcepts(limit)        — top concepts by mastery
 *   useMyPath()                  — strongest cluster
 *   useMySkillMap()              — full stars/edges/clusters/path data
 *   usePublicSkillMap(userId)    — shareable variant
 *   useConceptsCatalog(params)   — public catalog (used by CourseBuilder)
 *   useMyMastery(slug)           — single-concept mastery bar
 */

import { useQuery } from '@tanstack/react-query';
import { knowledge } from '../services/knowledge';

export function useMyConcepts(limit = 30) {
  return useQuery({
    queryKey: ['knowledge', 'me', limit],
    queryFn: () => knowledge.getMyConcepts(limit),
    staleTime: 60_000,
  });
}

export function useMyPath() {
  return useQuery({
    queryKey: ['knowledge', 'path'],
    queryFn: () => knowledge.getMyPath(),
    staleTime: 60_000,
  });
}

export function useMySkillMap() {
  return useQuery({
    queryKey: ['knowledge', 'skill-map', 'me'],
    queryFn: () => knowledge.getMySkillMap(),
    staleTime: 120_000,
  });
}

export function usePublicSkillMap(userId) {
  return useQuery({
    queryKey: ['knowledge', 'skill-map', userId],
    queryFn: () => knowledge.getPublicSkillMap(userId),
    enabled: !!userId,
    staleTime: 300_000,
  });
}

export function useConceptsCatalog(params = {}) {
  return useQuery({
    queryKey: ['knowledge', 'catalog', params],
    queryFn: () => knowledge.getConceptsCatalog(params),
    staleTime: 300_000,
  });
}

export function useMyMastery(slug) {
  return useQuery({
    queryKey: ['knowledge', 'mastery', slug],
    queryFn: () => knowledge.getMyMastery(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}
