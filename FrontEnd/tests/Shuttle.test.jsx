import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import Shuttle from '../src/cosmic/Shuttle';

let advance;
vi.mock('@react-three/fiber', () => ({ useFrame: (callback) => { advance = callback; } }));

const layouts = [
  { angle: 0, radius: 6, altitude: 0, size: 1 },
  { angle: 0.25, radius: 8, altitude: 0, size: 1.5 },
];
const tick = (delta) => act(() => advance({ clock: { elapsedTime: 0 } }, delta));
beforeEach(() => { advance = undefined; });

describe('Shuttle flight lifecycle', () => {
  it('parks next to the selected planet and exposes its live position', () => {
    const apiRef = createRef();
    render(<Shuttle apiRef={apiRef} layouts={layouts} startIndex={1} />);
    const position = apiRef.current.position?.toArray();
    expect(position).toBeDefined();
    expect(position[0]).toBeCloseTo(2.8);
    expect(position[1]).toBeCloseTo(0.9);
    expect(position[2]).toBeCloseTo(8);
  });

  it('moves over time and invokes arrival exactly once at the destination', () => {
    const apiRef = createRef();
    const arrived = vi.fn();
    render(<Shuttle apiRef={apiRef} layouts={layouts} />);
    act(() => apiRef.current.flyTo(1, arrived));
    expect(arrived).not.toHaveBeenCalled();
    tick(0.1);
    expect(arrived).not.toHaveBeenCalled();
    for (let i = 0; i < 300; i++) tick(1 / 60);
    expect(arrived).toHaveBeenCalledExactlyOnceWith(1);
    expect(apiRef.current.position.x).toBeCloseTo(2.8);
    expect(apiRef.current.position.z).toBeCloseTo(8);
    tick(1);
    expect(arrived).toHaveBeenCalledTimes(1);
  });

  it('retargeting drops the previous arrival callback', () => {
    const apiRef = createRef();
    const first = vi.fn();
    const latest = vi.fn();
    render(<Shuttle apiRef={apiRef} layouts={layouts} />);
    act(() => apiRef.current.flyTo(1, first));
    tick(0.1);
    act(() => apiRef.current.flyTo(0, latest));
    for (let i = 0; i < 300; i++) tick(1 / 60);
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('reduced motion reaches the destination without waiting for frames', () => {
    const apiRef = createRef();
    const arrived = vi.fn();
    render(<Shuttle apiRef={apiRef} layouts={layouts} reducedMotion />);
    act(() => apiRef.current.flyTo(1, arrived));
    expect(arrived).toHaveBeenCalledExactlyOnceWith(1);
    expect(apiRef.current.position.z).toBeCloseTo(8);
  });

  it('unmount cancels pending arrival and clears the exposed API', () => {
    const apiRef = createRef();
    const arrived = vi.fn();
    const { unmount } = render(<Shuttle apiRef={apiRef} layouts={layouts} />);
    act(() => apiRef.current.flyTo(1, arrived));
    const oldFrame = advance;
    unmount();
    oldFrame({ clock: { elapsedTime: 0 } }, 10);
    expect(arrived).not.toHaveBeenCalled();
    expect(apiRef.current).toBeNull();
  });

  it('rejects an absent destination without firing arrival', () => {
    const apiRef = createRef();
    const arrived = vi.fn();
    render(<Shuttle apiRef={apiRef} layouts={[]} />);
    expect(apiRef.current.flyTo(0, arrived)).toBe(false);
    expect(arrived).not.toHaveBeenCalled();
  });
});
