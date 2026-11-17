const fs = require('node:fs');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const root = 'D:/orbit-main/orbit-main';
const state = require(path.join(root, 'scripts/agent/supervisor-state.js'));
const lockFile = path.join(root, '.agent/RUNLOCK');
const guard = path.join(root, '.agent/RUNLOCK.claim');
const host = state.identity(20196);
if (host.state !== 'live' || host.processStarted !== '2026-11-16T11:49:07.8878510Z') throw Error('Current host identity changed');
const fd = fs.openSync(guard, 'wx');
try {
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, task: 'Explicit user-authorized deck lock transfer' }));
  fs.fsyncSync(fd);
  if (fs.existsSync(path.join(root, '.agent/RUNLOCK.execution'))) throw Error('An execution lease is active; transfer blocked');
  const oldBytes = fs.readFileSync(lockFile);
  const old = JSON.parse(oldBytes);
  if (old.pid !== 21156 || old.processStarted !== '2026-11-16T06:59:05.9407950Z' || old.token !== '160e1c13-212e-418e-9099-a940f25f7650') throw Error('Old lease changed; inspect before transfer');
  const archive = path.join(root, '.agent/index', 'user-authorized-old-runlock-' + randomUUID() + '.json');
  fs.writeFileSync(archive, oldBytes, { flag: 'wx' });
  const now = new Date().toISOString();
  const token = randomUUID();
  state.atomicWrite(lockFile, JSON.stringify({ pid: 20196, processStarted: host.processStarted, timestamp: now, token, task: 'Job D / ten-slide dense deck D1', scope: 'PPT first; M-0/M1 deferred; implementation and M4 closed', transferAuthority: 'User selected Transfer ki permission for this live-owner exception; no process killed', archivedLock: path.relative(root, archive).replaceAll('\\', '/') }, null, 2) + '\n');
  const lease = { root, lockFile, token };
  state.journal(lease, 'START', 'JOB-D-D1', 'authorized-lock-transfer', 'Exact user answer Transfer ki permission overrides live-lock prohibition for this one case; old bytes archived intact, no process killed; old token revoked. PPT first, application/M4 remain closed.');
  console.log(JSON.stringify({ writer: 20196, started: host.processStarted, token, archive, archivedSha256: createHash('sha256').update(oldBytes).digest('hex') }));
} finally {
  fs.closeSync(fd);
  fs.unlinkSync(guard);
}
