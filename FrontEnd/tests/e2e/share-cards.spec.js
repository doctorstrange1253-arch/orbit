import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';

const cases = [
  ['planet_1', 'rank-export-planet.png'],
  ['pulsar_1', 'rank-export-pulsar.png'],
  ['quasar', 'rank-export-quasar.png'],
];

test.use({ reducedMotion: 'reduce' });

for (const [tierId, filename] of cases) {
  test(`exports actual SVG artwork for ${tierId}`, async ({ page }) => {
    await page.goto('/cosmic-gallery', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.cb-badge').first()).toBeVisible();
    const dataUrl = await page.evaluate(async (id) => {
      const { buildShareCard } = await import('/src/cosmic/shareCard.js');
      return buildShareCard({ tierId: id, score: 120, city: 'Surat' });
    }, tierId);
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    const image = Buffer.from(dataUrl.split(',')[1], 'base64');
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(675);
    expect(image.length).toBeGreaterThan(5000);
    await writeFile(fileURLToPath(new URL(`../../../docs/progress/screenshots/${filename}`, import.meta.url)), image);
  });
}
