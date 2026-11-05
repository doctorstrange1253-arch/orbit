import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('three', () => ({
  AdditiveBlending: 'additive',
  BackSide: 'backside',
}));

vi.mock('@react-three/fiber', () => ({ useFrame: (cb) => { globalThis.__stationFrame = cb; } }));

import Station, { STATION_VARIANTS } from '../src/cosmic/Station';
import { mulberry32 } from '../src/cosmic/travel';

describe('Station (F6a)', () => {
  it('exposes three variants', () => {
    expect(STATION_VARIANTS).toEqual(['checkpoint', 'station', 'boss']);
  });

  it('mulberry32 is deterministic', () => {
    const a = mulberry32(99);
    const b = mulberry32(99);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('checkpoint mounts core plus ring', () => {
    const { container } = render(<Station variant="checkpoint" seed={5} position={[1, 2, 3]} scale={1.5} />);
    expect(container.querySelectorAll('mesh').length).toBe(2);
  });

  it('station mounts hub, ring, four lights, two domes', () => {
    const { container } = render(<Station variant="station" seed={5} />);
    expect(container.querySelectorAll('mesh').length).toBe(8);
  });

  it('boss mounts core, wireframe shell, glow shell', () => {
    const { container } = render(<Station variant="boss" seed={5} />);
    expect(container.querySelectorAll('mesh').length).toBe(3);
  });

  it('unknown variant falls back to checkpoint', () => {
    const { container } = render(<Station variant="nope" seed={5} />);
    expect(container.querySelectorAll('mesh').length).toBe(2);
  });

  it('frame callback advances without throwing', () => {
    render(<Station variant="boss" seed={5} motion={1} />);
    expect(() => globalThis.__stationFrame({ clock: { elapsedTime: 0 } }, 0.016)).not.toThrow();
  });
});
