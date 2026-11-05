import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const runtime = vi.hoisted(() => ({ arrivals: [], frames: new Set(), camera: null, startIndex: null, failCanvas: false }));
vi.mock('three', async (importOriginal) => ({
  ...await importOriginal(),
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
    React.useImperativeHandle(p.apiRef, () => ({
      flyTo(index, onArrival) {
        runtime.arrivals.push(() => onArrival?.(index));
        return true;
      },
      cancel() {},
    }), []);
    React.useEffect(() => { runtime.startIndex = p.startIndex; }, [p.startIndex]);
    return React.createElement('div', { 'data-testid': 'shuttle' });
  },
}));

vi.mock('../src/cosmic/Station', () => ({
  __esModule: true,
  STATION_VARIANTS: ['checkpoint', 'station', 'boss'],
  default: function MockStation(p) {
    return React.createElement('div', { 'data-testid': 'station', 'data-variant': p.variant });
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
    if (runtime.failCanvas) throw new Error('Renderer creation failed');
    return React.createElement('div', {
      'data-testid': 'r3f-canvas',
      'data-camera': JSON.stringify(props.camera),
      'data-fov': props.fov,
      'data-dpr': JSON.stringify(props.dpr),
      'data-glint': typeof props.gl?.toneMapping,
      'data-gltonemapping': props.gl?.toneMapping,
    }, props.children); // pass children: Canvas normally renders them into the scene
  },
  useFrame: (callback) => {
    React.useEffect(() => {
      runtime.frames.add(callback);
      return () => { runtime.frames.delete(callback); };
    }, [callback]);
  },
  useThree: () => ({ camera: runtime.camera }),
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

let reducedMotion = false;
const motionListeners = new Set();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    get matches() { return reducedMotion; },
    addEventListener(_event, listener) { motionListeners.add(listener); },
    removeEventListener(_event, listener) { motionListeners.delete(listener); },
  })),
});
Object.defineProperty(navigator, 'hardwareConcurrency', { writable: true, value: 8 });
Object.defineProperty(navigator, 'deviceMemory', { writable: true, value: 8 });
// jsdom has no WebGL — stub getContext so useQualityTier sees webgl2 as available
HTMLCanvasElement.prototype.getContext = () => ({});
globalThis.performance = { now: () => Date.now() };

import CourseSpaceJourneyWorld, { JourneyCamera, stationKindForIndex } from '../src/cosmic/CourseSpaceJourneyWorld';

const MODULES = [
  { _id: 'm1', title: 'Module One' },
  { _id: 'm2', title: 'Module Two' },
];

beforeEach(() => {
  reducedMotion = false;
  lastGl = null;
  runtime.arrivals = [];
  runtime.startIndex = null;
  runtime.frames.clear();
  runtime.camera = new THREE.PerspectiveCamera();
  runtime.failCanvas = false;
});
afterEach(() => vi.restoreAllMocks());

