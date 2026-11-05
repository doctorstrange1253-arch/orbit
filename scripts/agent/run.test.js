const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const RUNNER = path.join(__dirname, 'run.js');
const nodeCommand = (code) => `node -e "${code}"`;
const invoke = (code, args = []) => spawnSync(process.execPath, [RUNNER, nodeCommand(code), ...args], {
  cwd: path.dirname(ROOT), encoding: 'utf8', timeout: 15000,
});

test('reports stderr even when the command succeeds', () => {
  const result = invoke("process.stdout.write('stdout-proof');process.stderr.write('stderr-proof')");
  assert.equal(result.status, 0);
  assert.match(result.stdout, /stdout-proof/);
  assert.match(result.stdout.split('--- stderr')[1] || '', /stderr-proof/);
});

test('propagates a failing child exit code and captures both streams', () => {
  const result = invoke("process.stdout.write('out');process.stderr.write('err');process.exitCode=7");
  assert.equal(result.status, 7);
  assert.match(result.stdout, /EXIT: 7/);
  assert.match(result.stdout, /err/);
});

test('runs from an explicit package directory, not the caller directory', () => {
  const result = invoke('process.stdout.write(process.cwd())', ['120000', '--cwd', 'BackEnd']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes(path.join(ROOT, 'BackEnd')));
});

test('reports genuinely empty streams with zero line counts', () => {
  const result = invoke('process.exitCode=0');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /stdout 0 lines/);
  assert.match(result.stdout, /stderr 0 lines/);
});

test('keeps a distinct log for each invocation', () => {
  const a = invoke("process.stdout.write('first')", ['120000', '--label', 'runner-test']);
  const b = invoke("process.stdout.write('second')", ['120000', '--label', 'runner-test']);
  assert.equal(a.status, 0);
  assert.equal(b.status, 0);
  const logA = /log: (.+)/.exec(a.stdout)?.[1];
  const logB = /log: (.+)/.exec(b.stdout)?.[1];
  assert.ok(logA);
  assert.ok(logB);
  assert.notEqual(logA, logB);
});

test('invalid cwd fails rather than silently running at the root', () => {
  const result = invoke('process.exitCode=0', ['120000', '--cwd', 'missing-runner-directory']);
  assert.equal(result.status, 2);
});

test('timeout has an explicit failure code and diagnostic', () => {
  const result = invoke('Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,3000)', ['100']);
  assert.equal(result.status, 124);
  assert.match(result.stdout, /TIMEOUT/);
});
