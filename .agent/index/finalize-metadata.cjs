const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root='D:/orbit-main/orbit-main',base=path.join(root,'.agent/index');
const state=require(path.join(root,'scripts/agent/supervisor-state.js'));
state.assertLease({lockFile:path.join(root,'.agent/RUNLOCK'),token:'6ea73f5a-3898-49c5-800c-0610667d07d2'});
const rows=fs.readFileSync(path.join(base,'manifest.ndjson'),'utf8').trim().split('\n').map(JSON.parse);
const excludedPaths=new Set([
  'FrontEnd/android/app/google-services.json.example',
  'FrontEnd/android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml',
  'FrontEnd/android/app/src/main/res/drawable/ic_launcher_background.xml',
  'FrontEnd/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
  'FrontEnd/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
]);
for(const row of rows){if(excludedPaths.has(row.path)){row.depth='excluded';row.reason=row.path.endsWith('.example')?'Credential-adjacent configuration example; metadata only':'Android drawable/icon media XML; metadata only';}}
const byPath=new Map(rows.map(r=>[r.path,r]));
const changes=[],risks=[];
function save(name,lines){
  const file=path.join(base,name),temp=file+'.'+crypto.randomUUID()+'.pending';
  if(!lines.length)fs.writeFileSync(temp,'',{flag:'wx'});
  for(let i=0;i<lines.length;i+=150)fs.writeFileSync(temp,lines.slice(i,i+150).join('\n')+'\n',{flag:i?'a':'wx'});
  fs.renameSync(temp,file);
}
for(const name of fs.readdirSync(path.join(base,'modules')).filter(n=>n.endsWith('.md'))){
  const lines=fs.readFileSync(path.join(base,'modules',name),'utf8').split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const cells=lines[i].split('|').map(s=>s.trim()),row=byPath.get(cells[0]);
    if(!row)continue;
    if(!['excluded','missing','bounded','pitch'].includes(row.depth)){
      if(/^\.env/i.test(path.basename(row.path)))throw Error('Environment exclusion failed');
      const file=path.resolve(root,row.path),stat=fs.lstatSync(file);
      if(!stat.isFile()||stat.isSymbolicLink())throw Error('Unsafe source path');
      const text=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
      const count=text.length?text.replace(/\n$/,'').split('\n').length:0;
      if(Number(cells[1])!==count){changes.push({path:row.path,was:cells[1],now:count});cells[1]=String(count);lines[i]=cells.join(' | ');}
    }
    const receipt=cells.at(-1),risk=cells.at(-2)||'';
    if(/^(BackEnd|FrontEnd|shared|scripts|marketing)\//.test(row.path)&&!['excluded','missing'].includes(row.depth)&&/^READ:/.test(receipt)&&risk&&!/^(none|no concrete|no executable|no additional concrete)/i.test(risk)){
      risks.push({id:'SRC-'+String(risks.length+1).padStart(4,'0'),file:row.path,digest:'modules/'+name,line:i+1,observation:risk,status:'SOURCE_OBSERVATION_NOT_REPRODUCED',owner:'future authorized implementation or qualified validation',gate:'CP-W0 and new CP-C; parked recovery fixes also require TOOLING OK'});
    }
  }
  save('modules/'+name,lines);
}
save('manifest.ndjson',rows.map(r=>JSON.stringify(r)));
const manifestFile=path.join(base,'MANIFEST.md');
const manifestLines=fs.readFileSync(manifestFile,'utf8').split(/\r?\n/).map(line=>{
  const cells=line.split('|').map(s=>s.trim());
  if(cells[1]==='frontend-android')return `| frontend-android | ${rows.filter(r=>r.module==='frontend-android').length} | ${rows.filter(r=>r.module==='frontend-android'&&!['excluded','missing'].includes(r.depth)).length} |`;
  const row=byPath.get(cells[1]);
  return row?`| ${row.path} | ${row.size??'absent'} | ${row.type} | ${row.module} | ${row.depth} | ${row.status}; ${row.reason} |`:line;
});
save('MANIFEST.md',manifestLines);
save('source-observations.ndjson',risks.map(r=>JSON.stringify(r)));
const summary=['# Metadata normalization','Line-count convention: physical UTF-8 text lines, excluding one terminal separator, retaining intentional blank lines.','Excluded/history/title-only files were not content-read for normalization. Source bytes unchanged.','Changes:'+changes.length+'. Source observations:'+risks.length+'. These observations include hypotheses, test limitations and policy holds, not that many proven defects.','','| Path | Previous | Normalized |','|---|---:|---:|',...changes.map(c=>`| ${c.path} | ${c.was} | ${c.now} |`)];
const metadataPath=path.join(base,'METADATA_CHECK.md');
if(!fs.existsSync(metadataPath))save('METADATA_CHECK.md',summary);
else if(changes.length){
  fs.appendFileSync(metadataPath,'\n## Additional normalization\n');
  const entries=changes.map(c=>`| ${c.path} | ${c.was} | ${c.now} |`);
  for(let i=0;i<entries.length;i+=150)fs.appendFileSync(metadataPath,entries.slice(i,i+150).join('\n')+'\n');
}
console.log(JSON.stringify({normalized:changes.length,sourceObservations:risks.length}));
