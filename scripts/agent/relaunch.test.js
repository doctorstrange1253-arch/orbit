const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { launch, buildCommand } = require('./relaunch');
const locks = require('./supervisor-state');
const sessionId = '11111111-2222-4333-8444-555555555555';
const cmd = code => [process.execPath, '-e', code];
function fixture(code) {
  const root = fs.mkdtempSync(path.resolve(__dirname, '../../.agent/scratch/relaunch-test-'));
  fs.mkdirSync(path.join(root, '.agent'));
  for (const [name, text] of Object.entries({ MISSION: '# MISSION\nLocal fixture only.\n', STATE: '# STATE\nGATE: OPEN(C tooling only)\nHEARTBEAT: pending\nLAST_COMPLETED_STEP: none\n', HANDOFF: '# HANDOFF\nNext: verify local fixture.\n', CAPABILITIES: '# CAPABILITIES\nSynthetic children only.\n', RUN_JOURNAL: '# RUN JOURNAL\n', RESUME_PROMPT: 'Resume the same mission.\nKeep CP-C closed.\n' })) fs.writeFileSync(path.join(root, `.agent/${name}.md`), text);
  const child = path.join(root, 'synthetic-agent.cjs');
  fs.writeFileSync(child, `const fs=require('node:fs');const prompt=fs.readFileSync(0,'utf8');fs.writeFileSync('received-prompt',prompt);fs.writeFileSync('received-argv',JSON.stringify(process.argv.slice(2)));fs.appendFileSync('starts','x');${code}`);
  return root;
}
const success = `fs.writeFileSync('effect','once');console.log(JSON.stringify({type:'result',subtype:'success',session_id:${JSON.stringify(sessionId)},is_error:false,permission_denials:[],result:'done'}));`;
const options = root => ({ root, taskId: 'TEST', sessionId, allowModelCalls: true, commandPrefix: [process.execPath, path.join(root, 'synthetic-agent.cjs')], completionCheck: cmd('process.exit(require("fs").existsSync("effect")?0:1)'), recoveryCheck: cmd('process.exit(0)'), retryDelaysMs: [1, 2, 4, 8], timeoutMs: 6000 });
const read = (root, file) => fs.readFileSync(path.resolve(root, file), 'utf8');
test('the command resumes the exact session without changing model or permission rules', () => {
  assert.deepEqual(buildCommand({ sessionId, commandPrefix: ['C:/Tools/claude.exe'] }), ['C:/Tools/claude.exe', '--resume', sessionId, '--print', '--input-format', 'text', '--output-format', 'stream-json', '--verbose', '--permission-prompts', 'none']);
});
test('model-call authorization is required before any child or effect starts', async () => {
  const root = fixture(success);
  const result = await launch({ ...options(root), allowModelCalls: false });
  assert.equal(result.status, 'blocked');
  assert.match(result.reason, /authorization|consent|model/i);
  assert.equal(fs.existsSync(path.join(root, 'starts')), false);
});
test('a completed task is verified without launching the agent again', async () => {
  const root = fixture(success); fs.writeFileSync(path.join(root, 'effect'), 'already');
  const result = await launch(options(root));
  assert.equal(result.status, 'already_done');
  assert.equal(fs.existsSync(path.join(root, 'starts')), false);
});
test('a real synthetic child receives exact prompt and argv, with durable ownership records', async () => {
  const root = fixture(success);
  const result = await launch(options(root));
  assert.equal(result.status, 'done', result.reason);
  assert.equal(read(root, 'received-prompt'), 'Resume the same mission.\nKeep CP-C closed.\n');
  assert.deepEqual(JSON.parse(read(root, 'received-argv')), ['--resume', sessionId, '--print', '--input-format', 'text', '--output-format', 'stream-json', '--verbose', '--permission-prompts', 'none']);
  assert.equal(read(root, 'effect'), 'once');
  assert.match(read(root, '.agent/STATE.md'), /SUPERVISED_PROCESS: .*"pid":\d+/);
  assert.match(read(root, '.agent/STATE.md'), /SUPERVISED_PROCESS: .*"status":"stopped"/);
  assert(read(root, '.agent/STATE.md').includes('GATE: OPEN(C tooling only)'));
  assert.match(read(root, '.agent/RUN_JOURNAL.md'), /START TEST[\s\S]*DONE TEST/);
});
test('a live writer is not displaced even when its heartbeat is stale', async () => {
  const root = fixture(success); const lease = locks.acquire(root, 'OWNER');
  try {
    const result = await launch(options(root));
    assert.equal(result.status, 'blocked');
    assert.equal(fs.existsSync(path.join(root, 'starts')), false);
    assert.equal(JSON.parse(read(root, '.agent/RUNLOCK')).token, lease.token);
  } finally { locks.release(lease); }
});
test('a transient exit resumes only after fresh completion and recovery checks', async () => {
  const root = fixture(`if(fs.readFileSync('starts','utf8').length===1){console.error('ECONNRESET');process.exit(1)}${success}`);
  const configuration = options(root);
  configuration.recoveryCheck = cmd('require("fs").appendFileSync("recovery-checks","x");process.exit(0)');
  const result = await launch(configuration);
  assert.equal(result.status, 'done', result.reason);
  assert.equal(read(root, 'starts'), 'xx');
  assert.equal(read(root, 'effect'), 'once');
  assert.equal(read(root, 'recovery-checks'), 'xx');
});
test('quota failure stops without automatic retry or permission workaround', async () => {
  const root = fixture('console.error("HTTP 402 Budget pool quota has been exhausted");process.exit(1)');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'x');
});
test('structured permission denial prevents accepting an otherwise successful exit', async () => {
  const root = fixture(`console.log(JSON.stringify({type:'result',subtype:'success',session_id:${JSON.stringify(sessionId)},is_error:false,permission_denials:[{tool_name:'Edit',tool_use_id:'denied',tool_input:{}}],result:'blocked'}));`);
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'x');
});
test('a waiting approval gate prevents every agent launch', async () => {
  const root = fixture(success); fs.writeFileSync(path.join(root, '.agent/STATE.md'), '# STATE\nGATE: WAITING_FOR_APPROVAL (CP-W0)\n');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(fs.existsSync(path.join(root, 'starts')), false);
});
test('a gate closed during the failed attempt is preserved and blocks recovery', async () => {
  const root = fixture('fs.writeFileSync(".agent/STATE.md","# STATE\\nGATE: WAITING_FOR_APPROVAL (CP-C)\\n");console.error("HTTP 503");process.exit(1)');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'x');
  assert(read(root, '.agent/STATE.md').includes('WAITING_FOR_APPROVAL (CP-C)'));
});
test('a zero exit without a valid terminal result is not declared complete', async () => {
  const root = fixture('console.log("not a terminal result")');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'x');
});
test('an intentional SIGTERM exit is not automatically restarted', async () => {
  const root = fixture('process.exit(143)');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'x');
});
test('a terminal result from a different session cannot be accepted', async () => {
  const root = fixture('console.log(JSON.stringify({type:"result",subtype:"success",session_id:"other",is_error:false,permission_denials:[],result:"done"}))');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'x');
});
test('a failed recovery check stops before any agent effect', async () => {
  const root = fixture(success);
  const result = await launch({ ...options(root), recoveryCheck: cmd('console.error("unresolved effect");process.exit(2)') });
  assert.equal(result.status, 'blocked');
  assert.equal(fs.existsSync(path.join(root, 'starts')), false);
});
test('five launches within an hour prevent a sixth launch across separate invocations', async () => {
  const root = fixture(success);
  for (let index = 0; index < 5; index++) {
    const result = await launch(options(root));
    assert.equal(result.status, 'done', result.reason);
    fs.unlinkSync(path.join(root, 'effect'));
  }
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'xxxxx');
  assert.match(result.reason, /five|5|hour/i);
});
test('two same-method transient failures stop when no reviewed alternative is provided', async () => {
  const root = fixture('console.error("HTTP 503");process.exit(1)');
  const result = await launch(options(root));
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'xx');
});
test('three failed recoveries persist a circuit that cannot be bypassed by invoking again', async () => {
  const root = fixture('console.error("HTTP 503");process.exit(1)');
  const alternate = path.join(root, 'synthetic-alternative.cjs');
  fs.copyFileSync(path.join(root, 'synthetic-agent.cjs'), alternate);
  const configuration = { ...options(root), alternativePrefixes: [[process.execPath, alternate]] };
  const result = await launch(configuration);
  assert.equal(result.status, 'blocked');
  assert.equal(read(root, 'starts'), 'xxxx');
  const again = await launch(configuration);
  assert.equal(again.status, 'blocked');
  assert.equal(read(root, 'starts'), 'xxxx');
});
test('a verified completed effect after a transient failure is not duplicated', async () => {
  const root = fixture('fs.writeFileSync("effect","once");console.error("ECONNRESET");process.exit(1)');
  const result = await launch(options(root));
  assert.equal(result.status, 'already_done');
  assert.equal(read(root, 'starts'), 'x');
  assert.equal(read(root, 'effect'), 'once');
});
