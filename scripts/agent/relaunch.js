const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { setTimeout: delay } = require('node:timers/promises');
const state = require('./supervisor-state');
const { execute, validateCommand, redact } = require('./supervisor-process');
function buildCommand(options) {
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(options.sessionId || '')) throw state.blocked('An exact UUID session ID is required');
  const prefix = options.commandPrefix || ['claude']; validateCommand(prefix);
  if (prefix.some(value => /^--(?:model|permission|allowedTools|dangerously|allow-dangerously)/.test(value))) throw state.blocked('Launcher cannot override model or permissions');
  return [...prefix, '--resume', options.sessionId, '--print', '--input-format', 'text', '--output-format', 'stream-json', '--verbose', '--permission-prompts', 'none'];
}
function outcome(output) {
  const text = fs.readFileSync(output.stdoutPath, 'utf8');
  let messages;
  try { messages = text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)); }
  catch { messages = []; }
  const terminal = messages.filter(message => message.type === 'result' && !message.parent_tool_use_id).at(-1);
  const diagnostic = `${output.diagnostic} ${terminal?.errors?.join(' ') || ''}`;
  if ([130, 143].includes(output.code) || output.cancelled || !output.cleanupVerified || /HTTP\s*402|budget pool|quota.*exhaust|billing|authentication|credentials|permission denied|EACCES|EPERM/i.test(diagnostic)) return { kind: 'blocked', terminal, reason: 'Intentional stop, permission, quota or unverified process cleanup' };
  if (messages.some(message => message.subtype === 'permission_denied' || ['billing_error', 'authentication_failed', 'account_on_hold', 'oauth_org_not_allowed', 'cloud_credential_error'].includes(message.error))) return { kind: 'blocked', terminal, reason: 'Host reports a permission, billing or credential block' };
  if (terminal && (!Array.isArray(terminal.permission_denials) || terminal.permission_denials.length)) return { kind: 'blocked', terminal, reason: 'Permission-denial evidence is missing or nonempty' };
  if (output.code === 0) {
    if (terminal?.subtype === 'success' && terminal.is_error === false) return { kind: 'success', terminal };
    return { kind: 'blocked', terminal, reason: 'Zero exit lacks a successful terminal result' };
  }
  if (output.classification === 'transient' || /ECONNRESET|ETIMEDOUT|EAI_AGAIN|HTTP\s*(?:429|5\d\d)\b|rate.?limit|overloaded/i.test(diagnostic)) return { kind: 'transient', terminal };
  return { kind: 'blocked', terminal, reason: 'Unexpected exit requires diagnosis, not automatic replay' };
}
async function launch(options) {
  const result = { status: 'blocked', reason: null, attempts: [], checks: [] };
  let lease, runnerLock, runnerToken, receipt, receiptFile;
  try {
    if (options.allowModelCalls !== true) throw state.blocked('Explicit model-call authorization is required; no agent was started');
    const root = state.safeRoot(options.root), { taskId, sessionId, signal } = options;
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(taskId || '')) throw state.blocked('Invalid launcher task ID');
    const argv = buildCommand(options), alternatives = (options.alternativePrefixes || []).map(commandPrefix => buildCommand({ ...options, commandPrefix }));
    validateCommand(options.completionCheck); validateCommand(options.recoveryCheck);
    const promptFile = path.join(root, '.agent/RESUME_PROMPT.md'); state.regular(promptFile);
    const prompt = fs.readFileSync(promptFile, 'utf8');
    if (!prompt.trim() || Buffer.byteLength(prompt) > 1024 * 1024) throw state.blocked('Resume prompt is empty or exceeds the bounded stdin limit');
    state.gate(root, 'tooling'); lease = state.acquire(root, taskId);
    const scratch = path.join(root, '.agent/scratch'); fs.mkdirSync(scratch, { recursive: true });
    if (fs.lstatSync(scratch).isSymbolicLink()) throw state.blocked('Launcher scratch directory is a symlink');
    runnerLock = path.join(scratch, `relaunch-${sessionId}.lock`); runnerToken = randomUUID();
    const fd = fs.openSync(runnerLock, 'wx');
    try { fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, processStarted: state.identity(process.pid).processStarted, token: runnerToken, timestamp: state.utc() })); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    const fingerprint = state.hash(JSON.stringify({ taskId, argv, alternatives, completionCheck: options.completionCheck, recoveryCheck: options.recoveryCheck, prompt: state.hash(prompt) }));
    receiptFile = path.join(scratch, `relaunch-${sessionId}.json`); state.regular(receiptFile, true);
    receipt = fs.existsSync(receiptFile) ? JSON.parse(fs.readFileSync(receiptFile, 'utf8')) : { fingerprint, taskId, sessionId, launches: [], attempts: [], failedRecoveries: 0, method: 0, methodFailures: 0, active: null, circuitBlocked: false };
    if (receipt.fingerprint !== fingerprint || !Array.isArray(receipt.launches) || !Array.isArray(receipt.attempts) || !Number.isSafeInteger(receipt.failedRecoveries) || receipt.failedRecoveries < 0) throw state.blocked('Changed or invalid launcher checkpoint requires inspection');
    if (receipt.active) throw state.blocked('Interrupted launcher process must be reconciled before resuming');
    const save = () => state.atomicWrite(receiptFile, JSON.stringify({ ...receipt, updated: state.utc() }, null, 2) + '\n');
    const check = async (command, purpose) => {
      state.gate(root, 'tooling'); if (signal?.aborted) throw state.blocked('Operation intentionally cancelled');
      state.journal(lease, 'START', taskId, purpose, `Check argv SHA256 ${state.hash(JSON.stringify(command))}`);
      const output = await execute(command, { root, timeoutMs: options.checkTimeoutMs || 15000, signal, onSpawn: (pid, logs) => state.processRecord(lease, { task: taskId, purpose, status: 'running', pid, port: null, ...logs }) });
      state.processRecord(lease, { task: taskId, purpose, status: output.cleanupVerified ? 'stopped' : 'unverified', pid: output.pid, code: output.code, port: null, stdoutPath: output.stdoutPath, stderrPath: output.stderrPath });
      state.journal(lease, output.code === 0 ? 'DONE' : 'FAIL', taskId, purpose, `Exit ${output.code}; ${output.classification}; stdout ${output.stdoutPath}; stderr ${output.stderrPath}`);
      result.checks.push({ purpose, code: output.code, classification: output.classification }); return output;
    };
    const finish = (status, reason) => { receipt.status = status; save(); result.status = status; result.reason = reason || null; return result; };
    let recovering = receipt.attempts.length > 0 && receipt.status !== 'done' && receipt.status !== 'already_done';
    while (true) {
      const complete = await check(options.completionCheck, 'completion');
      if (complete.code === 0 && complete.classification === 'success') return finish('already_done');
      if (complete.code !== 1 || complete.classification !== 'deterministic') throw state.blocked('Completion check could not establish incomplete state');
      if (receipt.circuitBlocked || receipt.failedRecoveries >= 3) throw state.blocked('Three failed recoveries or a circuit require operator review');
      const now = Date.now(); receipt.launches = receipt.launches.filter(stamp => Number.isFinite(stamp) && now - stamp < 3600000);
      if (receipt.launches.length >= 5) { receipt.circuitBlocked = true; save(); throw state.blocked('Five launches in one hour; no sixth automatic agent start'); }
      if (receipt.methodFailures >= 2) { receipt.method++; receipt.methodFailures = 0; }
      const method = [argv, ...alternatives][receipt.method];
      if (!method) throw state.blocked('Two same-method failures require a reviewed alternative or operator diagnosis');
      const safe = await check(options.recoveryCheck, 'recovery');
      if (safe.code !== 0 || safe.classification !== 'success') throw state.blocked('Recovery check did not prove a safe incomplete state');
      state.gate(root, 'tooling');
      if (recovering) {
        const schedule = options.retryDelaysMs || [5000, 15000, 45000, 120000];
        const base = schedule[Math.min(receipt.attempts.length - 1, schedule.length - 1)];
        if (!Number.isFinite(base) || base < 0 || base > 120000) throw state.blocked('Invalid restart backoff');
        await delay(Math.round(base * (0.8 + Math.random() * 0.4)), undefined, { signal }); state.gate(root, 'tooling');
      }
      if (signal?.aborted) throw state.blocked('Operation intentionally cancelled');
      receipt.launches.push(Date.now()); receipt.active = { status: 'spawning', pid: null, processStarted: null }; save();
      state.journal(lease, 'START', taskId, 'launch', `Exact session ${sessionId}; argv SHA256 ${state.hash(JSON.stringify(method))}; recovery ${recovering}`);
      state.release(lease); lease = null;
      const output = await execute(method, { root, input: prompt, timeoutMs: options.timeoutMs || 600000, signal, onSpawn: (pid, logs) => {
        const owner = state.identity(pid); if (owner.state !== 'live' || !owner.processStarted) throw state.blocked('Cannot verify spawned agent identity');
        const childLock = { pid, processStarted: owner.processStarted, token: randomUUID(), session: sessionId, task: taskId, timestamp: state.utc() };
        const lockFile = path.join(root, '.agent/RUNLOCK'); const handle = fs.openSync(lockFile, 'wx');
        try { fs.writeFileSync(handle, JSON.stringify(childLock, null, 2) + '\n'); fs.fsyncSync(handle); } finally { fs.closeSync(handle); }
        receipt.active = { status: 'running', ...childLock, ...logs }; save();
        const childLease = { root, lockFile, token: childLock.token, borrowed: true };
        state.processRecord(childLease, { task: taskId, status: 'running', pid, processStarted: owner.processStarted, port: null, ...logs });
        state.journal(childLease, 'PROCESS', taskId, 'launch', `Owned agent PID ${pid}; port none; stdout ${logs.stdoutPath}; stderr ${logs.stderrPath}`); state.heartbeat(childLease);
      } });
      const lockFile = path.join(root, '.agent/RUNLOCK'); state.regular(lockFile, true);
      if (fs.existsSync(lockFile)) {
        const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
        if (lock.token !== receipt.active?.token) throw state.blocked('Agent writer ownership changed; inspect before takeover');
        const owner = state.identity(lock.pid);
        if (owner.state === 'unknown' || (owner.state === 'live' && owner.processStarted === lock.processStarted)) throw state.blocked('Agent owner is live or unverified after exit');
      }
      lease = state.acquire(root, taskId);
      const observed = outcome(output);
      if (observed.terminal && observed.terminal.session_id !== sessionId) observed.kind = 'blocked', observed.reason = 'Terminal result belongs to a different session';
      const attempt = { code: output.code, pid: output.pid, durationMs: output.durationMs, classification: observed.kind, stdoutPath: output.stdoutPath, stderrPath: output.stderrPath, method: receipt.method };
      receipt.attempts.push(attempt); receipt.active = null; result.attempts.push(attempt); save();
      state.processRecord(lease, { task: taskId, status: output.cleanupVerified ? 'stopped' : 'unverified', ...attempt, port: null });
      state.journal(lease, observed.kind === 'success' ? 'DONE' : 'FAIL', taskId, 'launch', `Exit ${output.code}; ${observed.kind}; stdout ${output.stdoutPath}; stderr ${output.stderrPath}`);
      state.gate(root, 'tooling');
      if (observed.kind === 'success') {
        const verified = await check(options.completionCheck, 'verification');
        if (verified.code !== 0 || verified.classification !== 'success') return finish('blocked', 'Normal turn ended without verified completion; explicit continuation is needed');
        receipt.failedRecoveries = 0; receipt.methodFailures = 0; receipt.method = 0; state.heartbeat(lease, `${taskId} launcher completion verified`); return finish('done');
      }
      if (observed.kind !== 'transient') return finish('blocked', observed.reason);
      if (recovering) receipt.failedRecoveries++;
      receipt.methodFailures++; receipt.status = 'retrying';
      if (receipt.failedRecoveries >= 3) receipt.circuitBlocked = true;
      save(); recovering = true;
    }
  } catch (error) { result.status = 'blocked'; result.reason = redact(error.message); return result; }
  finally {
    if (runnerLock && fs.existsSync(runnerLock) && JSON.parse(fs.readFileSync(runnerLock, 'utf8')).token === runnerToken) fs.unlinkSync(runnerLock);
    if (lease) state.release(lease);
  }
}
module.exports = { launch, buildCommand };
