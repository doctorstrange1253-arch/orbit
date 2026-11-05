/**
 * travel.js — pure journey math for shuttle travel between level nodes.
 * No three.js dependency: operates on [x, y, z] arrays so unit tests stay
 * fast and the same functions drive both the world and the Lab.
 * Curve construction (CatmullRomCurve3) lives in the Canvas components;
 * these helpers supply positions, easing, damping, and durations.
 * ([Skill: r3f-animation] damping pattern; [Skill: threejs-core-math].)
 */

/** Module world position from a seeded layout — THE single source of truth.
 *  PlanetNode and the journey controller both use this. */
export function layoutToPosition(layout, index) {
  const angle = layout.angle * Math.PI * 2;
  const x = Math.cos(angle) * layout.radius;
  const z = Math.sin(angle) * layout.radius;
  const y = layout.altitude * Math.sin(index * 1.5);
  return [x, y, z];
}

export function distance3(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Frame-rate-independent damping factor: lerp(current, target, smoothDampFactor(lambda, dt)). */
export function smoothDampFactor(lambda, dt) {
  return 1 - Math.exp(-lambda * dt);
}

export function damp3(current, target, lambda, dt) {
  const t = smoothDampFactor(lambda, dt);
  return [
    current[0] + (target[0] - current[0]) * t,
    current[1] + (target[1] - current[1]) * t,
    current[2] + (target[2] - current[2]) * t,
  ];
}

/** Flight duration scales with distance, clamped to a cinematic window. */
export function travelDuration(distance, speed = 6, min = 1.2, max = 4.0) {
  return Math.min(max, Math.max(min, distance / speed));
}

export function easeInOutCubic(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Arc midpoint lifted above the chord so hops read as flights, not slides. */
export function arcMidpoint(a, b, lift = 2.5) {
  return [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2];
}

/** Parked hover offset beside a planet of radius r. */
export function parkOffset(r) {
  return [r + 1.6, 0.9, 0];
}

export function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function mulberry32(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
