const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const SCRATCH = path.join(ROOT, '.agent/scratch');

function runCommand(command, options = {}) {
  const cwd = path.resolve(ROOT, options.cwd || '.');
  const timeout = options.timeout ?? 120000;
  if (!command || !Number.isFinite(timeout) || timeout <= 0) {
    throw new Error('A command and a positive timeout are required');
  }
  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    throw new Error(`Working directory does not exist: ${cwd}`);
  }
  const started = Date.now();
  const result = spawnSync(command, {
    cwd,
    shell: process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : '/bin/sh',
    encoding: 'utf8',
    timeout,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, CI: 'true', NO_COLOR: '1', GIT_TERMINAL_PROMPT: '0', npm_config_yes: 'false' },
  });
  const timedOut = result.error?.code === 'ETIMEDOUT';
  const code = timedOut ? 124 : (result.status ?? 2);
  const stdout = result.stdout || '';
  const stderr = (result.stderr || '') + (result.error ? `\n${result.error.message}\n` : '');
  const duration = Date.now() - started;
  const label = String(options.label || 'run').replace(/[^a-z0-9-]/gi, '-');
  fs.mkdirSync(SCRATCH, { recursive: true });
  const logPath = path.join(SCRATCH, `${label}-${started}-${randomUUID().slice(0, 8)}.log`);
  const log = `CMD: ${command}\nCWD: ${cwd}\nEXIT: ${code}${timedOut ? ' (TIMEOUT)' : ''}\nDURATION: ${duration}ms\n=== STDOUT ===\n${stdout}\n=== STDERR ===\n${stderr}\n`;
  fs.writeFileSync(logPath, log, 'utf8');
  fs.writeFileSync(path.join(SCRATCH, 'last-run.log'), log, 'utf8');
  return { command, cwd, code, stdout, stderr, duration, timedOut, logPath };
}

function printResult(result) {
  const split = (text) => text ? text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n') : [];
  const stdout = split(result.stdout);
  const stderr = split(result.stderr);
  console.log(`CMD: ${result.command}`);
  console.log(`CWD: ${result.cwd}  EXIT: ${result.code}${result.timedOut ? ' (TIMEOUT)' : ''}  DUR: ${(result.duration / 1000).toFixed(1)}s`);
  console.log(`stdout ${stdout.length} lines | stderr ${stderr.length} lines | log: ${path.relative(ROOT, result.logPath).replace(/\\/g, '/')}`);
  for (const [name, lines] of [['stdout', stdout], ['stderr', stderr]]) {
    console.log(`--- ${name} first 40 ---\n${lines.slice(0, 40).join('\n') || '(empty)'}`);
    if (lines.length > 40) console.log(`--- ${name} last 40 ---\n${lines.slice(-40).join('\n')}`);
  }
}

if (require.main === module) {
  try {
    const [command, ...args] = process.argv.slice(2);
    const options = {};
    if (args.length && /^\d+$/.test(args[0])) options.timeout = Number(args.shift());
    while (args.length) {
      const flag = args.shift();
      if (!['--cwd', '--label', '--timeout'].includes(flag) || !args.length) throw new Error(`Invalid option: ${flag}`);
      options[flag.slice(2)] = flag === '--timeout' ? Number(args.shift()) : args.shift();
    }
    const result = runCommand(command, options);
    printResult(result);
    process.exitCode = result.code;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}

module.exports = { runCommand, printResult };
