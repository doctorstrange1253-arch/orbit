// Pure layout + uniform-preset library — intentionally no React import.

/**
 * PlanetGenerator — deterministic procedural planet creation from module metadata.
 * Each course is compiled to a solar system whose planets map 1:1 to its
 * modules — a stable, reproducible layout guaranteed by seed(courseId+moduleId).
 *
 * Archetypes (8 total, per design §1):
 *   0 Terrestrial — rocky surface with crater-lit emissive
 *   1 Gas Giant  — banded swirling atmosphere
 *   2 Ice World  — frozen methane subsurface
 *   3 Volcanic   — magma-vent surface with lava tint
 *   4 Oceanic    — hydrosphere with deep water specular
 *   5 Crystalline — faceted mineral crystal geometry
 *   6 Desert     — erosion planetesimal with sand highlight
 *   7 Nebula Station — gas giant w/ signal-pulse station ring
 *
 * Seeding convention: SHA-256 of (courseId + ':' + moduleId) → int32, mixed
 * into octave-noise frequency floors and phase offsets. Same inputs → same output,
 * exact every reload. Determinism makes cross-client sync trivial.
 */
import { layoutToPosition } from './travel';

/** Re-export so labs can place nodes without duplicating the formula. */
export { layoutToPosition };

export const PLANET_ARCHETYPES = ['terrestrial', 'gas_giant', 'ice_world', 'volcanic', 'oceanic', 'crystalline', 'desert', 'nebula_station'];export const ARCHETYPE_LABELS = {
  terrestrial: 'Terra', gas_giant: 'Gasmass', ice_world: 'Ice', volcanic: 'Vulcane',
  oceanic: 'Ocean', crystalline: 'Crystal', desert: 'Desert', nebula_station: 'Nebula',
};

// NOTE: the old seededNoise JS noise helper was removed in F4. Layout math uses
// hashToSeed + bit slicing; actual terrain noise lives in the GPU shaders
// (shaders/noise.glsl) and PlanetSurface displacement. No JS noise needed.

function hashToSeed(courseId, moduleId) {
  const key = `${courseId}:${moduleId}`;
  let h = 0x811c9dc5; // FNV offset — cheap hash for low-cardinality keys
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Map archetype key to a leaf node label hint for module titles. */
export function archetypeFromModule({ category = '', courseId = '', moduleId = '' }) {
  if (!category && !courseId && !moduleId) return null;
  // If modules carry an `category` field, prefer it over numeric bucket.
  if (category && PLANET_ARCHETYPES.includes(category.toLowerCase())) return category.toLowerCase();
  // Otherwise derive from hash modulo 8 so any input yields a stable archetype.
  const seed = hashToSeed(courseId, moduleId);
  return PLANET_ARCHETYPES[seed % PLANET_ARCHETYPES.length];
}

/** Pure factory returning deterministic orbit + geometry params for one module.
 *  NOTE (F4): this module has NO default export — it is a pure layout/uniform
 *  library. Everything renderable lives in <PlanetSurface />. */
export function generatePlanetLayout({ courseId, moduleId, moduleTitle }) {
  const seed = hashToSeed(courseId || 'default', moduleId || '0');
  const archetype = PLANET_ARCHETYPES[seed % PLANET_ARCHETYPES.length];
  const angle = ((seed >>> 0) % 360) / 360;            // position around orbit
  const radius = 6 + ((seed >> 8) % 3) * 2.5;          // orbit spacing
  const altitude = ((seed >> 16) % 4) * 1.5;           // tilt wobble
  const size = 0.7 + ((seed >> 0) % 10) / 10 * 1.4;    // planet relative radius
  const orbitSpeed = 0.05 + ((seed >> 8) % 10) / 100;  // slow drifting rotation
  return {
    archetype,
    seed,
    angle, radius, altitude, size, orbitSpeed,
    title: moduleTitle,
  };
}

/**
 * Archetype uniform presets — the single source of truth for per-archetype
 * shader parameters. Shader stages read these from <PlanetSurface>
 * uniforms; changing a preset re-renders every instance of that archetype.
 *
 * Each preset: palA/palB/palC (terrain color ramp), oceanColor, oceanLevel,
 * capColor (polar caps), capLevel, atmoColor, atmoStrength, night (city-light
 * intensity), rough (surface roughness multiplier), metal.
 */
export const ARCHETYPE_UNIFORMS = {
  terrestrial: {
    palA: '#8a6b45', palB: '#4d7a3a', palC: '#d8d2c0',
    oceanColor: '#1e5fa8', oceanLevel: 0.42,
    capColor: '#eef2f6', capLevel: 0.86,
    atmoColor: '#6db8ff', atmoStrength: 0.55,
    night: 0.9, rough: 0.85, metal: 0.05,
  },
  gas_giant: {
    palA: '#c8a06a', palB: '#8a5f3a', palC: '#e8d8b0',
    oceanColor: '#6a4a2a', oceanLevel: -1.0, // no ocean
    capColor: '#e0d4c0', capLevel: 1.1,      // no caps
    atmoColor: '#d8b880', atmoStrength: 0.35,
    night: 0.0, rough: 0.6, metal: 0.0,
  },
  ice_world: {
    palA: '#b8d4e8', palB: '#7aa8cc', palC: '#f0f6fa',
    oceanColor: '#2a6a9a', oceanLevel: 0.35,
    capColor: '#ffffff', capLevel: 0.65,
    atmoColor: '#a8d0f0', atmoStrength: 0.45,
    night: 0.15, rough: 0.35, metal: 0.1,
  },
  volcanic: {
    palA: '#3a2a28', palB: '#6a2a1a', palC: '#1a1414',
    oceanColor: '#ff5a1a', oceanLevel: 0.30, // lava seas
    capColor: '#8a4a3a', capLevel: 1.1,      // no ice caps
    atmoColor: '#ff8a4a', atmoStrength: 0.5,
    night: 1.0, rough: 0.9, metal: 0.2,
  },
  oceanic: {
    palA: '#1a5a7a', palB: '#0a3a5a', palC: '#c8e0e8',
    oceanColor: '#1490d8', oceanLevel: 0.62, // mostly water
    capColor: '#eef2f6', capLevel: 0.92,
    atmoColor: '#4ac8ff', atmoStrength: 0.7,
    night: 0.4, rough: 0.25, metal: 0.15,
  },
  crystalline: {
    palA: '#8a6ad8', palB: '#4a3a9a', palC: '#e8e0ff',
    oceanColor: '#5a3ab8', oceanLevel: 0.28,
    capColor: '#d8ccf0', capLevel: 0.90,
    atmoColor: '#a88af0', atmoStrength: 0.4,
    night: 0.7, rough: 0.15, metal: 0.4,
  },
  desert: {
    palA: '#c8a05a', palB: '#9a6a30', palC: '#e8d0a0',
    oceanColor: '#3a6a8a', oceanLevel: 0.12, // rare oases
    capColor: '#e8dcc0', capLevel: 1.1,      // no ice caps
    atmoColor: '#e8b860', atmoStrength: 0.3,
    night: 0.25, rough: 0.95, metal: 0.0,
  },
  nebula_station: {
    palA: '#3a2a6a', palB: '#1a4a6a', palC: '#c8a8ff',
    oceanColor: '#4a6ad8', oceanLevel: -1.0,
    capColor: '#c8d0f0', capLevel: 1.1,
    atmoColor: '#8a5ae8', atmoStrength: 0.8,
    night: 1.0, rough: 0.5, metal: 0.3,
  },
};
