/**
 * planet.spec — Planet Lab captures (mandate 3.G / 6.2 step 3): every archetype
 * on a turntable at 1280px into docs/design/lab-captures/. Each archetype must
 * be reviewed here with a capture attached before being wired into the world.
 * Headless SwiftShader: wiring/composition proof, not final visual quality.
 */
import { test, expect } from '@playwright/test';

const SHOTS = '../docs/design/lab-captures';
const ARCHETYPES = ['terrestrial', 'gas_giant', 'ice_world', 'volcanic', 'oceanic', 'crystalline', 'desert', 'nebula_station'];

test.describe('planet lab', () => {
  for (const arch of ARCHETYPES) {
    test(`archetype ${arch} renders at 1280`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
      await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
      await page.waitForTimeout(2000); // let leva + webgl settle
      // Switch to the Planet tab — scope to the Labs nav (leva also renders buttons)
      const nav = page.getByRole('navigation', { name: 'Labs' });
      await nav.getByRole('button', { name: 'Planet', exact: true }).click();
      await page.waitForTimeout(500);
      // Leva archetype select: find the select labeled by the Planet lab panel
      const selects = page.locator('select');
      const count = await selects.count();
      for (let i = 0; i < count; i++) {
        const opts = await selects.nth(i).locator('option').allTextContents().catch(() => []);
        if (opts.includes('terrestrial') || opts.includes(arch)) {
          await selects.nth(i).selectOption(arch);
          break;
        }
      }
      await page.waitForTimeout(1500); // let the shader settle
      const shot = `${SHOTS}/planet-${arch}-1280.png`;
      await page.screenshot({ path: shot });
      console.log('capture:', shot, '| pageerrors:', errors.length ? errors.join(' ;; ') : 'none');
      expect(errors.join(' ')).not.toMatch(/WebGL|GLSL|shader|THREE\.WebGL/i);
      await ctx.close();
    });
  }
});
