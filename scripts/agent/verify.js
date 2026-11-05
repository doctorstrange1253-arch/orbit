const fs = require('node:fs');
const path = require('node:path');
const { runCommand } = require('./run');

const ROOT = path.resolve(__dirname, '../..');
const fast = process.argv.includes('--fast');
const results = [];

function step(name, command, cwd = '.', timeout = 120000) {
  console.log(`RUN ${name} in ${cwd}`);
  try {
    const result = runCommand(command, { cwd, timeout, label: name });
    results.push({ name, status: result.code === 0 ? 'PASS' : 'FAIL', code: result.code, log: path.relative(ROOT, result.logPath).replace(/\\/g, '/'), duration: result.duration });
    console.log(`${result.code === 0 ? 'PASS' : 'FAIL'} ${name}; exit ${result.code}; log ${results.at(-1).log}`);
    const summary = `${result.stdout}\n${result.stderr}`.trim().split(/\r?\n/).slice(-12);
    console.log(summary.join('\n') || '(empty output)');
  } catch (error) {
    results.push({ name, status: 'FAIL', code: 2, reason: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

step('agent-tests', 'node --test scripts/agent/*.test.js');
step('check-no-emoji', 'node scripts/agent/check-no-emoji.js');
step('sync-registry', 'node scripts/agent/sync-registry.js');

const packages = ['FrontEnd', 'BackEnd'].map((directory) => ({
  directory,
  manifest: JSON.parse(fs.readFileSync(path.join(ROOT, directory, 'package.json'), 'utf8')),
}));

for (const kind of ['typecheck', 'lint', 'test', 'build']) {
  for (const { directory, manifest } of packages) {
    const candidates = kind === 'typecheck' ? ['typecheck', 'type-check', 'check:types'] : [kind];
    const script = candidates.find((key) => manifest.scripts?.[key]);
    const name = `${directory.toLowerCase()}-${kind}`;
    if (!script || (fast && kind === 'build')) {
      results.push({ name, status: 'SKIP', reason: !script ? 'No script configured' : '--fast requested' });
      continue;
    }
    if (!fs.existsSync(path.join(ROOT, directory, 'node_modules'))) {
      results.push({ name, status: 'FAIL', code: 2, reason: 'Dependencies are not installed' });
      continue;
    }
    step(name, `npm run ${script}`, directory, kind === 'lint' ? 300000 : 540000);
  }
}

console.log('\n=== verification ===');
for (const item of results) console.log(`${item.status.padEnd(4)} ${item.name}: ${item.code === undefined ? item.reason : `exit ${item.code}`} ${item.log || ''}`);
const failed = results.filter((item) => item.status === 'FAIL');
const report = { recordedAt: new Date().toISOString(), results, pass: failed.length === 0 };
fs.writeFileSync(path.join(ROOT, '.agent/scratch/verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Summary: ${failed.length} failed; ${results.filter((item) => item.status === 'SKIP').length} skipped. Report: .agent/scratch/verification.json`);
process.exitCode = failed.length ? 1 : 0;
