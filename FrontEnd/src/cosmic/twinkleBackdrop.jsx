import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import milkywayFrag from './shaders/milkyway.frag.glsl?raw';

/**
 * TwinkleBackdrop — deep-space background: a BackSide sphere (r=300, outside the
 * starfield shell) running the Milky Way + fbm nebula + dust-lane fragment
 * shader (shaders/milkyway.frag.glsl). One draw call, ~6k tris.
 *
 * `motion` = 0 freezes the drift under prefers-reduced-motion. Sphere follows
 * the camera (frustumCulled=false, position updated per frame) so it never
 * clips at the far plane. Rendered opaque behind everything (depthWrite true).
 */
const MW_VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export default function TwinkleBackdrop({ radius = 300, motion = 1 }) {
  const meshRef = useRef();
  const matRef = useRef();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMotion: { value: motion },
  }), [motion]);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) meshRef.current.position.copy(state.camera.position);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[radius, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={MW_VERT}
        fragmentShader={milkywayFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
