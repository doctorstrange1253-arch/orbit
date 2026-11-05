#!/usr/bin/env node
/**
 * sync-registry.js — cross-checks FILE_REGISTRY.md against disk and PATHS.md rules.
 * Reports: (a) files in known agent areas missing from registry, (b) registered files
 * missing on disk, (c) suspicious names, (d) duplicate basenames, (e) misplaced
 * root-level files. Exits non-zero on problems.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const problems = [];

const regPath = path.join(ROOT, '.agent', 'FILE_REGISTRY.md');
const registry = fs.existsSync(regPath) ? fs.readFileSync(regPath, 'utf8') : '';
const registered = new Set(
  registry.split('\n')
    .filter((l) => l.startsWith('|') && l.includes('|'))
    .map((l) => l.split('|')[1].trim())
    .filter((p) => p && !p.startsWith('Path') && p !== '---')
);

// (a) files in agent-owned areas not in registry
const AREAS = ['.agent', 'scripts/agent', 'docs/plan', 'docs/design', 'docs/progress', 'FrontEnd/tests'];
function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    // scratch/ and quarantine/ are gitignored by design; never registry-checked
    if (e.isDirectory()) { if (e.name === 'scratch' || e.name === 'quarantine' || e.name === 'node_modules') continue; walk(p, out); }
    else out.push(path.relative(ROOT, p).split(path.sep).join('/'));
  }
}
const onDisk = [];
for (const a of AREAS) walk(path.join(ROOT, a), onDisk);
for (const f of onDisk) {
  if (!registered.has(f)) problems.push(`(a) not in registry: ${f}`);
}

for (const f of registered) {
  if (/[,*+]/.test(f) || path.isAbsolute(f) || f.split('/').includes('..')) {
    problems.push(`(b) registry entry is not a literal project-relative path: ${f}`);
  } else if (!fs.existsSync(path.join(ROOT, f))) {
    problems.push(`(b) registered but missing on disk: ${f}`);
  }
}

// (c) suspicious names anywhere (excluding node_modules/.git/dist)
const SUSPICIOUS = /(^|\/)(tmp|temp|final|new|copy|old|backup|bak|v2|v3|untitled|test2?|utils2)[-_.]/i;
const UNDERSCORE = /(^|\/)_[^/]+$/;
const seen = new Map();
function walkAll(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.isDirectory()) {
      const relative = path.relative(ROOT, path.join(dir, e.name)).split(path.sep).join('/');
      if (['.git', 'node_modules', 'dist'].includes(e.name) || ['.agent/scratch', '.agent/quarantine', 'FrontEnd/test-results', 'FrontEnd/playwright-report'].includes(relative)) continue;
      walkAll(path.join(dir, e.name));
    } else {
      const p = path.join(dir, e.name);
      const rel = path.relative(ROOT, p).split(path.sep).join('/');
      if (SUSPICIOUS.test(rel) || UNDERSCORE.test(rel)) problems.push(`(c) suspicious name: ${rel}`);
      const base = e.name;
      if (!seen.has(base)) seen.set(base, []);
      seen.get(base).push(rel);
    }
  }
}
walkAll(ROOT);

// (d) duplicate basenames (whitelist = normal multi-instance config names)
const COMMON = new Set(['.gitignore', '.env', '.env.example', '.dockerignore', 'package.json', 'package-lock.json', 'index.js', 'index.css', 'index.html', 'App.jsx', 'App.css', 'vite.config.js', 'eslint.config.js', 'capacitor.config.json', 'vercel.json', 'Dockerfile', 'build.gradle', 'splash.png', 'ic_launcher.png', 'ic_launcher_background.png', 'ic_launcher_foreground.png', 'ic_launcher_round.png', 'ic_launcher_background.xml']);
// known same-name pairs: admin vs app namespaces, backend vs frontend services.
// These are by-design mirrors (admin shell duplicates app components); flagged
// once in the recovery report, not per-run. Expansion policy: add a name here
// only after confirming both copies are intentional, with a comment.
const KNOWN_PAIRS = new Set(['honours.js', 'Toast.jsx', 'Moderation.jsx', 'Sessions.jsx', 'useOnlineUsers.js', 'BossCeremony.jsx', 'PactHall.jsx', 'Observatory.jsx']);
for (const [base, paths] of seen) {
  if (paths.length > 1 && !base.endsWith('.md') && !COMMON.has(base) && !KNOWN_PAIRS.has(base)) problems.push(`(d) duplicate basename ${base}: ${paths.join(', ')}`);
}

// (e) misplaced root-level files (allowed: dotfiles/dirs, package files, vercel.json, config)
const ALLOWED_ROOT = new Set(['vercel.json', 'CLAUDE.md']);
for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (e.isDirectory()) continue;
  if (e.name.startsWith('.')) continue;
  if (ALLOWED_ROOT.has(e.name)) continue;
  if (/\.(json|js|mjs|ts|html|css|yml|yaml|toml|lock)$/.test(e.name)) continue;
  problems.push(`(e) unexpected root file: ${e.name}`);
}

try {
  const commands = [
    ['diff', '--name-only', '-z'],
    ['diff', '--cached', '--name-only', '-z'],
    ['ls-files', '--others', '--exclude-standard', '-z'],
  ];
  const changed = new Set(commands.flatMap((args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean)));
  for (const file of changed) {
    if (!registered.has(file)) problems.push(`(a) changed file not in registry: ${file}`);
  }
} catch (error) { problems.push(`git inventory unavailable: ${error.code || error.status}`); }

console.log('sync-registry report');
console.log('registered entries:', registered.size, '| files in agent areas:', onDisk.length);
if (problems.length) {
  console.log(`PROBLEMS (${problems.length}):`);
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}
console.log('no problems');
