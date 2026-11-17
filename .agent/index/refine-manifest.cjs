const fs = require('node:fs');
const path = require('node:path');
const base = 'D:/orbit-main/orbit-main/.agent/index';
const state = require('D:/orbit-main/orbit-main/scripts/agent/supervisor-state.js');
state.assertLease({ lockFile: path.join(base, '../RUNLOCK'), token: '6ea73f5a-3898-49c5-800c-0610667d07d2' });
const rows = fs.readFileSync(path.join(base, 'manifest.ndjson'), 'utf8').trim().split('\n').map(JSON.parse);
let corrected = 0;
for (const row of rows) {
  if (/^docs\/pitch\/deck\/tooling\//.test(row.path)) {
    if (row.depth !== 'excluded') corrected++;
    row.depth = 'excluded'; row.reason = 'Isolated third-party pitch tooling dependency/vendor file; metadata only';
  } else if (/\.(pyd|a|so|dylib|class|jar|pak|dat|pfb|sfd)$/i.test(row.path)) {
    if (row.depth !== 'excluded') corrected++;
    row.depth = 'excluded'; row.reason = 'Binary or font file; metadata only';
  }
}
const old = fs.readFileSync(path.join(base, 'MANIFEST.md'), 'utf8');
const dirs = old.split('\n').filter(line => line.includes('| not-enumerated |'));
const counts = [...new Set(rows.map(r => r.module))].sort().map(module => ({module, files:rows.filter(r=>r.module===module).length, eligible:rows.filter(r=>r.module===module&&!['excluded','missing'].includes(r.depth)).length}));
function chunks(file, lines) { for(let i=0;i<lines.length;i+=150) fs.writeFileSync(path.join(base,file),lines.slice(i,i+150).join('\n')+'\n',{flag:i?'a':'w'}); }
chunks('manifest.ndjson', rows.map(r=>JSON.stringify(r)));
chunks('MANIFEST.md', ['# Project manifest','Metadata snapshot 2026-11-15; refined explicit dependency classification. No excluded file content read.','Root D:/orbit-main/orbit-main plus ../docs/. Parent tmp-* clones and .claude settings are outside product scope and unread.','Directory exclusions have not been recursively enumerated. All already enumerated vendor paths remain individually recorded as excluded.','Index outputs are separately registered, not recursively added to product scope. Large records require partial read batches; title/status reads do not count as full content.', '', '| Module | Files | Eligible |','|---|---:|---:|',...counts.map(c=>`| ${c.module} | ${c.files} | ${c.eligible} |`),'','| Excluded subtree | Reason | Enumeration |','|---|---|---|',...dirs,'','| Path | Bytes | Type | Module | Depth | Status / reason |','|---|---:|---|---|---|---|',...rows.map(r=>`| ${r.path} | ${r.size??'absent'} | ${r.type} | ${r.module} | ${r.depth} | ${r.status}; ${r.reason} |`)]);
const batches=[];
for(const {module} of counts){
  let files=[],bytes=0,n=1;
  const flush=()=>{if(files.length)batches.push({id:module+'-'+String(n++).padStart(3,'0'),module,bytes,files,status:'PENDING'});files=[];bytes=0;};
  for(const row of rows.filter(r=>r.module===module&&!['excluded','missing'].includes(r.depth))){
    const charge=['pitch','bounded'].includes(row.depth)?Math.min(row.size,12000):Math.min(row.size,75000);
    if(files.length&&(files.length>=25||bytes+charge>80000))flush();
    files.push(row.path);bytes+=charge;
  }
  flush();
}
chunks('batches.ndjson',batches.map(b=>JSON.stringify(b)));
chunks('PROGRESS.md',['# Index progress','Snapshot 2026-11-15. Batch bytes are read budget, not total file size. Sources >80KB require successive <=80KB content parts saved before proceeding; do not mark complete from one part.','First read-only workflow whm8t8eo4 pending: docs-design10; docs-plan00-16; v3audit+tooling; v3world+switcher. No returned coverage yet.','','| Module | Batch | Files | Read budget bytes | Status |','|---|---|---:|---:|---|',...batches.map(b=>`| ${b.module} | ${b.id} | ${b.files.length} | ${b.bytes} | ${b.status} |`)]);
console.log(JSON.stringify({files:rows.length,eligible:rows.filter(r=>!['excluded','missing'].includes(r.depth)).length,excluded:rows.filter(r=>r.depth==='excluded').length,missing:rows.filter(r=>r.depth==='missing').length,batches:batches.length,correctedClassification:corrected,pitchTitleOnly:rows.filter(r=>r.depth==='pitch').length}));
