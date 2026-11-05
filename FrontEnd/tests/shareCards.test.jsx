import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import CosmicBadge from '../src/cosmic/CosmicBadge';
import BadgeDefsSprite from '../src/cosmic/BadgeDefsSprite';
import { TIER_ORDER } from '../src/cosmic/tiers';
import { buildShareCard } from '../src/cosmic/shareCard';
import { buildSessionCard } from '../src/cosmic/sessionCard';

let context;
let canvas;
let imageSource;

beforeEach(() => {
  context = {
    createRadialGradient: () => ({ addColorStop() {} }),
    fillRect() {}, beginPath() {}, arc() {}, fill() {}, rect() {}, roundRect() {},
    measureText: (text) => ({ width: String(text).length * 10 }),
    fillText: vi.fn(), drawImage: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function () { canvas = this; return context; });
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,test');
  vi.stubGlobal('Image', class {
    set src(value) { imageSource = value; queueMicrotask(() => this.onload?.()); }
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('share-card artwork', () => {
  it('exports all existing rank identities with vector artwork rather than text glyphs', async () => {
    for (const tierId of TIER_ORDER) {
      const { container, unmount } = render(<><BadgeDefsSprite /><CosmicBadge tierId={tierId} /></>);
      context.fillText.mockClear();
      context.drawImage.mockClear();
      const result = await buildShareCard({ tierId, score: 120, city: 'Surat', badgeSvg: container.querySelector('.cb-svg') });
      expect(result).toMatch(/^data:image\/png/);
      expect([canvas.width, canvas.height]).toEqual([1200, 675]);
      expect(context.drawImage).toHaveBeenCalledTimes(1);
      const labels = context.fillText.mock.calls.map(([text]) => text);
      expect(labels.every((text) => typeof text === 'string')).toBe(true);
      expect(labels.join(' ')).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
      expect(decodeURIComponent(imageSource.split(',').slice(1).join(','))).toContain('id="cb-sky"');
      unmount();
    }
  });

  it('rejects a rank export when its badge artwork is unavailable', async () => {
    await expect(buildShareCard({ tierId: 'pulsar_1' })).rejects.toThrow(/artwork is not available/);
  });

  it.each([[1, 'Rating: 1/5'], [4.7, 'Rating: 5/5'], [99, 'Rating: 5/5'], [0, 'Not rated']])('uses an explicit rating label for %s', (rating, label) => {
    buildSessionCard({ rating, partnerName: 'Asha', learned: 'A new chord', durationSec: 120 });
    expect(context.fillText.mock.calls.map(([text]) => text)).toContain(label);
    expect([canvas.width, canvas.height]).toEqual([1200, 675]);
  });
});
