/**
 * shuttle.spec — Shuttle Lab capture (mandate 6.2 step 4 + 3.G): parametric
 * shuttle mid-flight between lab planets at 1280px into lab-captures/.
 * Headless SwiftShader: wiring/composition proof only.
 */
import { test, expect } from '@playwright/test';

const SHOTS = '../docs/design/lab-captures';

test('shuttle lab: flies between nodes, trail visible', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(2500);
  await page.getByRole('navigation', { name: 'Labs' }).getByRole('button', { name: 'Shuttle', exact: true }).click();
  await page.waitForTimeout(2600); // AutoFly fires at 600ms; mid-flight at ~2s
  const shot = `${SHOTS}/shuttle-flight-1280.png`;
  await page.screenshot({ path: shot });
  console.log('capture:', shot, '| pageerrors:', errors.length ? errors.join(' ;; ') : 'none');
  expect(errors.join(' ')).not.toMatch(/WebGL|GLSL|shader|THREE\.WebGL/i);
  await ctx.close();
});
