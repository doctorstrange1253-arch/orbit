import { Suspense, useMemo, useState } from 'react';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useControls, Leva } from 'leva';
import { Perf } from 'r3f-perf';
import StarfieldBackdrop from '../cosmic/StarfieldBackdrop';
import TwinkleBackdrop from '../cosmic/twinkleBackdrop';
import PlanetSurface from '../cosmic/PlanetSurface';
import Shuttle from '../cosmic/Shuttle';
import { generatePlanetLayout, layoutToPosition, PLANET_ARCHETYPES } from '../cosmic/PlanetGenerator';
// layoutToPosition is re-exported from PlanetGenerator (from travel.js) so the
// Lab and the world share one position formula.

/**
 * LookDevLab — dev-only route (/dev/lab), excluded from production bundles via
 * lazy import + gate in App.jsx. One tab per 07-look-dev-lab-spec.md lab.
 * Leva controls drive the live scene; Playwright captures land in
 * docs/design/lab-captures/. Every 3D asset must be reviewed here with a
 * capture attached before it is wired into the app (Design QA checklist).
 *
 * Tabs live today: Starfield, Planet (stub — F4+), Postprocess.
 * Shuttle / Station / UI Kit tabs land with their assets.
 */

const TABS = [
  { id: 'starfield', label: 'Star' },
  { id: 'milkyway', label: 'Nebula' },
  { id: 'planet', label: 'Planet' },
  { id: 'shuttle', label: 'Shuttle' },
  { id: 'postprocess', label: 'PostFX' },
];

function StarLabScene({ starCount, seed, mwOn }) {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.2} />
      {mwOn && <TwinkleBackdrop radius={300} motion={1} />}
      <StarfieldBackdrop count={starCount} radius={200} seed={seed} motion={1} />
      <OrbitControls enablePan minDistance={4} maxDistance={60} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

function PlanetLabScene({ archetype, seed, spin }) {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.2} />
      <TwinkleBackdrop radius={300} motion={1} />
      <StarfieldBackdrop count={2000} radius={200} seed={7} motion={1} />
      <PlanetSurface archetype={archetype} seed={seed} radius={3.2} sunDirection={[6, 2.5, 4]} spin={spin} detail={32} motion={1} />
      <OrbitControls enablePan minDistance={5} maxDistance={40} autoRotate={false} />
    </>
  );
}

const LAB_LAYOUTS = [
  generatePlanetLayout({ courseId: 'lab', moduleId: 'l1', moduleTitle: 'Launch' }),
  generatePlanetLayout({ courseId: 'lab', moduleId: 'l2', moduleTitle: 'Orbit' }),
  generatePlanetLayout({ courseId: 'lab', moduleId: 'l3', moduleTitle: 'Deep' }),
];

function ShuttleLabScene({ spin }) {
  const apiRef = React.useRef(null);
  const [target, setTarget] = React.useState(1);
  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 8, 4]} intensity={1.2} />
      <TwinkleBackdrop radius={300} motion={1} />
      <StarfieldBackdrop count={2000} radius={200} seed={7} motion={1} />
      {LAB_LAYOUTS.map((l, i) => (
        <group key={i} position={layoutToPosition(l, i)}>
          <PlanetSurface archetype={l.archetype} seed={l.seed} radius={l.size * 0.8} sunDirection={[-l.radius, 0, 0]} spin={spin * 0.5} detail={16} motion={1} />
        </group>
      ))}
      <Shuttle layouts={LAB_LAYOUTS} startIndex={0} reducedMotion={false} apiRef={apiRef} />
      {/* auto-fly between nodes so captures show travel + trail */}
      <AutoFly apiRef={apiRef} target={target} onDone={() => setTarget((t) => (t + 1) % LAB_LAYOUTS.length)} />
      <OrbitControls enablePan={false} minDistance={6} maxDistance={40} />
    </>
  );
}

function AutoFly({ apiRef, target, onDone }) {
  const fired = React.useRef(false);
  React.useEffect(() => {
    fired.current = false;
    const id = setTimeout(() => {
      if (!fired.current) { fired.current = true; apiRef.current?.flyTo?.(target); setTimeout(onDone, 4200); }
    }, 600);
    return () => clearTimeout(id);
  }, [target, apiRef, onDone]);
  return null;
}

export default function LookDevLab() {
  const [tab, setTab] = useState('starfield');

  const starControls = useControls('Star lab', {
    count: { value: 4000, min: 500, max: 12000, step: 500 },
    seed: { value: 49236, min: 1, max: 999999, step: 1 },
    milkyway: { value: true },
    showPerf: { value: true },
  }, { collapsed: false });

  const planetControls = useControls('Planet lab', {
    archetype: { value: 'terrestrial', options: PLANET_ARCHETYPES },
    seed: { value: 12345, min: 1, max: 999999, step: 1 },
    spin: { value: 0.1, min: 0, max: 1.5, step: 0.05 },
  }, { collapsed: false });

  const shuttleControls = useControls('Shuttle lab', {
    thrust: { value: 1.0, min: 0, max: 2, step: 0.1 },
    spin: { value: 0.2, min: 0, max: 1, step: 0.05 },
  }, { collapsed: false });

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = useMemo(() => tab === 'planet' ? (
    <PlanetLabScene archetype={planetControls.archetype} seed={planetControls.seed} spin={planetControls.spin} />
  ) : tab === 'shuttle' ? (
    <ShuttleLabScene spin={shuttleControls.spin} />
  ) : (
    <StarLabScene starCount={starControls.count} seed={starControls.seed} mwOn={starControls.milkyway} />
  ), [tab, starControls.count, starControls.seed, starControls.milkyway, planetControls.archetype, planetControls.seed, planetControls.spin, shuttleControls.spin]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" data-testid="look-dev-lab">
      <Leva
        titleBar={{ title: 'Look-Dev' }}
        collapsed={false}
        theme={{ sizes: { rootWidth: '320px' } }}
      />
      <header className="flex items-center gap-2 pl-4 pr-[340px] py-2 border-b border-slate-800">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400">dev-only</span>
        <h1 className="text-sm font-bold">Look-Dev Lab</h1>
        <p className="text-[11px] text-slate-500 ml-2">reduced motion: {reduced ? 'on' : 'off'} — captures to docs/design/lab-captures/</p>
        <nav className="ml-auto flex gap-1" aria-label="Labs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 text-xs rounded-lg ${tab === t.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="h-[calc(100vh-52px)]">
        <Canvas camera={{ position: [0, 6, 24], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.AgXToneMapping }}>
          <Suspense fallback={null}>
            {starControls.showPerf && <Perf position="top-left" minimal />}
            {scene}
          </Suspense>
        </Canvas>
      </main>
    </div>
  );
}
