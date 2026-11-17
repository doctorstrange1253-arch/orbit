const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const root='D:/orbit-main/orbit-main',base=path.join(root,'.agent/index');
const rows=fs.readFileSync(path.join(base,'manifest.ndjson'),'utf8').trim().split('\n').map(JSON.parse);
const coverage=fs.readFileSync(path.join(base,'coverage.ndjson'),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const eligible=rows.filter(r=>!['excluded','missing'].includes(r.depth));
const failures=[],mismatches=[],receiptPaths=new Set(),metadataChanges=[];
for(const row of coverage){if(receiptPaths.has(row.path))failures.push('Duplicate coverage '+row.path);receiptPaths.add(row.path);}
for(const row of rows){
  const file=path.resolve(root,row.path);
  if(!fs.existsSync(file)){failures.push('Missing path '+row.path);continue;}
  if(fs.lstatSync(file).size!==row.size)metadataChanges.push(row.path);
  if(!['excluded','missing'].includes(row.depth)&&!receiptPaths.has(row.path))failures.push('No receipt '+row.path);
}
for(const item of coverage){
  const row=rows.find(r=>r.path===item.path);
  if(!row||['excluded','missing'].includes(row.depth))failures.push('Unexpected coverage '+item.path);
  const lines=fs.readFileSync(path.join(base,item.digest),'utf8').split(/\r?\n/);
  const matches=lines.filter(line=>line.split('|')[0].trim()===item.path);
  if(matches.length!==1){failures.push('Digest multiplicity '+item.path);continue;}
  if(['bounded','pitch'].includes(row.depth))continue;
  if(/^\.env/i.test(path.basename(item.path)))throw Error('Unsafe environment path');
  const text=fs.readFileSync(path.resolve(root,item.path),'utf8').replaceAll('\r\n','\n');
  const count=text.length?text.replace(/\n$/,'').split('\n').length:0;
  if(Number(matches[0].split('|')[1].trim())!==count)mismatches.push({path:item.path,count});
}
const caps={'INDEX.md':150,'PROJECT_BRIEF.md':200,'OPEN_WORK.md':200,'DRIFT.md':200};
for(const [file,max]of Object.entries(caps)){
  const text=fs.readFileSync(path.join(base,file),'utf8');
  if(text.trimEnd().split(/\r?\n/).length>max)failures.push('Overlength '+file);
}
const authorFiles=fs.readdirSync(base).filter(n=>/\.(md|cjs)$/.test(n)).map(n=>path.join(base,n));
authorFiles.push(...fs.readdirSync(path.join(base,'modules')).filter(n=>n.endsWith('.md')).map(n=>path.join(base,'modules',n)));
for(const file of authorFiles){if(/[\p{Extended_Pictographic}\uFE0F]/u.test(fs.readFileSync(file,'utf8')))failures.push('Authored pictograph '+path.relative(base,file));}
const seed='79202030c1646b239ad3db7d14759a30';
const sample=coverage.filter(r=>r.path.startsWith('BackEnd/')||r.path.startsWith('FrontEnd/src/')).map(r=>({path:r.path,key:crypto.createHash('sha256').update(seed+'\0'+r.path).digest('hex')})).sort((a,b)=>a.key.localeCompare(b.key)).slice(0,10).map(r=>r.path);
const spot=fs.readFileSync(path.join(base,'SPOT_CHECKS.md'),'utf8');
for(const p of sample)if(!spot.split('\n').some(l=>l.includes('| '+p+' |')&&l.includes('MATCH:')))failures.push('Unverified selected sample '+p);
if(coverage.length!==eligible.length)failures.push('Coverage total mismatch');
const head=cp.execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(head!=='ae9ba9653a35e6c4b1d656bef9ce8956282f2509')failures.push('HEAD changed');
const result={enumerated:rows.length,eligible:eligible.length,excluded:rows.filter(r=>r.depth==='excluded').length,missing:rows.filter(r=>r.depth==='missing').length,receipts:coverage.length,scopes:coverage.reduce((a,r)=>(a[r.readScope]=(a[r.readScope]||0)+1,a),{}),lineCountMismatches:mismatches,metadataChangedSinceSnapshot:metadataChanges,randomMatches:sample.length,head,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length||mismatches.length)process.exitCode=1;
