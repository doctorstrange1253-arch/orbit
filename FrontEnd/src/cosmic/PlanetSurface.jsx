import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import planetVert from './shaders/planet.vert.glsl?raw';
import planetFrag from './shaders/planet.frag.glsl?raw';
import { ARCHETYPE_UNIFORMS } from './PlanetGenerator';

/**
 * PlanetSurface — one component renders all 8 planet archetypes
 * ([Skill: r3f-shaders], [Skill: threejs-core-math] for the math below).
 *
 * Geometry: IcosahedronGeometry detail 24 (~11.5k tris, under budget) with
 * CPU fbm displacement so silhouettes are real geometry. The SAME mulberry32
 * height field drives displacement; the fragment shader colors via uniforms.
 * Atmosphere: fresnel rim in planet.frag.glsl (no second mesh = no extra
 * draw call). Night lights, specular glint, polar caps — all in-shader.
 *
 * Props: archetype, seed, radius, sunDirection (vec3 to the star),
 *        spin (rad/s, 0 freezes), detail (icosahedron detail, tier-gated).
 */

function mulberry32(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Small JS-side value noise for geometry displacement. Matches the GLSL
// hash shape closely enough that displacement and coloring agree visually;
// exact equality is unnecessary (color uses its own fbm at higher octaves).
export function makeDisplace(seed) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const fade = (t) => t * t * (3 - 2 * t);
  const grad = (h, x, y, z) => ((h & 1) ? -x : x) + ((h & 2) ? -y : y) + ((h & 4) ? -z : z);
  function noise3(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[X] + Y, AA = perm[A & 255] + Z, AB = perm[(A + 1) & 255] + Z;
    const B = perm[(X + 1) & 255] + Y, BA = perm[B & 255] + Z, BB = perm[(B + 1) & 255] + Z;
    const lerp = (a, b, t) => a + (b - a) * t;
    return lerp(
      lerp(lerp(grad(perm[AA & 255], x, y, z), grad(perm[BA & 255], x - 1, y, z), u),
           lerp(grad(perm[AB & 255], x, y - 1, z), grad(perm[BB & 255], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(perm[(AA + 1) & 255], x, y, z - 1), grad(perm[(BA + 1) & 255], x - 1, y, z - 1), u),
           lerp(grad(perm[(AB + 1) & 255], x, y - 1, z - 1), grad(perm[(BB + 1) & 255], x - 1, y - 1, z - 1), u), v),
      w);
  }
  return (x, y, z) => {
    let v = 0, a = 0.5, fx = x, fy = y, fz = z;
    for (let o = 0; o < 4; o++) { v += a * noise3(fx, fy, fz); fx *= 2.03; fy *= 2.03; fz *= 2.03; a *= 0.5; }
    return v; // ~[-0.94, 0.94]
  };
}

// Exported for the unit test + LookDevLab seed preview.
export function displaceIcosahedron(radius, detail, seed, strength = 0.16) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const displace = makeDisplace(seed);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const scale = 2.4 / radius;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const h = displace(n.x * scale * radius + seed * 0.013, n.y * scale * radius, n.z * scale * radius);
    const r = radius * (1 + h * strength);
    pos.setXYZ(i, n.x * r, n.y * r, n.z * r);
  }
  geo.computeVertexNormals();
  pos.needsUpdate = true;
  return geo;
}

const c = (hex) => new THREE.Color(hex);

export default function PlanetSurface({ archetype = 'terrestrial', seed = 1, radius = 1, sunDirection = [0, 6, 0], spin = 0.1, detail = 24, motion = 1 }) {
  const groupRef = useRef();
  const matRef = useRef();
  const preset = ARCHETYPE_UNIFORMS[archetype] || ARCHETYPE_UNIFORMS.terrestrial;

  const geometry = useMemo(() => displaceIcosahedron(radius, detail, seed), [radius, detail, seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => ({
    uSeed: { value: (seed % 997) / 997 },
    uPalA: { value: c(preset.palA) }, uPalB: { value: c(preset.palB) }, uPalC: { value: c(preset.palC) },
    uOcean: { value: c(preset.oceanColor) }, uOceanLevel: { value: preset.oceanLevel },
    uCap: { value: c(preset.capColor) }, uCapLevel: { value: preset.capLevel },
    uAtmo: { value: c(preset.atmoColor) }, uAtmoStrength: { value: preset.atmoStrength },
    uNight: { value: preset.night },
    uSunDir: { value: new THREE.Vector3(...sunDirection).normalize() },
    uSunColor: { value: new THREE.Color('#fff2df') },
    uTime: { value: 0 }, uMotion: { value: motion },
  }), [archetype, seed, sunDirection, motion]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state, delta) => {
    if (groupRef.current && spin > 0 && motion > 0) groupRef.current.rotation.y += spin * delta;
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          vertexShader={planetVert}
          fragmentShader={planetFrag}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
}
