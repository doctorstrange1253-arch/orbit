import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
const root = 'D:/orbit-main/orbit-main';
const require = createRequire(root + '/FrontEnd/package.json');
const { chromium } = require('playwright');
const { safeAssetPath, fixtureBody } = await import(pathToFileURL(root + '/scripts/agent/identity-ui-capture.mjs'));
const build = root + '/.agent/scratch/iw-a2-20261108-be84ac1c/build';
const out = root + '/docs/pitch/deck/assets/fresh-d1';
const fixture = JSON.parse(await fs.readFile(root + '/scripts/agent/identity-ui-fixtures.json', 'utf8'));
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const rel = path.extname(url.pathname) ? url.pathname : '/index.html';
    const target = safeAssetPath(build, rel);
    if (!target) { res.writeHead(403).end(); return; }
    const real = await fs.realpath(target);
    if (!real.startsWith(path.resolve(build) + path.sep)) { res.writeHead(403).end(); return; }
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    res.end(await fs.readFile(target));
  } catch { res.writeHead(404).end(); }
});
await fs.mkdir(out, { recursive: true });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const [slug, route] of [['journey','/courses/course-fixture/learn/lesson-3'],['course','/mentor/courses/course-fixture/edit'],['studio','/mentor/recorder'],['student','/student/universe']]) {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(account => {
      localStorage.setItem('auth-storage', JSON.stringify({ state: { user: account, token: 'synthetic-ui-token-not-a-credential' }, version: 2 }));
      localStorage.setItem('skillswap-sounds-enabled', 'false');
      localStorage.setItem('skillswap-music-enabled', 'false');
      localStorage.setItem('skillswap-appearance', JSON.stringify({ state: { theme: 'cyan-purple', backgroundStyle: 'minimal', animationSpeed: 'off' }, version: 0 }));
      window.WebSocket = class { constructor() { throw Error('Fixture capture: sockets blocked'); } };
    }, fixture.account);
    await context.route('**/*', async routeObj => {
      const request = routeObj.request(), url = new URL(request.url());
      if (url.pathname.startsWith('/api/')) {
        if (request.method() !== 'GET') { await routeObj.fulfill({ status: 403, body: '{}' }); return; }
        const body = fixtureBody(url.pathname.slice(4), fixture);
        await routeObj.fulfill({ status: body === undefined ? 404 : 200, contentType: 'application/json', body: JSON.stringify(body ?? {}) });
      } else if (url.origin === origin && !url.pathname.startsWith('/socket.io')) await routeObj.continue();
      else await routeObj.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4200);
    const headings = await page.locator('h1,h2').allTextContents();
    await page.screenshot({ path: out + '/' + slug + '.png', fullPage: false, timeout: 30000 });
    results.push({ slug, route, image: 'assets/fresh-d1/' + slug + '.png', pixels: [3840,2160], headings, errors, synthetic: true, externalTraffic: 'BLOCKED', sourceBuild: 'retained2026-11-09; not new source implementation' });
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
await fs.writeFile(out + '/capture-report.json', JSON.stringify({ results, note: 'Prototype screenshots, sample data; retained build; no backend/DB, network or media permissions' }, null, 2));
console.log(JSON.stringify(results));
