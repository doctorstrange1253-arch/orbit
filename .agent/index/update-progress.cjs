const fs = require('node:fs');
const path = require('node:path');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root, '.agent/index');
const state = require(path.join(root, 'scripts/agent/supervisor-state.js'));
const lease = {root,lockFile:path.join(root,'.agent/RUNLOCK'),token:'6ea73f5a-3898-49c5-800c-0610667d07d2'};
state.assertLease(lease);
const load = name => fs.readFileSync(path.join(base,name),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const rows=load('manifest.ndjson'), batches=load('batches.ndjson'), seen=new Map();
const eligible = row => !['excluded','missing'].includes(row.depth);
const accepted = {L1:['FULL','KEY_SECTIONS'],L2:['FULL','KEY_SECTIONS'],L3:['FULL','KEY_SECTIONS','HEADER'],bounded:['BOUNDED'],pitch:['TITLE']};
for(const name of fs.readdirSync(path.join(base,'modules')).filter(n=>n.endsWith('.md'))){
  for(const line of fs.readFileSync(path.join(base,'modules',name),'utf8').split(/\r?\n/)){
    const cells=line.replace(/^\|\s*/,'').split('|').map(cell=>cell.trim());
    const row=rows.find(r=>r.path===cells[0]);
    const receipt=cells.find(cell=>/^READ:[A-Z_]+$/.test(cell))?.slice(5);
    if(!row || !eligible(row) || !accepted[row.depth]?.includes(receipt)) continue;
    if(row.depth==='L1' && receipt==='KEY_SECTIONS' && !(Number(cells[1])>600)) continue;
    if(seen.has(row.path)) throw Error('Duplicate digest receipt: '+row.path);
    seen.set(row.path,{name,receipt});
  }
}
const covered=rows.filter(r=>eligible(r)&&seen.has(r.path));
const counts=[...new Set(rows.map(r=>r.module))].sort().map(module=>({module,total:rows.filter(r=>r.module===module).length,eligible:rows.filter(r=>r.module===module&&eligible(r)).length,digested:covered.filter(r=>r.module===module).length}));
function chunks(name,lines){
  const file=path.join(base,name),temp=file+'.'+require('node:crypto').randomUUID()+'.pending';
  if(!lines.length) fs.writeFileSync(temp,'',{flag:'wx'});
  for(let i=0;i<lines.length;i+=150) fs.writeFileSync(temp,lines.slice(i,i+150).join('\n')+'\n',{flag:i?'a':'wx'});
  fs.renameSync(temp,file);
}
const spotFile=path.join(base,'SPOT_CHECKS.md');
const verifiedSample=new Set(fs.existsSync(spotFile)?fs.readFileSync(spotFile,'utf8').split(/\r?\n/).filter(line=>line.includes('| MATCH:')).map(line=>line.split('|')[1].trim()):[]);
chunks('coverage.ndjson',covered.map(r=>JSON.stringify({path:r.path,depth:r.depth,digest:'modules/'+seen.get(r.path).name,readScope:seen.get(r.path).receipt,status:'DIGEST_RECORDED',verification:verifiedSample.has(r.path)?'random-source-comparison-matched':'not-independently-spot-checked'})));
chunks('PROGRESS.md',['# Index progress','Updated2026-11-15. Per-file coverage.ndjson is authoritative for resumption; batch status derived from saved digest rows, not workflow launch.','Read budgets cap files at25/about80KB; oversized files need saved partial batches. Protected histories/title-only entries retain limited depth.','Current readers and exact next steps are in ../RESUME_MAIN.md; this derived table does not infer workflow completion or approval.','','| Module | Batch | Eligible files | Saved digests | Status |','|---|---|---:|---:|---|',...batches.map(b=>{const files=b.files.filter(p=>rows.some(r=>r.path===p&&eligible(r)));const n=files.filter(p=>seen.has(p)).length;return `| ${b.module} | ${b.id} | ${files.length} | ${n} | ${n===files.length?'DIGESTED':n?'PARTIAL':'PENDING'} |`;})]);
chunks('INDEX.md',['# Project index','Status: WAITING_FOR_APPROVAL (CP-IDX). Assigned-depth source index complete; no research closure, application implementation or runtime acceptance.','Repository D:/orbit-main/orbit-main; branch feature/orbit-v3-foundation; HEADae9ba9653a35e6c4b1d656bef9ce8956282f2509.','Coverage: '+rows.length+' enumerated files; '+covered.length+' saved eligible digests; '+rows.filter(r=>r.depth==='excluded').length+' excluded files; '+rows.filter(eligible).length+' eligible total; '+rows.filter(r=>r.depth==='missing').length+' missing.','51excluded subtree records are not per-file enumerations. Additional parenttmp-* clones/settings out of product scope. Metadata refinement excluded643vendor/nativebinary paths before content reads.','[Manifest](MANIFEST.md) | [Progress](PROGRESS.md) | [Resume](../RESUME_MAIN.md)','Digest presence means assigned-depth reading recorded, not runtime correctness. '+verifiedSample.size+' random source comparisons matched; see SPOT_CHECKS.md and PROJECT_BRIEF.md for limits.','','| Module | Files | Eligible | Digested | Digest |','|---|---:|---:|---:|---|',...counts.map(c=>`| ${c.module} | ${c.total} | ${c.eligible} | ${c.digested} | ${fs.existsSync(path.join(base,'modules',c.module+'.md'))?'[read](modules/'+c.module+'.md)':'pending'} |`)]);
const artifactPaths=fs.readdirSync(base,{withFileTypes:true}).filter(entry=>entry.isFile()&&!entry.name.endsWith('.pending')).map(entry=>'.agent/index/'+entry.name);
artifactPaths.push('.agent/index/REGISTRATION_PENDING.md',...fs.readdirSync(path.join(base,'modules')).filter(n=>n.endsWith('.md')).map(n=>'.agent/index/modules/'+n));
const uniqueArtifactPaths=[...new Set(artifactPaths)];
const marker=path.join(base,'registered.ndjson');
const registered=new Set(fs.existsSync(marker)?load('registered.ndjson').map(r=>r.path):[]);
const added=uniqueArtifactPaths.filter(p=>!registered.has(p));
chunks('REGISTRATION_PENDING.md',['# Registration queue','Coordinator must compare exact canonical registry paths before a single manual append. Refresh never appends registry rows automatically.','',...added.map(p=>'- '+p)]);
state.journal(lease,'DONE','IW-C-MLOCK','index-digest-batch',`${covered.length} eligible file digests saved;${added.length} artifacts awaiting manual registration;${rows.length} manifest rows. Source spot-check/reconciliation/CP-IDX pending.`);
console.log(JSON.stringify({savedDigests:covered.length,eligible:rows.filter(r=>!['excluded','missing'].includes(r.depth)).length,remaining:rows.filter(r=>!['excluded','missing'].includes(r.depth)&&!seen.has(r.path)).length,pendingRegistration:added.length}));
