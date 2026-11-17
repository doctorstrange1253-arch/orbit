const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const state = require('./supervisor-state');
const { redact } = require('./supervisor-process');
const contextEvents = new Set(['SessionStart', 'PostModelSwitch', 'PostToolUse', 'PostToolUseFailure']);
const supported = new Set([...contextEvents, 'PreCompact', 'PostCompact', 'Stop', 'StopFailure', 'SessionEnd']);
function currentState(root) {
  const file = path.join(root, '.agent/STATE.md'); state.regular(file);
  return fs.readFileSync(file, 'utf8').split(/\r?\n## (?:Historical|User-requested sleep-pause resume)/)[0];
}
function recoverySummary(root) {
  const text = currentState(root);
  const gate = text.match(/\bGATE_STATUS:\s*([^\r\n]+)/)?.[1] || text.match(/\bGATE:\s*([^\r\n]+)/)?.[1] || 'UNVERIFIED; stop until inspected';
  const task = text.match(/\bTASK(?:_ID)?:\s*([^\r\n]+)/i)?.[1] || text.match(/Phase\/task:\s*([^\r\n]+)/i)?.[1] || 'UNVERIFIED; inspect STATE';
  const completed = text.match(/LAST_COMPLETED_STEP:\s*([^\r\n]+)/)?.[1] || 'UNVERIFIED';
  const next = text.match(/(?:Immediate next|Next):\s*([^\r\n]+)/i)?.[1] || 'Read HANDOFF and inspect the last unfinished step';
  return redact(`Mission: ${root}/.agent/MISSION.md\nTASK: ${task.slice(0,400)}\nGATE: ${gate.slice(0,500)}\nLAST_COMPLETED_STEP: ${completed.slice(0,700)}\nNext: ${next.slice(0,700)}\nRestart is not gate approval; preserve completed work, private data and pending evidence.`);
}
function reminder(root, event, reason) {
  const text = currentState(root);
  const gate = text.match(/\bGATE_STATUS:\s*([^\r\n]+)/)?.[1] || text.match(/\bGATE:\s*([^\r\n]+)/)?.[1] || 'UNVERIFIED; stop until inspected';
  const next = text.match(/(?:Immediate next|Next):\s*([^\r\n]+)/i)?.[1] || 'Read HANDOFF and inspect the last unfinished step';
  return { hookSpecificOutput: { hookEventName: event, additionalContext: redact(`${reason}. Read ${root}/.agent/MISSION.md, STATE.md, HANDOFF.md, CAPABILITIES.md and the last30lines of RUN_JOURNAL.md and ERRORS.md. Files win over summaries. Current gate: ${gate.slice(0,350)}. Next: ${next.slice(0,350)}. A restart or reminder never counts as approval; CP-W0 never replaces CP-C or slice gates. Preserve completed work and private data; do not replay non-idempotent effects. Report actual limitations; never fabricate results.`).slice(0,1850) } };
}
function handleEvent(root, payload) {
  const event = payload?.hook_event_name;
  if (!supported.has(event) || payload.agent_id || (event === 'Stop' && payload.stop_hook_active)) return {};
  root = state.safeRoot(root);
  const id = payload.session_id;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) throw state.blocked('Missing or invalid hook session ID');
  let context = contextEvents.has(event) ? reminder(root, event, event === 'SessionStart' || event === 'PostModelSwitch' ? 'Amnesia event: resume the same mission' : 'Recovery reminder') : {};
  const lockFile = path.join(root, '.agent/RUNLOCK'); state.regular(lockFile, true);
  if (!fs.existsSync(lockFile)) return { ...context, systemMessage: 'Mission writer lock missing; inspect recovery state before canonical writes.' };
  const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  const owner = state.identity(lock.pid);
  if (lock.session !== id || owner.state !== 'live' || owner.processStarted !== lock.processStarted) return { ...context, systemMessage: 'Mission lock owner differs or is unverified; no canonical state was changed. Inspect before takeover.' };
  const scratch = path.join(root, '.agent/scratch'); fs.mkdirSync(scratch, { recursive: true });
  if (fs.lstatSync(scratch).isSymbolicLink()) throw state.blocked('Hook scratch directory is a symlink');
  const counterFile = path.join(scratch, `mission-hooks-${id}.json`), eventLock = counterFile + '.lock';
  let fd;
  try { fd = fs.openSync(eventLock, 'wx'); } catch (error) {
    if (error.code === 'EEXIST') return { ...context, systemMessage: 'Recovery event counter is busy; inspect a stale event lock rather than deleting it blindly.' };
    throw error;
  }
  const token = randomUUID();
  try {
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, processStarted: state.identity(process.pid).processStarted, token, timestamp: state.utc() })); fs.fsyncSync(fd);
    state.regular(counterFile, true);
    let counter = { calls: 0, recent: [], unidentifiedCalls: 0, pending: [] };
    if (fs.existsSync(counterFile)) counter = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
    const actionTypes = ['failure', 'heartbeat', ...[...supported].filter(name => name !== 'PostToolUse' && name !== 'PostToolUseFailure')];
    const pending = counter?.pending === undefined ? [] : counter.pending;
    const validAction = action => action && typeof action === 'object' && !Array.isArray(action) &&
      /^[a-f0-9]{64}$/.test(action.id || '') && actionTypes.includes(action.type) &&
      typeof action.step === 'string' && action.step.length <= 180 && !/[\r\n\0]/.test(action.step) &&
      typeof action.detail === 'string' && action.detail.length <= 500 &&
      typeof action.created === 'string' && Number.isFinite(Date.parse(action.created)) &&
      (action.snapshot === undefined || (action.type === 'PreCompact' && typeof action.snapshot === 'string' && action.snapshot.length <= 5000));
    if (!counter || !Number.isSafeInteger(counter.calls) || counter.calls < 0 || !Array.isArray(counter.recent) ||
        counter.recent.length > 512 || counter.recent.some(value => typeof value !== 'string') ||
        !Array.isArray(pending) || pending.length > 64 || !pending.every(validAction) ||
        new Set(pending.map(action => action.id)).size !== pending.length) throw state.blocked('Corrupt hook counter or pending actions require inspection');
    counter.pending = pending;
    const toolEvent = event === 'PostToolUse' || event === 'PostToolUseFailure';
    const toolId = typeof payload.tool_use_id === 'string' && payload.tool_use_id.length <= 180 && !/[\r\n\0]/.test(payload.tool_use_id) ? payload.tool_use_id : null;
    const duplicate = Boolean(toolEvent && toolId && counter.recent.includes(toolId));
    if (duplicate && !counter.pending.length) return {};
    const enqueue = (type, step, detail, snapshot) => {
      if (counter.pending.length >= 64) throw state.blocked('Pending hook delivery is full; inspect before dropping actions');
      const action = { id: state.hash(JSON.stringify([id, type, toolId || token, counter.calls])), type, step, detail: redact(detail).slice(0,500), created: state.utc() };
      if (snapshot !== undefined) action.snapshot = snapshot;
      if (!counter.pending.some(saved => saved.id === action.id)) counter.pending.push(action);
    };
    if (toolEvent && !duplicate) {
      counter.calls++;
      if (toolId) counter.recent = [...counter.recent, toolId].slice(-512);
      else counter.unidentifiedCalls = (counter.unidentifiedCalls || 0) + 1;
      if (event === 'PostToolUseFailure') enqueue('failure', toolId || 'unknown-call', `${String(payload.tool_name || 'tool').slice(0,120)} failed; inspect original tool error before retry`);
      if (counter.calls % 10 === 0) enqueue('heartbeat', String(counter.calls), 'Ten unique tool callbacks; state/registry reread is required');
    } else if (!toolEvent) {
      let snapshot;
      if (event === 'PreCompact') {
        const journalFile = path.join(root, '.agent/RUN_JOURNAL.md'); state.regular(journalFile);
        const tail = fs.readFileSync(journalFile, 'utf8').trimEnd().split(/\r?\n/).slice(-5).join('\n');
        snapshot = `${recoverySummary(root)}\n\nLast journal observations (not new approvals):\n${redact(tail).slice(-1800)}`;
      }
      enqueue(event, event === 'StopFailure' || event === 'Stop' ? 'turn' : event, event === 'StopFailure' ? redact(String(payload.error || payload.reason || 'terminal API error')).slice(0,250) : 'Lifecycle observation only; inspect unfinished work and preserve gates', snapshot);
    }
    counter.lastEvent = event; counter.updated = state.utc();
    const saveCounter = () => state.atomicWrite(counterFile, JSON.stringify(counter) + '\n');
    saveCounter();
    if (toolEvent && counter.calls % 15 === 0) context = reminder(root, event, `${counter.calls} tool calls since hook counter bootstrap; reload mission and recovery files`);
    else if (toolEvent && counter.calls % 10 === 0) context = reminder(root, event, `${counter.calls} tool calls; reread STATE and FILE_REGISTRY and retain current gate`);
    if (!counter.pending.length) return duplicate ? {} : context;
    const lease = state.acquire(root, 'MISSION-HOOK', lock.token);
    let execution;
    try {
      try { execution = state.claimExecution(lease); }
      catch (error) {
        if (error.code !== 'BLOCKED') throw error;
        return { ...context, systemMessage: 'Canonical execution is busy or changed; recovery hook preserved its scratch counter and deferred canonical writes.' };
      }
      const journalFile = path.join(root, '.agent/RUN_JOURNAL.md'); state.regular(journalFile);
      let delivered = fs.readFileSync(journalFile, 'utf8');
      while (counter.pending.length) {
        const action = counter.pending[0], marker = `hook-action:${action.id}`;
        if (!delivered.includes(marker)) {
          if (action.type === 'failure') {
            state.journal(lease, 'FAIL', 'MISSION-HOOK', action.step, `${action.detail}; ${marker}`);
          } else if (action.type === 'heartbeat') {
            state.heartbeat(lease);
            state.journal(lease, 'HEARTBEAT', 'MISSION-HOOK', action.step, `${action.detail}; ${marker}`);
          } else if (action.type === 'PreCompact') {
            const handoffFile = path.join(root, '.agent/HANDOFF.md'); state.regular(handoffFile);
            if (!fs.readFileSync(handoffFile, 'utf8').includes(marker)) {
              state.durableAppend(handoffFile, `\n## RECOVERY SNAPSHOT - ${action.created}\n\n${action.snapshot}\n\n${marker}\n`);
            }
            state.journal(lease, 'SNAPSHOT', 'MISSION-HOOK', 'compact', `Actual bounded state/journal retained before compaction; ${marker}`);
          } else if (action.type === 'Stop') {
            state.heartbeat(lease);
            state.durableAppend(journalFile, `CLEAN-END ${action.created} normal assistant turn end; outstanding background work is not declared done; ${marker}`);
          } else if (action.type === 'StopFailure') {
            state.journal(lease, 'FAIL', 'MISSION-HOOK', 'turn', `${action.detail}; ${marker}`);
          } else {
            state.journal(lease, 'EVENT', 'MISSION-HOOK', action.type, `${action.detail}; ${marker}`);
          }
          delivered += `\n${marker}\n`;
        }
        counter.pending.shift();
        saveCounter();
      }
    } finally {
      try { if (execution) state.releaseExecution(execution); }
      finally { state.release(lease); }
    }
    return context;
  } finally {
    fs.closeSync(fd);
    if (JSON.parse(fs.readFileSync(eventLock, 'utf8')).token === token) fs.unlinkSync(eventLock);
  }
}
if (require.main === module) {
  try {
    const argv = process.argv.slice(2);
    const root = argv.length === 2 && argv[0] === '--root' ? argv[1] : path.resolve(__dirname, '../..');
    if (argv.length && !(argv.length === 2 && argv[0] === '--root')) throw new Error('Usage: node recovery-hooks.js [--root <repository>]');
    const input = fs.readFileSync(0, 'utf8');
    if (Buffer.byteLength(input) > 1024 * 1024) throw new Error('Hook payload exceeded bounded input limit');
    process.stdout.write(JSON.stringify(handleEvent(root, JSON.parse(input))) + '\n');
  } catch (error) { process.stderr.write(`Recovery hook: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = { handleEvent };
