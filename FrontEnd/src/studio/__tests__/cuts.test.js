import { describe, it, expect } from 'vitest';
import { normalizeCuts, addCut, cutTotal, skipTarget, toEffective, fromEffective } from '../cuts';

describe('normalizeCuts', () => {
  it('sorts, merges touching ranges and drops the invalid ones', () => {
    expect(normalizeCuts([
      { fromSec: 40, toSec: 60 },
      { fromSec: 10, toSec: 20 },
      { fromSec: 18, toSec: 25 },
      { fromSec: 5, toSec: 5 },
      { fromSec: -2, toSec: 1 },
      { fromSec: 'x', toSec: 3 },
    ])).toEqual([
      { fromSec: 10, toSec: 25 },
      { fromSec: 40, toSec: 60 },
    ]);
  });

  it('treats a missing or malformed list as no cuts', () => {
    expect(normalizeCuts(undefined)).toEqual([]);
    expect(normalizeCuts(null)).toEqual([]);
    expect(normalizeCuts('nope')).toEqual([]);
  });
});

describe('addCut — two retakes in a row become one cut', () => {
  it('merges the second retake into the first', () => {
    const once = addCut([], 30, 50);
    const twice = addCut(once, 45, 65);
    expect(twice).toEqual([{ fromSec: 30, toSec: 65 }]);
  });

  it('keeps two retakes apart when good material sits between them', () => {
    const cuts = addCut(addCut([], 10, 30), 120, 140);
    expect(cuts).toHaveLength(2);
    expect(cutTotal(cuts)).toBe(40);
  });
});

describe('skipTarget', () => {
  const cuts = [{ fromSec: 10, toSec: 30 }];

  it('jumps to the end of the cut when playback lands inside it', () => {
    expect(skipTarget(cuts, 10)).toBe(30);
    expect(skipTarget(cuts, 22.4)).toBe(30);
  });

  it('leaves playback alone outside a cut', () => {
    expect(skipTarget(cuts, 9)).toBeNull();
    expect(skipTarget(cuts, 30)).toBeNull();
    expect(skipTarget([], 22)).toBeNull();
  });
});

describe('effective time — what the student sees', () => {
  const cuts = [{ fromSec: 10, toSec: 30 }, { fromSec: 60, toSec: 70 }];

  it('subtracts cut time that has already gone by', () => {
    expect(toEffective(cuts, 5)).toBe(5);
    expect(toEffective(cuts, 30)).toBe(10);
    expect(toEffective(cuts, 45)).toBe(25);
    expect(toEffective(cuts, 90)).toBe(60);
  });

  it('maps a seek on the trimmed timeline back to the real file', () => {
    expect(fromEffective(cuts, 5)).toBe(5);
    expect(fromEffective(cuts, 10)).toBe(30);
    expect(fromEffective(cuts, 25)).toBe(45);
    expect(fromEffective(cuts, 60)).toBe(90);
  });

  it('round-trips every second of a 120s file with 30s cut out', () => {
    const total = 120 - cutTotal(cuts);
    for (let e = 0; e <= total; e += 1) {
      expect(toEffective(cuts, fromEffective(cuts, e))).toBeCloseTo(e, 6);
    }
  });

  it('is the identity when nothing was cut', () => {
    expect(toEffective([], 42)).toBe(42);
    expect(fromEffective([], 42)).toBe(42);
    expect(cutTotal([])).toBe(0);
  });
});
