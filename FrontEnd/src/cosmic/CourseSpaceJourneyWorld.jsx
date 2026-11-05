import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import useQualityTier from '../hooks/useQualityTier';
import StarfieldBackdrop from './StarfieldBackdrop';
import TwinkleBackdrop from './twinkleBackdrop';
import PlanetSurface from './PlanetSurface';
import Shuttle from './Shuttle';
import Station from './Station';
import { layoutToPosition, smoothDampFactor } from './travel';
import { generatePlanetLayout, ARCHETYPE_LABELS } from './PlanetGenerator';

/**
 * CourseSpaceJourneyWorld — the signature 3D level map (Phase 6, task F1 shell).
 *
 * Shell responsibilities (mandate 6.2 step 1):
 *  - lazy 3D chunk: parent lazy-imports this file; Canvas mounts only in 3D mode
 *  - quality tiers: useQualityTier() picks DPR cap + postprocessing on/off;
 *    'low' (or reduced motion) defaults to the 2D keyboard-navigable fallback
 *  - WebGL context loss: preventDefault on webglcontextlost, banner + restore
 *  - AgX tone mapping (verified in three r187 constants) + DPR cap
 *  - zero emoji: all labels are text + custom SVG-free typography
 *
 * Scene contents (steps 2-3 of 6.2 land here progressively):
 *  StarfieldBackdrop + TwinkleBackdrop (nebula) + central star + one seeded
 *  planet node per module via generatePlanetLayout(courseId, moduleId).
 *  GLSL lives in shaders/*.glsl and is imported ?raw ([Skill: r3f-shaders]).
 */

const TIER_DPR = { ultra: 2, high: 1.75, medium: 1.5, low: 1 };
const POST_TIERS = new Set(['ultra', 'high']);

function CentralStar({ title }) {
  const ref = useRef();
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      <pointLight intensity={3} distance={50} color="#ffedd5" />
      <Html position={[0, -2.8, 0]} center>
        <div className="px-4 py-1.5 rounded-xl bg-slate-950/90 border border-orange-500/40 text-orange-200 text-sm font-bold shadow-2xl backdrop-blur-md">
          {title || 'Course Core'}
        </div>
      </Html>
    </group>
  );
}

function PlanetNode({ layout, index, active, onSelect, reducedMotion }) {
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = layoutToPosition(layout, index); // single source of truth (travel.js)
  const r = layout.size * 0.8;
  // direction from planet node to the central star (world origin)
  const sunDir = [-x, -y, -z];
  const hl = active ? '#4ade80' : hovered ? '#facc15' : null;
  return (
    <group position={[x, y, z]}>
      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={0.5} floatIntensity={1}>
        {/* click/hover proxy: invisible sphere slightly larger than the planet */}
        <mesh
          onClick={() => onSelect(index)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.3 : 1}
          visible={false}
        >
          <sphereGeometry args={[r * 1.35, 16, 16]} />
          <meshBasicMaterial />
        </mesh>
        <group scale={hovered ? 1.15 : 1}>
          <PlanetSurface
            archetype={layout.archetype}
            seed={layout.seed}
            radius={r}
            sunDirection={sunDir}
            spin={reducedMotion ? 0 : layout.orbitSpeed * 0.5}
            detail={16}
            motion={reducedMotion ? 0 : 1}
          />
          {hl && (
            <mesh scale={1.12}>
              <sphereGeometry args={[r, 32, 32]} />
              <meshBasicMaterial color={hl} transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} />
            </mesh>
          )}
        </group>
      </Float>
      <Html position={[0, 1.3, 0]} center distanceFactor={15}>
        <button
          type="button"
          onClick={() => onSelect(index)}
          aria-pressed={active}
          className="cursor-pointer px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg border border-white/20 whitespace-nowrap"
          style={{
            backgroundColor: active ? 'rgba(74, 222, 128, 0.85)' : 'rgba(15, 23, 42, 0.85)',
            color: active ? '#052e16' : '#f8fafc',
          }}
        >
          {index + 1}. {layout.title || `Module ${index + 1}`}
        </button>
      </Html>
    </group>
  );
}

