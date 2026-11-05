/**
 * cosmic.captures.spec — Playwright visual QA for the 3D signature world (mandate 3.F).
 *
 * Requires the dev server on http://127.0.0.1:5173 and captures land in
 * docs/progress/screenshots/. Headless Chromium has no real GPU (mandate 5.10):
 * these captures validate layout/wiring/states, NOT GPU performance or final
 * visual quality. Run the Look-Dev Lab + this spec; real-GPU verification is
 * still needed on a real browser before budgets count as met.
 */
import process from 'node:process';
import { test } from '@playwright/test';

const BASE = process.env.ORBIT_BASE_URL || 'http://127.0.0.1:5173';
const SHOTS = '../docs/progress/screenshots';

test.describe('login smoke captures', () => {
  test('login at 1280 with reduced motion', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    // CourseLearn needs auth + course id; capture the unauthenticated redirect instead:
    // this is a smoke placeholder until the Look-Dev Lab dev route exists (F3).
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: `${SHOTS}/login-1280.png` });
    await ctx.close();
  });

  test('login at 360 with reduced motion', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: `${SHOTS}/login-360.png` });
    await ctx.close();
  });
});