describe('CourseSpaceJourneyWorld (F1 scene shell)', () => {
  it('keeps the current route until arrival then navigates to the selected lesson', () => {
    function JourneyRoute() {
      const location = useLocation();
      const navigate = useNavigate();
      return <>
        <output data-testid="current-route">{location.pathname}</output>
        <CourseSpaceJourneyWorld key={location.pathname} courseId="c1" modules={MODULES} selectedModuleId="m1" onSelectModule={(module) => navigate(`/courses/c1/learn/${module._id}`)} />
      </>;
    }
    render(<MemoryRouter initialEntries={['/courses/c1/learn/m1']}><JourneyRoute /></MemoryRouter>);
    act(() => screen.getByRole('button', { name: /Module Two/ }).click());
    expect(screen.getByTestId('current-route').textContent).toBe('/courses/c1/learn/m1');
    act(() => runtime.arrivals[0]());
    expect(screen.getByTestId('current-route').textContent).toBe('/courses/c1/learn/m2');
  });

  it('ignores stale arrivals after a newer selection or a switch to 2D', () => {
    const select = vi.fn();
    render(<CourseSpaceJourneyWorld courseId="c1" modules={MODULES} onSelectModule={select} />);
    act(() => screen.getByRole('button', { name: /Module Two/ }).click());
    act(() => screen.getByRole('button', { name: /Module One/ }).click());
    act(() => runtime.arrivals[0]());
    expect(select).not.toHaveBeenCalled();
    act(() => screen.getByRole('button', { name: /2D map/i }).click());
    act(() => runtime.arrivals[1]());
    expect(select).not.toHaveBeenCalled();
  });

  it('damps camera follow without moving on zero-delta frames', () => {
    render(<JourneyCamera shuttlePosRef={{ current: new THREE.Vector3(5, 2, -1) }} active reducedMotion={false} />);
    const frame = [...runtime.frames][0];
    frame({}, 0);
    expect(runtime.camera.position.toArray()).toEqual([0, 0, 0]);
    frame({}, 1 / 60);
    expect(runtime.camera.position.x).toBeGreaterThan(0);
    expect(runtime.camera.position.x).toBeLessThan(11);
  });

  it('does not compete with idle orbit controls', () => {
    render(<JourneyCamera shuttlePosRef={{ current: new THREE.Vector3(5, 2, -1) }} active={false} reducedMotion={false} />);
    [...runtime.frames][0]({}, 1 / 60);
    expect(runtime.camera.position.toArray()).toEqual([0, 0, 0]);
  });

  it('initializes the shuttle at the lesson selected by a deep link', () => {
    render(<CourseSpaceJourneyWorld courseId="c1" modules={MODULES} selectedModuleId="m2" />);
    expect(runtime.startIndex).toBe(1);
  });
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

  it.each(['null', 'throw'])('keeps lesson navigation usable when WebGL detection returns %s', (failure) => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      if (failure === 'throw') throw new Error('WebGL unavailable');
      return null;
    });
    const selected = vi.fn();
    render(<CourseSpaceJourneyWorld courseId="c1" modules={MODULES} onSelectModule={selected} />);
    const toggle = screen.getByRole('button', { name: /3D view/i });
    act(() => toggle.click());
    expect(screen.queryByTestId('r3f-canvas')).toBeNull();
    act(() => screen.getByRole('button', { name: /Module Two/ }).click());
    expect(selected).toHaveBeenCalledExactlyOnceWith(MODULES[1]);
  });

  it('recovers locally if renderer creation fails after capability detection', () => {
    runtime.failCanvas = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<CourseSpaceJourneyWorld courseId="c1" modules={MODULES} />)).not.toThrow();
    expect(screen.getByRole('button', { name: /Module Two/ })).toBeTruthy();
  });

  it('responds to live motion preference changes and preserves a manual 2D choice', () => {
    const { unmount } = render(<CourseSpaceJourneyWorld courseId="c1" modules={MODULES} />);
    const changeMotion = (value) => act(() => {
      reducedMotion = value;
      motionListeners.forEach((listener) => listener());
    });
    changeMotion(true);
    expect(screen.queryByTestId('r3f-canvas')).toBeNull();
    changeMotion(false);
    expect(screen.getByTestId('r3f-canvas')).toBeTruthy();
    act(() => screen.getByRole('button', { name: /2D map/i }).click());
    changeMotion(true);
    changeMotion(false);
    expect(screen.queryByTestId('r3f-canvas')).toBeNull();
    unmount();
    expect(motionListeners.size).toBe(0);
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

  it('renders one Station per module with boss on the last when >=4 modules', () => {
    const mods = [
      { _id: 'a' }, { _id: 'b' }, { _id: 'c' }, { _id: 'd' },
    ];
    const { container } = render(
      <CourseSpaceJourneyWorld courseId="c1" courseTitle="T" modules={mods} onSelectModule={() => {}} />
    );
    const stations = container.querySelectorAll('[data-testid="station"]');
    expect(stations.length).toBe(4);
    const variants = [...stations].map((s) => s.getAttribute('data-variant'));
    expect(variants[3]).toBe('boss');
    expect(variants).toContain('checkpoint');
  });

  it('stationKindForIndex rules: boss only when >=4 and last, station every 3rd, else checkpoint', () => {
    expect(stationKindForIndex(0, 4)).toBe('checkpoint');
    expect(stationKindForIndex(2, 4)).toBe('station');
    expect(stationKindForIndex(3, 4)).toBe('boss');
    expect(stationKindForIndex(2, 3)).toBe('station');
    expect(stationKindForIndex(1, 3)).toBe('checkpoint');
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
