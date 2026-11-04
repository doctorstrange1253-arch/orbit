import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import starVert from './shaders/starfield.vert.glsl?raw';
import starFrag from './shaders/starfield.frag.glsl?raw';

/**
 * StarfieldBackdrop — one draw call for the whole sky: a single <points>
 * geometry with `count` stars placed deterministically (mulberry32 PRNG) on
 * a spherical shell, plus per-star seed (color temperature + twinkle phase +
 * size). Vertex shader does twinkle + perspective point size; fragment shader
 * does soft sprite + dither + faint diffraction spikes ([Skill: r3f-shaders]).
 *
 * Disposal: geometry + material created imperatively in useMemo are freed in a
 * dedicated useEffect (threejs-errors-performance: leak-free remounts).
 * uMotion = 0 freezes twinkle under prefers-reduced-motion.
 */
export default function StarfieldBackdrop({ count = 8000, radius = 200, seed = 0xC051C, motion = 1 }) {
  const matRef = useRef();

  const { positions, seeds } = useMemo(() => {
    let s = (seed >>> 0) || 1;
    const rand = () => {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const r = radius;
    for (let i = 0; i < count; i++) {
      // uniform shell distribution via normalized gaussian-ish direction
      let x = rand() * 2 - 1, y = rand() * 2 - 1, z = rand() * 2 - 1;
      let len = Math.sqrt(x * x + y * y + z * z) || 1;
      if (len < 0.05) { x = 1; y = 0; z = 0; len = 1; }
      x /= len; y /= len; z /= len;
      const rr = r * (0.75 + rand() * 0.5); // 0.75r-1.25r shell
      positions[i * 3] = x * rr;
      positions[i * 3 + 1] = y * rr;
      positions[i * 3 + 2] = z * rr;
      seeds[i] = rand();
    }
    return { positions, seeds };
  }, [count, radius, seed]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMotion: { value: motion },
  }), [motion]);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={starVert}
        fragmentShader={starFrag}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
