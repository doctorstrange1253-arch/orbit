const fs = require('node:fs');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const identities = new Map();
const utc = () => new Date().toISOString();
const hash = value => createHash('sha256').update(value).digest('hex');
function blocked(message) { const error = new Error(message); error.code = 'BLOCKED'; return error; }
function identity(pid) {
  if (!Number.isInteger(pid) || pid < 1) return { state: 'unknown' };
  try { process.kill(pid, 0); } catch (error) { return { state: error.code === 'ESRCH' ? 'dead' : 'unknown' }; }
  if (pid === process.pid && identities.has(pid)) return identities.get(pid);
  let started;
  if (process.platform === 'win32') {
    const code = `$v=Get-CimInstance Win32_Process -Filter "ProcessId=${pid}"; if($v){$v.CreationDate.ToUniversalTime().ToString("o")}else{exit 3}`;
    const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', code], { encoding: 'utf8', timeout: 10000, windowsHide: true });
    if (result.status === 3) return { state: 'dead' };
    if (result.status !== 0) return { state: 'unknown' };
    started = result.stdout.trim();
  } else {
    try { started = fs.readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ').at(-1).split(' ')[19]; } catch { return { state: 'unknown' }; }
  }
  if (!started) return { state: 'unknown' };
  const result = { state: 'live', processStarted: started };
  if (pid === process.pid) identities.set(pid, result);
  return result;
}
function safeRoot(root) {
  root = path.resolve(root);
  for (const target of [root, path.join(root, '.agent')]) {
    const stat = fs.lstatSync(target);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw blocked('Root or .agent is not a real directory');
  }
  return root;
}
function regular(file, optional = false) {
  try { const s = fs.lstatSync(file); if (!s.isFile() || s.isSymbolicLink()) throw blocked('Unsafe file path'); }
  catch (error) { if (!(optional && error.code === 'ENOENT')) throw error; }
}
function durableAppend(file, line) {
  regular(file, true);
  const fd = fs.openSync(file, 'a');
  try { fs.writeFileSync(fd, line + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function atomicWrite(file, text) {
  regular(file, true);
  const temp = path.join(path.dirname(file), `.supervisor-${randomUUID()}.pending`);
  const fd = fs.openSync(temp, 'wx');
  try { fs.writeFileSync(fd, text); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  try { fs.renameSync(temp, file); } catch (error) { error.pendingPath = temp; throw error; }
}
function acquire(root, task, token) {
  root = safeRoot(root);
  const lockFile = path.join(root, '.agent/RUNLOCK');
  const guard = path.join(root, '.agent/RUNLOCK.claim');
  let fd;
  try { fd = fs.openSync(guard, 'wx'); } catch (error) { if (error.code === 'EEXIST') throw blocked('Lock claim is held; inspect its owner'); throw error; }
  try {
    const own = identity(process.pid);
    if (own.state !== 'live') throw blocked('Cannot verify writer process identity');
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, ...own, timestamp: utc() })); fs.fsyncSync(fd);
    regular(lockFile, true);
    if (fs.existsSync(lockFile)) {
      const bytes = fs.readFileSync(lockFile, 'utf8');
      let old; try { old = JSON.parse(bytes); } catch { throw blocked('Malformed RUNLOCK requires recovery inspection'); }
      const status = identity(old.pid);
      if (status.state === 'live' && old.processStarted === status.processStarted && token && token === old.token) return { root, lockFile, token, borrowed: true };
      if (status.state !== 'dead' && !(status.state === 'live' && status.processStarted !== old.processStarted)) throw blocked('Writer lock belongs to a live or unknown owner');
      if (!Number.isInteger(old.pid) || !old.processStarted || !old.token) throw blocked('Invalid lock identity; manual inspection required');
      const archive = path.join(root, '.agent/scratch');
      fs.mkdirSync(archive, { recursive: true });
      fs.writeFileSync(path.join(archive, `stale-runlock-${randomUUID()}.json`), bytes, { flag: 'wx' });
      fs.unlinkSync(lockFile);
    }
    const lock = { pid: process.pid, processStarted: own.processStarted, timestamp: utc(), token: randomUUID(), task };
    const handle = fs.openSync(lockFile, 'wx');
    try { fs.writeFileSync(handle, JSON.stringify(lock, null, 2) + '\n'); fs.fsyncSync(handle); } finally { fs.closeSync(handle); }
    return { root, lockFile, token: lock.token, borrowed: false };
  } finally { fs.closeSync(fd); fs.unlinkSync(guard); }
}
function assertLease(lease) {
  regular(lease.lockFile);
  const lock = JSON.parse(fs.readFileSync(lease.lockFile, 'utf8'));
  if (lock.token !== lease.token) throw blocked('Writer lease changed');
}
function release(lease) {
  assertLease(lease);
  if (!lease.borrowed) fs.unlinkSync(lease.lockFile);
}
function claimExecution(lease) {
  assertLease(lease);
  const file = path.join(lease.root, '.agent/RUNLOCK.execution');
  let fd;
  try { fd = fs.openSync(file, 'wx'); } catch (error) { if (error.code === 'EEXIST') throw blocked('Another supervisor holds the execution lease; inspect before recovery'); throw error; }
  const claim = { pid: process.pid, processStarted: identity(process.pid).processStarted, token: randomUUID(), timestamp: utc() };
  try { fs.writeFileSync(fd, JSON.stringify(claim)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  return { file, token: claim.token };
}
function releaseExecution(claim) {
  regular(claim.file);
  if (JSON.parse(fs.readFileSync(claim.file, 'utf8')).token !== claim.token) throw blocked('Execution lease changed');
  fs.unlinkSync(claim.file);
}
function processRecord(lease, record) {
  assertLease(lease);
  durableAppend(path.join(lease.root, '.agent/STATE.md'), `SUPERVISED_PROCESS: ${JSON.stringify({ ...record, observed: utc() })}`);
}
function gate(root, scope) {
  const file = path.join(root, '.agent/STATE.md'); regular(file);
  const text = fs.readFileSync(file, 'utf8');
  const current = text.split(/\r?\n## (?:Historical|User-requested sleep-pause resume)/)[0];
  const status = current.match(/\bGATE_STATUS:\s*([^\r\n]+)/)?.[1] || current.match(/\bGATE:\s*([^\r\n]+)/)?.[1] || '';
  if (!status.startsWith('OPEN') || /WORK_STATUS:\s*(?:PAUSED|HOLD|ABORT)|Work status:\s*PAUSED/i.test(current)) throw blocked('Gate is waiting, paused, missing or closed');
  if (!['tooling', 'research', 'documents'].includes(scope)) {
    if (!(scope === 'application' && /AUTHORIZED_SCOPE:\s*IMPLEMENTATION\b/.test(current))) throw blocked('Application scope is not authorized');
  }
}
function journal(lease, kind, task, step, evidence) {
  assertLease(lease);
  const line = `${kind} ${task} step ${step} ${utc()} ${String(evidence).replace(/[\r\n]/g, ' ')}`;
  durableAppend(path.join(lease.root, '.agent/RUN_JOURNAL.md'), line);
}
function heartbeat(lease, completed) {
  assertLease(lease);
  const file = path.join(lease.root, '.agent/STATE.md'); regular(file);
  let text = fs.readFileSync(file, 'utf8');
  const stamp = utc();
  text = /HEARTBEAT: [^\r\n]+/.test(text) ? text.replace(/HEARTBEAT: [^\r\n]+/, `HEARTBEAT: ${stamp}`) : text + `\nHEARTBEAT: ${stamp}\n`;
  if (completed) text = /LAST_COMPLETED_STEP: [^\r\n]+/.test(text) ? text.replace(/LAST_COMPLETED_STEP: [^\r\n]+/, `LAST_COMPLETED_STEP: ${completed}`) : text + `LAST_COMPLETED_STEP: ${completed}\n`;
  atomicWrite(file, text);
}
module.exports = { utc, hash, blocked, identity, safeRoot, regular, durableAppend, atomicWrite, acquire, assertLease, release, claimExecution, releaseExecution, processRecord, gate, journal, heartbeat };
