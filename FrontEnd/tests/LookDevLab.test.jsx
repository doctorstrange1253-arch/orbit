import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

vi.mock('three', () => ({
  Vector2: class {}, Vector3: class {}, Color: class {},
  Raycaster: class { constructor() {} },
  ShaderMaterial: class {},
  AdditiveBlending: 'additive', BackSide: 'backside', DoubleSide: 'doubleside', NormalBlending: 'normal',
  AgXToneMapping: 5,
}));
vi.mock('@react-three/fiber', () => ({
  Canvas: (p) => React.createElement('div', { 'data-testid': 'lab-canvas' }, p.children),
  useFrame: () => null,
}));
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Stars: () => null,
  Html: (p) => React.createElement('div', null, p.children),
  Float: (p) => React.createElement('div', null, p.children),
  useProgress: () => ({ active: false, progress: 0 }),
  Environment: () => React.createElement('div'),
}));
vi.mock('leva', () => ({
  Leva: () => React.createElement('div'),
  useControls: () => ({ count: 4000, seed: 49236, milkyway: true, showPerf: false }),
}));
vi.mock('r3f-perf', () => ({ Perf: () => null }));

Object.defineProperty(window, 'matchMedia', {
  writable: true, value: vi.fn().mockReturnValue({ matches: false }),
});
Object.defineProperty(navigator, 'hardwareConcurrency', { writable: true, value: 8 });
Object.defineProperty(navigator, 'deviceMemory', { writable: true, value: 8 });
globalThis.performance = { now: () => Date.now() };

import LookDevLab from '../src/cosmic/LookDevLab';

describe('LookDevLab (F3)', () => {
  it('renders the dev-only shell with lab tabs and a canvas', () => {
    const { container } = render(<LookDevLab />);
    expect(container.querySelector('[data-testid="look-dev-lab"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="lab-canvas"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Star' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nebula' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'PostFX' })).toBeTruthy();
  });
});