/** Damped chase camera: follows the shuttle, looks at it. Reduced motion: fixed orbit. */
export function JourneyCamera({ shuttlePosRef, reducedMotion, active }) {
  const { camera } = useThree();
  const lookRef = useRef(new THREE.Vector3());
  const desiredRef = useRef(new THREE.Vector3());
  useFrame((_, delta) => {
    if (!active || reducedMotion || !Number.isFinite(delta) || delta <= 0) return;
    const target = shuttlePosRef.current;
    if (!target) return;
    const dt = Math.min(delta, 0.1);
    desiredRef.current.set(target.x + 6, target.y + 4, target.z + 9);
    camera.position.lerp(desiredRef.current, smoothDampFactor(3, dt));
    lookRef.current.lerp(target, smoothDampFactor(5, dt));
    camera.lookAt(lookRef.current);
  });
  return null;
}

export function stationKindForIndex(i, total) {
  if (total >= 4 && i === total - 1) return 'boss';
  if (i % 3 === 2) return 'station';
  return 'checkpoint';
}

function StationNode({ layout, index, total, reducedMotion }) {
  const [x, y, z] = layoutToPosition(layout, index);
  const kind = stationKindForIndex(index, total);
  const orbitR = layout.size * 0.8 + 1.1;
  return (
    <Station
      variant={kind}
      seed={layout.seed}
      position={[x + orbitR, y + 0.4, z]}
      scale={kind === 'boss' ? 1.4 : 0.9}
      motion={reducedMotion ? 0 : 1}
    />
  );
}

function WorldScene({ courseId, courseTitle, modules, onSelectModule, selectedModuleId, tier, reducedMotion }) {
  const layouts = useMemo(
    () => modules.map((m, i) => generatePlanetLayout({
      courseId: courseId || 'course',
      moduleId: String(m._id || m.id || i),
      moduleTitle: m.title,
    })),
    [courseId, modules]
  );
  const post = POST_TIERS.has(tier);
  const shuttleApiRef = useRef(null);
  const shuttlePosRef = useRef(null);
  const requestRef = useRef(0);
  const [travelling, setTravelling] = useState(false);
  const startIndex = Math.max(0, modules.findIndex((module) => String(module._id || module.id) === String(selectedModuleId)));

  useEffect(() => () => {
    requestRef.current++;
    shuttleApiRef.current?.cancel();
  }, [layouts]);

  const handleSelect = (index) => {
    const module = modules[index];
    if (!module) return;
    const request = ++requestRef.current;
    if (reducedMotion || !shuttleApiRef.current) {
      shuttleApiRef.current?.cancel();
      onSelectModule?.(module);
      return;
    }
    setTravelling(true);
    const accepted = shuttleApiRef.current.flyTo(index, () => {
      if (request !== requestRef.current) return;
      requestRef.current++;
      setTravelling(false);
      onSelectModule?.(module);
    });
    if (!accepted) setTravelling(false);
  };

  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 15]} intensity={1.5} />
      <StarfieldBackdrop count={tier === 'ultra' ? 8000 : 4000} radius={200} motion={reducedMotion ? 0 : 1} />
      <TwinkleBackdrop motion={reducedMotion ? 0 : 1} />
      <CentralStar title={courseTitle} />
      {layouts.map((layout, i) => (
        <PlanetNode
          key={String(modules[i]._id || modules[i].id || i)}
          layout={layout}
          index={i}
          active={String(selectedModuleId) === String(modules[i]._id || modules[i].id)}
          onSelect={handleSelect}
          reducedMotion={reducedMotion}
        />
      ))}
      <Shuttle layouts={layouts} startIndex={startIndex} reducedMotion={reducedMotion} apiRef={shuttleApiRef} positionRef={shuttlePosRef} />
      {layouts.map((layout, i) => (
        <StationNode key={`st-${i}`} layout={layout} index={i} total={layouts.length} reducedMotion={reducedMotion} />
      ))}
      <JourneyCamera shuttlePosRef={shuttlePosRef} reducedMotion={reducedMotion} active={travelling} />
      <OrbitControls enabled={!travelling} enablePan={false} minDistance={8} maxDistance={35} autoRotate={!reducedMotion && !travelling} autoRotateSpeed={0.5} />
      {post && (
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.75} />
          {/* EffectComposer forces renderer NoToneMapping while mounted; the
              ToneMapping effect (last) applies AgX instead. OutputPass is not
              exported by @react-three/postprocessing 3.2.2. */}
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      )}
    </>
  );
}

