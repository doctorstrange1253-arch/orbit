#!/usr/bin/env node
/**
 * run.js — run a command with a timeout, capture everything, print a compact result.
 * Usage: node scripts/agent/run.js "<command>" [timeoutMs=120000]
 * Writes full output to .agent/scratch/last-run.log. Never treats empty output as success.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCRATCH = path.join(ROOT, '.agent', 'scratch');
fs.mkdirSync(SCRATCH, { recursive: true });

const cmd = process.argv[2];
const timeoutMs = Number(process.argv[3] || 120000);
if (!cmd) { console.error('usage: run.js "<command>" [timeoutMs]'); process.exit(2); }

const t0 = Date.now();
let stdout = '', stderr = '', code = 0, timedOut = false;
try {
  stdout = execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', cmd], {
    cwd: ROOT, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'], shell: false,
  });
} catch (e) {
  code = e.status == null ? (e.signal ? 1 : 2) : e.status;
  timedOut = e.killed === true && e.signal === 'SIGTERM';
  stdout = e.stdout || '';
  stderr = (e.stderr || '') + (e.message || '');
}
const dur = ((Date.now() - t0) / 1000).toFixed(1);

const logPath = path.join(SCRATCH, 'last-run.log');
fs.writeFileSync(logPath, `CMD: ${cmd}\nCWD: ${ROOT}\nEXIT: ${code}${timedOut ? ' (TIMEOUT)' : ''}\nDURATION: ${dur}s\n=== STDOUT ===\n${stdout}\n=== STDERR ===\n${stderr}\n`);

const lines = (s) => s.split('\n').filter(Boolean);
const so = lines(stdout), se = lines(stderr);
const head = (a, n) => a.slice(0, n).join('\n');
const tail = (a, n) => a.slice(-n).join('\n');
console.log(`CMD: ${cmd}`);
console.log(`CWD: ${ROOT}  EXIT: ${code}${timedOut ? ' (TIMEOUT)' : ''}  DUR: ${dur}s`);
console.log(`stdout ${so.length} lines | stderr ${se.length} lines | log: ${path.relative(ROOT, logPath)}`);
console.log('--- stdout first 40 ---\n' + (head(so, 40) || '(empty)'));
console.log('--- stdout last 40 ---\n' + (tail(so, 40) || '(empty)'));
console.log('--- stderr first 40 ---\n' + (head(se, 40) || '(empty)'));
console.log('--- stderr last 40 ---\n' + (tail(se, 40) || '(empty)'));
process.exit(code || 0);
