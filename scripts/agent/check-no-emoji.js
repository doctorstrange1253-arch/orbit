#!/usr/bin/env node
/**
 * check-no-emoji.js — zero-emoji guard.
 * Scans FrontEnd/src, FrontEnd/public, BackEnd (excl node_modules), docs, .agent,
 * scripts, CLAUDE.md, and the last 50 commit messages for emoji/pictograph ranges:
 * 1F000-1FAFF (emoticons/supplemental symbols/transport), 2600-26FF (misc symbols),
 * 2700-27BF (dingbats), 2B00-2BFF, FE0F, 20E3, regional indicators 1F1E6-1F1FF.
 * Arrows (2190-21FF) and technical glyphs (2300-23FF) are typography, not scanned.
 * Exits 1 on any hit.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}]/u;

const SCAN_DIRS = ['FrontEnd/src', 'FrontEnd/public', 'FrontEnd/tests', 'BackEnd/controllers', 'BackEnd/routes', 'BackEnd/models', 'BackEnd/services', 'BackEnd/middleware', 'BackEnd/config', 'BackEnd/data', 'BackEnd/tests', 'docs', '.agent', 'scripts', 'marketing'];
const SCAN_FILES = ['CLAUDE.md', 'FrontEnd/package.json', 'BackEnd/package.json'];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist']);
const hits = [];

function scanFile(p) {
  let text;
  try {
    const st = fs.statSync(p);
    if (st.size > 4 * 1024 * 1024) return;
    text = fs.readFileSync(p, 'utf8');
  } catch { return; }
  const lines = text.split('\n');
  lines.forEach((l, i) => {
    if (EMOJI.test(l)) hits.push(`${path.relative(ROOT, p)}:${i + 1}: ${l.trim().slice(0, 100)}`);
  });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p); }
    else scanFile(p);
  }
}
for (const d of SCAN_DIRS) walk(path.join(ROOT, d));
for (const f of SCAN_FILES) scanFile(path.join(ROOT, f));

// commit messages
try {
  const log = execFileSync('git', ['log', '-n', '50', '--pretty=%H %s%n%b'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  log.split('\n').forEach((l) => { if (EMOJI.test(l)) hits.push(`commit-msg: ${l.trim().slice(0, 100)}`); });
} catch { /* not a repo */ }

if (hits.length) {
  console.log(`check-no-emoji: ${hits.length} HIT(S)`);
  hits.slice(0, 50).forEach((h) => console.log('  ' + h));
  process.exit(1);
}
console.log('check-no-emoji: clean (0 emoji in scanned files + last 50 commit messages)');