/** 2D fallback: same node topology as the 3D map, fully keyboard + SR usable. */
function Map2D({ courseId, modules, onSelectModule, selectedModuleId }) {
  return (
    <div className="w-full h-full flex flex-col p-6 bg-slate-950" role="region" aria-label="Course level map, 2D">
      <h3 className="text-lg font-bold text-slate-100 mb-1">Level map</h3>
      <p className="text-xs text-slate-400 mb-4">Keyboard: Tab to move, Enter to open a level.</p>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules.map((m, i) => {
          const active = String(selectedModuleId) === String(m._id || m.id);
          return (
            <li key={String(m._id || m.id || i)}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelectModule && onSelectModule(m)}
                className={`w-full text-left p-4 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  active ? 'bg-emerald-950/50 border-emerald-500' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Level {i + 1} · {ARCHETYPE_LABELS[generatePlanetLayout({ courseId, moduleId: String(m._id || m.id || i) }).archetype] || 'Planet'}
                </span>
                <span className="block text-sm font-semibold text-slate-100 mt-1">{m.title || `Module ${i + 1}`}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function CourseSpaceJourneyWorld({ courseId, courseTitle, modules = [], onSelectModule, selectedModuleId }) {
  const { tier, supported, reducedMotion } = useQualityTier();
  const [override, setOverride] = useState(null);
  const [rendererFailed, setRendererFailed] = useState(false);
  const [ctxLost, setCtxLost] = useState(false);
  const detachRef = useRef(null);
  const auto2d = tier === 'low' || reducedMotion;
  const viewMode = !supported || rendererFailed ? '2d' : override || (auto2d ? '2d' : '3d');
  const onRendererError = useCallback(() => setRendererFailed(true), []);

  // R3F 9 passes RootState to onCreated (renderer = state.gl). Context-loss
  // listeners attach there (works regardless of when R3F finishes configuring)
  // and detach on unmount or when a new canvas is created.
  useEffect(() => () => { if (detachRef.current) detachRef.current(); detachRef.current = null; }, []);

  const onCreated = useCallback((state) => {
    // Renderer color config lives in the Canvas `gl` prop (R3F 9 applies it
    // before firing onCreated). This handler owns context-loss wiring only.
    const gl = state.gl;
    gl.toneMappingExposure = 1.0;
    const el = gl.domElement;
    const onLost = (e) => { e.preventDefault(); setCtxLost(true); };
    const onRestored = () => setCtxLost(false);
    el.addEventListener('webglcontextlost', onLost);
    el.addEventListener('webglcontextrestored', onRestored);
    if (detachRef.current) detachRef.current();
    detachRef.current = () => {
      el.removeEventListener('webglcontextlost', onLost);
      el.removeEventListener('webglcontextrestored', onRestored);
    };
  }, []);

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 shadow-xl">
        <span className="text-sm font-bold text-slate-100">{courseTitle || 'Course journey'}</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">tier: {tier}</span>
        <div className="h-4 w-px bg-slate-700" />
        <button
          type="button"
          disabled={!supported || rendererFailed}
          onClick={() => setOverride(viewMode === '3d' ? '2d' : '3d')}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all shadow focus-visible:outline-2 focus-visible:outline-cyan-400"
        >
          {viewMode === '3d' ? '2D map' : '3D view'}
        </button>
      </div>

      {ctxLost && (
        <div role="alert" className="absolute top-4 right-4 z-20 px-3 py-2 rounded-lg bg-amber-600/90 text-white text-xs font-semibold shadow-lg">
          Graphics context lost — restoring…
        </div>
      )}

      {viewMode === '3d' ? (
        <SceneBoundary onError={onRendererError} fallback={<Map2D courseId={courseId} modules={modules} onSelectModule={onSelectModule} selectedModuleId={selectedModuleId} />}>
        <Canvas
          frameloop={reducedMotion || ctxLost ? 'demand' : 'always'}
          camera={{ position: [0, 10, 18], fov: 60 }}
          dpr={[1, TIER_DPR[tier] || 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.AgXToneMapping }}
          onCreated={onCreated}
        >
          <Suspense fallback={null}>
            <WorldScene
              courseId={courseId}
              courseTitle={courseTitle}
              modules={modules}
              onSelectModule={onSelectModule}
              selectedModuleId={selectedModuleId}
              tier={tier}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </Canvas>
        </SceneBoundary>
      ) : (
        <Map2D courseId={courseId} modules={modules} onSelectModule={onSelectModule} selectedModuleId={selectedModuleId} />
      )}
    </div>
  );
}
