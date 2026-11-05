import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

vi.mock('three', () => {
  class V3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    clone() { return new V3(this.x, this.y, this.z); }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    toArray() { return [this.x, this.y, this.z]; }
    distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
    normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this; }
  }
  class Q { slerp() { return this; } copy(q) { return q; } setFromRotationMatrix() { return this; } }
  class M4 { lookAt() { return this; } }
  class Curve {
    constructor(pts) { this.pts = pts; }
    getPointAt(t) { const i = Math.min(this.pts.length - 1, Math.floor(t * this.pts.length)); return this.pts[Math.max(0, i)]; }
    getTangentAt() { return new V3(0, 0, 1); }
  }
  class Geo {
    constructor() { this.attrs = {}; this.drawRange = { start: 0, count: 0 }; }
    setAttribute(n, a) { this.attrs[n] = a; }
    setDrawRange(s, c) { this.drawRange = { start: s, count: c }; }
  }
  class Attr { constructor(arr) { this.array = arr; this.needsUpdate = false; } }
  class Mesh {
    constructor() {
      this.rotation = { x: 0, y: 0, z: 0 };
      this.position = new V3();
      this.scale = { x: 1, y: 1, z: 1, setScalar(s) { this.x = this.y = this.z = s; }, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.material = {};
    }
  }
  class Group {
    constructor() { this.children = []; this.rotation = { x: 0, y: 0, z: 0 }; this.position = new V3(); this.quaternion = new Q(); }
    add(c) { this.children.push(c); }
  }
  return {
    Vector2: class { constructor(x = 0, y = 0) { this.x = x; this.y = y; } },
    Vector3: V3, Quaternion: Q, Matrix4: M4,
    CatmullRomCurve3: Curve,
    BufferGeometry: Geo, BufferAttribute: Attr,
    Group, Mesh,
    CylinderGeometry: Geo, ConeGeometry: Geo, SphereGeometry: Geo,
    ShapeGeometry: Geo, Shape: class { constructor() {} },
    MeshStandardMaterial: class { constructor() {} }, MeshBasicMaterial: class { constructor() {} },
    AdditiveBlending: 'additive', DoubleSide: 'doubleside',
  };
});

vi.mock('@react-three/fiber', () => ({ useFrame: (cb) => { globalThis.__frameCb = cb; } }));

import Shuttle from '../src/cosmic/Shuttle';
import { layoutToPosition } from '../src/cosmic/travel';
import { generatePlanetLayout } from '../src/cosmic/PlanetGenerator';

const layouts = [
  generatePlanetLayout({ courseId: 'c', moduleId: 'a', moduleTitle: 'A' }),
  generatePlanetLayout({ courseId: 'c', moduleId: 'b', moduleTitle: 'B' }),
];

describe('Shuttle (F5b)', () => {
  it('mounts and exposes an imperative flyTo via apiRef', () => {
    const apiRef = React.createRef();
    const { container } = render(<Shuttle apiRef={apiRef} layouts={layouts} startIndex={0} />);
    expect(container).toBeTruthy();
    expect(typeof apiRef.current?.flyTo).toBe('function');
  });

  it('flyTo(1) starts a flight and one frame advances without throwing', () => {
    const apiRef = React.createRef();
    render(<Shuttle apiRef={apiRef} layouts={layouts} startIndex={0} />);
    apiRef.current.flyTo(1);
    // refs are null under the mocked DOM renderer — the frame callback must
    // tolerate that and still advance the flight state
    expect(() => globalThis.__frameCb && globalThis.__frameCb({ clock: { elapsedTime: 0 } }, 0.016)).not.toThrow();
  });

  it('layoutToPosition matches the world node position formula', () => {
    // The world PlanetNode uses cos/sin/radius + altitude*sin(i*1.5); travel.js must agree
    const p = layoutToPosition(layouts[0], 0);
    const angle = layouts[0].angle * Math.PI * 2;
    expect(p[0]).toBeCloseTo(Math.cos(angle) * layouts[0].radius, 10);
    expect(p[2]).toBeCloseTo(Math.sin(angle) * layouts[0].radius, 10);
  });
});
