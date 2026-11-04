#!/usr/bin/env node
/**
 * verify.js — runs, in order, whichever exist: emoji guard, registry sync, lint,
 * unit tests (FrontEnd vitest, BackEnd jest), build. Prints a pass/fail table.
 * Exits non-zero on any failure. Never mark a task done on red.
 * Usage: node scripts/agent/verify.js [--fast]   (--fast skips build)
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const fast = process.argv.includes('--fast');
const results = [];

function step(name, cwd, cmd, args, timeoutMs) {
  const t0 = Date.now();
  try {
    const out = execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    results.push({ name, pass: true, dur: ((Date.now() - t0) / 1000).toFixed(1), tail: out.trim().split('\n').slice(-6).join(' | ') });
  } catch (e) {
    const out = ((e.stdout || '') + (e.stderr || ''));
    results.push({ name, pass: false, dur: ((Date.now() - t0) / 1000).toFixed(1), tail: out.trim().split('\n').slice(-10).join(' | ') });
  }
}

const node = process.execPath;
const A = (p) => path.join(ROOT, 'scripts', 'agent', p);

step('check-no-emoji', ROOT, node, [A('check-no-emoji.js')], 120000);
step('sync-registry', ROOT, node, [A('sync-registry.js')], 120000);

if (fs.existsSync(path.join(ROOT, 'FrontEnd', 'node_modules'))) {
  step('frontend-lint', path.join(ROOT, 'FrontEnd'), node, ['node_modules/.bin/eslint', '.', '--max-warnings=999'], 300000);
  step('frontend-tests', path.join(ROOT, 'FrontEnd'), node, ['node_modules/.bin/vitest', 'run'], 420000);
}
if (fs.existsSync(path.join(ROOT, 'BackEnd', 'node_modules'))) {
  step('backend-tests', path.join(ROOT, 'BackEnd'), node, ['node_modules/.bin/jest', '--maxWorkers=2'], 540000);
}
if (!fast && fs.existsSync(path.join(ROOT, 'FrontEnd', 'node_modules'))) {
  step('frontend-build', path.join(ROOT, 'FrontEnd'), node, ['node_modules/.bin/vite', 'build'], 540000);
}

console.log('\n=== verify table ===');
let fail = 0;
for (const r of results) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}  (${r.dur}s)`);
  console.log('      ' + r.tail.slice(0, 400));
}
console.log(fail === 0 ? 'ALL PASS' : `${fail} FAILURE(S)`);
process.exit(fail === 0 ? 0 : 1);
