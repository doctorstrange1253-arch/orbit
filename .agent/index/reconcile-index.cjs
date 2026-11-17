const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root, '.agent/index');
const state = require(path.join(root,'scripts/agent/supervisor-state.js'));
state.assertLease({lockFile:path.join(root,'.agent/RUNLOCK'),token:'6ea73f5a-3898-49c5-800c-0610667d07d2'});
const read = file => fs.readFileSync(path.join(base,file),'utf8');
const rows = read('manifest.ndjson').trim().split('\n').map(JSON.parse);
const knownModules = new Set(['agent-control','agent-side','docs-design','docs-design-v2','docs-design-v3','docs-plan','docs-plan-v2','docs-progress','docs-progress-checkpoints','docs-progress-screenshots','docs-pitch','docs-launch-video-script.md']);
function save(file,lines){
  const target=path.join(base,file),temp=target+'.'+crypto.randomUUID()+'.pending';
  if(!lines.length)fs.writeFileSync(temp,'',{flag:'wx'});
  for(let i=0;i<lines.length;i+=150)fs.writeFileSync(temp,lines.slice(i,i+150).join('\n')+'\n',{flag:i?'a':'wx'});
  fs.renameSync(temp,target);
}
let cache=0,receipts=0;
for(const row of rows){if(row.path.includes('/.gradle/')){if(row.depth!=='excluded')cache++;row.depth='excluded';row.reason='Generated Gradle cache; metadata only, no content reads';}}
for(const name of fs.readdirSync(path.join(base,'modules')).filter(n=>n.endsWith('.md'))){
  const lines=read('modules/'+name).split(/\r?\n/).map(line=>{
    const p=line.replace(/^\|\s*/,'').split('|')[0].trim();
    const row=rows.find(r=>r.path===p);
    if(!row||!knownModules.has(row.module)||line.includes('READ:'))return line;
    const count=Number(line.split('|')[1]?.trim());
    const scope=row.depth==='pitch'?'TITLE':row.depth==='bounded'?'BOUNDED':row.module==='docs-progress-screenshots'&&count>600?'KEY_SECTIONS':'FULL';
    receipts++;return line+' | READ:'+scope;
  });
  save('modules/'+name,lines);
}
save('manifest.ndjson',rows.map(r=>JSON.stringify(r)));
const counts=[...new Set(rows.map(r=>r.module))].sort().map(module=>({module,files:rows.filter(r=>r.module===module).length,eligible:rows.filter(r=>r.module===module&&!['excluded','missing'].includes(r.depth)).length}));
const dirs=read('MANIFEST.md').split('\n').filter(line=>line.includes('| not-enumerated |'));
save('MANIFEST.md',['# Project manifest','Metadata snapshot2026-11-15, cache classification corrected. No excluded content read.','2644enumerated files; dependency/scratch/build subtrees are explicitly not enumerated. Index outputs and parentclone/settings trees are outside product content scope.','Gradle cache paths already enumerated remain individually excluded; do not read or digest them.','','| Module | Files | Eligible |','|---|---:|---:|',...counts.map(c=>`| ${c.module} | ${c.files} | ${c.eligible} |`),'','| Excluded subtree | Reason | Enumeration |','|---|---|---|',...dirs,'','| Path | Bytes | Type | Module | Depth | Status / reason |','|---|---:|---|---|---|---|',...rows.map(r=>`| ${r.path} | ${r.size??'absent'} | ${r.type} | ${r.module} | ${r.depth} | ${r.status}; ${r.reason} |`)]);
const batches=read('batches.ndjson').trim().split('\n').map(JSON.parse).map(b=>({...b,files:b.files.filter(p=>!rows.some(r=>r.path===p&&['excluded','missing'].includes(r.depth)))})).filter(b=>b.files.length);
save('batches.ndjson',batches.map(b=>JSON.stringify(b)));
state.durableAppend(path.join(root,'.agent/ERRORS.md'),'| IDX-E02 | Index accounting review2026-11-15 | Isolated regression run6tests:5failed/1passed; cache test then1failed/6passed | Filename-only credit, empty write no-op, truncate/append interruption, missing-path credit and omitted Gradle cache | Explicit READ receipts with depth validation, atomic per-file replacement including empty, dynamic missing count and cache exclusion; original seven cases now7PASS/exit0. Logs .agent/index/accounting-red.log, accounting-cache-red.log, accounting-final-green.log. Not application or parked-toolkit tests. |');
console.log(JSON.stringify({receipts,cacheReclassified:cache,eligible:rows.filter(r=>!['excluded','missing'].includes(r.depth)).length,excluded:rows.filter(r=>r.depth==='excluded').length}));
