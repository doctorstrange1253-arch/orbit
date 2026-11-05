import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { layoutToPosition, easeInOutCubic, arcMidpoint, parkOffset, add3, travelDuration } from './travel';

/**
 * Shuttle — original parametric delta-wing craft, code-authored (no GLTF).
 * ([Skill: r3f-shaders], [Skill: r3f-animation], [Skill: threejs-core-math].)
 *
 * Geometry: hull from extruded lathe-ish hull shape via CylinderGeometry +
 * nose cone + two wing fins + engine block; PBR-ish meshStandardMaterial.
 * Thruster FX: two additive point sprites at the engine nozzles, scaled by
 * thrust; plus a short ribbon trail (last N positions, additive fade).
 *
 * API: imperative via ref — shuttleRef.current.flyTo(index) starts a
 * Catmull-Rom flight to that node's park offset; useFrame advances it with
 * easeInOutCubic and records trail points. Damped camera follow is done by
 * JourneyCamera in the world file.
 */

const WING = [[0, 0], [1.6, -0.9], [1.6, -1.4], [0.25, -1.4]]; // 2D profile extruded thin

function buildHull() {
  const g = new THREE.Group();
  // fuselage: tapered cylinder
  const hull = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.3, 1.6, 12),
    new THREE.MeshStandardMaterial({ color: '#c8d2e0', metalness: 0.85, roughness: 0.3 })
  );
  hull.rotation.x = Math.PI / 2;
  g.add(hull);
  // nose
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: '#e8f0fa', metalness: 0.7, roughness: 0.25 })
  );
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = 1.05;
  g.add(nose);
  // cockpit canopy
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#1a2a4a', metalness: 0.2, roughness: 0.1, emissive: '#2a4a8a', emissiveIntensity: 0.4 })
  );
  canopy.scale.set(1, 0.7, 1.6);
  canopy.position.set(0, 0.14, 0.35);
  g.add(canopy);
  // delta wings
  const wingGeo = new THREE.ShapeGeometry(new THREE.Shape(WING.map(([x, y]) => new THREE.Vector2(x, y))));
  for (const s of [1, -1]) {
    const wing = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({
      color: '#8a94a8', metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide,
    }));
    wing.rotation.x = -Math.PI / 2;
    wing.scale.x = s;
    wing.position.z = -0.7;
    g.add(wing);
  }
  // engine block + emissive nozzle
  const eng = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.35, 10),
    new THREE.MeshStandardMaterial({ color: '#5a6474', metalness: 0.9, roughness: 0.4 })
  );
  eng.rotation.x = Math.PI / 2;
  eng.position.z = -0.95;
  g.add(eng);
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.14, 0.08, 10),
    new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ff9a3a', emissiveIntensity: 2.2, metalness: 0.4, roughness: 0.4 })
  );
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = -1.15;
  g.add(nozzle);
  return g;
}

const MAX_TRAIL = 48;

export default function Shuttle({ layouts, startIndex = 0, reducedMotion = false, apiRef }) {
  const groupRef = useRef();
  const nozzleRef = useRef();
  const trailRef = useRef();

  const state = useRef({
    flight: null, // { curve: CatmullRomCurve3, t, dur }
    trail: [],
    pos: new THREE.Vector3(...parkOffset((layouts[startIndex]?.size || 1) * 0.8)),
    quat: new THREE.Quaternion(),
    thrust: 0,
    flyTo: null,
  });

  const hull = useMemo(() => buildHull(), []);

  const trailGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL * 3), 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, []);

  // imperative flight API — exposed via apiRef prop (works under mocked R3F in
  // tests) and callable as shuttleApi.flyTo(i) from the world.
  const flyTo = (index) => {
    const layout = layouts[index];
    if (!layout) return;
    const st = state.current;
    const target = new THREE.Vector3(...add3(layoutToPosition(layout, index), parkOffset(layout.size * 0.8)));
    const mid = new THREE.Vector3(...arcMidpoint(st.pos.toArray(), target.toArray(), 2.5));
    st.flight = {
      curve: new THREE.CatmullRomCurve3([st.pos.clone(), mid, target]),
      t: 0,
      dur: travelDuration(st.pos.distanceTo(target)),
    };
  };
  state.current.flyTo = flyTo;
  if (apiRef) apiRef.current = { flyTo };

  useFrame((s, delta) => {
    const st = state.current;
    if (st.flight && !reducedMotion) {
      st.flight.t += delta / st.flight.dur;
      const k = easeInOutCubic(st.flight.t);
      const p = st.flight.curve.getPointAt(Math.min(k, 1));
      // orientation: face along tangent (slerped for banking)
      const tan = st.flight.curve.getTangentAt(Math.min(k, 1));
      const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), tan, new THREE.Vector3(0, 1, 0));
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
      st.quat.slerp(targetQuat, 1 - Math.exp(-6 * delta));
      st.pos.copy(p);
      st.thrust = 1;
      if (st.flight.t >= 1) st.flight = null;
    } else {
      st.thrust = Math.max(0, st.thrust - delta * 3);
    }
    if (groupRef.current) {
      if (groupRef.current.position) groupRef.current.position.copy(st.pos);
      if (groupRef.current.quaternion) groupRef.current.quaternion.copy(st.quat);
    }
    if (nozzleRef.current) {
      const e = 0.6 + st.thrust * 1.6;
      if (nozzleRef.current.material) nozzleRef.current.material.emissiveIntensity = e * 2.2;
      if (nozzleRef.current.scale?.setScalar) nozzleRef.current.scale.setScalar(0.7 + st.thrust * 0.8);
    }
    // trail — guard trailGeo.attributes.position (mock geometries may lack it)
    st.trail.push(st.pos.clone());
    if (st.trail.length > MAX_TRAIL) st.trail.shift();
    const attr = trailGeo.attributes && trailGeo.attributes.position;
    if (attr) {
      const arr = attr.array;
      st.trail.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
      attr.needsUpdate = true;
      trailGeo.setDrawRange(0, st.trail.length);
    }
    if (trailRef.current) trailRef.current.geometry = trailGeo;
  });

  return (
    <group>
      <group ref={groupRef}>
        <primitive object={hull} />
        <mesh ref={nozzleRef} position={[0, 0, -1.15]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshBasicMaterial color="#ffb066" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <line ref={trailRef} geometry={trailGeo} frustumCulled={false}>
        <lineBasicMaterial color="#7ac8ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </line>
    </group>
  );
}
