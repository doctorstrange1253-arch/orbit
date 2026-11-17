const fs = require('node:fs');
const path = require('node:path');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root, '.agent/index');
const state = require(path.join(root, 'scripts/agent/supervisor-state.js'));
state.assertLease({ lockFile: path.join(root, '.agent/RUNLOCK'), token: '160e1c13-212e-418e-9099-a940f25f7650' });
const docs = ['PROJECT_BRIEF.md', 'OPEN_WORK.md', 'DRIFT.md'];
const claims = [];
for (const doc of docs) {
  const text = fs.readFileSync(path.join(base, doc), 'utf8');
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || /^\|[- :|]+\|$/.test(line)) continue;
    if (/^\| (Module|Area|ID) \|/.test(line)) continue;
    const cells = line.startsWith('|') ? line.split('|').slice(1, -1).map(s => s.trim()) : [];
    const label = cells[0] || 'Narrative';
    const claim = cells.length ? cells.slice(1).join(' / ') : line.replace(/^- /, '');
    claims.push({ id: 'BV-' + String(claims.length + 1).padStart(3, '0'), document: '.agent/index/' + doc, line: index + 1, label, original: claim, kind: cells.length ? 'table-row-compound' : 'narrative-compound', status: 'PENDING', requiresAtomicVerdicts: true });
  }
}
const manifest = path.join(base, 'brief-claims.ndjson');
if (fs.existsSync(manifest)) throw Error('Claim manifest already exists; preserve it');
for (let i = 0; i < claims.length; i += 150) fs.writeFileSync(manifest, claims.slice(i, i + 150).map(c => JSON.stringify(c)).join('\n') + '\n', { flag: i ? 'a' : 'wx' });
console.log(JSON.stringify({ claims: claims.length, documents: docs, batches: Math.ceil(claims.length / 24), next: 'Return-only verification must split compound rows into atomic verdicts, never silently omit clauses.' }));
