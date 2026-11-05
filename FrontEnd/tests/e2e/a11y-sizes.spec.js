import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SIZES = [
  { name: '360', width: 360, height: 740 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1920', width: 1920, height: 1080 },
];

const SHOTS = '../docs/progress/screenshots';

test.describe('lab captures + a11y', () => {
  for (const s of SIZES) {
    test(`lab at ${s.name}px`, async ({ browser }) => {
      test.setTimeout(120000);
      const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height } });
      const page = await ctx.newPage();
      await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
      const tabs = page.getByRole('navigation', { name: 'Labs' }).getByRole('button');
      for (let index = 0; index < await tabs.count(); index++) {
        const tab = tabs.nth(index);
        await expect(tab).toBeInViewport();
        await tab.click({ timeout: 5000 });
        await expect(tab).toHaveAttribute('aria-pressed', 'true');
      }
      await tabs.first().focus();
      for (let index = 0; index < await tabs.count(); index++) {
        await expect(tabs.nth(index)).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(tabs.nth(index)).toHaveAttribute('aria-pressed', 'true');
        await page.keyboard.press('Tab');
      }
      await page.screenshot({ path: `${SHOTS}/lab-${s.name}.png` });
      await ctx.close();
    });
  }

  test('lab page has no critical/serious a11y violations', async ({ browser }) => {
    test.setTimeout(120000);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto('/dev/lab', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(page.getByTestId('look-dev-lab')).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((violation) => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map((node) => node.target) }))).toEqual([]);
    await ctx.close();
  });
});
