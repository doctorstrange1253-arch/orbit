const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root, '.agent/index');
const state = require(path.join(root, 'scripts/agent/supervisor-state.js'));
state.assertLease({ lockFile: path.join(root, '.agent/RUNLOCK'), token: '160e1c13-212e-418e-9099-a940f25f7650' });
const input = process.argv[2];
const claims = fs.readFileSync(path.join(base, 'brief-claims.ndjson'), 'utf8').trim().split('\n').map(JSON.parse);
const expected = new Set(claims.map(c => c.id));
(async () => {
  const parts = [];
  for await (const line of readline.createInterface({ input: fs.createReadStream(input, { encoding: 'utf8' }), crlfDelay: Infinity })) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('"report": ')) continue;
    const text = JSON.parse(trimmed.slice(10).replace(/,$/, ''));
    if (typeof text !== 'string') throw Error('Report is not text');
    parts.push(JSON.parse(text.replace(/^```json\s*/, '').replace(/\s*```$/, '')));
  }
  if (parts.length !== 4) throw Error('Expected four real verification returns');
  const all = [], seen = new Set(), missing = [], errors = [];
  for (const report of parts) {
    if (!Array.isArray(report.rows) || !Array.isArray(report.coverageIds)) throw Error('Report contract mismatch');
    for (const id of report.coverageIds) {
      if (!expected.has(id) || seen.has(id)) throw Error('Unknown/duplicate covered input ID: ' + id);
      seen.add(id);
      if (!report.rows.some(r => r.inputId === id)) missing.push(id);
    }
    for (const row of report.rows) {
      if (!expected.has(row.inputId) || !['CONFIRMED', 'CORRECTED', 'UNVERIFIED', 'STALE'].includes(row.verdict)) throw Error('Invalid verdict row');
      if (!Array.isArray(row.evidence) || !row.claim) throw Error('Missing evidence contract');
      if (row.verdict === 'CORRECTED' && !row.correction) throw Error('Correction missing replacement');
      all.push(row);
    }
    if (report.errors?.length) errors.push(...report.errors);
    if (report.omittedIds?.length) missing.push(...report.omittedIds);
  }
  for (const id of expected) if (!seen.has(id)) missing.push(id);
  const output = path.join(base, 'brief-verdicts-returned.ndjson');
  if (fs.existsSync(output)) throw Error('Returned evidence already preserved');
  for (let i = 0; i < all.length; i += 150) fs.writeFileSync(output, all.slice(i, i + 150).map(r => JSON.stringify(r)).join('\n') + '\n', { flag: i ? 'a' : 'wx' });
  const counts = all.reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {});
  fs.writeFileSync(path.join(base, 'brief-verification-summary.json'), JSON.stringify({ inputs: claims.length, coveredInputs: seen.size, atomicRows: all.length, counts, missing, errors, acceptance: 'RETURNED_CONTRACT_CHECKED; coordinator evidence spot-check pending' }, null, 2) + '\n');
  console.log(JSON.stringify({ inputs: claims.length, coveredInputs: seen.size, atomicRows: all.length, counts, missing, errors, correctionIds: all.filter(r => r.verdict === 'CORRECTED').map(r => r.inputId + ':' + r.subId) }));
})().catch(e => { console.error(e.message); process.exitCode = 1; });
