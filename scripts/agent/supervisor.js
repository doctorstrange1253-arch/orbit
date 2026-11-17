const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const state = require('./supervisor-state');
const { execute, validateCommand } = require('./supervisor-process');
function validate(options) {
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(options.taskId || '')) throw state.blocked('Invalid task ID');
  if (!Array.isArray(options.steps) || !options.steps.length) throw state.blocked('At least one step is required');
  const ids = new Set();
  for (const step of options.steps) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(step.id || '') || ids.has(step.id)) throw state.blocked('Invalid or duplicate step ID');
    ids.add(step.id); validateCommand(step.command);
    if (typeof step.idempotent !== 'boolean') throw state.blocked('Each step must declare idempotency');
    if (!['tooling', 'research', 'documents', 'application'].includes(step.scope)) throw state.blocked('Each step must declare scope');
    for (const argv of [step.check, step.retryProof, ...(step.alternatives || [])].filter(Boolean)) validateCommand(argv);
    if (step.timeoutMs !== undefined && (!Number.isFinite(step.timeoutMs) || step.timeoutMs <= 0)) throw state.blocked('Invalid step timeout');
  }
}
async function runSteps(options) {
  const result = { status: 'blocked', steps: [], reason: null };
  let lease, executionLease;
  try {
    validate(options);
    const { taskId, steps, signal } = options, root = state.safeRoot(options.root);
    lease = state.acquire(root, taskId, options.lockToken);
    executionLease = state.claimExecution(lease);
    const receipts = path.join(root, '.agent/scratch/supervisor-receipts');
    fs.mkdirSync(receipts, { recursive: true });
    if (fs.lstatSync(receipts).isSymbolicLink()) throw state.blocked('Receipt directory is a symlink');
    for (const step of steps) {
      state.gate(root, step.scope);
      if (signal?.aborted) throw state.blocked('Operation cancelled');
      const cwd = path.resolve(root, step.cwd || '.');
      const relative = path.relative(fs.realpathSync(root), fs.realpathSync(cwd));
      if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || fs.lstatSync(cwd).isSymbolicLink()) throw state.blocked('Step cwd must remain in the repository');
      const fingerprint = state.hash(JSON.stringify(step));
      const receiptPath = path.join(receipts, `${state.hash(JSON.stringify([taskId, step.id]))}.json`);
      const legacyPath = path.join(receipts, `${taskId}-${step.id}.json`);
      const readCheckpoint = file => {
        state.regular(file, true);
        if (!fs.existsSync(file)) return null;
        const bytes = fs.readFileSync(file, 'utf8');
        let data; try { data = JSON.parse(bytes); } catch { throw state.blocked('Corrupt checkpoint; inspect before replay'); }
        const validId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(value);
        const count = value => value === undefined || (Number.isSafeInteger(value) && value >= 0);
        const operation = value => value && typeof value === 'object' && !Array.isArray(value) && (
          ['running', 'spawning'].includes(value.status) || (value.status === undefined && Number.isInteger(value.code))
        );
        if (!data || typeof data !== 'object' || Array.isArray(data) || !validId(data.taskId) || !validId(data.id) ||
            typeof data.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(data.fingerprint) ||
            !['running', 'retrying', 'done', 'already_done', 'blocked', 'failed'].includes(data.status) ||
            !Array.isArray(data.attempts) || !data.attempts.every(operation) || !Array.isArray(data.checks) || !data.checks.every(operation) ||
            !(data.active === null || data.active === undefined || (operation(data.active) && ['running', 'spawning'].includes(data.active.status))) ||
            !count(data.recoveries) || !count(data.methodFailures) ||
            (data.legacySourceHash !== undefined && (typeof data.legacySourceHash !== 'string' || !/^[a-f0-9]{64}$/.test(data.legacySourceHash)))) {
          throw state.blocked('Unknown or malformed checkpoint identity/state; inspect before replay');
        }
        if (file === receiptPath) {
          if (data.taskId !== taskId || data.id !== step.id) throw state.blocked('Hashed checkpoint identity mismatch; inspect before replay');
        } else if (path.basename(file) !== `${data.taskId}-${data.id}.json`) {
          throw state.blocked('Legacy checkpoint identity does not match its path; inspect before replay');
        }
        return { data, sourceHash: state.hash(bytes) };
      };
      const hashed = readCheckpoint(receiptPath), old = readCheckpoint(legacyPath);
      const legacy = old?.data.taskId === taskId && old.data.id === step.id ? old : null;
      const candidates = [hashed?.data, legacy?.data].filter(Boolean);
      for (const saved of candidates) {
        if (saved.fingerprint !== fingerprint) throw state.blocked('Task definition changed; use a new task or inspect its checkpoint');
        if (saved.status === 'blocked') throw state.blocked('Circuit or unresolved step is blocked; inspect checkpoint before recovery');
        const unfinished = [saved.active, ...saved.attempts, ...saved.checks].filter(a => a && ['running', 'spawning'].includes(a.status));
        for (const active of unfinished) {
          const owner = state.identity(active.pid);
          if (!active.processStarted || owner.state === 'unknown' || (owner.state === 'live' && owner.processStarted === active.processStarted)) throw state.blocked('Interrupted process is live or unverified; reconcile it before replay');
        }
      }
      if (hashed && legacy && hashed.data.legacySourceHash !== legacy.sourceHash) {
        const prefix = key => JSON.stringify(hashed.data[key].slice(0, legacy.data[key].length)) === JSON.stringify(legacy.data[key]);
        if (hashed.data.legacySourceHash !== undefined || !prefix('attempts') || !prefix('checks') ||
            (hashed.data.recoveries || 0) < (legacy.data.recoveries || 0)) {
          throw state.blocked('Divergent legacy checkpoint history; inspect before replay');
        }
      }
      const receipt = hashed?.data || legacy?.data || null;
      const record = { id: step.id, status: 'running', attempts: [...(receipt?.attempts || [])], checks: [...(receipt?.checks || [])], active: null, recoveries: receipt?.recoveries || 0, legacySourceHash: legacy?.sourceHash || receipt?.legacySourceHash };
      result.steps.push(record);
      const save = () => state.atomicWrite(receiptPath, JSON.stringify({ ...record, taskId, fingerprint, updated: state.utc() }, null, 2) + '\n');
      const invoke = async (argv, purpose, attemptMethod) => {
        state.assertLease(lease); state.gate(root, step.scope);
        if (signal?.aborted) throw state.blocked('Operation cancelled');
        state.journal(lease, 'START', taskId, step.id, `${purpose}; argv SHA256 ${state.hash(JSON.stringify(argv))}`);
        record.active = { status: 'spawning', purpose, pid: null, processStarted: null }; save();
        const output = await execute(argv, { root, cwd, timeoutMs: step.timeoutMs, signal, outputLimitBytes: step.outputLimitBytes, onSpawn: (pid, logs) => {
          const owner = state.identity(pid);
          record.active = { status: 'running', purpose, pid, processStarted: owner.processStarted || null, ...logs }; save();
          state.processRecord(lease, { task: taskId, step: step.id, ...record.active, port: step.port || null });
          state.journal(lease, 'PROCESS', taskId, step.id, `PID ${pid}; port ${step.port || 'none declared'}; stdout ${logs.stdoutPath}; stderr ${logs.stderrPath}`);
          state.heartbeat(lease);
        } });
        if (attemptMethod !== undefined) { output.method = attemptMethod; record.attempts.push(output); }
        else record.checks.push(output);
        const active = record.active;
        record.active = null; save();
        state.processRecord(lease, { task: taskId, step: step.id, ...active, status: output.cleanupVerified ? 'stopped' : 'unverified', code: output.code });
        state.journal(lease, output.code === 0 ? 'DONE' : 'FAIL', taskId, step.id, `${purpose}; exit ${output.code}; ${output.classification}; stdout ${output.stdoutPath}; stderr ${output.stderrPath}`);
        return output;
      };
      if (step.check) {
        const check = await invoke(step.check, 'idempotency check');
        if (check.code === 0) { record.status = 'already_done'; record.recoveries = 0; save(); state.heartbeat(lease, `${taskId}/${step.id} verified already complete`); continue; }
        if (check.code !== 1 || check.classification !== 'deterministic') throw state.blocked('Idempotency check could not establish incomplete state');
      } else if (receipt) throw state.blocked('Existing checkpoint requires a fresh completion check before replay');
      if (receipt) { record.recoveries++; save(); if (record.recoveries >= 3) throw state.blocked('Three incomplete recoveries require operator review'); }
      let total = receipt?.attempts?.length || 0;
      let method = receipt?.attempts?.at(-1)?.method || 0;
      let methodFailures = receipt?.methodFailures || 0;
      let recovering = Boolean(receipt);
      if (recovering && !step.idempotent) throw state.blocked('Interrupted non-idempotent step requires explicit state reconciliation');
      const methods = [step.command, ...(step.alternatives || [])];
      while (total < 5) {
        if (methodFailures >= 2) { method++; methodFailures = 0; record.methodFailures = 0; save(); }
        if (!methods[method]) { record.status = 'blocked'; result.reason = 'Two same-method failures; provide a verified alternative'; break; }
        if (total > 0) {
          const schedule = options.retryDelaysMs || [5000, 15000, 45000, 120000];
          const base = schedule[Math.min(total - 1, schedule.length - 1)];
          if (!Number.isFinite(base) || base < 0 || base > 120000) throw state.blocked('Invalid retry backoff');
          await delay(Math.round(base * (0.8 + Math.random() * 0.4)), undefined, { signal });
        }
        record.status = 'running'; save();
        const attempt = await invoke(methods[method], `attempt ${total + 1}, method ${method + 1}`, method);
        total++;
        if (attempt.code === 0) {
          if (step.check) { const check = await invoke(step.check, 'completion verification'); if (check.code !== 0) { record.status = 'blocked'; result.reason = 'Command exited zero but completion check failed'; break; } }
          record.status = 'done'; record.recoveries = 0; record.methodFailures = 0; state.heartbeat(lease, `${taskId}/${step.id} verified`); break;
        }
        if (attempt.classification !== 'transient') { record.status = attempt.classification === 'blocked' ? 'blocked' : 'failed'; result.reason = 'Step requires diagnosis'; break; }
        if (!step.idempotent) {
          if (!step.retryProof) { record.status = 'blocked'; result.reason = 'Non-idempotent result needs proof before retry'; break; }
          const proof = await invoke(step.retryProof, 'no-effect retry proof');
          if (proof.code !== 0) { record.status = 'blocked'; result.reason = 'No-effect proof was not established'; break; }
        }
        methodFailures++; record.methodFailures = methodFailures;
        record.status = total >= 5 ? 'blocked' : 'retrying'; save();
      }
      if (record.status === 'running' || record.status === 'retrying') record.status = 'blocked';
      save();
      if (record.status !== 'done' && record.status !== 'already_done') { result.status = record.status; return result; }
    }
    result.status = 'done'; return result;
  } catch (error) {
    result.status = error.code === 'BLOCKED' || error.name === 'AbortError' ? 'blocked' : 'failed';
    result.reason = error.message;
    return result;
  } finally {
    const failures = [];
    if (executionLease) { try { state.releaseExecution(executionLease); } catch (error) { failures.push(error.message); } }
    if (lease) { try { state.release(lease); } catch (error) { failures.push(error.message); } }
    if (failures.length) { result.status = 'blocked'; result.reason = `Cleanup requires inspection: ${failures.join('; ')}`; }
  }
}
if (require.main === module) {
  const file = process.argv[2];
  if (!file || process.argv.length !== 3) { console.error('Usage: node scripts/agent/supervisor.js <reviewed-task.json>'); process.exitCode = 2; }
  else {
    try {
      const config = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
      const controller = new AbortController();
      process.once('SIGINT', () => controller.abort()); process.once('SIGTERM', () => controller.abort());
      runSteps({ ...config, signal: controller.signal }).then(result => { console.log(JSON.stringify(result)); process.exitCode = result.status === 'done' ? 0 : result.status === 'blocked' ? 3 : 1; }).catch(error => { console.error(error.message); process.exitCode = 2; });
    } catch (error) { console.error(error.message); process.exitCode = 2; }
  }
}
module.exports = { runSteps };
