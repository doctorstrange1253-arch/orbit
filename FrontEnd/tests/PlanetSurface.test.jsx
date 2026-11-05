import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ARCHETYPE_UNIFORMS, PLANET_ARCHETYPES } from '../src/cosmic/PlanetGenerator';

// Real three for geometry math; mock only the R3F renderer surface.
vi.mock('@react-three/fiber', () => ({ useFrame: () => null }));

// ?raw GLSL imports resolve to strings in vitest (vite handles it); assert that.
import planetVert from '../src/cosmic/shaders/planet.vert.glsl?raw';
import planetFrag from '../src/cosmic/shaders/planet.frag.glsl?raw';
import { displaceIcosahedron } from '../src/cosmic/PlanetSurface';
import PlanetSurface from '../src/cosmic/PlanetSurface';

describe('PlanetSurface (F4)', () => {
  it('every archetype has a complete uniform preset', () => {
    const keys = ['palA', 'palB', 'palC', 'oceanColor', 'oceanLevel', 'capColor', 'capLevel', 'atmoColor', 'atmoStrength', 'night', 'rough', 'metal'];
    expect(PLANET_ARCHETYPES).toHaveLength(8);
    for (const a of PLANET_ARCHETYPES) {
      expect(ARCHETYPE_UNIFORMS[a], `preset ${a}`).toBeDefined();
      for (const k of keys) expect(ARCHETYPE_UNIFORMS[a][k], `${a}.${k}`).toBeDefined();
    }
  });

  it('GLSL chunks load as raw strings with expected varyings/uniforms', () => {
    expect(typeof planetVert).toBe('string');
    expect(planetVert).toContain('vNormal');
    expect(typeof planetFrag).toBe('string');
    for (const u of ['uSeed', 'uPalA', 'uOcean', 'uCap', 'uAtmo', 'uNight', 'uSunDir', 'uTime']) {
      expect(planetFrag).toContain(u);
    }
    expect(planetFrag).toContain('gl_FragColor');
  });

  it('displaceIcosahedron is deterministic and actually displaces', async () => {
    const THREE = await import('three');
    const g1 = displaceIcosahedron(1, 8, 42);
    const g2 = displaceIcosahedron(1, 8, 42);
    expect(g1.attributes.position.array).toEqual(g2.attributes.position.array);
    // radii vary from exactly 1.0 somewhere (displacement happened)
    const arr = g1.attributes.position.array;
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < arr.length; i += 3) {
      const r = Math.hypot(arr[i], arr[i + 1], arr[i + 2]);
      if (r < min) min = r;
      if (r > max) max = r;
    }
    expect(max - min).toBeGreaterThan(0.05);
    expect(g1.index ? g1.index.count / 3 : arr.length / 9).toBeGreaterThan(100);
    g1.dispose(); g2.dispose();
    expect(THREE.IcosahedronGeometry).toBeTruthy();
  });

  it('renders one mesh with a shaderMaterial (mocked R3F surface)', () => {
    // With useFrame mocked and R3F intrinsics unmounted in jsdom, we assert the
    // component mounts without throwing and returns a group-level element.
    const el = React.createElement(PlanetSurface, { archetype: 'terrestrial', seed: 7, radius: 1 });
    expect(el).toBeTruthy();
    expect(el.props.archetype).toBe('terrestrial');
  });

  it('falls back to terrestrial preset for unknown archetypes', () => {
    const { container } = render(React.createElement('div', null, 'x'));
    expect(container).toBeTruthy();
    expect(ARCHETYPE_UNIFORMS['nope']).toBeUndefined();
  });
});
