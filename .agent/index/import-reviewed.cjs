const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root,'.agent/index');
const state = require(path.join(root,'scripts/agent/supervisor-state.js'));
state.assertLease({lockFile:path.join(root,'.agent/RUNLOCK'),token:'6ea73f5a-3898-49c5-800c-0610667d07d2'});
const [input,position,moduleName] = process.argv.slice(2);
if(!input || !Number.isInteger(Number(position)) || !/^[a-z0-9-]+$/.test(moduleName)) throw Error('Expected output path, digest position and module');
const target=path.join(base,'modules',moduleName+'.md');
const existing=fs.existsSync(target)?fs.readFileSync(target,'utf8'):'';
const prior=new Map(existing.split(/\r?\n/).map((line,index)=>[line.replace(/^\|\s*/,'').split('|')[0].trim(),{line,index}]));
const manifest=new Map(fs.readFileSync(path.join(base,'manifest.ndjson'),'utf8').trim().split('\n').map(JSON.parse).map(row=>[row.path,row]));
const allowed={L1:['FULL','KEY_SECTIONS'],L2:['FULL','KEY_SECTIONS'],L3:['FULL','KEY_SECTIONS','HEADER'],pitch:['TITLE'],bounded:['BOUNDED'],excluded:['EXCLUDED']};
(async()=>{
  const stream=fs.createReadStream(input,{encoding:'utf8'});
  const lines=readline.createInterface({input:stream,crlfDelay:Infinity});
  let n=0,digest;
  for await(const line of lines){
    const text=line.trim();
    if(!text.startsWith('"digest": '))continue;
    if(n++===Number(position)){digest=JSON.parse(text.slice(10).replace(/,$/,''));break;}
  }
  stream.destroy();
  if(typeof digest!=='string')throw Error('Selected returned digest absent');
  const incoming=digest.split(/\r?\n/).map(line=>line.replaceAll(root+'/','').replace(/^\|\s*/,'').replace(/^(.*?)\|\s*(\d+) lines\s*\|/,'$1| $2 |'))
    .filter(line=>/^(BackEnd|FrontEnd|scripts|shared|marketing)\/[^|]+\s\|/.test(line));
  const selected=new Set(),rows=[],output=existing?existing.trimEnd().split(/\r?\n/):['# '+moduleName+' source digest','Returned source reads reviewed by the coordinator before import. No execution or runtime proof.','path | lines | read scope | role / exports | dependencies | risks / TODOs | receipt','--- | ---: | --- | --- | --- | --- | ---'];
  for(const line of incoming){
    const cells=line.split('|').map(c=>c.trim()),p=cells[0],row=manifest.get(p),receipt=cells.at(-1);
    if(selected.has(p))throw Error('Duplicate incoming digest: '+p);
    selected.add(p);
    const scope=receipt?.match(/^READ:(FULL|KEY_SECTIONS|HEADER|TITLE|BOUNDED|EXCLUDED)$/)?.[1];
    if(!row||!scope||!allowed[row.depth]?.includes(scope)||cells.length<7)throw Error('Invalid digest receipt: '+p);
    if(row.depth==='L1'&&scope==='KEY_SECTIONS'&&!(Number(cells[1])>600))throw Error('Incomplete L1 digest: '+p);
    const old=prior.get(p);
    if(old){
      if(/\|\s*READ:(FULL|KEY_SECTIONS|HEADER|TITLE|BOUNDED|EXCLUDED)\s*$/.test(old.line))continue;
      output[old.index]=line;
    }else output.push(line);
    rows.push(line);
  }
  if(!rows.length)throw Error('No new reviewed rows found');
  const temp=target+'.'+require('node:crypto').randomUUID()+'.pending';
  for(let i=0;i<output.length;i+=150)fs.writeFileSync(temp,output.slice(i,i+150).join('\n')+'\n',{flag:i?'a':'wx'});
  fs.renameSync(temp,target);
  console.log(JSON.stringify({module:moduleName,imported:rows.length,fromDigest:Number(position)}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
