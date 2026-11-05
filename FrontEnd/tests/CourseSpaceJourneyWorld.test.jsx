import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';

// ── mocks (same pattern as the passing CourseSpaceJourney3D tests) ──
vi.mock('three', () => ({
  Vector2: class {}, Vector3: class { constructor() { this.x = 0; this.y = 0; this.z = 0; } lerp() { return this; } },
  Color: class {},
  Quaternion: class { constructor() {} },
  Raycaster: class { constructor() {} },
  ShaderMaterial: class { constructor(_p) { this.uniforms = {}; } },
  AdditiveBlending: 'additive', BackSide: 'backside', DoubleSide: 'doubleside', NormalBlending: 'normal',
  AgXToneMapping: 5, ACESFilmicToneMapping: 4,
}));

vi.mock('../src/cosmic/PlanetSurface', () => ({
  __esModule: true,
  default: (p) => React.createElement('div', {
    'data-testid': 'planet-surface',
    'data-archetype': p.archetype,
    'data-seed': p.seed,
    'data-radius': p.radius,
    'data-spin': p.spin,
    'data-detail': p.detail,
  }),
}));

vi.mock('../src/cosmic/Shuttle', () => ({
  __esModule: true,
  default: function MockShuttle(p) {
    React.useEffect(() => { if (p.apiRef) p.apiRef.current = { flyTo: () => {} }; }, []);
    return React.createElement('div', { 'data-testid': 'shuttle' });
  },
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
      props.onCreated && props.onCreated({ gl });
    }, []);
    return React.createElement('div', {
      'data-testid': 'r3f-canvas',
      'data-camera': JSON.stringify(props.camera),
      'data-fov': props.fov,
      'data-dpr': JSON.stringify(props.dpr),
      'data-glint': typeof props.gl?.toneMapping,
      'data-gltonemapping': props.gl?.toneMapping,
    }, props.children); // pass children: Canvas normally renders them into the scene
  },
  useFrame: () => null,
  useThree: () => ({ camera: { position: { lerp() {} }, lookAt() {} } }),
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
  ToneMapping: (p) => React.createElement('div', { 'data-testid': 'tonemapping', 'data-mode': p.mode }),
}));

vi.mock('postprocessing', () => ({ ToneMappingMode: { AGX: 7, ACES_FILMIC: 6 } }));

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

  it('applies DPR cap in dpr prop + AgX via gl prop and composer ToneMapping effect', () => {
    const { container, unmount } = render(<CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={() => {}} />);
    const canvas = container.querySelector('[data-testid="r3f-canvas"]');
    const dpr = JSON.parse(canvas.getAttribute('data-dpr'));
    expect(dpr).toEqual([1, 1.75]); // high tier per stubs
    expect(Number(canvas.getAttribute('data-gltonemapping'))).toBe(5); // THREE.AgXToneMapping from the three mock
    const tm = container.querySelector('[data-testid="tonemapping"]');
    expect(Number(tm.getAttribute('data-mode'))).toBe(7); // postprocessing ToneMappingMode.AGX
    unmount();
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

  it('renders one seeded PlanetSurface per module (archetype plumbed through)', () => {
    const { container } = render(
      <CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={MODULES} onSelectModule={() => {}} selectedModuleId="m1" />
    );
    const surfaces = container.querySelectorAll('[data-testid="planet-surface"]');
    expect(surfaces.length).toBe(MODULES.length);
    // Same course+module must always yield the same archetype (seeded determinism)
    const first = surfaces[0].getAttribute('data-archetype');
    expect(first).toBeTruthy();
    expect(Number(surfaces[0].getAttribute('data-seed'))).toBeGreaterThan(0);
    expect(Number(surfaces[0].getAttribute('data-detail'))).toBe(16);
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
