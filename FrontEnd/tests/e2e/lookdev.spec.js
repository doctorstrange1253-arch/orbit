/**
 * lookdev.spec — Look-Dev Lab captures (mandate 3.G): Star + Nebula labs at
 * 1280px (desktop) into docs/design/lab-captures/. Headless Chromium renders
 * with SwiftShader (no real GPU) — captures validate wiring/composition, not
 * final visual quality or framerate (mandate 5.10 says so explicitly).
 */
import { test, expect } from '@playwright/test';

const SHOTS = '../docs/design/lab-captures';

test.describe('look-dev lab', () => {
  test('star lab renders canvas at 1280', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') console.log('[browser-error]', m.text().slice(0, 200)); });
    page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));
    await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(2500); // let WebGL warm up under SwiftShader
    const shot = `${SHOTS}/star-lab-1280.png`;
    await page.screenshot({ path: shot });
    console.log('capture:', shot);
    await ctx.close();
  });
});
