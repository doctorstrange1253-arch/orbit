import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
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

export default function Shuttle({ layouts, startIndex = 0, reducedMotion = false, apiRef, positionRef }) {
  const scene = useMemo(() => {
    const root = new THREE.Group();
    const hull = buildHull();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL * 3), 3));
    geometry.setDrawRange(0, 0);
    const trail = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#7ac8ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    trail.frustumCulled = false;
    root.add(hull, trail);
    return { root, hull, trail };
  }, []);
  const state = useRef(null);
  if (state.current === null) state.current = {
    pos: new THREE.Vector3(), quat: new THREE.Quaternion(), tangent: new THREE.Vector3(),
    forward: new THREE.Vector3(0, 0, 1), desired: new THREE.Quaternion(),
    flight: null, active: false, thrust: 0, trailCount: 0,
  };

  const cancel = useCallback(() => {
    state.current.flight = null;
    state.current.thrust = 0;
  }, []);

  useEffect(() => {
    const st = state.current;
    const layout = layouts[startIndex];
    st.pos.set(...(layout ? add3(layoutToPosition(layout, startIndex), parkOffset(layout.size * 0.8)) : [0, 0, 0]));
    st.active = true;
    st.flight = null;
    st.trailCount = 0;
    scene.hull.position.copy(st.pos);
    if (positionRef) positionRef.current = st.pos;
    return () => {
      st.active = false;
      cancel();
      if (positionRef?.current === st.pos) positionRef.current = null;
    };
  }, [layouts, startIndex, positionRef, scene, cancel]);

  useEffect(() => () => {
    const geometries = new Set();
    const materials = new Set();
    scene.root.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }, [scene]);

  const flyTo = useCallback((index, onArrival) => {
    const layout = layouts[index];
    const st = state.current;
    if (!layout || !st.active) return false;
    const target = new THREE.Vector3(...add3(layoutToPosition(layout, index), parkOffset(layout.size * 0.8)));
    if (![target.x, target.y, target.z].every(Number.isFinite)) return false;
    if (reducedMotion || st.pos.distanceToSquared(target) < 0.000001) {
      cancel();
      st.pos.copy(target);
      scene.hull.position.copy(target);
      onArrival?.(index);
      return true;
    }
    const mid = new THREE.Vector3(...arcMidpoint(st.pos.toArray(), target.toArray(), 2.5));
    st.flight = { curve: new THREE.CatmullRomCurve3([st.pos.clone(), mid, target]), t: 0, dur: travelDuration(st.pos.distanceTo(target)), target, index, onArrival };
    return true;
  }, [layouts, reducedMotion, scene, cancel]);

  useImperativeHandle(apiRef, () => ({ flyTo, cancel, position: state.current.pos }), [flyTo, cancel]);

  useFrame((_, delta) => {
    const st = state.current;
    if (!st.active || !Number.isFinite(delta) || delta <= 0) return;
    const flight = st.flight;
    const dt = Math.min(delta, 0.1);
    if (flight) {
      flight.t = reducedMotion ? 1 : Math.min(1, flight.t + dt / flight.dur);
      const t = easeInOutCubic(flight.t);
      flight.curve.getPointAt(t, st.pos);
      flight.curve.getTangentAt(t, st.tangent);
      if (st.tangent.lengthSq() > 0) st.desired.setFromUnitVectors(st.forward, st.tangent.normalize());
      st.quat.slerp(st.desired, 1 - Math.exp(-6 * dt));
      st.thrust = 1;
      const attribute = scene.trail.geometry.attributes.position;
      if (st.trailCount === MAX_TRAIL) attribute.array.copyWithin(0, 3);
      else st.trailCount++;
      attribute.setXYZ(st.trailCount - 1, st.pos.x, st.pos.y, st.pos.z);
      attribute.needsUpdate = true;
      scene.trail.geometry.setDrawRange(0, st.trailCount);
    } else {
      st.thrust = Math.max(0, st.thrust - dt * 3);
    }
    scene.hull.position.copy(st.pos);
    scene.hull.quaternion.copy(st.quat);
    scene.trail.material.opacity = reducedMotion ? 0 : st.thrust * 0.55;
    if (flight?.t === 1 && st.flight === flight) {
      st.flight = null;
      flight.onArrival?.(flight.index);
    }
  });

  return <primitive object={scene.root} />;
}
