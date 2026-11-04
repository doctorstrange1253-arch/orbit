#!/usr/bin/env node
/**
 * where.js — answer "where is X": searches FILE_REGISTRY.md first, then find-file.js.
 * Usage: node scripts/agent/where.js <keyword>
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const kw = (process.argv[2] || '').toLowerCase();
if (!kw) { console.error('usage: where.js <keyword>'); process.exit(2); }

const reg = path.join(ROOT, '.agent', 'FILE_REGISTRY.md');
console.log('--- registry hits ---');
if (fs.existsSync(reg)) {
  fs.readFileSync(reg, 'utf8').split('\n').forEach((l) => { if (l.toLowerCase().includes(kw)) console.log(l); });
} else {
  console.log('(no FILE_REGISTRY.md)');
}
console.log('--- filesystem hits ---');
try {
  const out = execFileSync(process.execPath, [path.join(__dirname, 'find-file.js'), kw, '--content', kw], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  console.log(out);
} catch (e) {
  console.log((e.stdout || '') + (e.stderr || ''));
}
