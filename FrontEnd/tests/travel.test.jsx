import { describe, it, expect } from 'vitest';
import {
  layoutToPosition, distance3, smoothDampFactor, damp3,
  travelDuration, easeInOutCubic, arcMidpoint, parkOffset, add3,
} from '../src/cosmic/travel';

describe('travel math (F5a)', () => {
  const layout = { angle: 0.25, radius: 8.5, altitude: 1.5 };

  it('layoutToPosition is deterministic and matches the orbit formula', () => {
    const a = layoutToPosition(layout, 2);
    const b = layoutToPosition(layout, 2);
    expect(a).toEqual(b);
    // angle 0.25 -> PI/2: x = cos(PI/2)*8.5 ~ 0, z = sin(PI/2)*8.5 = 8.5
    expect(a[0]).toBeCloseTo(0, 10);
    expect(a[2]).toBeCloseTo(8.5, 10);
    expect(a[1]).toBeCloseTo(1.5 * Math.sin(3), 10);
  });

  it('different layouts give different positions', () => {
    const a = layoutToPosition({ angle: 0.1, radius: 6, altitude: 0 }, 0);
    const b = layoutToPosition({ angle: 0.6, radius: 11, altitude: 3 }, 1);
    expect(distance3(a, b)).toBeGreaterThan(1);
  });

  it('smoothDampFactor stays in (0,1) and grows with lambda*dt', () => {
    const small = smoothDampFactor(1, 0.016);
    const big = smoothDampFactor(8, 0.016);
    expect(small).toBeGreaterThan(0);
    expect(small).toBeLessThan(1);
    expect(big).toBeGreaterThan(small);
    expect(smoothDampFactor(3, 0)).toBe(0);
  });

  it('damp3 converges toward the target', () => {
    let p = [0, 0, 0];
    const target = [10, 0, 0];
    for (let i = 0; i < 120; i++) p = damp3(p, target, 4, 1 / 60);
    expect(p[0]).toBeGreaterThan(9.5);
    expect(p[0]).toBeLessThanOrEqual(10);
  });

  it('travelDuration clamps to the cinematic window', () => {
    expect(travelDuration(0.5)).toBe(1.2);   // min clamp
    expect(travelDuration(100)).toBe(4.0);   // max clamp
    expect(travelDuration(12)).toBeCloseTo(2.0, 5); // 12/6
  });

  it('easeInOutCubic hits 0 / 0.5 / 1 and clamps', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(-3)).toBe(0);
    expect(easeInOutCubic(9)).toBe(1);
  });

  it('arcMidpoint lifts above both endpoints', () => {
    const m = arcMidpoint([0, 1, 0], [10, 3, 0]);
    expect(m[0]).toBe(5);
    expect(m[1]).toBeCloseTo(5.5, 10);
  });

  it('parkOffset scales with planet radius', () => {
    expect(parkOffset(1)).toEqual([2.6, 0.9, 0]);
    const sum = add3([1, 1, 1], parkOffset(0.8));
    expect(sum[0]).toBeCloseTo(3.4, 10);
    expect(sum[1]).toBeCloseTo(1.9, 10);
    expect(sum[2]).toBeCloseTo(1, 10);
    expect(parkOffset(2)[0]).toBeCloseTo(3.6, 10);
  });
});
