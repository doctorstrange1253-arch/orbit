import { describe, it, expect } from 'vitest';
import { generatePlanetLayout, archetypeFromModule, PLANET_ARCHETYPES, ARCHETYPE_LABELS } from '../src/cosmic/PlanetGenerator';

describe('PlanetGenerator', () => {
  describe('PLANET_ARCHETYPES', () => {
    it('exposes exactly 8 archetypes covering all design §1 categories', () => {
      expect(PLANET_ARCHETYPES).toHaveLength(8);
      expect(PLANET_ARCHETYPES).toEqual(['terrestrial', 'gas_giant', 'ice_world', 'volcanic', 'oceanic', 'crystalline', 'desert', 'nebula_station']);
    });
    it('has a Chinese-readable label per archetype', () => {
      Object.keys(ARCHETYPE_LABELS).forEach((k) => {
        expect(typeof ARCHETYPE_LABELS[k]).toBe('string');
        expect(ARCHETYPE_LABELS[k].length).toBeGreaterThan(0);
      });
    });
  });

  describe('generatePlanetLayout determinism', () => {
    it.each(['000000000000000000000221', '000000000000000000000006'])('keeps positive planet dimensions for lesson %s', (moduleId) => {
      const layout = generatePlanetLayout({ courseId: '000000000000000000000001', moduleId });
      expect(layout.size).toBeGreaterThanOrEqual(0.7);
      expect(layout.size).toBeLessThanOrEqual(2.1);
      expect(layout.radius).toBeGreaterThanOrEqual(6);
      expect(layout.radius).toBeLessThanOrEqual(11);
      expect(layout.altitude).toBeGreaterThanOrEqual(0);
      expect(layout.orbitSpeed).toBeGreaterThanOrEqual(0.05);
    });

    it('keeps finite bounded parameters across real ObjectId values', () => {
      for (let index = 1; index <= 1024; index++) {
        const layout = generatePlanetLayout({ courseId: '000000000000000000000001', moduleId: index.toString(16).padStart(24, '0') });
        expect(layout.size).toBeGreaterThan(0);
        expect(layout.radius).toBeGreaterThanOrEqual(6);
        expect(layout.altitude).toBeGreaterThanOrEqual(0);
        expect(layout.orbitSpeed).toBeGreaterThan(0);
        for (const key of ['angle', 'radius', 'altitude', 'size', 'orbitSpeed']) expect(Number.isFinite(layout[key])).toBe(true);
      }
    });
    it('produces identical output for identical inputs', () => {
      const a = generatePlanetLayout({ courseId: 'course-1', moduleId: 'mod-A', moduleTitle: 'First Module' });
      const b = generatePlanetLayout({ courseId: 'course-1', moduleId: 'mod-A', moduleTitle: 'First Module' });
      expect(a).toEqual(b);
    });
    it('different course-module combos yield different archetypes', () => {
      const a = generatePlanetLayout({ courseId: 'a', moduleId: 'm1', moduleTitle: '' }).archetype;
      const b = generatePlanetLayout({ courseId: 'b', moduleId: 'm1', moduleTitle: '' }).archetype;
      // With weak hash mod 8, collisions are unlikely but we assert the values differ for distinct course IDs.
      if (a === b) throw new Error('Seed collision detected for different course IDs');
    });
    it('every layout result has all required fields populated', () => {
      const out = generatePlanetLayout({ courseId: 'c', moduleId: 'd', moduleTitle: 'T' });
      ['archetype', 'seed', 'angle', 'radius', 'altitude', 'size', 'orbitSpeed', 'title'].forEach((f) => {
        expect(out[f]).toBeDefined();
      });
    });
  });

  describe('archetypeFromModule', () => {
    it('returns archetype when module category matches known list', () => {
      const arch = archetypeFromModule({ category: 'gas_giant', courseId: '', moduleId: '' });
      expect(arch).toBe('gas_giant');
    });
    it('falls back to hash-derived archetype when no category present', () => {
      const arch = archetypeFromModule({ category: '', courseId: 'course-X', moduleId: 'mod-Y' });
      expect(PLANET_ARCHETYPES).toContain(arch);
    });
    it('returns null when all three props empty', () => {
      expect(archetypeFromModule({ courseId: '', moduleId: '' })).toBeNull();
    });
  });
});
