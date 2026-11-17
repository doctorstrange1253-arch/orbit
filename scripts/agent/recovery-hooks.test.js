const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { handleEvent } = require('./recovery-hooks');
const locks = require('./supervisor-state');
function fixture() {
  const root = fs.mkdtempSync(path.resolve(__dirname, '../../.agent/scratch/hook-test-'));
  fs.mkdirSync(path.join(root, '.agent'));
  for (const [name, text] of Object.entries({ MISSION: '# MISSION\nStudent=Multiverse; Mentor=Dimensions; Peer=Space.\n', STATE: '# STATE\nGATE: OPEN(C tooling only)\nTASK: TEST\nHEARTBEAT: pending\nLAST_COMPLETED_STEP: none\n', HANDOFF: '# HANDOFF\nNext: verify fixtures.\n', CAPABILITIES: '# CAPABILITIES\nLocal tests only.\n', RUN_JOURNAL: '# RUN JOURNAL\n', ERRORS: '# ERRORS\n' })) fs.writeFileSync(path.join(root, `.agent/${name}.md`), text);
  const own = locks.identity(process.pid);
  fs.writeFileSync(path.join(root, '.agent/RUNLOCK'), JSON.stringify({ pid: process.pid, processStarted: own.processStarted, token: 'fixture-token', session: 'fixture-session' }));
  return root;
}
const payload = (event, extra = {}) => ({ session_id: 'fixture-session', hook_event_name: event, ...extra });
test('startup context tells the next model to reload mission and respect its gate', () => {
  const root = fixture();
  const result = handleEvent(root, payload('SessionStart', { source: 'resume' }));
  assert.equal(result.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(result.hookSpecificOutput.additionalContext, /MISSION.md/);
  assert.match(result.hookSpecificOutput.additionalContext, /OPEN\(C tooling only\)/);
  assert.match(result.hookSpecificOutput.additionalContext, /never.*approval/i);
});
test('tool events emit a reload reminder on the fifteenth unique call, not duplicates', () => {
  const root = fixture();
  for (let i = 1; i <= 14; i++) handleEvent(root, payload('PostToolUse', { tool_name: 'Read', tool_use_id: `call-${i}` }));
  const duplicate = handleEvent(root, payload('PostToolUse', { tool_name: 'Read', tool_use_id: 'call-14' }));
  assert.equal(duplicate.hookSpecificOutput, undefined);
  const result = handleEvent(root, payload('PostToolUse', { tool_name: 'Read', tool_use_id: 'call-15' }));
  assert.match(result.hookSpecificOutput.additionalContext, /15.*tool/i);
  assert.match(result.hookSpecificOutput.additionalContext, /RUN_JOURNAL.md/);
  assert(result.hookSpecificOutput.additionalContext.length <= 1900);
});
test('the tenth tool call refreshes heartbeat without changing the gate or completed step', () => {
  const root = fixture();
  for (let i = 1; i <= 10; i++) handleEvent(root, payload('PostToolUse', { tool_name: 'Read', tool_use_id: `call-${i}` }));
  const state = fs.readFileSync(path.join(root, '.agent/STATE.md'), 'utf8');
  assert(!state.includes('HEARTBEAT: pending'));
  assert(state.includes('GATE: OPEN(C tooling only)'));
  assert(state.includes('LAST_COMPLETED_STEP: none'));
});
test('subagent events never write canonical state or journal', () => {
  const root = fixture();
  const before = fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8');
  handleEvent(root, payload('PostToolUse', { agent_id: 'worker-1', tool_use_id: 'call-1' }));
  assert.equal(fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8'), before);
});
test('a different session cannot borrow the live main writer lock', () => {
  const root = fixture();
  const before = fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8');
  const result = handleEvent(root, { session_id: 'unrelated-session', hook_event_name: 'SessionStart' });
  assert.match(result.systemMessage, /owner|lock/i);
  assert.equal(fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8'), before);
});
test('pre-compaction saves an actual file snapshot without touching the phase gate', () => {
  const root = fixture();
  handleEvent(root, payload('PreCompact'));
  const handoff = fs.readFileSync(path.join(root, '.agent/HANDOFF.md'), 'utf8');
  assert.match(handoff, /RECOVERY SNAPSHOT/);
  assert.match(handoff, /OPEN\(C tooling only\)/);
  assert(handoff.includes('Next: verify fixtures.'));
  assert(fs.readFileSync(path.join(root, '.agent/STATE.md'), 'utf8').includes('GATE: OPEN(C tooling only)'));
});
test('normal Stop writes CLEAN-END, but a failure or recursive stop does not', () => {
  const root = fixture();
  handleEvent(root, payload('StopFailure', { error: 'billing_error' }));
  let journal = fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8');
  assert.match(journal, /FAIL/); assert(!journal.includes('CLEAN-END'));
  handleEvent(root, payload('Stop', { stop_hook_active: true }));
  assert(!fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8').includes('CLEAN-END'));
  handleEvent(root, payload('Stop'));
  journal = fs.readFileSync(path.join(root, '.agent/RUN_JOURNAL.md'), 'utf8');
  assert.match(journal, /CLEAN-END/);
});
test('the actual CLI accepts hook JSON on stdin and emits valid bounded context JSON', () => {
  const root = fixture();
  const output = spawnSync(process.execPath, [path.join(__dirname, 'recovery-hooks.js'), '--root', root], { input: JSON.stringify(payload('SessionStart', { source: 'resume' })), encoding: 'utf8', timeout: 15000 });
  assert.equal(output.status, 0, output.stderr);
  const value = JSON.parse(output.stdout);
  assert.equal(value.hookSpecificOutput.hookEventName, 'SessionStart');
});
const read = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const leaseFor = root => ({ root, lockFile: path.join(root, '.agent/RUNLOCK'), token: 'fixture-token', borrowed: true });
test('a supervisor claiming execution during hook acquisition blocks canonical mutation', () => {
  const root = fixture(), lease = leaseFor(root), original = locks.acquire;
  const before = read(root, '.agent/RUN_JOURNAL.md');
  let execution;
  locks.acquire = (...args) => { execution = locks.claimExecution(lease); return original(...args); };
  try {
    const result = handleEvent(root, payload('Stop'));
    assert.equal(read(root, '.agent/RUN_JOURNAL.md'), before);
    assert.match(result.systemMessage, /execution|busy|defer|pending/i);
    assert.equal(JSON.parse(read(root, '.agent/RUNLOCK.execution')).token, execution.token);
  } finally { locks.acquire = original; if (execution) locks.releaseExecution(execution); }
});
for (const count of [10, 15]) {
  test(`the ${count}-call reload reminder is delivered while canonical execution is busy`, () => {
    const root = fixture(), lease = leaseFor(root), execution = locks.claimExecution(lease);
    const beforeState = read(root, '.agent/STATE.md'), beforeJournal = read(root, '.agent/RUN_JOURNAL.md');
    try {
      let result;
      for (let i = 1; i <= count; i++) result = handleEvent(root, payload('PostToolUse', { tool_name: 'Read', tool_use_id: `busy-${i}` }));
      assert.match(result.hookSpecificOutput.additionalContext, new RegExp(`${count}.*tool`, 'i'));
      assert.equal(read(root, '.agent/STATE.md'), beforeState);
      assert.equal(read(root, '.agent/RUN_JOURNAL.md'), beforeJournal);
    } finally { locks.releaseExecution(execution); }
  });
}
test('pre-compaction snapshots include the current task and gate beyond long opening notes', () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, '.agent/STATE.md'), '# STATE\n' + 'Opening preservation note. '.repeat(180) + '\nTASK: LONG-SNAPSHOT\nGATE: OPEN(C tooling only)\nHEARTBEAT: pending\nLAST_COMPLETED_STEP: checkpoint54verified\nNext: recheck retained-source outcomes\n## Historical\nGATE: WAITING_FOR_APPROVAL (OLD)\n');
  handleEvent(root, payload('PreCompact'));
  const handoff = read(root, '.agent/HANDOFF.md');
  assert.match(handoff, /LONG-SNAPSHOT/);
  assert.match(handoff, /OPEN\(C tooling only\)/);
  assert.match(handoff, /checkpoint54verified/);
  assert.match(handoff, /recheck retained-source outcomes/);
  assert(!handoff.includes('WAITING_FOR_APPROVAL (OLD)'));
  assert(handoff.length < 6000);
});
test('a busy-writer heartbeat is retained until a later hook can safely deliver it', () => {
  const root = fixture(), execution = locks.claimExecution(leaseFor(root));
  try { for (let i = 1; i <= 10; i++) handleEvent(root, payload('PostToolUse', { tool_use_id: `pending-${i}` })); }
  finally { locks.releaseExecution(execution); }
  handleEvent(root, payload('PostToolUse', { tool_use_id: 'pending-10' }));
  assert(!read(root, '.agent/STATE.md').includes('HEARTBEAT: pending'));
  assert.match(read(root, '.agent/RUN_JOURNAL.md'), /HEARTBEAT/);
  const counter = JSON.parse(read(root, '.agent/scratch/mission-hooks-fixture-session.json'));
  assert.equal(counter.calls, 10);
});
test('an interrupted failed-tool action is delivered on replay without recounting or duplicate journal effects', () => {
  const root = fixture(), original = locks.journal;
  let injected = false;
  locks.journal = (...args) => {
    if (!injected && args[1] === 'FAIL') { injected = true; throw new Error('Injected hook journal I/O'); }
    return original(...args);
  };
  try { assert.throws(() => handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'retry-failed' })), /Injected hook journal I\/O/); }
  finally { locks.journal = original; }
  handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'retry-failed' }));
  handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'retry-failed' }));
  const journal = read(root, '.agent/RUN_JOURNAL.md');
  assert.equal((journal.match(/failed; inspect original tool error/g) || []).length, 1);
  assert.equal(JSON.parse(read(root, '.agent/scratch/mission-hooks-fixture-session.json')).calls, 1);
  assert.equal(fs.existsSync(path.join(root, '.agent/RUNLOCK.execution')), false);
});
test('a failed pending-action acknowledgement cannot duplicate a durable tool-failure journal entry', () => {
  const root = fixture(), original = locks.atomicWrite;
  let injected = false;
  locks.atomicWrite = (file, text) => {
    if (!injected && file.endsWith('mission-hooks-fixture-session.json') && read(root, '.agent/RUN_JOURNAL.md').includes('failed; inspect original tool error')) {
      injected = true;
      throw new Error('Injected action acknowledgement failure');
    }
    return original(file, text);
  };
  try { assert.throws(() => handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'ack-failed' })), /Injected action acknowledgement/); }
  finally { locks.atomicWrite = original; }
  handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'ack-failed' }));
  handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'ack-failed' }));
  assert.equal((read(root, '.agent/RUN_JOURNAL.md').match(/failed; inspect original tool error/g) || []).length, 1);
  const counter = JSON.parse(read(root, '.agent/scratch/mission-hooks-fixture-session.json'));
  assert.equal(counter.calls, 1);
  assert.deepEqual(counter.pending, []);
});
test('malformed pending hook actions block before any canonical journal change', () => {
  const root = fixture(), before = read(root, '.agent/RUN_JOURNAL.md');
  fs.mkdirSync(path.join(root, '.agent/scratch'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agent/scratch/mission-hooks-fixture-session.json'), JSON.stringify({ calls: 1, recent: ['old-call'], pending: ['unknown-action'] }));
  assert.throws(() => handleEvent(root, payload('PostToolUseFailure', { tool_name: 'Read', tool_use_id: 'new-call' })), /counter|pending|action|inspect/i);
  assert.equal(read(root, '.agent/RUN_JOURNAL.md'), before);
});
