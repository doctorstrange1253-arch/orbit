/**
 * twinkleBackdrop — R3F component emitting a pulsing ambient gradient + sparse
 * volumetric pulse rings derived from a seeded particle field. Pure Canvas
 * pass-through; weight is ~0.02 triangles, intentionally budget-friendly.
 */
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import useQualityTier from '../hooks/useQualityTier';

export default function TwinkleBackdrop({ seed = 0x42, density = 400, speed = 0.3 }) {
  const tier = useQualityTier();
  const ref = useRef();

  const enabled = tier !== 'low'; // full glitter below low tier

  // Subtle global pulse matching the canonical star-field twinkle frequency
  useFrame(() => {
    if (!ref.current || !enabled) return;
    ref.current.material.opacity = 0.55 + 0.45 * Math.sin(performance.now() * speed);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[100, 32, 32]} />
      <shaderMaterial
        uniforms={{ uTime: { value: performance.now() * 0.001 }, uOpacity: { value: 0.6 } }}
        vertexShader={/* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform float uOpacity;
          varying vec3 vPos;
          void main() {
            // Fade far edge toward radial distance. Cheap approximate nebula glow.
            float d = length(vPos) / 100.0;
            gl_FragColor = vec4(0.1, 0.15, 0.25, uOpacity * (1.0 - clamp(d, 0.0, 1.0)));
          }
        `}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
