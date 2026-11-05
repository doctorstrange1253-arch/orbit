import { test, expect } from '@playwright/test';

const SHOTS = '../docs/design/lab-captures';
const VARIANTS = ['checkpoint', 'station', 'boss'];

test.describe('station lab', () => {
  for (const v of VARIANTS) {
    test(`station variant ${v} renders at 1280`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
      await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
      const nav = page.getByRole('navigation', { name: 'Labs' });
      await nav.getByRole('button', { name: 'Station', exact: true }).click();
      await page.waitForTimeout(400);
      const selects = page.locator('select');
      const n = await selects.count();
      for (let i = 0; i < n; i++) {
        const opts = await selects.nth(i).locator('option').allTextContents().catch(() => []);
        if (opts.includes('checkpoint') && opts.includes('boss')) {
          await selects.nth(i).selectOption(v);
          break;
        }
      }
      await page.waitForTimeout(1500);
      const shot = `${SHOTS}/station-${v}-1280.png`;
      await page.screenshot({ path: shot });
      console.log('capture:', shot, '| pageerrors:', errors.length ? errors.join(' ;; ') : 'none');
      expect(errors.join(' ')).not.toMatch(/WebGL|GLSL|shader|THREE\.WebGL/i);
      await ctx.close();
    });
  }
});
