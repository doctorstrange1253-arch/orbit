const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { runSteps } = require('./supervisor.js');
const fixtures = path.resolve(__dirname, '../../.agent/scratch');
function fixture() {
  const root = fs.mkdtempSync(path.join(fixtures, 'supervisor-test-'));
  fs.mkdirSync(path.join(root, '.agent'));
  fs.writeFileSync(path.join(root, '.agent/STATE.md'), '# STATE\nGATE: OPEN(C tooling only)\nHEARTBEAT: pending\nLAST_COMPLETED_STEP: none\n');
  fs.writeFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), '# RUN JOURNAL\n');
  return root;
}
const cmd = code => [process.execPath, '-e', code];
const step = (code, extra = {}) => ({ id: 'one', scope: 'tooling', command: cmd(code), idempotent: true, timeoutMs: 3000, ...extra });
const run = (root, steps, extra = {}) => runSteps({ root, taskId: 'TEST', steps, retryDelaysMs: [1, 2, 4, 8], ...extra });
const read = (root, name) => fs.readFileSync(path.resolve(root, name), 'utf8');
test('a successful real command preserves both streams and completes its journal step', async () => {
  const root = fixture();
  const result = await run(root, [step('console.log("OUT");console.error("ERR")')]);
  assert.equal(result.status, 'done');
  assert.equal(result.steps[0].attempts.length, 1);
  assert.match(read(root, result.steps[0].attempts[0].stdoutPath), /OUT/);
  assert.match(read(root, result.steps[0].attempts[0].stderrPath), /ERR/);
  assert.match(read(root, '.agent/RUN_JOURNAL.md'), /START TEST step one.*\n[\s\S]*DONE TEST step one/);
});
test('a verified already-complete step does not repeat its effect', async () => {
  const root = fixture();
  const result = await run(root, [step('require("fs").writeFileSync("unwanted","x")', { check: cmd('process.exit(0)') })]);
  assert.equal(result.steps[0].status, 'already_done');
  assert.equal(fs.existsSync(path.join(root, 'unwanted')), false);
});
test('a transient first failure retries safely and preserves the failed attempt', async () => {
  const root = fixture();
  const code = 'const f=require("fs");if(!f.existsSync("attempt")){f.writeFileSync("attempt","1");console.error("ECONNRESET");process.exit(1)}console.log("recovered")';
  const result = await run(root, [step(code)]);
  assert.equal(result.status, 'done');
  assert.deepEqual(result.steps[0].attempts.map(a => a.code), [1, 0]);
  assert.match(read(root, '.agent/RUN_JOURNAL.md'), /FAIL TEST step one/);
});
test('permission failure is blocked without another attempt or fallback', async () => {
  const root = fixture();
  const result = await run(root, [step('console.error("EACCES permission denied");process.exit(1)', { alternatives: [cmd('require("fs").writeFileSync("bypass","x")')] })]);
  assert.equal(result.status, 'blocked');
  assert.equal(result.steps[0].attempts.length, 1);
  assert.equal(fs.existsSync(path.join(root, 'bypass')), false);
});
test('deterministic failure is retained and never blindly retried', async () => {
  const root = fixture();
  const result = await run(root, [step('console.error("SyntaxError bad input");process.exit(2)')]);
  assert.equal(result.status, 'failed');
  assert.equal(result.steps[0].attempts.length, 1);
});
test('two same-method transient failures switch to a supplied alternative', async () => {
  const root = fixture();
  const result = await run(root, [step('console.error("HTTP 503");process.exit(1)', { alternatives: [cmd('console.log("alternate worked")')] })]);
  assert.equal(result.status, 'done');
  assert.deepEqual(result.steps[0].attempts.map(a => a.method), [0, 0, 1]);
});
test('five failed attempts trip the circuit without a sixth process', async () => {
  const root = fixture();
  const argv = cmd('const f=require("fs");f.appendFileSync("count","x");console.error("HTTP 503");process.exit(1)');
  const result = await run(root, [{ ...step(''), command: argv, alternatives: [argv, argv] }]);
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'count'), 'xxxxx');
  assert.equal(result.steps[0].attempts.length, 5);
});
test('a non-idempotent failure has no automatic replay without a state proof', async () => {
  const root = fixture();
  const result = await run(root, [step('require("fs").appendFileSync("effect","x");console.error("ECONNRESET");process.exit(1)', { idempotent: false })]);
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'effect'), 'x');
  assert.equal(result.steps[0].attempts.length, 1);
});
test('a waiting gate stops work before the command starts', async () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, '.agent/STATE.md'), '# STATE\nGATE: WAITING_FOR_APPROVAL (CP-W0)\n');
  const result = await run(root, [step('require("fs").writeFileSync("ran","x")')]);
  assert.equal(result.status, 'blocked');
  assert.equal(fs.existsSync(path.join(root, 'ran')), false);
});
test('Phase C does not permit an application-scoped command', async () => {
  const root = fixture();
  const result = await run(root, [step('require("fs").writeFileSync("ran","x")', { scope: 'application' })]);
  assert.equal(result.status, 'blocked');
  assert.equal(fs.existsSync(path.join(root, 'ran')), false);
});
test('a timeout terminates the owned command and is not a success', async () => {
  const root = fixture();
  const result = await run(root, [step('setInterval(()=>{},1000)', { timeoutMs: 150, idempotent: false })]);
  assert.equal(result.status, 'blocked');
  assert.equal(result.steps[0].attempts[0].code, 124);
  assert.equal(result.steps[0].attempts[0].cleanupVerified, true);
});
test('a step check error cannot be mistaken for an unfinished safe task', async () => {
  const root = fixture();
  const result = await run(root, [step('require("fs").writeFileSync("ran","x")', { check: cmd('console.error("EACCES");process.exit(2)') })]);
  assert.equal(result.status, 'blocked');
  assert.equal(fs.existsSync(path.join(root, 'ran')), false);
});
test('failure prevents dependent steps from starting', async () => {
  const root = fixture();
  const result = await run(root, [step('process.exit(2)'), step('require("fs").writeFileSync("dependent","x")', { id: 'two' })]);
  assert.equal(result.status, 'failed');
  assert.equal(fs.existsSync(path.join(root, 'dependent')), false);
});
test('a borrowed writer token cannot run two supervisors concurrently', async () => {
  const root = fixture();
  const locks = require('./supervisor-state');
  const lease = locks.acquire(root, 'PARENT');
  try {
    const options = { lockToken: lease.token };
    const one = run(root, [step('setTimeout(()=>{},350)')], options);
    const two = run(root, [step('require("fs").writeFileSync("second","x")', { id: 'other' })], options);
    const results = await Promise.all([one, two]);
    assert.equal(results[0].status, 'done');
    assert.equal(results[1].status, 'blocked');
    assert.equal(fs.existsSync(path.join(root, 'second')), false);
  } finally { locks.release(lease); }
});
test('an inherited live child blocks recovery even with an idempotent command', async () => {
  const root = fixture();
  const locks = require('./supervisor-state');
  const item = step('require("fs").writeFileSync("replayed","x")', { check: cmd('process.exit(1)') });
  fs.mkdirSync(path.join(root, '.agent/scratch/supervisor-receipts'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agent/scratch/supervisor-receipts/TEST-one.json'), JSON.stringify({ fingerprint: locks.hash(JSON.stringify(item)), status: 'running', attempts: [{ status: 'running', pid: process.pid, processStarted: locks.identity(process.pid).processStarted, method: 0 }], methodFailures: 0 }));
  const result = await run(root, [item]);
  assert.equal(result.status, 'blocked');
  assert.equal(fs.existsSync(path.join(root, 'replayed')), false);
});
test('process identity and stopped status are recorded in STATE, not just stdout', async () => {
  const root = fixture();
  const result = await run(root, [step('console.log("safe")')]);
  assert.equal(result.status, 'done');
  const stateText = read(root, '.agent/STATE.md');
  assert.match(stateText, /SUPERVISED_PROCESS: .*"pid":\d+/);
  assert.match(stateText, /SUPERVISED_PROCESS: .*"status":"stopped"/);
});
test('a failed completion check cannot claim a task was verified', async () => {
  const root = fixture();
  const result = await run(root, [step('console.log("not sufficient")', { check: cmd('process.exit(1)') })]);
  assert.equal(result.status, 'blocked');
  assert.equal(result.steps[0].attempts.length, 1);
  assert(!read(root, '.agent/STATE.md').includes('TEST/one verified'));
});
test('an explicit no-effect proof permits a safe non-idempotent retry', async () => {
  const root = fixture();
  const code = 'const f=require("fs");if(!f.existsSync("attempt")){f.writeFileSync("attempt","1");console.error("ECONNRESET");process.exit(1)}f.writeFileSync("effect","once")';
  const result = await run(root, [step(code, { idempotent: false, retryProof: cmd('process.exit(require("fs").existsSync("effect")?1:0)') })]);
  assert.equal(result.status, 'done');
  assert.equal(read(root, 'effect'), 'once');
  assert.equal(result.steps[0].attempts.length, 2);
});
test('excess command output is a bounded failure rather than truncated success', async () => {
  const root = fixture();
  const result = await run(root, [step('console.log("x".repeat(20000));setInterval(()=>{},1000)', { outputLimitBytes: 1024 })]);
  assert.equal(result.status, 'blocked');
  assert.equal(result.steps[0].attempts.length, 1);
  assert.equal(result.steps[0].attempts[0].outputLimit, true);
});
test('a canceled retry does not launch a later attempt', async () => {
  const root = fixture();
  const controller = new AbortController();
  const pending = run(root, [step('require("fs").appendFileSync("attempt","x");console.error("HTTP 503");process.exit(1)')], { signal: controller.signal, retryDelaysMs: [5000] });
  setTimeout(() => controller.abort(), 1500);
  const result = await pending;
  assert.equal(result.status, 'blocked');
  assert(read(root, 'attempt').length <= 1);
});
test('the argv process helper delivers a bounded multiline prompt through stdin exactly', async () => {
  const root = fixture();
  const { execute } = require('./supervisor-process');
  const input = 'Resume the same mission.\nKeep CP-C closed.\nQuotes: "one" and "two".\n';
  const result = await execute(cmd('process.stdout.write(require("fs").readFileSync(0,"utf8"))'), { root, input, timeoutMs: 3000 });
  assert.equal(result.code, 0);
  assert.equal(read(root, result.stdoutPath), input);
});
test('invalid or oversized stdin blocks before starting a process', () => {
  const root = fixture();
  const { execute } = require('./supervisor-process');
  for (const input of [{ invalid: true }, 'x'.repeat(1024 * 1024 + 1)]) {
    assert.throws(() => execute(cmd('require("fs").writeFileSync("ran","x")'), { root, input }), /input|stdin|payload/i);
  }
  assert.equal(fs.existsSync(path.join(root, 'ran')), false);
});
test('stdin is released only after the process ownership callback finishes', async () => {
  const root = fixture();
  const { execute } = require('./supervisor-process');
  const code = 'const f=require("fs");f.readFileSync(0,"utf8");process.stdout.write(String(f.existsSync("ownership-recorded")))';
  const result = await execute(cmd(code), { root, input: 'resume', timeoutMs: 3000, onSpawn: () => {
    const end = Date.now() + 400;
    while (Date.now() < end) {}
    fs.writeFileSync(path.join(root, 'ownership-recorded'), 'recorded before input');
  } });
  assert.equal(result.code, 0);
  assert.equal(read(root, result.stdoutPath), 'true');
});
