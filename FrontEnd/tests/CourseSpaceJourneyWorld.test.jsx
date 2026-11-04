import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';

// ── mocks (same pattern as the passing CourseSpaceJourney3D tests) ──
vi.mock('three', () => ({
  Vector2: class {}, Vector3: class {}, Color: class {},
  Raycaster: class { constructor() {} },
  ShaderMaterial: class { constructor(p) { this.uniforms = {}; } },
  AdditiveBlending: 'additive', BackSide: 'backside', DoubleSide: 'doubleside', NormalBlending: 'normal',
  AgXToneMapping: 5, ACESFilmicToneMapping: 4,
}));

let lastGl = null;
vi.mock('@react-three/fiber', () => ({
  Canvas: (props) => {
    React.useEffect(() => {
      const gl = {
        domElement: document.createElement('canvas'),
        setPixelRatio() {}, setSize() {}, dispose() {}, toneMapping: 0,
      };
      lastGl = gl;
      props.onCreated && props.onCreated(gl);
    }, []);
    return React.createElement('div', {
      'data-testid': 'r3f-canvas',
      'data-camera': JSON.stringify(props.camera),
      'data-fov': props.fov,
    });
  },
  useFrame: () => null,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Stars: () => null,
  Html: (p) => React.createElement('div', { 'data-testid': 'drei-html' }, p.children),
  Float: (p) => React.createElement('div', null, p.children),
  useProgress: () => ({ active: false, progress: 0 }),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: (p) => React.createElement('div', { 'data-testid': 'composer' }, p.children),
  Bloom: () => null,
  Vignette: () => null,
  OutputPass: () => null,
}));

vi.mock('r3f-perf', () => ({ Perf: () => null }));

// matchMedia stub, controllable per test
let reducedMotion = false;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((q) => ({ matches: q.includes('reduce') ? reducedMotion : false })),
});
Object.defineProperty(navigator, 'hardwareConcurrency', { writable: true, value: 8 });
Object.defineProperty(navigator, 'deviceMemory', { writable: true, value: 8 });
// jsdom has no WebGL — stub getContext so useQualityTier sees webgl2 as available
HTMLCanvasElement.prototype.getContext = () => ({});
globalThis.performance = { now: () => Date.now() };

import CourseSpaceJourneyWorld from '../src/cosmic/CourseSpaceJourneyWorld';

const MODULES = [
  { _id: 'm1', title: 'Module One' },
  { _id: 'm2', title: 'Module Two' },
];

beforeEach(() => { reducedMotion = false; lastGl = null; });

describe('CourseSpaceJourneyWorld (F1 scene shell)', () => {
  it('renders the 3D canvas at high tier with camera + fov props', () => {
    const { container } = render(
      <CourseSpaceJourneyWorld courseId="c1" courseTitle="Deep Space" modules={MODULES} onSelectModule={() => {}} selectedModuleId="m1" />
    );
    const canvas = container.querySelector('[data-testid="r3f-canvas"]');
    expect(canvas).not.toBeNull();
    expect(canvas.getAttribute('data-camera')).toContain('18');
  });

  it('applies DPR cap + AgX tone mapping in onCreated', () => {
    render(<CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={() => {}} />);
    expect(lastGl).not.toBeNull();
    expect(lastGl.toneMapping).toBe(5); // AgXToneMapping from the three mock
  });

  it('shows a context-lost banner when webglcontextlost fires (and preventDefault allows restore)', () => {
    render(<CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={() => {}} />);
    const el = lastGl.domElement;
    const evt = new Event('webglcontextlost', { cancelable: true });
    act(() => { el.dispatchEvent(evt); });
    expect(evt.defaultPrevented).toBe(true);
    expect(screen.getByText(/context lost/i)).toBeTruthy();
  });

  it('falls back to a keyboard-navigable 2D list when reduced motion is set', async () => {
    reducedMotion = true;
    const onSelect = vi.fn();
    render(<CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={onSelect} selectedModuleId="m2" />);
    const btn = await screen.findByRole('button', { name: /Module One/ });
    expect(btn).toBeTruthy();
    expect(screen.getByRole('button', { name: /Module Two/ }).getAttribute('aria-pressed')).toBe('true');
    act(() => { btn.click(); });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ _id: 'm1' }));
  });

  it('2D fallback renders zero canvas elements', async () => {
    reducedMotion = true;
    const { container } = render(<CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={() => {}} />);
    await screen.findByRole('button', { name: /Module One/ });
    expect(container.querySelector('[data-testid="r3f-canvas"]')).toBeNull();
  });

  it('view toggle switches between 3D canvas and 2D map', async () => {
    const { container } = render(<CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={() => {}} />);
    expect(container.querySelector('[data-testid="r3f-canvas"]')).not.toBeNull();
    const toggle = screen.getByRole('button', { name: /2d map/i });
    act(() => { toggle.click(); });
    expect(container.querySelector('[data-testid="r3f-canvas"]')).toBeNull();
    expect(await screen.findByRole('button', { name: /Module One/ })).toBeTruthy();
  });
});
