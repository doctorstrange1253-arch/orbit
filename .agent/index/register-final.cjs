const fs=require('node:fs');
const path=require('node:path');
const readline=require('node:readline');
const root='D:/orbit-main/orbit-main',base=path.join(root,'.agent/index');
const state=require(path.join(root,'scripts/agent/supervisor-state.js'));
const lease={root,lockFile:path.join(root,'.agent/RUNLOCK'),token:'6ea73f5a-3898-49c5-800c-0610667d07d2'};
state.assertLease(lease);
(async()=>{
  const registry=new Set(),duplicates=[];
  const input=fs.createReadStream(path.join(root,'.agent/FILE_REGISTRY.md'),{encoding:'utf8'});
  for await(const line of readline.createInterface({input,crlfDelay:Infinity})){
    const m=line.match(/^\| ([^|]+) \|/);if(!m)continue;
    const p=m[1].trim();if(registry.has(p)&&p.startsWith('.agent/index/'))duplicates.push(p);registry.add(p);
  }
  if(duplicates.length)throw Error('Duplicate index registry rows: '+duplicates.join(','));
  const artifacts=fs.readdirSync(base,{withFileTypes:true}).filter(e=>e.isFile()&&!e.name.endsWith('.pending')).map(e=>'.agent/index/'+e.name);
  artifacts.push(...fs.readdirSync(path.join(base,'modules')).filter(n=>n.endsWith('.md')).map(n=>'.agent/index/modules/'+n),'docs/progress/checkpoints/CP-IDX.md');
  const added=[];
  for(const p of artifacts){
    const st=fs.lstatSync(path.join(root,p));if(!st.isFile()||st.isSymbolicLink())throw Error('Unsafe artifact '+p);
    if(registry.has(p))continue;
    state.durableAppend(path.join(root,'.agent/FILE_REGISTRY.md'),`| ${p} | CP-IDX source index or verification artifact | IW-C-MLOCK / CP-IDX | exists; assigned-depth evidence, not application acceptance | 2026-11-15 |`);
    registry.add(p);added.push(p);
  }
  const marker=path.join(base,'registered.ndjson'),lines=artifacts.filter(p=>p.startsWith('.agent/index/')).sort().map(p=>JSON.stringify({path:p}));
  for(let i=0;i<lines.length;i+=150)fs.writeFileSync(marker,lines.slice(i,i+150).join('\n')+'\n',{flag:i?'a':'w'});
  console.log(JSON.stringify({artifacts:artifacts.length,added:added.length,duplicateIndexRows:duplicates.length}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
