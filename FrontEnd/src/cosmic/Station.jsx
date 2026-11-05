import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32 } from './travel';

export const STATION_VARIANTS = ['checkpoint', 'station', 'boss'];

function CheckpointBeacon({ seed, motion }) {
  const ref = useRef();
  const speed = 0.4 + (seed % 7) * 0.05;
  useFrame((s, d) => {
    if (ref.current && ref.current.rotation && motion > 0) ref.current.rotation.y += speed * d;
  });
  return (
    <group ref={ref}>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#3a5a8a" emissive="#4ac8ff" emissiveIntensity={1.2} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.05, 8, 32]} />
        <meshBasicMaterial color="#7ac8ff" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StationHub({ seed, motion }) {
  const ringRef = useRef();
  const speed = 0.15 + ((seed % 5) * 0.03);
  const intensities = useMemo(() => {
    const rand = mulberry32(seed);
    return [0, 1, 2, 3].map(() => 1.5 + rand());
  }, [seed]);
  useFrame((s, d) => {
    if (ringRef.current && ringRef.current.rotation && motion > 0) ringRef.current.rotation.z += speed * d;
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 2.2, 10]} />
        <meshStandardMaterial color="#9aa4b5" metalness={0.85} roughness={0.35} />
      </mesh>
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[1.5, 0.18, 10, 36]} />
          <meshStandardMaterial color="#6a7484" metalness={0.8} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 1.5, Math.sin((i * Math.PI) / 2) * 1.5, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color="#222222" emissive={i % 2 ? '#4ade80' : '#facc15'} emissiveIntensity={intensities[i]} />
          </mesh>
        ))}
      </group>
      {[1.3, -1.3].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial color="#c8d2e0" metalness={0.7} roughness={0.3} emissive="#2a6ad8" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function BossEncounter({ seed, motion }) {
  const coreRef = useRef();
  const shellRef = useRef();
  const speed = 0.2 + ((seed % 5) * 0.04);
  useFrame((s, d) => {
    if (motion <= 0) return;
    if (coreRef.current && coreRef.current.rotation) coreRef.current.rotation.y += speed * d;
    if (shellRef.current && shellRef.current.rotation) shellRef.current.rotation.y -= speed * 0.6 * d;
  });
  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color="#1a1214" metalness={0.6} roughness={0.5} emissive="#ff2a3a" emissiveIntensity={0.35} flatShading />
      </mesh>
      <mesh ref={shellRef} scale={1.45}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#ff2a3a" wireframe transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.7}>
        <sphereGeometry args={[1.3, 24, 18]} />
        <meshBasicMaterial color="#7a1020" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function Station({ variant = 'checkpoint', seed = 1, position = [0, 0, 0], scale = 1, motion = 1 }) {
  const v = STATION_VARIANTS.includes(variant) ? variant : 'checkpoint';
  return (
    <group position={position} scale={scale}>
      {v === 'checkpoint' && <CheckpointBeacon seed={seed} motion={motion} />}
      {v === 'station' && <StationHub seed={seed} motion={motion} />}
      {v === 'boss' && <BossEncounter seed={seed} motion={motion} />}
    </group>
  );
}
