const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { blocked } = require('./supervisor-state');
function validateCommand(argv) {
  if (!Array.isArray(argv) || !argv.length || argv.some(a => typeof a !== 'string' || a.includes('\0')) || !argv[0]) throw blocked('Command must be a nonempty argv array');
  if (/\.(?:cmd|bat)$/i.test(argv[0])) throw blocked('Batch commands need an explicit reviewed shell adapter');
}
function classify(result) {
  const text = result.diagnostic || '';
  if (/EACCES|EPERM|permission denied|not authorized|unauthorized|forbidden|missing credentials|HTTP\s*(?:401|403)\b/i.test(text)) return 'blocked';
  if (result.code === 130 || result.outputLimit || !result.cleanupVerified) return 'blocked';
  if (result.code === 0) return 'success';
  if (result.timedOut || /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ECONNREFUSED|EADDRINUSE|EBUSY|HTTP\s*(?:429|5\d\d)\b|\brate limit|temporarily unavailable/i.test(text)) return 'transient';
  return 'deterministic';
}
function redact(text) {
  return text.replace(/(Bearer\s+)[\w.+/=-]+/gi, '$1[REDACTED]').replace(/\bsk-ant-[\w-]+/g, '[REDACTED]').replace(/(["'](?:api[_-]?key|password|secret|token)["']\s*:\s*)(["'])(?:\\.|(?!\2)[^\\])*\2/gi, (_, key, quote) => `${key}${quote}[REDACTED]${quote}`).replace(/((?:api[_-]?key|password|secret|token)\s*[=:]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}
function execute(argv, options) {
  validateCommand(argv);
  const { root, cwd = root, timeoutMs = 120000, onSpawn, signal, input, outputLimitBytes = 4 * 1024 * 1024 } = options;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isSafeInteger(outputLimitBytes) || outputLimitBytes < 1) throw blocked('Invalid process limits');
  if (input !== undefined && (typeof input !== 'string' || Buffer.byteLength(input) > 1024 * 1024)) throw blocked('Process stdin input must be a string of at most 1 MiB');
  const directory = path.join(root, '.agent/scratch');
  fs.mkdirSync(directory, { recursive: true });
  if (fs.lstatSync(directory).isSymbolicLink()) throw blocked('Scratch must not be a symlink');
  const stem = path.join(directory, `supervisor-${randomUUID()}`);
  const stdoutPath = stem + '.stdout.log', stderrPath = stem + '.stderr.log';
  const stdout = fs.openSync(stdoutPath, 'wx'), stderr = fs.openSync(stderrPath, 'wx');
  return new Promise(resolve => {
    const started = Date.now();
    const result = { code: null, timedOut: false, outputLimit: false, cleanupVerified: true, stdoutPath, stderrPath, diagnostic: '' };
    const child = spawn(argv[0], argv.slice(1), { cwd, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'], env: { ...process.env, CI: 'true', NO_COLOR: '1', GIT_TERMINAL_PROMPT: '0', npm_config_yes: 'false' } });
    let stopping = false, finished = false, timer, deadline;
    const stop = reason => {
      if (stopping || finished) return;
      stopping = true;
      result.timedOut = reason === 'timeout'; result.outputLimit = reason === 'output'; result.cancelled = reason === 'cancel';
      if (child.pid) {
        if (process.platform === 'win32') {
          const kill = spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
          result.cleanupVerified = kill.status === 0 || child.exitCode !== null || child.signalCode !== null;
        } else { try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { result.cleanupVerified = error.code === 'ESRCH'; } }
      }
      deadline = setTimeout(() => { result.cleanupVerified = false; child.stdout.destroy(); child.stderr.destroy(); complete(null); }, 5000);
    };
    const streams = [{ pipe: child.stdout, fd: stdout, bytes: 0, pending: '' }, { pipe: child.stderr, fd: stderr, bytes: 0, pending: '' }];
    for (const stream of streams) {
      stream.pipe.setEncoding('utf8');
      stream.pipe.on('data', chunk => {
        stream.bytes += Buffer.byteLength(chunk);
        if (stream.bytes > outputLimitBytes) { stop('output'); return; }
        stream.pending += chunk;
        const last = stream.pending.lastIndexOf('\n');
        if (last >= 0) {
          const safe = redact(stream.pending.slice(0, last + 1));
          fs.writeSync(stream.fd, safe); stream.pending = stream.pending.slice(last + 1);
          result.diagnostic = (result.diagnostic + safe).slice(-8192);
        }
      });
    }
    const cancel = () => stop('cancel');
    const complete = code => {
      if (finished) return;
      finished = true; clearTimeout(timer); clearTimeout(deadline); signal?.removeEventListener('abort', cancel);
      for (const stream of streams) { const safe = redact(stream.pending); fs.writeSync(stream.fd, safe); result.diagnostic = (result.diagnostic + safe).slice(-8192); fs.fsyncSync(stream.fd); fs.closeSync(stream.fd); }
      result.code = result.cancelled ? 130 : result.timedOut ? 124 : result.outputLimit ? 125 : code ?? 2;
      result.durationMs = Date.now() - started; result.pid = child.pid ?? null; result.diagnostic = redact(result.diagnostic);
      result.classification = classify(result); resolve(result);
    };
    child.once('spawn', () => { try { onSpawn?.(child.pid, { stdoutPath, stderrPath }); child.stdin?.end(input); } catch (error) { result.diagnostic += error.message; stop('cancel'); } });
    child.once('error', error => { result.diagnostic += `\n${error.code || ''} ${error.message}`; });
    child.once('close', code => complete(code));
    child.stdin?.on('error', error => { result.diagnostic += `\nstdin ${error.code || ''}: ${error.message}`; });
    timer = setTimeout(() => stop('timeout'), timeoutMs);
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
  });
}
module.exports = { execute, validateCommand, classify, redact };
