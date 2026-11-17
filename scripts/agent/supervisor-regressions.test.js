const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const state = require('./supervisor-state');
const { runSteps } = require('./supervisor');
const cmd = code => [process.execPath, '-e', code];
function fixture() {
  const root = fs.mkdtempSync(path.resolve(__dirname, '../../.agent/scratch/supervisor-review-'));
  fs.mkdirSync(path.join(root, '.agent'));
  fs.writeFileSync(path.join(root, '.agent/STATE.md'), '# STATE\nGATE: OPEN(C tooling only)\nHEARTBEAT: pending\nLAST_COMPLETED_STEP: none\n');
  fs.writeFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), '# RUN JOURNAL\n');
  return root;
}
const read = (root, file) => fs.readFileSync(path.resolve(root, file), 'utf8');
const checkpoint = (root, task = 'REVIEW', id = 'one') => read(root, `.agent/scratch/supervisor-receipts/${state.hash(JSON.stringify([task, id]))}.json`);
const step = extra => ({ id: 'one', scope: 'tooling', idempotent: true, command: cmd('require("fs").writeFileSync("effect","once")'), check: cmd('process.exit(require("fs").existsSync("effect")?0:1)'), ...extra });
const run = (root, item, taskId = 'REVIEW') => runSteps({ root, taskId, steps: [item], retryDelaysMs: [1, 2, 4, 8] });
test('repository containment rejects a symlinked ancestor before external execution', async () => {
  const root = fixture(); const outside = fixture();
  fs.mkdirSync(path.join(outside, 'subdir'));
  fs.symlinkSync(outside, path.join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  try {
    const result = await run(root, { ...step({ check: undefined, cwd: 'escape/subdir' }), command: cmd('require("fs").writeFileSync("outside-effect","bad")') });
    assert.equal(result.status, 'blocked');
    assert.equal(fs.existsSync(path.join(outside, 'subdir/outside-effect')), false);
  } finally { fs.unlinkSync(path.join(root, 'escape')); }
});
test('quoted JSON credentials do not reach logs, diagnostics or receipts', async () => {
  const root = fixture();
  const code = 'const value=JSON.stringify({token:"TOPSECRET",password:"PRIVATE",api_key:"KEYVALUE"});console.log(value);console.error(value);process.exit(2)';
  const result = await run(root, step({ command: cmd(code), check: undefined }));
  const output = result.steps[0].attempts[0];
  const artifacts = [read(root, output.stdoutPath), read(root, output.stderrPath), output.diagnostic, checkpoint(root)];
  for (const text of artifacts) for (const secret of ['TOPSECRET', 'PRIVATE', 'KEYVALUE']) assert(!text.includes(secret), `Secret leaked: ${secret}`);
});
test('diagnostic truncation cannot remove a credential label and expose its value', async () => {
  const root = fixture();
  const code = 'process.stdout.write("token=TOPSECRET"+String.fromCharCode(10)+"x".repeat(8182));process.exitCode=2';
  const result = await run(root, step({ command: cmd(code), check: undefined }));
  const output = result.steps[0].attempts[0];
  assert(!output.diagnostic.includes('TOPSECRET'));
  assert(!checkpoint(root).includes('TOPSECRET'));
});
test('a terminal attempt stays counted when the following journal write fails', async () => {
  const root = fixture(); const original = state.journal;
  state.journal = (...args) => {
    if (args[1] === 'FAIL' && String(args[4]).startsWith('attempt')) throw new Error('Injected journal I/O failure');
    return original(...args);
  };
  try {
    const result = await run(root, step({ command: cmd('console.error("HTTP 503");process.exit(1)'), check: undefined }));
    assert.equal(result.status, 'failed');
  } finally { state.journal = original; }
  const receipt = JSON.parse(checkpoint(root));
  assert.equal(receipt.attempts.length, 1);
  assert.equal(receipt.attempts[0].code, 1);
  assert.equal(receipt.active, null);
});
test('an execution-lease cleanup error still releases the writer and returns a controlled result', async () => {
  const root = fixture(); const original = state.releaseExecution;
  state.releaseExecution = () => { throw new Error('Injected missing execution lease'); };
  let result;
  try { result = await run(root, step()); } finally { state.releaseExecution = original; }
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /cleanup|execution lease/i);
  assert.equal(fs.existsSync(path.join(root, '.agent/RUNLOCK')), false);
});
test('verified complete rechecks never consume the incomplete-recovery circuit', async () => {
  const root = fixture(); const item = step({ command: cmd('require("fs").appendFileSync("effect","x")') });
  const first = await run(root, item); assert.equal(first.status, 'done');
  for (let index = 0; index < 4; index++) {
    const result = await run(root, item);
    assert.equal(result.status, 'done', result.reason);
    assert.equal(result.steps[0].status, 'already_done');
  }
  assert.equal(read(root, 'effect'), 'x');
});
test('method success clears its failure streak before a later incomplete recovery', async () => {
  const root = fixture();
  const item = step({ command: cmd('console.error("HTTP 503");process.exit(1)'), alternatives: [cmd('require("fs").writeFileSync("effect","once")')] });
  assert.equal((await run(root, item)).status, 'done');
  fs.unlinkSync(path.join(root, 'effect'));
  const result = await run(root, item);
  assert.equal(result.status, 'done', result.reason);
  assert.equal(read(root, 'effect'), 'once');
});
test('different valid task and step pairs have independent checkpoint identities', async () => {
  const root = fixture();
  const first = await run(root, step({ id: 'b', check: undefined, command: cmd('console.log("first")') }), 'sync-a');
  assert.equal(first.status, 'done');
  const second = await run(root, step({ id: 'a-b', check: undefined, command: cmd('console.log("second")') }), 'sync');
  assert.equal(second.status, 'done', second.reason);
});
function receiptFixture(root, item, { task = 'REVIEW', id = 'one', legacy = false, value } = {}) {
  const dir = path.join(root, '.agent/scratch/supervisor-receipts');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, legacy ? `${task}-${id}.json` : `${state.hash(JSON.stringify([task, id]))}.json`);
  const bytes = typeof value === 'string' ? value : JSON.stringify(value);
  fs.writeFileSync(file, bytes);
  return { file, bytes };
}
const completeReceipt = item => ({ taskId: 'REVIEW', id: 'one', fingerprint: state.hash(JSON.stringify(item)), status: 'done', attempts: [], checks: [], active: null, recoveries: 0 });
const guardedStep = () => step({ check: cmd('require("fs").writeFileSync("check-effect","ran");process.exit(1)') });
for (const scenario of ['anonymous', 'missing-task', 'missing-step', 'wrong-owner-path', 'null', 'array', 'bad-attempts', 'bad-checks', 'bad-active', 'bad-fingerprint', 'unknown-status', 'negative-recoveries', 'corrupt-json']) {
  test(`legacy checkpoint ${scenario} blocks before any command and preserves its bytes`, async () => {
    const root = fixture(), item = guardedStep(), value = completeReceipt(item);
    if (scenario === 'anonymous') { delete value.taskId; delete value.id; }
    if (scenario === 'missing-task') delete value.taskId;
    if (scenario === 'missing-step') delete value.id;
    if (scenario === 'wrong-owner-path') value.taskId = 'OTHER';
    if (scenario === 'bad-attempts') value.attempts = {};
    if (scenario === 'bad-checks') value.checks = {};
    if (scenario === 'bad-active') value.active = { status: 'mystery' };
    if (scenario === 'bad-fingerprint') value.fingerprint = 'bad';
    if (scenario === 'unknown-status') value.status = 'mystery';
    if (scenario === 'negative-recoveries') value.recoveries = -1;
    const payload = scenario === 'null' ? null : scenario === 'array' ? [] : scenario === 'corrupt-json' ? '{' : value;
    const saved = receiptFixture(root, item, { legacy: true, value: payload });
    const result = await run(root, item);
    assert.equal(result.status, 'blocked', result.reason);
    assert.equal(fs.existsSync(path.join(root, 'effect')), false);
    assert.equal(fs.existsSync(path.join(root, 'check-effect')), false);
    assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
  });
}
test('a mismatched hashed checkpoint blocks before its completion check', async () => {
  const root = fixture(), item = guardedStep();
  const saved = receiptFixture(root, item, { value: { ...completeReceipt(item), taskId: 'OTHER' } });
  const result = await run(root, item);
  assert.equal(result.status, 'blocked', result.reason);
  assert.equal(fs.existsSync(path.join(root, 'check-effect')), false);
  assert.equal(fs.existsSync(path.join(root, 'effect')), false);
  assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
});
test('a matching completed legacy receipt still requires a fresh completion check', async () => {
  const root = fixture(), item = step({ check: cmd('require("fs").writeFileSync("checked","fresh");process.exit(0)') });
  const saved = receiptFixture(root, item, { legacy: true, value: completeReceipt(item) });
  const result = await run(root, item);
  assert.equal(result.status, 'done', result.reason);
  assert.equal(result.steps[0].status, 'already_done');
  assert.equal(read(root, 'checked'), 'fresh');
  assert.equal(fs.existsSync(path.join(root, 'effect')), false);
  assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
});
test('a valid foreign colliding legacy pair does not consume another task checkpoint', async () => {
  const root = fixture(), item = step({ id: 'a-b', check: undefined });
  const saved = receiptFixture(root, item, { task: 'sync-a', id: 'b', legacy: true, value: { ...completeReceipt(item), taskId: 'sync-a', id: 'b' } });
  const result = await run(root, item, 'sync');
  assert.equal(result.status, 'done', result.reason);
  assert.equal(read(root, 'effect'), 'once');
  assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
});
test('a completed legacy migration preserves history across later fresh rechecks', async () => {
  const root = fixture(), item = step({ check: cmd('require("fs").appendFileSync("checked","x");process.exit(0)') });
  const saved = receiptFixture(root, item, { legacy: true, value: completeReceipt(item) });
  for (let index = 0; index < 2; index++) {
    const result = await run(root, item);
    assert.equal(result.status, 'done', result.reason);
    assert.equal(result.steps[0].status, 'already_done');
  }
  assert.equal(read(root, 'checked'), 'xx');
  assert.equal(fs.existsSync(path.join(root, 'effect')), false);
  assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
});
test('divergent legacy attempt history cannot disappear behind a hashed checkpoint', async () => {
  const root = fixture(), item = guardedStep();
  receiptFixture(root, item, { value: completeReceipt(item) });
  const saved = receiptFixture(root, item, { legacy: true, value: { ...completeReceipt(item), attempts: [{ code: 1, classification: 'transient', method: 0 }] } });
  const result = await run(root, item);
  assert.equal(result.status, 'blocked', result.reason);
  assert.equal(fs.existsSync(path.join(root, 'check-effect')), false);
  assert.equal(fs.existsSync(path.join(root, 'effect')), false);
  assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
});
test('an unverified active legacy process blocks before the completion check', async () => {
  const root = fixture(), item = guardedStep();
  receiptFixture(root, item, { legacy: true, value: { ...completeReceipt(item), status: 'running', active: { status: 'spawning', pid: null, processStarted: null } } });
  const result = await run(root, item);
  assert.equal(result.status, 'blocked', result.reason);
  assert.equal(fs.existsSync(path.join(root, 'check-effect')), false);
  assert.equal(fs.existsSync(path.join(root, 'effect')), false);
});
for (const scenario of ['anonymous', 'live-matching', 'definition-changed', 'blocked']) {
  test(`a hashed checkpoint cannot hide a ${scenario} legacy checkpoint`, async () => {
    const root = fixture(), item = guardedStep();
    receiptFixture(root, item, { value: completeReceipt(item) });
    const value = completeReceipt(item);
    if (scenario === 'anonymous') { delete value.taskId; delete value.id; }
    if (scenario === 'live-matching') value.active = { status: 'running', pid: process.pid, processStarted: state.identity(process.pid).processStarted };
    if (scenario === 'definition-changed') value.fingerprint = 'f'.repeat(64);
    if (scenario === 'blocked') value.status = 'blocked';
    const saved = receiptFixture(root, item, { legacy: true, value });
    const result = await run(root, item);
    assert.equal(result.status, 'blocked', result.reason);
    assert.equal(fs.existsSync(path.join(root, 'check-effect')), false);
    assert.equal(fs.existsSync(path.join(root, 'effect')), false);
    assert.equal(fs.readFileSync(saved.file, 'utf8'), saved.bytes);
  });
}
