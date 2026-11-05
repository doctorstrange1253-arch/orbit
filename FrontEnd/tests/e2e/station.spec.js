import { test, expect } from '@playwright/test';

const SHOTS = '../docs/design/lab-captures';
const VARIANTS = ['checkpoint', 'station', 'boss'];

test.describe('station lab', () => {
  for (const v of VARIANTS) {
    test(`station variant ${v} renders at 1280`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (message) => {
        if (message.type() === 'error' && /THREE|WebGL|GLSL|shader/i.test(message.text())) errors.push(message.text());
      });
      await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000);
      const nav = page.getByRole('navigation', { name: 'Labs' });
      await nav.getByRole('button', { name: 'Station', exact: true }).click();
      await page.waitForTimeout(400);
      const select = page.locator('select').filter({ has: page.locator('option').filter({ hasText: /^checkpoint$/ }) });
      await expect(select).toHaveCount(1);
      await select.selectOption({ label: v });
      await expect(select.locator('option:checked')).toHaveText(v);
      await page.waitForTimeout(1500);
      const shot = `${SHOTS}/station-${v}-1280.png`;
      await page.screenshot({ path: shot });
      console.log('capture:', shot, '| pageerrors:', errors.length ? errors.join(' ;; ') : 'none');
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }
});
