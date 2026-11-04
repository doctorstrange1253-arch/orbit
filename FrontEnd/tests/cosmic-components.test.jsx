import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

// Mock R3F so Canvas/points/mesh/shaderMaterial don't blow up in jsdom.
vi.mock('three', () => ({
  Vector2: class {},
  Vector3: class {},
  Color: class {},
  Raycaster: class { constructor() {} },
  ShaderMaterial: class { constructor(p) { this.uniforms = {}; this.material = p?.uniforms || {}; } },
  AdditiveBlending: 'additive',
  BackSide: 'backside',
  DoubleSide: 'doubleside',
  NormalBlending: 'normal',
}));
vi.mock('@react-three/fiber', () => ({
  Canvas: (props) => React.createElement('div', { 'data-testid': 'r3f-canvas', 'data-camera': JSON.stringify(props.camera), 'data-fov': props.fov }),
  useFrame: () => null,
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Stars: () => null,
  Html: (p) => React.createElement('div', p.position),
  Float: (p) => React.createElement('div', null, p.children),
  useProgress: () => ({ active: false, progress: 0 }),
  Environment: () => React.createElement('div'),
  leva: () => null, // LookDevShell imports leva
}));

// Stub window APIs for the quality-tier hook
Object.defineProperty(window, 'matchMedia', {
  writable: true, value: vi.fn().mockReturnValue({ matches: false }),
});
Object.defineProperty(navigator, 'hardwareConcurrency', {
  writable: true, value: 8,
});
Object.defineProperty(navigator, 'deviceMemory', {
  writable: true, value: 8,
});
globalThis.performance = { now: () => Date.now() };

import CourseSpaceJourney3D from '../src/cosmic/CourseSpaceJourney3D';
import StarfieldBackdrop from '../src/cosmic/StarfieldBackdrop';
import TwinkleBackdrop from '../src/cosmic/twinkleBackdrop';
import { generatePlanetLayout, PLANET_ARCHETYPES } from '../src/cosmic/PlanetGenerator';
import LookDevShell from '../src/components/cosmic/lookDevShell';

describe('cosmic components (smoke)', () => {
  it('StarfieldBackdrop renders without throwing', async () => {
    const { container } = render(<StarfieldBackdrop count={4000} radius={200} depth={100} />);
    expect(container).toBeTruthy();
  });

  it('TwinkleBackdrop renders at high tier without throwing', async () => {
    const { rerender } = render(<TwinkleBackdrop seed={0x42} density={400} speed={0.3} />);
    rerender(<TwinkleBackdrop seed={0x42} density={400} speed={0.3} />);
    expect(document.body).toBeTruthy();
  });

  it('PlanetGenerator produces a deterministic layout for courseId + moduleId', async () => {
    const a = generatePlanetLayout({ courseId: 'c', moduleId: 'm', moduleTitle: 'T' });
    const b = generatePlanetLayout({ courseId: 'c', moduleId: 'm', moduleTitle: 'T' });
    expect(a).toEqual(b);
    expect(PLANET_ARCHETYPES).toContain(a.archetype);
  });

  it('LookDevShell renders with lab tab labels and capture button', async () => {
    const { getByText } = render(<LookDevShell>payload</LookDevShell>);
    expect(getByText('Look-Dev Lab')).toBeTruthy();
    expect(getByText('Capture [L]')).toBeTruthy();
  });

  it('CourseSpaceJourney3D mounts under mocked Canvas camera props', async () => {
    const { container } = render(<CourseSpaceJourney3D courseTitle="Test" modules={[{ id: 'm1', title: 'Mod 1' }]} onSelectModule={() => {}} selectedModuleId="m1" />);
    const canvas = container.querySelector('[data-testid="r3f-canvas"]');
    expect(canvas).not.toBeNull();
  });
});
