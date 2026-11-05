import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { checkForbiddenEmojis, scanReactTree } from '../src/utils/emojiGuard';

const rocket = String.fromCodePoint(0x1f680);
const planet = String.fromCodePoint(0x1fa90);
const star = String.fromCodePoint(0x2b50);

describe('runtime emoji guard', () => {
  it('recognizes pictographs consistently without rejecting plain text or digits', () => {
    for (const value of [rocket, planet, star, String.fromCodePoint(0x200d, 0xfe0f)]) {
      expect(checkForbiddenEmojis(value)).toBe(true);
      expect(checkForbiddenEmojis(value)).toBe(true);
    }
    for (const value of ['Course 123', '', undefined, null, 42]) expect(checkForbiddenEmojis(value)).toBe(false);
  });

  it('walks element children and accessible text attributes', () => {
    const tree = createElement('section', { title: `Overview ${planet}` },
      createElement('button', { 'aria-label': `Resume ${rocket}` },
        ['Lesson ', createElement('span', { key: 'rating' }, star)]));
    const violations = scanReactTree(tree);
    expect(violations).toHaveLength(3);
    expect(violations.some((item) => item.includes('title'))).toBe(true);
    expect(violations.some((item) => item.includes('aria-label'))).toBe(true);
  });

  it('does not execute component functions while inspecting their props', () => {
    function Unrendered() { throw new Error('Must not execute'); }
    expect(scanReactTree(createElement(Unrendered, { title: rocket }))).toHaveLength(1);
  });

  it('accepts fragments and arrays while ignoring non-renderable values', () => {
    expect(scanReactTree([null, false, 0, 'Course', createElement('span', null, planet)])).toHaveLength(1);
    expect(scanReactTree(createElement('div', { className: 'plain' }, 'Course 123'))).toEqual([]);
  });
});
