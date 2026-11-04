#!/usr/bin/env node
/**
 * find-file.js — dependency-free file walker (no find/grep/rg needed).
 * Usage:
 *   node scripts/agent/find-file.js <name-or-pattern> [--content <text>] [--root <dir>]
 * Case-insensitive substring match on path; --content also matches file text.
 * Skips .git and node_modules (reported separately). Prints path, size, mtime.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const pattern = (args[0] || '').toLowerCase();
const contentIdx = args.indexOf('--content');
const content = contentIdx >= 0 ? (args[contentIdx + 1] || '').toLowerCase() : null;
const rootIdx = args.indexOf('--root');
const root = rootIdx >= 0 ? path.resolve(ROOT, args[rootIdx + 1]) : ROOT;

if (!pattern && !content) { console.error('usage: find-file.js <pattern> [--content <text>] [--root <dir>]'); process.exit(2); }

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist']);
let skipped = 0;
const results = [];

function walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) { skipped++; continue; }
      walk(p);
    } else if (e.isFile()) {
      const rel = path.relative(root, p);
      const hitName = pattern && (rel.toLowerCase().includes(pattern) || e.name.toLowerCase().includes(pattern));
      let hitContent = false;
      if (content && !hitName) {
        try {
          const st = fs.statSync(p);
          if (st.size < 2 * 1024 * 1024) {
            hitContent = fs.readFileSync(p, 'utf8').toLowerCase().includes(content);
          }
        } catch { /* unreadable */ }
      }
      if (hitName || hitContent) {
        const st = fs.statSync(p);
        results.push(`${rel}  (${st.size} B, ${st.mtime.toISOString().slice(0, 16)}Z)${hitContent && !hitName ? '  [content]' : ''}`);
      }
    }
  }
}
walk(root);
console.log(`root: ${root}\npattern: ${pattern || '-'}  content: ${content || '-'}  skipped dirs (.git/node_modules/dist): ${skipped}\nmatches: ${results.length}`);
results.sort().forEach((r) => console.log(r));
